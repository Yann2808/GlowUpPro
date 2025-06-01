import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { 
  analyzeFacialFeatures, 
  generateMakeupRecommendations,
  analyzeProductCompatibility 
} from "./openai";
import { 
  insertFacialAnalysisSchema,
  insertCartItemSchema,
  insertProfessionalSchema,
  insertProfessionalReviewSchema,
  insertBookingSchema
} from "@shared/schema";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
      cb(null, true);
    } else {
      cb(new Error('Only image files are allowed'));
    }
  },
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Facial Analysis Routes
  app.post('/api/facial-analysis', isAuthenticated, upload.single('image'), async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No image file provided" });
      }

      // Convert image to base64
      const base64Image = file.buffer.toString('base64');
      
      // Analyze with OpenAI
      const analysisResult = await analyzeFacialFeatures(base64Image);
      
      // Store in database
      const facialAnalysis = await storage.createFacialAnalysis({
        userId,
        imageUrl: `data:image/${file.mimetype.split('/')[1]};base64,${base64Image}`,
        skinTone: analysisResult.skinTone,
        faceShape: analysisResult.faceShape,
        eyeColor: analysisResult.eyeColor,
        recommendations: analysisResult.recommendations,
      });

      res.json(facialAnalysis);
    } catch (error) {
      console.error("Error in facial analysis:", error);
      res.status(500).json({ message: "Failed to analyze facial features" });
    }
  });

  app.get('/api/facial-analysis/latest', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analysis = await storage.getLatestFacialAnalysis(userId);
      res.json(analysis);
    } catch (error) {
      console.error("Error fetching latest analysis:", error);
      res.status(500).json({ message: "Failed to fetch latest analysis" });
    }
  });

  app.get('/api/facial-analysis/history', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const analyses = await storage.getFacialAnalysesByUser(userId);
      res.json(analyses);
    } catch (error) {
      console.error("Error fetching analysis history:", error);
      res.status(500).json({ message: "Failed to fetch analysis history" });
    }
  });

  // Makeup Recommendations Routes
  app.post('/api/makeup-recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const { skinTone, faceShape, occasion = "everyday" } = req.body;
      
      if (!skinTone || !faceShape) {
        return res.status(400).json({ message: "Skin tone and face shape are required" });
      }

      const recommendations = await generateMakeupRecommendations(skinTone, faceShape, occasion);
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate makeup recommendations" });
    }
  });

  // Product Routes
  app.get('/api/products', async (req, res) => {
    try {
      const { category } = req.query;
      let products;
      
      if (category) {
        products = await storage.getProductsByCategory(Number(category));
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.get('/api/products/:id', async (req, res) => {
    try {
      const productId = Number(req.params.id);
      const product = await storage.getProduct(productId);
      
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      
      res.json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      res.status(500).json({ message: "Failed to fetch product" });
    }
  });

  app.get('/api/product-categories', async (req, res) => {
    try {
      const categories = await storage.getProductCategories();
      res.json(categories);
    } catch (error) {
      console.error("Error fetching categories:", error);
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Product Compatibility Analysis
  app.post('/api/product-compatibility', isAuthenticated, async (req: any, res) => {
    try {
      const { skinTone, productType, productShade } = req.body;
      
      if (!skinTone || !productType || !productShade) {
        return res.status(400).json({ message: "Skin tone, product type, and product shade are required" });
      }

      const compatibility = await analyzeProductCompatibility(skinTone, productType, productShade);
      res.json(compatibility);
    } catch (error) {
      console.error("Error analyzing product compatibility:", error);
      res.status(500).json({ message: "Failed to analyze product compatibility" });
    }
  });

  // Cart Routes
  app.get('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartItems = await storage.getCartItems(userId);
      res.json(cartItems);
    } catch (error) {
      console.error("Error fetching cart:", error);
      res.status(500).json({ message: "Failed to fetch cart items" });
    }
  });

  app.post('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const cartData = insertCartItemSchema.parse({ ...req.body, userId });
      const cartItem = await storage.addToCart(cartData);
      res.json(cartItem);
    } catch (error) {
      console.error("Error adding to cart:", error);
      res.status(500).json({ message: "Failed to add item to cart" });
    }
  });

  app.put('/api/cart/:id', isAuthenticated, async (req: any, res) => {
    try {
      const cartItemId = Number(req.params.id);
      const { quantity } = req.body;
      
      if (!quantity || quantity < 1) {
        return res.status(400).json({ message: "Valid quantity is required" });
      }
      
      await storage.updateCartItemQuantity(cartItemId, quantity);
      res.json({ message: "Cart item updated successfully" });
    } catch (error) {
      console.error("Error updating cart item:", error);
      res.status(500).json({ message: "Failed to update cart item" });
    }
  });

  app.delete('/api/cart/:id', isAuthenticated, async (req: any, res) => {
    try {
      const cartItemId = Number(req.params.id);
      await storage.removeFromCart(cartItemId);
      res.json({ message: "Item removed from cart" });
    } catch (error) {
      console.error("Error removing from cart:", error);
      res.status(500).json({ message: "Failed to remove item from cart" });
    }
  });

  app.delete('/api/cart', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      await storage.clearCart(userId);
      res.json({ message: "Cart cleared successfully" });
    } catch (error) {
      console.error("Error clearing cart:", error);
      res.status(500).json({ message: "Failed to clear cart" });
    }
  });

  // Professional Routes
  app.get('/api/professionals', async (req, res) => {
    try {
      const professionals = await storage.getProfessionals();
      res.json(professionals);
    } catch (error) {
      console.error("Error fetching professionals:", error);
      res.status(500).json({ message: "Failed to fetch professionals" });
    }
  });

  app.get('/api/professionals/:id', async (req, res) => {
    try {
      const professionalId = Number(req.params.id);
      const professional = await storage.getProfessional(professionalId);
      
      if (!professional) {
        return res.status(404).json({ message: "Professional not found" });
      }
      
      res.json(professional);
    } catch (error) {
      console.error("Error fetching professional:", error);
      res.status(500).json({ message: "Failed to fetch professional" });
    }
  });

  app.post('/api/professionals', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const professionalData = insertProfessionalSchema.parse({ ...req.body, userId });
      const professional = await storage.createProfessional(professionalData);
      res.json(professional);
    } catch (error) {
      console.error("Error creating professional profile:", error);
      res.status(500).json({ message: "Failed to create professional profile" });
    }
  });

  // Professional Reviews Routes
  app.get('/api/professionals/:id/reviews', async (req, res) => {
    try {
      const professionalId = Number(req.params.id);
      const reviews = await storage.getProfessionalReviews(professionalId);
      res.json(reviews);
    } catch (error) {
      console.error("Error fetching reviews:", error);
      res.status(500).json({ message: "Failed to fetch reviews" });
    }
  });

  app.post('/api/professionals/:id/reviews', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const professionalId = Number(req.params.id);
      const reviewData = insertProfessionalReviewSchema.parse({ 
        ...req.body, 
        userId, 
        professionalId 
      });
      const review = await storage.createProfessionalReview(reviewData);
      res.json(review);
    } catch (error) {
      console.error("Error creating review:", error);
      res.status(500).json({ message: "Failed to create review" });
    }
  });

  // Booking Routes
  app.get('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookings = await storage.getBookings(userId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  app.post('/api/bookings', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const bookingData = insertBookingSchema.parse({ ...req.body, userId });
      const booking = await storage.createBooking(bookingData);
      res.json(booking);
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.put('/api/bookings/:id/status', isAuthenticated, async (req: any, res) => {
    try {
      const bookingId = Number(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      
      await storage.updateBookingStatus(bookingId, status);
      res.json({ message: "Booking status updated successfully" });
    } catch (error) {
      console.error("Error updating booking status:", error);
      res.status(500).json({ message: "Failed to update booking status" });
    }
  });

  // Makeup Looks Routes
  app.get('/api/makeup-looks', async (req, res) => {
    try {
      const { category } = req.query;
      let looks;
      
      if (category) {
        looks = await storage.getMakeupLooksByCategory(category as string);
      } else {
        looks = await storage.getMakeupLooks();
      }
      
      res.json(looks);
    } catch (error) {
      console.error("Error fetching makeup looks:", error);
      res.status(500).json({ message: "Failed to fetch makeup looks" });
    }
  });

  app.get('/api/makeup-looks/:id', async (req, res) => {
    try {
      const lookId = Number(req.params.id);
      const look = await storage.getMakeupLook(lookId);
      
      if (!look) {
        return res.status(404).json({ message: "Makeup look not found" });
      }
      
      res.json(look);
    } catch (error) {
      console.error("Error fetching makeup look:", error);
      res.status(500).json({ message: "Failed to fetch makeup look" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
