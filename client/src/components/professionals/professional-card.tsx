import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Star, MapPin, Verified, Calendar, Loader2 } from "lucide-react";

interface Professional {
  id: number;
  userId: string;
  businessName?: string;
  specialties?: string[];
  bio?: string;
  basePrice: string;
  currency: string;
  location?: string;
  isVerified: boolean;
  averageRating: number;
  totalReviews: number;
  user: {
    firstName?: string;
    lastName?: string;
    profileImageUrl?: string;
  };
}

interface ProfessionalCardProps {
  professional: Professional;
  onBook: (date: string, notes?: string) => void;
  isBooking: boolean;
  featured?: boolean;
}

export default function ProfessionalCard({ professional, onBook, isBooking, featured }: ProfessionalCardProps) {
  const [bookingDate, setBookingDate] = useState("");
  const [bookingNotes, setBookingNotes] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const formatPrice = (price: string, currency: string) => {
    return `${Number(price).toLocaleString()} ${currency}`;
  };

  const renderStars = (rating: number) => {
    return [...Array(5)].map((_, i) => (
      <Star 
        key={i} 
        className={`w-3 h-3 ${i < Math.floor(rating) ? 'fill-current text-golden' : 'text-gray-300'}`} 
      />
    ));
  };

  const handleBooking = () => {
    if (bookingDate) {
      onBook(bookingDate, bookingNotes);
      setIsDialogOpen(false);
      setBookingDate("");
      setBookingNotes("");
    }
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().slice(0, 16);
  };

  return (
    <Card className={`bg-white shadow-md ${featured ? 'ring-2 ring-golden' : ''}`}>
      <CardContent className="p-4">
        {featured && (
          <Badge className="mb-3 bg-golden text-white">
            ⭐ Recommandé
          </Badge>
        )}
        
        <div className="flex items-center space-x-3">
          <div className="relative">
            <img
              src={professional.user.profileImageUrl || "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=200"}
              alt={`${professional.user.firstName} ${professional.user.lastName}`}
              className="w-16 h-16 rounded-full object-cover"
            />
            {professional.isVerified && (
              <div className="absolute -bottom-1 -right-1 bg-primary rounded-full p-1">
                <Verified className="w-3 h-3 text-white" />
              </div>
            )}
          </div>
          
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-1">
              <h5 className="font-poppins font-semibold text-brown">
                {professional.user.firstName} {professional.user.lastName}
              </h5>
              {professional.isVerified && (
                <Badge variant="outline" className="text-xs border-primary text-primary">
                  Certifié
                </Badge>
              )}
            </div>
            
            {professional.businessName && (
              <p className="text-warm-gray text-sm mb-1">
                {professional.businessName}
              </p>
            )}
            
            {professional.location && (
              <div className="flex items-center text-warm-gray text-xs mb-2">
                <MapPin className="w-3 h-3 mr-1" />
                {professional.location}
              </div>
            )}
            
            <div className="flex items-center space-x-1 mb-2">
              <div className="flex">
                {renderStars(professional.averageRating || 0)}
              </div>
              <span className="text-warm-gray text-xs">
                ({professional.totalReviews} avis)
              </span>
            </div>
            
            {professional.specialties && professional.specialties.length > 0 && (
              <div className="flex flex-wrap gap-1 mb-2">
                {professional.specialties.slice(0, 2).map((specialty, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {specialty}
                  </Badge>
                ))}
                {professional.specialties.length > 2 && (
                  <Badge variant="secondary" className="text-xs">
                    +{professional.specialties.length - 2}
                  </Badge>
                )}
              </div>
            )}
            
            <div className="flex justify-between items-center">
              <span className="text-primary font-semibold">
                {formatPrice(professional.basePrice, professional.currency)}
              </span>
              
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button size="sm" className="bg-primary text-white">
                    <Calendar className="w-3 h-3 mr-1" />
                    Réserver
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-md">
                  <DialogHeader>
                    <DialogTitle className="font-poppins text-brown">
                      Réserver avec {professional.user.firstName} {professional.user.lastName}
                    </DialogTitle>
                  </DialogHeader>
                  
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="booking-date">Date et heure</Label>
                      <Input
                        id="booking-date"
                        type="datetime-local"
                        value={bookingDate}
                        onChange={(e) => setBookingDate(e.target.value)}
                        min={getMinDate()}
                        className="mt-1"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="booking-notes">Notes (optionnel)</Label>
                      <Textarea
                        id="booking-notes"
                        placeholder="Décrivez le type de maquillage souhaité..."
                        value={bookingNotes}
                        onChange={(e) => setBookingNotes(e.target.value)}
                        className="mt-1"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-cream rounded-lg">
                      <span className="text-sm text-warm-gray">Prix estimé:</span>
                      <span className="font-bold text-primary">
                        {formatPrice(professional.basePrice, professional.currency)}
                      </span>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        onClick={handleBooking}
                        disabled={!bookingDate || isBooking}
                        className="flex-1 bg-primary hover:bg-primary/90 text-white"
                      >
                        {isBooking ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Réservation...
                          </>
                        ) : (
                          "Confirmer la réservation"
                        )}
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setIsDialogOpen(false)}
                        disabled={isBooking}
                      >
                        Annuler
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </div>
        
        {professional.bio && (
          <div className="mt-3 pt-3 border-t">
            <p className="text-sm text-warm-gray line-clamp-2">
              {professional.bio}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
