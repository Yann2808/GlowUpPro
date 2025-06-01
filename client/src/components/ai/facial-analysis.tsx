import { useState, useRef } from "react";
import { useMutation } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { Camera, Upload, RefreshCw, CheckCircle } from "lucide-react";

interface FacialAnalysisProps {
  onComplete: () => void;
}

export default function FacialAnalysis({ onComplete }: FacialAnalysisProps) {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { toast } = useToast();

  const analysisMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('image', file);
      
      const response = await fetch('/api/facial-analysis', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`${response.status}: ${errorText}`);
      }

      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Analyse terminée !",
        description: "Vos recommandations personnalisées sont prêtes",
      });
      onComplete();
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
        title: "Erreur d'analyse",
        description: "Impossible d'analyser votre photo. Veuillez réessayer.",
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        const url = URL.createObjectURL(file);
        setPreviewUrl(url);
      } else {
        toast({
          title: "Format non supporté",
          description: "Veuillez sélectionner une image (JPG, PNG, etc.)",
          variant: "destructive",
        });
      }
    }
  };

  const startCamera = async () => {
    try {
      setIsCapturing(true);
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'user',
          width: { ideal: 640 },
          height: { ideal: 480 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      toast({
        title: "Accès caméra refusé",
        description: "Impossible d'accéder à votre caméra. Utilisez l'upload de fichier.",
        variant: "destructive",
      });
      setIsCapturing(false);
    }
  };

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      const ctx = canvas.getContext('2d');

      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      ctx?.drawImage(video, 0, 0);
      
      canvas.toBlob((blob) => {
        if (blob) {
          const file = new File([blob], 'selfie.jpg', { type: 'image/jpeg' });
          setSelectedFile(file);
          const url = URL.createObjectURL(blob);
          setPreviewUrl(url);
          stopCamera();
        }
      }, 'image/jpeg', 0.8);
    }
  };

  const stopCamera = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsCapturing(false);
  };

  const handleAnalyze = () => {
    if (selectedFile) {
      analysisMutation.mutate(selectedFile);
    }
  };

  const resetAnalysis = () => {
    setSelectedFile(null);
    setPreviewUrl(null);
    stopCamera();
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <section className="py-6 px-4">
      <div className="max-w-md mx-auto">
        <Card className="bg-white shadow-lg">
          <CardContent className="p-6">
            <div className="text-center mb-6">
              <div className="w-20 h-20 gradient-glow rounded-full flex items-center justify-center mx-auto mb-4">
                <Camera className="text-white text-3xl" />
              </div>
              <h4 className="font-poppins font-semibold text-lg text-brown mb-2">
                Prendre une photo
              </h4>
              <p className="text-warm-gray text-sm">
                Laissez notre IA analyser votre teint et vos traits
              </p>
            </div>

            {/* Camera View */}
            {isCapturing && (
              <div className="mb-4">
                <video
                  ref={videoRef}
                  className="w-full rounded-lg"
                  autoPlay
                  playsInline
                  muted
                />
                <div className="flex space-x-2 mt-3">
                  <Button onClick={capturePhoto} className="flex-1 bg-primary">
                    <Camera className="w-4 h-4 mr-2" />
                    Capturer
                  </Button>
                  <Button onClick={stopCamera} variant="outline">
                    Annuler
                  </Button>
                </div>
              </div>
            )}

            {/* Preview */}
            {previewUrl && !isCapturing && (
              <div className="mb-4">
                <img
                  src={previewUrl}
                  alt="Photo sélectionnée"
                  className="w-full rounded-lg"
                />
              </div>
            )}

            {/* Action Buttons */}
            {!selectedFile && !isCapturing && (
              <div className="space-y-3">
                <Button
                  onClick={startCamera}
                  className="w-full bg-primary hover:bg-primary/90 text-white"
                >
                  <Camera className="w-5 h-5 mr-2" />
                  Prendre une photo
                </Button>
                
                <div className="relative">
                  <Button
                    onClick={() => fileInputRef.current?.click()}
                    variant="outline"
                    className="w-full"
                  >
                    <Upload className="w-5 h-5 mr-2" />
                    Choisir une photo
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />
                </div>
              </div>
            )}

            {/* Analysis Button */}
            {selectedFile && !isCapturing && (
              <div className="space-y-3">
                <Button
                  onClick={handleAnalyze}
                  disabled={analysisMutation.isPending}
                  className="w-full bg-accent hover:bg-accent/90 text-white font-semibold"
                >
                  {analysisMutation.isPending ? (
                    <>
                      <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                      Analyse en cours...
                    </>
                  ) : (
                    <>
                      <CheckCircle className="w-5 h-5 mr-2" />
                      Analyser mon visage
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={resetAnalysis}
                  variant="outline"
                  className="w-full"
                  disabled={analysisMutation.isPending}
                >
                  Choisir une autre photo
                </Button>
              </div>
            )}

            {/* Hidden canvas for photo capture */}
            <canvas ref={canvasRef} className="hidden" />
          </CardContent>
        </Card>

        {/* Tips */}
        <Card className="mt-4 bg-cream">
          <CardContent className="p-4">
            <h5 className="font-semibold text-brown mb-3">Conseils pour une bonne photo :</h5>
            <ul className="text-sm text-warm-gray space-y-1">
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Utilisez un bon éclairage naturel
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Regardez directement la caméra
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Évitez le maquillage pour une analyse précise
              </li>
              <li className="flex items-start">
                <span className="text-primary mr-2">•</span>
                Gardez une expression neutre
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
