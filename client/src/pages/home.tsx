import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import LoadingSpinner from "@/components/common/loading-spinner";
import { useAuth } from "@/hooks/useAuth";
import { Camera, ShoppingBag, Users, Star, Plus, ArrowRight } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { user } = useAuth();
  
  const { data: latestAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: ["/api/facial-analysis/latest"],
  });

  const { data: cartItems, isLoading: cartLoading } = useQuery({
    queryKey: ["/api/cart"],
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: professionals, isLoading: professionalsLoading } = useQuery({
    queryKey: ["/api/professionals"],
  });

  const { data: makeupLooks, isLoading: looksLoading } = useQuery({
    queryKey: ["/api/makeup-looks"],
  });

  if (analysisLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative h-64 gradient-hero">
          <img 
            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
            alt="Beautiful African woman with makeup" 
            className="absolute inset-0 w-full h-full object-cover opacity-60" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brown/40 to-transparent"></div>
          <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-6">
            <h2 className="font-poppins font-bold text-2xl text-white mb-2">
              Bonjour {user?.firstName || 'Belle'} ! 
            </h2>
            <p className="text-cream text-sm mb-4">
              Prête à découvrir votre nouveau look ?
            </p>
            <Link href="/ai-analysis">
              <Button className="bg-accent hover:bg-accent/90 text-white font-semibold py-2 px-6 rounded-full">
                <Camera className="w-4 h-4 mr-2" />
                Analyser mon visage
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Latest Analysis Results */}
      {latestAnalysis && (
        <section className="py-6 px-4">
          <div className="max-w-md mx-auto">
            <h3 className="font-poppins font-bold text-lg text-brown mb-4">
              Votre dernière analyse
            </h3>
            <Card className="bg-white shadow-lg">
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-warm-gray text-sm">Teint de peau</span>
                    <Badge variant="secondary" className="bg-brown text-white">
                      {latestAnalysis.skinTone}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-warm-gray text-sm">Forme du visage</span>
                    <Badge variant="secondary" className="bg-secondary text-white">
                      {latestAnalysis.faceShape}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-warm-gray text-sm">Couleur des yeux</span>
                    <Badge variant="secondary" className="bg-golden text-white">
                      {latestAnalysis.eyeColor}
                    </Badge>
                  </div>
                </div>
                <Link href="/ai-analysis">
                  <Button variant="outline" className="w-full mt-4">
                    Voir les recommandations
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Quick Actions */}
      <section className="py-6 px-4">
        <div className="max-w-md mx-auto">
          <h3 className="font-poppins font-bold text-lg text-brown mb-4">
            Actions rapides
          </h3>
          <div className="grid grid-cols-3 gap-4">
            <Link href="/ai-analysis">
              <Card className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="w-12 h-12 gradient-glow rounded-full flex items-center justify-center mx-auto mb-2">
                    <Camera className="text-white text-lg" />
                  </div>
                  <p className="text-brown text-xs font-medium">Analyse IA</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/marketplace">
              <Card className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="w-12 h-12 gradient-accent rounded-full flex items-center justify-center mx-auto mb-2">
                    <ShoppingBag className="text-white text-lg" />
                    {cartItems && cartItems.length > 0 && (
                      <Badge className="absolute -mt-2 -mr-2 bg-accent text-white text-xs h-5 w-5 rounded-full p-0 flex items-center justify-center">
                        {cartItems.length}
                      </Badge>
                    )}
                  </div>
                  <p className="text-brown text-xs font-medium">Boutique</p>
                </CardContent>
              </Card>
            </Link>

            <Link href="/professionals">
              <Card className="text-center hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="w-12 h-12 bg-brown rounded-full flex items-center justify-center mx-auto mb-2">
                    <Users className="text-white text-lg" />
                  </div>
                  <p className="text-brown text-xs font-medium">Pros</p>
                </CardContent>
              </Card>
            </Link>
          </div>
        </div>
      </section>

      {/* Recommended Looks */}
      {!looksLoading && makeupLooks && makeupLooks.length > 0 && (
        <section className="py-6 px-4 bg-cream">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-poppins font-bold text-lg text-brown">
                Looks Recommandés
              </h3>
              <Button variant="ghost" size="sm" className="text-primary">
                Voir tout
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              {makeupLooks.slice(0, 4).map((look) => (
                <Card key={look.id} className="overflow-hidden">
                  <img 
                    src={look.imageUrl || "https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
                    alt={look.name} 
                    className="w-full h-28 object-cover" 
                  />
                  <CardContent className="p-3">
                    <h5 className="font-poppins font-semibold text-brown text-sm mb-1">
                      {look.name}
                    </h5>
                    <p className="text-warm-gray text-xs mb-2">
                      {look.description?.substring(0, 50)}...
                    </p>
                    <Button size="sm" className="w-full bg-primary text-white text-xs">
                      Essayer
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Featured Products */}
      {!productsLoading && products && products.length > 0 && (
        <section className="py-6 px-4">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-poppins font-bold text-lg text-brown">
                Produits Vedettes
              </h3>
              <Link href="/marketplace">
                <Button variant="ghost" size="sm" className="text-primary">
                  Voir tout
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {products.slice(0, 4).map((product) => (
                <Card key={product.id} className="overflow-hidden">
                  <img 
                    src={product.imageUrl || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300"} 
                    alt={product.name} 
                    className="w-full h-24 object-cover" 
                  />
                  <CardContent className="p-3">
                    <h5 className="font-poppins font-semibold text-brown text-sm mb-1">
                      {product.name}
                    </h5>
                    <p className="text-warm-gray text-xs mb-2">
                      {product.description?.substring(0, 30)}...
                    </p>
                    <div className="flex justify-between items-center">
                      <span className="font-bold text-primary text-sm">
                        {Number(product.price).toLocaleString()} {product.currency}
                      </span>
                      <Button size="sm" variant="outline" className="p-1">
                        <Plus className="w-3 h-3" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Top Professionals */}
      {!professionalsLoading && professionals && professionals.length > 0 && (
        <section className="py-6 px-4 bg-cream">
          <div className="max-w-md mx-auto">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-poppins font-bold text-lg text-brown">
                Maquilleurs Top
              </h3>
              <Link href="/professionals">
                <Button variant="ghost" size="sm" className="text-primary">
                  Voir tous
                </Button>
              </Link>
            </div>

            <div className="space-y-3">
              {professionals.slice(0, 2).map((professional) => (
                <Card key={professional.id} className="bg-white shadow-md">
                  <CardContent className="p-4">
                    <div className="flex items-center space-x-3">
                      <img 
                        src={professional.user.profileImageUrl || "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"} 
                        alt={`${professional.user.firstName} ${professional.user.lastName}`} 
                        className="w-12 h-12 rounded-full object-cover" 
                      />
                      <div className="flex-1">
                        <h5 className="font-poppins font-semibold text-brown text-sm">
                          {professional.user.firstName} {professional.user.lastName}
                        </h5>
                        <p className="text-warm-gray text-xs mb-1">
                          {professional.businessName}
                        </p>
                        <div className="flex items-center space-x-1 mb-1">
                          <div className="flex text-golden">
                            {[...Array(5)].map((_, i) => (
                              <Star 
                                key={i} 
                                className={`w-3 h-3 ${i < Math.floor(professional.averageRating || 0) ? 'fill-current' : ''}`} 
                              />
                            ))}
                          </div>
                          <span className="text-warm-gray text-xs">
                            ({professional.totalReviews} avis)
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-primary font-semibold text-sm">
                            {Number(professional.basePrice).toLocaleString()} {professional.currency}
                          </span>
                          <Button size="sm" className="bg-primary text-white text-xs">
                            Réserver
                          </Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      <BottomNavigation />
    </div>
  );
}
