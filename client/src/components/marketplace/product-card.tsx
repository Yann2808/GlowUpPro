import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, Loader2 } from "lucide-react";

interface Product {
  id: number;
  name: string;
  nameEn?: string;
  description?: string;
  price: string;
  currency: string;
  imageUrl?: string;
  stock: number;
  isActive: boolean;
}

interface ProductCardProps {
  product: Product;
  onAddToCart: () => void;
  isAddingToCart: boolean;
}

export default function ProductCard({ product, onAddToCart, isAddingToCart }: ProductCardProps) {
  const formatPrice = (price: string, currency: string) => {
    return `${Number(price).toLocaleString()} ${currency}`;
  };

  return (
    <Card className="overflow-hidden hover:shadow-md transition-shadow">
      <div className="relative">
        <img
          src={product.imageUrl || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"}
          alt={product.name}
          className="w-full h-28 object-cover"
        />
        
        {product.stock <= 5 && product.stock > 0 && (
          <Badge className="absolute top-2 left-2 bg-accent text-white text-xs">
            Stock limité
          </Badge>
        )}
        
        {product.stock === 0 && (
          <Badge className="absolute top-2 left-2 bg-destructive text-white text-xs">
            Épuisé
          </Badge>
        )}
      </div>
      
      <CardContent className="p-3">
        <h5 className="font-poppins font-semibold text-brown text-sm mb-1 line-clamp-1">
          {product.name}
        </h5>
        
        {product.description && (
          <p className="text-warm-gray text-xs mb-2 line-clamp-2">
            {product.description}
          </p>
        )}
        
        <div className="flex justify-between items-center">
          <span className="font-bold text-primary text-sm">
            {formatPrice(product.price, product.currency)}
          </span>
          
          <Button
            size="sm"
            onClick={onAddToCart}
            disabled={isAddingToCart || product.stock === 0}
            className="bg-accent hover:bg-accent/90 text-white p-2 h-8 w-8"
          >
            {isAddingToCart ? (
              <Loader2 className="w-3 h-3 animate-spin" />
            ) : (
              <Plus className="w-3 h-3" />
            )}
          </Button>
        </div>
        
        {product.stock <= 10 && product.stock > 0 && (
          <p className="text-xs text-warm-gray mt-1">
            Plus que {product.stock} en stock
          </p>
        )}
      </CardContent>
    </Card>
  );
}
