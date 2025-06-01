import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import LoadingSpinner from "@/components/common/loading-spinner";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  User, 
  Settings, 
  Calendar, 
  ShoppingBag, 
  Star, 
  Camera, 
  LogOut,
  Edit,
  Save,
  X
} from "lucide-react";

export default function Profile() {
  const { user, isLoading: authLoading } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings, isLoading: bookingsLoading } = useQuery({
    queryKey: ["/api/bookings"],
  });

  const { data: cartItems, isLoading: cartLoading } = useQuery({
    queryKey: ["/api/cart"],
  });

  const { data: analysisHistory, isLoading: analysisLoading } = useQuery({
    queryKey: ["/api/facial-analysis/history"],
  });

  useEffect(() => {
    if (user) {
      setEditForm({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
      });
    }
  }, [user]);

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; email: string }) => {
      await apiRequest("PUT", "/api/auth/user", data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
      setIsEditing(false);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées",
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
        description: "Impossible de mettre à jour le profil",
        variant: "destructive",
      });
    },
  });

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(editForm);
  };

  if (authLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      {/* Profile Header */}
      <section className="py-6 px-4 gradient-glow text-white">
        <div className="max-w-md mx-auto text-center">
          <div className="relative inline-block mb-4">
            <img
              src={user?.profileImageUrl || "https://images.unsplash.com/photo-1494790108755-2616b612b786?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"}
              alt="Photo de profil"
              className="w-20 h-20 rounded-full object-cover border-4 border-white"
            />
            <Button
              size="sm"
              className="absolute bottom-0 right-0 rounded-full w-8 h-8 p-0 bg-white text-primary"
            >
              <Camera className="w-4 h-4" />
            </Button>
          </div>
          
          {isEditing ? (
            <div className="space-y-3">
              <div className="flex space-x-2">
                <Input
                  value={editForm.firstName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, firstName: e.target.value }))}
                  placeholder="Prénom"
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                />
                <Input
                  value={editForm.lastName}
                  onChange={(e) => setEditForm(prev => ({ ...prev, lastName: e.target.value }))}
                  placeholder="Nom"
                  className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
                />
              </div>
              <Input
                value={editForm.email}
                onChange={(e) => setEditForm(prev => ({ ...prev, email: e.target.value }))}
                placeholder="Email"
                type="email"
                className="bg-white/20 border-white/30 text-white placeholder:text-white/70"
              />
              <div className="flex space-x-2 justify-center">
                <Button
                  onClick={handleSaveProfile}
                  disabled={updateProfileMutation.isPending}
                  size="sm"
                  className="bg-white text-primary hover:bg-cream"
                >
                  <Save className="w-4 h-4 mr-1" />
                  Sauvegarder
                </Button>
                <Button
                  onClick={() => setIsEditing(false)}
                  size="sm"
                  variant="outline"
                  className="border-white text-white hover:bg-white/20"
                >
                  <X className="w-4 h-4 mr-1" />
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="font-poppins font-bold text-2xl mb-1">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-white/90 mb-4">{user?.email}</p>
              <Button
                onClick={() => setIsEditing(true)}
                size="sm"
                className="bg-white text-primary hover:bg-cream"
              >
                <Edit className="w-4 h-4 mr-2" />
                Modifier le profil
              </Button>
            </>
          )}
        </div>
      </section>

      {/* Profile Tabs */}
      <section className="py-6 px-4">
        <div className="max-w-md mx-auto">
          <Tabs defaultValue="overview" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="overview" className="text-xs">
                <User className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="bookings" className="text-xs">
                <Calendar className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="purchases" className="text-xs">
                <ShoppingBag className="w-4 h-4" />
              </TabsTrigger>
              <TabsTrigger value="analysis" className="text-xs">
                <Camera className="w-4 h-4" />
              </TabsTrigger>
            </TabsList>

            {/* Overview Tab */}
            <TabsContent value="overview" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-poppins text-brown flex items-center">
                    <Settings className="w-5 h-5 mr-2" />
                    Aperçu du Compte
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-primary">
                        {bookings?.length || 0}
                      </div>
                      <div className="text-sm text-warm-gray">Rendez-vous</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-secondary">
                        {analysisHistory?.length || 0}
                      </div>
                      <div className="text-sm text-warm-gray">Analyses IA</div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold text-brown mb-3">Préférences</h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-warm-gray">Langue</span>
                        <Badge>Français</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-warm-gray">Notifications</span>
                        <Badge>Activées</Badge>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-warm-gray">Localisation</span>
                        <Badge>Dakar, Sénégal</Badge>
                      </div>
                    </div>
                  </div>

                  <Button
                    onClick={handleLogout}
                    variant="destructive"
                    className="w-full"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </Button>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Bookings Tab */}
            <TabsContent value="bookings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-poppins text-brown flex items-center">
                    <Calendar className="w-5 h-5 mr-2" />
                    Mes Rendez-vous
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {bookingsLoading ? (
                    <div className="text-center py-4">
                      <LoadingSpinner />
                    </div>
                  ) : bookings && bookings.length > 0 ? (
                    <div className="space-y-3">
                      {bookings.map((booking: any) => (
                        <div key={booking.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <h5 className="font-semibold text-brown">
                                {booking.professional.user.firstName} {booking.professional.user.lastName}
                              </h5>
                              <p className="text-sm text-warm-gray">
                                {booking.professional.businessName}
                              </p>
                            </div>
                            <Badge 
                              variant={
                                booking.status === "confirmed" ? "default" :
                                booking.status === "pending" ? "secondary" :
                                booking.status === "completed" ? "outline" : "destructive"
                              }
                            >
                              {booking.status === "confirmed" ? "Confirmé" :
                               booking.status === "pending" ? "En attente" :
                               booking.status === "completed" ? "Terminé" : "Annulé"}
                            </Badge>
                          </div>
                          <div className="text-sm text-warm-gray">
                            <p>{new Date(booking.serviceDate).toLocaleDateString('fr-FR', {
                              weekday: 'long',
                              year: 'numeric',
                              month: 'long',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}</p>
                            {booking.totalPrice && (
                              <p className="font-semibold text-primary">
                                {Number(booking.totalPrice).toLocaleString()} CFA
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="mx-auto text-warm-gray text-4xl mb-4" />
                      <p className="text-warm-gray">Aucun rendez-vous programmé</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Purchases Tab */}
            <TabsContent value="purchases" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-poppins text-brown flex items-center">
                    <ShoppingBag className="w-5 h-5 mr-2" />
                    Mon Panier
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {cartLoading ? (
                    <div className="text-center py-4">
                      <LoadingSpinner />
                    </div>
                  ) : cartItems && cartItems.length > 0 ? (
                    <div className="space-y-3">
                      {cartItems.map((item: any) => (
                        <div key={item.id} className="flex items-center space-x-3 border rounded-lg p-3">
                          <img
                            src={item.product.imageUrl || "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?ixlib=rb-4.0.3&auto=format&fit=crop&w=100&h=100"}
                            alt={item.product.name}
                            className="w-12 h-12 rounded object-cover"
                          />
                          <div className="flex-1">
                            <h5 className="font-semibold text-brown text-sm">
                              {item.product.name}
                            </h5>
                            <p className="text-xs text-warm-gray">
                              Quantité: {item.quantity}
                            </p>
                            <p className="text-sm font-semibold text-primary">
                              {Number(item.product.price).toLocaleString()} CFA
                            </p>
                          </div>
                        </div>
                      ))}
                      <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                        Finaliser la commande
                      </Button>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <ShoppingBag className="mx-auto text-warm-gray text-4xl mb-4" />
                      <p className="text-warm-gray">Votre panier est vide</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Analysis History Tab */}
            <TabsContent value="analysis" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="font-poppins text-brown flex items-center">
                    <Camera className="w-5 h-5 mr-2" />
                    Historique des Analyses
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {analysisLoading ? (
                    <div className="text-center py-4">
                      <LoadingSpinner />
                    </div>
                  ) : analysisHistory && analysisHistory.length > 0 ? (
                    <div className="space-y-3">
                      {analysisHistory.map((analysis: any) => (
                        <div key={analysis.id} className="border rounded-lg p-3">
                          <div className="flex justify-between items-start mb-2">
                            <div className="space-y-1">
                              <div className="flex space-x-2">
                                <Badge className="bg-brown text-white">
                                  {analysis.skinTone}
                                </Badge>
                                <Badge className="bg-secondary text-white">
                                  {analysis.faceShape}
                                </Badge>
                              </div>
                              <p className="text-xs text-warm-gray">
                                {new Date(analysis.createdAt).toLocaleDateString('fr-FR')}
                              </p>
                            </div>
                            <Button size="sm" variant="outline">
                              Voir détails
                            </Button>
                          </div>
                          {analysis.recommendations?.makeupTips && (
                            <p className="text-sm text-warm-gray">
                              {analysis.recommendations.makeupTips[0]?.substring(0, 80)}...
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <Camera className="mx-auto text-warm-gray text-4xl mb-4" />
                      <p className="text-warm-gray">Aucune analyse effectuée</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <BottomNavigation />
    </div>
  );
}
