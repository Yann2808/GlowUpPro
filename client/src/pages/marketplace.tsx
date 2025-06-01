import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import ProductCard from "@/components/marketplace/product-card";
import LoadingSpinner from "@/components/common/loading-spinner";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Search, ShoppingCart, Filter, Tag } from "lucide-react";

export default function Marketplace() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products", selectedCategory],
    queryFn: () => {
      const url = selectedCategory ? `/api/products?category=${selectedCategory}` : "/api/products";
      return fetch(url, { credentials: "include" }).then(res => res.json());
    },
  });

  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: ["/api/product-categories"],
  });

  const { data: cartItems, isLoading: cartLoading } = useQuery({
    queryKey: ["/api/cart"],
  });

  const addToCartMutation = useMutation({
    mutationFn: async (productId: number) => {
      await apiRequest("POST", "/api/cart", { productId, quantity: 1 });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
      toast({
        title: "Produit ajouté",
        description: "Le produit a été ajouté à votre panier",
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Non autorisé",
          description: "Vous êtes déconnecté. Reconnexion...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le produit au panier",
        variant: "destructive",
      });
    },
  });

  const filteredProducts = products?.filter((product: any) =>
    product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    product.description?.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  if (productsLoading || categoriesLoading) {
    return <LoadingSpinner />;
  }

  const cartItemCount = cartItems?.length || 0;

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      {/* Hero Section */}
      <section className="py-6 px-4 gradient-accent">
        <div className="max-w-md mx-auto text-center">
          <ShoppingCart className="mx-auto text-white text-3xl mb-4" />
          <h2 className="font-poppins font-bold text-2xl text-white mb-2">
            Marketplace Beauté
          </h2>
          <p className="text-white/90 mb-4">
            Produits sélectionnés pour votre peau
          </p>
          
          {cartItemCount > 0 && (
            <Badge className="bg-white text-primary">
              {cartItemCount} produit{cartItemCount > 1 ? 's' : ''} dans le panier
            </Badge>
          )}
        </div>
      </section>

      {/* Search Bar */}
      <section className="py-4 px-4 bg-white border-b">
        <div className="max-w-md mx-auto">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-gray w-4 h-4" />
            <Input
              placeholder="Rechercher des produits..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </section>

      {/* Category Filter */}
      {categories && categories.length > 0 && (
        <section className="py-4 px-4 bg-white border-b">
          <div className="max-w-md mx-auto">
            <div className="flex items-center space-x-2 mb-3">
              <Filter className="w-4 h-4 text-warm-gray" />
              <span className="text-sm font-medium text-brown">Catégories</span>
            </div>
            <div className="flex space-x-2 overflow-x-auto">
              <Button
                variant={selectedCategory === null ? "default" : "outline"}
                size="sm"
                onClick={() => setSelectedCategory(null)}
                className="whitespace-nowrap"
              >
                Toutes
              </Button>
              {categories.map((category: any) => (
                <Button
                  key={category.id}
                  variant={selectedCategory === category.id ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(category.id)}
                  className="whitespace-nowrap"
                >
                  {category.name}
                </Button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Promo Banner */}
      <section className="py-4 px-4">
        <div className="max-w-md mx-auto">
          <Card className="gradient-glow text-white">
            <CardContent className="p-4 text-center">
              <Tag className="mx-auto text-2xl mb-2" />
              <h4 className="font-poppins font-bold text-lg mb-1">Offre Spéciale</h4>
              <p className="text-sm mb-2">-20% sur votre premier achat</p>
              <Badge className="bg-white text-primary font-semibold">
                Code: GLOW20
              </Badge>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-4 px-4">
        <div className="max-w-md mx-auto">
          {filteredProducts.length === 0 ? (
            <div className="text-center py-8">
              <ShoppingCart className="mx-auto text-warm-gray text-4xl mb-4" />
              <h3 className="font-poppins font-semibold text-brown mb-2">
                Aucun produit trouvé
              </h3>
              <p className="text-warm-gray">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              {filteredProducts.map((product: any) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onAddToCart={() => addToCartMutation.mutate(product.id)}
                  isAddingToCart={addToCartMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Featured Collections */}
      <section className="py-6 px-4 bg-cream">
        <div className="max-w-md mx-auto">
          <h3 className="font-poppins font-bold text-lg text-brown mb-4">
            Collections Spéciales
          </h3>
          
          <div className="space-y-4">
            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">🌟</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-poppins font-semibold text-brown">
                      Peaux Ébènes
                    </h4>
                    <p className="text-warm-gray text-sm">
                      Produits spécialement sélectionnés
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Voir
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-golden rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">✨</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-poppins font-semibold text-brown">
                      Nouveautés
                    </h4>
                    <p className="text-warm-gray text-sm">
                      Les dernières tendances beauté
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Voir
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-12 h-12 bg-accent rounded-full flex items-center justify-center">
                    <span className="text-white text-xl">💄</span>
                  </div>
                  <div className="flex-1">
                    <h4 className="font-poppins font-semibold text-brown">
                      Essentiels Quotidiens
                    </h4>
                    <p className="text-warm-gray text-sm">
                      Pour votre routine beauté
                    </p>
                  </div>
                  <Button size="sm" variant="outline">
                    Voir
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Shopping Cart Summary */}
      {cartItemCount > 0 && (
        <section className="fixed bottom-20 left-0 right-0 p-4 z-40">
          <div className="max-w-md mx-auto">
            <Card className="bg-primary text-white shadow-lg">
              <CardContent className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="font-semibold">
                      {cartItemCount} produit{cartItemCount > 1 ? 's' : ''} dans le panier
                    </p>
                    <p className="text-sm opacity-90">
                      Prêt pour la commande
                    </p>
                  </div>
                  <Button variant="secondary" className="bg-white text-primary">
                    Voir le panier
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      <BottomNavigation />
    </div>
  );
}
