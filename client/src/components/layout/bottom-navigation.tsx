import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Home, Camera, ShoppingBag, Users, User } from "lucide-react";

const navigationItems = [
  {
    href: "/",
    icon: Home,
    label: "Accueil",
  },
  {
    href: "/ai-analysis",
    icon: Camera,
    label: "IA",
  },
  {
    href: "/marketplace",
    icon: ShoppingBag,
    label: "Shop",
  },
  {
    href: "/professionals",
    icon: Users,
    label: "Pros",
  },
  {
    href: "/profile",
    icon: User,
    label: "Profil",
  },
];

export default function BottomNavigation() {
  const [location] = useLocation();

  return (
    <nav className="bg-white border-t border-gray-200 fixed bottom-0 left-0 right-0 z-50 safe-bottom">
      <div className="flex justify-around items-center py-2">
        {navigationItems.map((item) => {
          const isActive = location === item.href;
          const Icon = item.icon;
          
          return (
            <Link key={item.href} href={item.href}>
              <button className="flex flex-col items-center p-2 transition-colors">
                <Icon 
                  className={cn(
                    "text-lg w-5 h-5",
                    isActive ? "text-primary" : "text-warm-gray"
                  )}
                />
                <span 
                  className={cn(
                    "text-xs mt-1",
                    isActive ? "text-primary" : "text-warm-gray"
                  )}
                >
                  {item.label}
                </span>
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
