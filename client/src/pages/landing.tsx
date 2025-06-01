import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sparkles, Camera, ShoppingBag, Users, Star, Play } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <div className="flex justify-between items-center px-4 py-3">
          <div className="flex items-center space-x-2">
            <Sparkles className="text-primary text-xl" />
            <h1 className="font-poppins font-bold text-xl text-brown">GlowUp</h1>
          </div>
          <Button onClick={handleLogin} variant="outline" size="sm">
            Se connecter
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="relative h-80 gradient-hero">
          <img 
            src="https://images.unsplash.com/photo-1596462502278-27bfdc403348?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600" 
            alt="Femme africaine avec maquillage naturel" 
            className="absolute inset-0 w-full h-full object-cover opacity-60" 
          />
          <div className="absolute inset-0 bg-gradient-to-t from-brown/40 to-transparent"></div>
          <div className="relative z-10 flex flex-col justify-center items-center h-full text-center px-6">
            <h2 className="font-poppins font-bold text-3xl text-white mb-4">
              Révélez votre beauté naturelle
            </h2>
            <p className="text-cream text-lg mb-6 max-w-sm">
              Découvrez des looks maquillage personnalisés grâce à notre IA
            </p>
            <Button 
              onClick={handleLogin}
              className="bg-accent hover:bg-accent/90 text-white font-semibold py-3 px-8 rounded-full"
            >
              Commencer l'analyse IA
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-8 px-4">
        <div className="max-w-md mx-auto">
          <div className="text-center mb-6">
            <h3 className="font-poppins font-bold text-2xl text-brown mb-2">
              Fonctionnalités IA
            </h3>
            <p className="text-warm-gray">
              Notre IA analyse votre visage pour des recommandations sur mesure
            </p>
          </div>
          
          <div className="grid grid-cols-1 gap-6">
            {/* AI Analysis Feature */}
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 gradient-glow rounded-full flex items-center justify-center">
                    <Camera className="text-white text-2xl" />
                  </div>
                </div>
                <h4 className="font-poppins font-semibold text-lg text-center text-brown mb-2">
                  Analyse Faciale IA
                </h4>
                <p className="text-warm-gray text-center text-sm">
                  Analysez votre teint, forme de visage et traits pour des recommandations personnalisées
                </p>
              </CardContent>
            </Card>

            {/* Marketplace Feature */}
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 gradient-accent rounded-full flex items-center justify-center">
                    <ShoppingBag className="text-white text-2xl" />
                  </div>
                </div>
                <h4 className="font-poppins font-semibold text-lg text-center text-brown mb-2">
                  Marketplace Intégrée
                </h4>
                <p className="text-warm-gray text-center text-sm">
                  Achetez les produits recommandés adaptés à votre peau
                </p>
              </CardContent>
            </Card>

            {/* Professionals Feature */}
            <Card className="bg-white shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-4">
                  <div className="w-16 h-16 bg-brown rounded-full flex items-center justify-center">
                    <Users className="text-white text-2xl" />
                  </div>
                </div>
                <h4 className="font-poppins font-semibold text-lg text-center text-brown mb-2">
                  Maquilleurs Professionnels
                </h4>
                <p className="text-warm-gray text-center text-sm">
                  Réservez des séances avec des maquilleurs certifiés près de chez vous
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Sample Looks Section */}
      <section className="py-8 px-4 bg-cream">
        <div className="max-w-md mx-auto">
          <h3 className="font-poppins font-bold text-2xl text-brown mb-6 text-center">
            Exemples de Looks
          </h3>
          
          <div className="grid grid-cols-2 gap-4">
            <Card className="overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1580489944761-15a19d654956?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                alt="Look naturel jour" 
                className="w-full h-32 object-cover" 
              />
              <CardContent className="p-3">
                <h5 className="font-poppins font-semibold text-brown mb-1">Look Naturel</h5>
                <p className="text-warm-gray text-xs">Parfait pour le quotidien</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1616683693504-3ea7e9ad6fec?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                alt="Look soirée glamour" 
                className="w-full h-32 object-cover" 
              />
              <CardContent className="p-3">
                <h5 className="font-poppins font-semibold text-brown mb-1">Look Soirée</h5>
                <p className="text-warm-gray text-xs">Élégant et glamour</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1560472354-b33ff0c44a43?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                alt="Look professionnel" 
                className="w-full h-32 object-cover" 
              />
              <CardContent className="p-3">
                <h5 className="font-poppins font-semibold text-brown mb-1">Look Pro</h5>
                <p className="text-warm-gray text-xs">Business et confiance</p>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <img 
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?ixlib=rb-4.0.3&auto=format&fit=crop&w=400&h=300" 
                alt="Look culturel africain" 
                className="w-full h-32 object-cover" 
              />
              <CardContent className="p-3">
                <h5 className="font-poppins font-semibold text-brown mb-1">Look Culturel</h5>
                <p className="text-warm-gray text-xs">Inspiration africaine</p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-8 px-4">
        <div className="max-w-md mx-auto">
          <h3 className="font-poppins font-bold text-2xl text-brown mb-6 text-center">
            Témoignages
          </h3>
          
          <div className="space-y-4">
            <Card className="bg-white shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <img 
                    src="https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" 
                    alt="Témoignage utilisatrice" 
                    className="w-12 h-12 rounded-full object-cover" 
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-poppins font-semibold text-brown">Mariam K.</h5>
                      <div className="flex text-golden text-xs">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-warm-gray text-sm">
                      "L'analyse IA est incroyable ! J'ai enfin trouvé les bonnes teintes pour ma peau."
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-white shadow-md">
              <CardContent className="p-4">
                <div className="flex items-start space-x-3">
                  <img 
                    src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200" 
                    alt="Témoignage utilisatrice" 
                    className="w-12 h-12 rounded-full object-cover" 
                  />
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <h5 className="font-poppins font-semibold text-brown">Awa S.</h5>
                      <div className="flex text-golden text-xs">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="w-3 h-3 fill-current" />
                        ))}
                      </div>
                    </div>
                    <p className="text-warm-gray text-sm">
                      "Les maquilleuses professionnelles sont excellentes. Je recommande !"
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-8 px-4">
        <div className="max-w-md mx-auto text-center">
          <Card className="gradient-hero text-white">
            <CardContent className="p-8">
              <Sparkles className="mx-auto text-4xl mb-4" />
              <h3 className="font-poppins font-bold text-2xl mb-4">
                Prête à révéler votre beauté ?
              </h3>
              <p className="mb-6 opacity-90">
                Rejoignez des milliers de femmes qui ont transformé leur routine beauté
              </p>
              <Button 
                onClick={handleLogin}
                className="bg-white text-primary font-bold py-3 px-8 rounded-full hover:bg-cream"
              >
                Créer mon compte
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Bottom padding for mobile */}
      <div className="h-8"></div>
    </div>
  );
}
