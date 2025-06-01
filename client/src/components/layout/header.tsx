import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { Sparkles, Search, ShoppingBag, Bell } from "lucide-react";
import { Link } from "wouter";

export default function Header() {
  const { user } = useAuth();

  const { data: cartItems } = useQuery({
    queryKey: ["/api/cart"],
  });

  const cartItemCount = cartItems?.length || 0;

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="flex justify-between items-center px-4 py-3">
        <Link href="/">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-primary text-xl" />
            <h1 className="font-poppins font-bold text-xl text-brown">GlowUp</h1>
          </div>
        </Link>
        
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" className="p-2">
            <Search className="text-warm-gray w-5 h-5" />
          </Button>
          
          <Link href="/marketplace">
            <Button variant="ghost" size="sm" className="p-2 relative">
              <ShoppingBag className="text-warm-gray w-5 h-5" />
              {cartItemCount > 0 && (
                <Badge className="absolute -top-1 -right-1 bg-accent text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                  {cartItemCount}
                </Badge>
              )}
            </Button>
          </Link>
          
          <Button variant="ghost" size="sm" className="p-2">
            <Bell className="text-warm-gray w-5 h-5" />
          </Button>
          
          <Link href="/profile">
            <Button variant="ghost" size="sm" className="p-1">
              <img
                src={user?.profileImageUrl || "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                alt="Profile"
                className="w-8 h-8 rounded-full object-cover"
              />
            </Button>
          </Link>
        </div>
      </div>
    </header>
  );
}
