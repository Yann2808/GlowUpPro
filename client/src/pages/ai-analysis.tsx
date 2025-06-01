import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import Header from "@/components/layout/header";
import BottomNavigation from "@/components/layout/bottom-navigation";
import FacialAnalysis from "@/components/ai/facial-analysis";
import LoadingSpinner from "@/components/common/loading-spinner";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Camera, Sparkles, RefreshCw, Eye } from "lucide-react";

export default function AIAnalysis() {
  const [showAnalysis, setShowAnalysis] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: latestAnalysis, isLoading: analysisLoading } = useQuery({
    queryKey: ["/api/facial-analysis/latest"],
  });

  const { data: analysisHistory, isLoading: historyLoading } = useQuery({
    queryKey: ["/api/facial-analysis/history"],
  });

  const recommendationsMutation = useMutation({
    mutationFn: async (data: { skinTone: string; faceShape: string; occasion?: string }) => {
      const response = await apiRequest("POST", "/api/makeup-recommendations", data);
      return response.json();
    },
    onSuccess: (recommendations) => {
      toast({
        title: "Recommandations générées",
        description: `${recommendations.length} looks personnalisés créés pour vous !`,
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
        description: "Impossible de générer les recommandations",
        variant: "destructive",
      });
    },
  });

  const handleAnalysisComplete = () => {
    queryClient.invalidateQueries({ queryKey: ["/api/facial-analysis/latest"] });
    queryClient.invalidateQueries({ queryKey: ["/api/facial-analysis/history"] });
    setShowAnalysis(false);
  };

  const handleGenerateRecommendations = () => {
    if (latestAnalysis) {
      recommendationsMutation.mutate({
        skinTone: latestAnalysis.skinTone,
        faceShape: latestAnalysis.faceShape,
        occasion: "everyday"
      });
    }
  };

  if (analysisLoading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <Header />

      {/* Hero Section */}
      <section className="py-6 px-4">
        <div className="max-w-md mx-auto text-center">
          <div className="w-20 h-20 gradient-glow rounded-full flex items-center justify-center mx-auto mb-4">
            <Camera className="text-white text-3xl" />
          </div>
          <h2 className="font-poppins font-bold text-2xl text-brown mb-2">
            Analyse IA Personnalisée
          </h2>
          <p className="text-warm-gray mb-6">
            Notre IA analyse votre visage pour des recommandations sur mesure
          </p>
          
          {!latestAnalysis && (
            <Button 
              onClick={() => setShowAnalysis(true)}
              className="bg-primary hover:bg-primary/90 text-white font-semibold py-3 px-8 rounded-xl"
            >
              <Sparkles className="w-5 h-5 mr-2" />
              Commencer l'analyse
            </Button>
          )}
        </div>
      </section>

      {/* Facial Analysis Component */}
      {showAnalysis && (
        <FacialAnalysis onComplete={handleAnalysisComplete} />
      )}

      {/* Latest Analysis Results */}
      {latestAnalysis && (
        <section className="py-6 px-4">
          <div className="max-w-md mx-auto">
            <Card className="bg-white shadow-lg">
              <CardHeader>
                <CardTitle className="font-poppins text-brown flex items-center">
                  <Eye className="w-5 h-5 mr-2" />
                  Résultats d'analyse
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-warm-gray">Teint de peau</span>
                    <Badge className="bg-brown text-white">
                      {latestAnalysis.skinTone}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-warm-gray">Forme du visage</span>
                    <Badge className="bg-secondary text-white">
                      {latestAnalysis.faceShape}
                    </Badge>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-warm-gray">Couleur des yeux</span>
                    <Badge className="bg-golden text-white">
                      {latestAnalysis.eyeColor}
                    </Badge>
                  </div>

                  {latestAnalysis.recommendations && (
                    <div className="pt-4 border-t">
                      <h4 className="font-poppins font-semibold text-brown mb-3">
                        Recommandations
                      </h4>
                      
                      {latestAnalysis.recommendations.foundationShade && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-warm-gray">
                            Fond de teint recommandé:
                          </span>
                          <p className="text-sm text-brown">
                            {latestAnalysis.recommendations.foundationShade}
                          </p>
                        </div>
                      )}

                      {latestAnalysis.recommendations.bestColors && (
                        <div className="mb-3">
                          <span className="text-sm font-medium text-warm-gray">
                            Couleurs qui vous vont:
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {latestAnalysis.recommendations.bestColors.map((color, index) => (
                              <Badge key={index} variant="outline" className="text-xs">
                                {color}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}

                      {latestAnalysis.recommendations.makeupTips && (
                        <div>
                          <span className="text-sm font-medium text-warm-gray">
                            Conseils maquillage:
                          </span>
                          <ul className="text-sm text-brown mt-1 space-y-1">
                            {latestAnalysis.recommendations.makeupTips.map((tip, index) => (
                              <li key={index} className="flex items-start">
                                <span className="text-primary mr-2">•</span>
                                {tip}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleGenerateRecommendations}
                      disabled={recommendationsMutation.isPending}
                      className="flex-1 bg-accent hover:bg-accent/90 text-white"
                    >
                      {recommendationsMutation.isPending ? (
                        <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Sparkles className="w-4 h-4 mr-2" />
                      )}
                      Génerer des looks
                    </Button>
                    <Button 
                      onClick={() => setShowAnalysis(true)}
                      variant="outline"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>
      )}

      {/* Recommended Looks from AI */}
      {recommendationsMutation.data && (
        <section className="py-6 px-4 bg-cream">
          <div className="max-w-md mx-auto">
            <h3 className="font-poppins font-bold text-xl text-brown mb-4">
              Looks Personnalisés pour Vous
            </h3>
            
            <div className="space-y-4">
              {recommendationsMutation.data.map((look: any, index: number) => (
                <Card key={index} className="bg-white shadow-md">
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start mb-3">
                      <h4 className="font-poppins font-semibold text-brown">
                        {look.lookName}
                      </h4>
                      <Badge 
                        variant={look.difficulty === "beginner" ? "secondary" : 
                               look.difficulty === "intermediate" ? "default" : "destructive"}
                      >
                        {look.difficulty === "beginner" ? "Débutant" :
                         look.difficulty === "intermediate" ? "Intermédiaire" : "Avancé"}
                      </Badge>
                    </div>

                    {look.culturalNotes && (
                      <p className="text-sm text-warm-gray mb-3 italic">
                        {look.culturalNotes}
                      </p>
                    )}

                    {look.products && look.products.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-brown mb-2">
                          Produits recommandés:
                        </h5>
                        <div className="space-y-1">
                          {look.products.slice(0, 3).map((product: any, pIndex: number) => (
                            <div key={pIndex} className="text-xs text-warm-gray">
                              <span className="font-medium">{product.type}:</span> {product.shade}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {look.steps && look.steps.length > 0 && (
                      <div className="mb-3">
                        <h5 className="text-sm font-medium text-brown mb-2">
                          Étapes principales:
                        </h5>
                        <div className="space-y-1">
                          {look.steps.slice(0, 2).map((step: string, sIndex: number) => (
                            <div key={sIndex} className="text-xs text-warm-gray flex items-start">
                              <span className="text-primary mr-2 mt-0.5">•</span>
                              {step}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    <Button className="w-full bg-primary hover:bg-primary/90 text-white">
                      Tutoriel détaillé
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Analysis History */}
      {!historyLoading && analysisHistory && analysisHistory.length > 1 && (
        <section className="py-6 px-4">
          <div className="max-w-md mx-auto">
            <h3 className="font-poppins font-bold text-lg text-brown mb-4">
              Historique des analyses
            </h3>
            
            <div className="space-y-3">
              {analysisHistory.slice(1, 4).map((analysis) => (
                <Card key={analysis.id} className="bg-white">
                  <CardContent className="p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <p className="text-sm text-brown font-medium">
                          {analysis.skinTone} • {analysis.faceShape}
                        </p>
                        <p className="text-xs text-warm-gray">
                          {new Date(analysis.createdAt!).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                      <Button size="sm" variant="outline">
                        Voir
                      </Button>
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
