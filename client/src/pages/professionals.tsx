import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import ProfessionalCard from "@/components/professionals/professional-card";
import LoadingSpinner from "@/components/common/loading-spinner";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Search, Users, MapPin, Star, Calendar } from "lucide-react";

export default function Professionals() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: professionals, isLoading: professionalsLoading } = useQuery({
    queryKey: ["/api/professionals"],
  });

  const bookingMutation = useMutation({
    mutationFn: async (data: { professionalId: number; serviceDate: string; notes?: string }) => {
      await apiRequest("POST", "/api/bookings", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings"] });
      toast({
        title: "Réservation confirmée",
        description: "Votre rendez-vous a été programmé avec succès",
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
        title: "Erreur de réservation",
        description: "Impossible de confirmer votre rendez-vous",
        variant: "destructive",
      });
    },
  });

  const filteredProfessionals = professionals?.filter((professional: any) => {
    const matchesSearch = 
      professional.user.firstName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      professional.user.lastName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      professional.businessName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      professional.specialties?.some((specialty: string) => 
        specialty.toLowerCase().includes(searchQuery.toLowerCase())
      );
    
    const matchesLocation = !selectedLocation || professional.location === selectedLocation;
    
    return matchesSearch && matchesLocation;
  }) || [];

  const locations = [...new Set(professionals?.map((p: any) => p.location).filter(Boolean))] || [];

  if (professionalsLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      {/* Hero Section */}
      <section className="py-6 px-4 bg-brown text-white">
        <div className="max-w-md mx-auto text-center">
          <Users className="mx-auto text-3xl mb-4" />
          <h2 className="font-poppins font-bold text-2xl mb-2">
            Maquilleurs Professionnels
          </h2>
          <p className="text-white/90 mb-4">
            Trouvez des experts certifiés près de chez vous
          </p>
          
          {professionals && (
            <Badge className="bg-white text-brown">
              {professionals.length} professionnel{professionals.length > 1 ? 's' : ''} disponible{professionals.length > 1 ? 's' : ''}
            </Badge>
          )}
        </div>
      </section>

      {/* Search and Filters */}
      <section className="py-4 px-4 bg-white border-b">
        <div className="max-w-md mx-auto space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-warm-gray w-4 h-4" />
            <Input
              placeholder="Rechercher par nom ou spécialité..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Location Filter */}
          {locations.length > 0 && (
            <div>
              <div className="flex items-center space-x-2 mb-2">
                <MapPin className="w-4 h-4 text-warm-gray" />
                <span className="text-sm font-medium text-brown">Localisation</span>
              </div>
              <div className="flex space-x-2 overflow-x-auto">
                <Button
                  variant={selectedLocation === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedLocation(null)}
                  className="whitespace-nowrap"
                >
                  Toutes
                </Button>
                {locations.map((location: string) => (
                  <Button
                    key={location}
                    variant={selectedLocation === location ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedLocation(location)}
                    className="whitespace-nowrap"
                  >
                    {location}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Top Rated Section */}
      {professionals && professionals.length > 0 && (
        <section className="py-4 px-4 bg-cream">
          <div className="max-w-md mx-auto">
            <div className="flex items-center space-x-2 mb-4">
              <Star className="w-5 h-5 text-golden" />
              <h3 className="font-poppins font-bold text-lg text-brown">
                Les Mieux Notés
              </h3>
            </div>
            
            <div className="grid grid-cols-1 gap-3">
              {professionals
                .filter((p: any) => p.averageRating >= 4.5)
                .slice(0, 2)
                .map((professional: any) => (
                  <ProfessionalCard
                    key={professional.id}
                    professional={professional}
                    onBook={(date, notes) => 
                      bookingMutation.mutate({
                        professionalId: professional.id,
                        serviceDate: date,
                        notes
                      })
                    }
                    isBooking={bookingMutation.isPending}
                    featured
                  />
                ))}
            </div>
          </div>
        </section>
      )}

      {/* All Professionals */}
      <section className="py-4 px-4">
        <div className="max-w-md mx-auto">
          <h3 className="font-poppins font-bold text-lg text-brown mb-4">
            Tous les Professionnels
          </h3>
          
          {filteredProfessionals.length === 0 ? (
            <div className="text-center py-8">
              <Users className="mx-auto text-warm-gray text-4xl mb-4" />
              <h3 className="font-poppins font-semibold text-brown mb-2">
                Aucun professionnel trouvé
              </h3>
              <p className="text-warm-gray">
                Essayez de modifier vos critères de recherche
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredProfessionals.map((professional: any) => (
                <ProfessionalCard
                  key={professional.id}
                  professional={professional}
                  onBook={(date, notes) => 
                    bookingMutation.mutate({
                      professionalId: professional.id,
                      serviceDate: date,
                      notes
                    })
                  }
                  isBooking={bookingMutation.isPending}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Call to Action for Professionals */}
      <section className="py-6 px-4 bg-cream">
        <div className="max-w-md mx-auto">
          <Card className="gradient-glow text-white">
            <CardContent className="p-6 text-center">
              <Calendar className="mx-auto text-3xl mb-4" />
              <h3 className="font-poppins font-bold text-xl mb-3">
                Vous êtes maquilleuse ?
              </h3>
              <p className="mb-4 opacity-90">
                Rejoignez notre réseau de professionnels certifiés
              </p>
              <Button className="bg-white text-primary font-bold py-2 px-6 rounded-full hover:bg-cream">
                Devenir Partenaire
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      <BottomNavigation />
    </div>
  );
}
