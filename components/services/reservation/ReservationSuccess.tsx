"use client";

import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { CheckCircle, Calendar, ArrowRight } from "lucide-react";
import confetti from 'canvas-confetti';
import { useRouter } from "next/navigation";
import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import { useTranslation } from 'react-i18next';

interface ReservationSuccessProps {
  isOpen: boolean;
  onClose: () => void;
  reservationId?: string;
  serviceName?: string;
  reservationDate?: Date;
  timeSlot?: {
    startTime: string;
    endTime: string;
  };
  locationSlug?: string;
}

export function ReservationSuccess({ 
  isOpen, 
  onClose, 
  reservationId = "",
  serviceName = "",
  reservationDate = new Date(),
  timeSlot = { startTime: "", endTime: "" },
  locationSlug = ""
}: ReservationSuccessProps) {
  const { t, i18n } = useTranslation();
  const [confettiTriggered, setConfettiTriggered] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (isOpen && !confettiTriggered) {
      // Trigger confetti with more spectacular effects
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      
      // First burst - center explosion
      confetti({
        particleCount: 200,
        spread: 180,
        origin: { x: 0.5, y: 0.5 }
      });
      
      // Side bursts
      setTimeout(() => {
        confetti({
          particleCount: 150,
          angle: 60,
          spread: 70,
          origin: { x: 0, y: 0.6 }
        });
        confetti({
          particleCount: 150,
          angle: 120,
          spread: 70,
          origin: { x: 1, y: 0.6 }
        });
      }, 250);

      // Continuous smaller bursts
      const interval = setInterval(() => {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        
        // Random positions for more festive look
        confetti({
          particleCount: Math.floor(particleCount),
          spread: 120,
          origin: { x: Math.random(), y: Math.random() - 0.2 },
          colors: ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'],
          shapes: ['circle', 'square'],
          ticks: 300,
          scalar: 1.5
        });
      }, 300);

      setConfettiTriggered(true);
      
      // Redirect after 2 seconds
      if (locationSlug) {
        setTimeout(() => {
          router.push(`/${i18n.language}/services/${locationSlug}`); // Dil öneki eklendi
        }, 2000);
      }
    }

    if (!isOpen) {
      setConfettiTriggered(false);
    }
  }, [isOpen, confettiTriggered, router, locationSlug, i18n.language]); // i18n.language bağımlılıklara eklendi

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md bg-white p-0 rounded-2xl overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
        <DialogTitle>
          <VisuallyHidden.Root>{t('reservation_successful_title')}</VisuallyHidden.Root>
        </DialogTitle>
        
        <div className="bg-gradient-to-r from-green-500 to-emerald-600 p-8 flex flex-col items-center">
          <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-4 shadow-lg animate-bounce">
            <CheckCircle className="w-14 h-14 text-green-500" />
          </div>
          <h2 className="text-white text-2xl font-bold text-center mb-2">{t('reservation_successfully_created')}</h2>
          <p className="text-white text-center opacity-90">{t('thank_you_message')}</p>
        </div>
        
        <div className="p-6 space-y-4">
          <div className="space-y-4">
            <div className="bg-green-50 p-4 rounded-lg border border-green-100 shadow-inner">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center shadow-md">
                  <Calendar className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-green-700">{t('reservation_number_label')}</p>
                  <p className="font-bold text-green-800 text-lg">{reservationId?.substring(0, 8).toUpperCase() || 'XXXXXXXX'}</p>
                </div>
              </div>
              
              {serviceName && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <p className="text-sm text-green-700 mb-1">{t('service_label')}</p>
                  <p className="font-medium text-green-800">{serviceName}</p>
                </div>
              )}
              
              {reservationDate && timeSlot && (
                <div className="mt-3 pt-3 border-t border-green-200">
                  <div className="flex items-center gap-2">
                    <p className="text-sm text-green-700 font-medium">{reservationDate.toLocaleDateString(i18n.language === 'tr' ? 'tr-TR' : 'en-US')}</p>
                    <ArrowRight className="w-3 h-3 text-green-600" />
                    <p className="text-sm text-green-700 font-medium">{timeSlot.startTime} - {timeSlot.endTime}</p>
                  </div>
                </div>
              )}
            </div>
            
            <p className="text-center text-gray-600">
              {t('reservation_details_saved')}{locationSlug ? t('redirect_to_homepage_message') : ""}
            </p>
          </div>
          
          <div className="flex justify-center">
            <Button 
              onClick={onClose}
              className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-8 py-6 rounded-lg shadow-lg hover:shadow-xl transition-all duration-300 font-bold text-lg"
            >
              {t('ok_button')}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
