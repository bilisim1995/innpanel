"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import {
  Route, Clock, MapPin, Zap, Users, Star, Sparkles, Award, 
  ChevronDown, ChevronUp, Info, Check, X
} from "lucide-react";
import { AssignmentData } from "@/lib/assignments";

interface ServiceTourDetailsProps {
  assignment: AssignmentData;
  service: any;
  theme: any;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

export function ServiceTourDetails({ assignment, service, theme, isOpen, onToggle }: ServiceTourDetailsProps) {
  // Get the background style from theme
  const backgroundStyle = theme.customStyle?.background ? 
    { background: theme.customStyle.background } : 
    { backgroundColor: theme.customStyle?.backgroundColor || '#dc2626' };
  
  // Get text color based on background style
  const textColor = theme.customStyle?.backgroundColor || '#dc2626';
  
  // Convert hours to minutes for display
  const convertToMinutes = (hours: string | number) => {
    const numHours = typeof hours === 'string' ? parseFloat(hours) : hours;
    return Math.round(numHours * 60);
  };

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card 
        className="backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 animate-in fade-in-0 slide-in-from-left-4 delay-300 border-2"
        style={{ 
          backgroundColor: `${textColor}10`,
          borderColor: `${textColor}20`
        }}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="relative overflow-hidden cursor-pointer hover:bg-white/20 transition-colors duration-200">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/20 rounded-full -translate-y-10 translate-x-10"></div>
            <CardTitle 
              className="flex items-center justify-between relative z-10 text-lg"
              style={{ color: textColor }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md animate-pulse"
                  style={backgroundStyle}
                >
                  <Route className="h-5 w-5 text-white" />
                </div>
                Tur Detayları
                <div className="flex items-center gap-1">
                  {theme.decorativeIcons.slice(0, 2).map((Icon: any, index: number) => (
                    <Icon 
                      key={index} 
                      className="w-5 h-5 animate-pulse" 
                      style={{ 
                        animationDelay: `${index * 300}ms`,
                        color: textColor
                      }} 
                    />
                  ))}
                </div>
              </div>
              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-8">
            {/* Tüm Detaylar Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Süre */}
              {((assignment.serviceCategory === "balloon" && service.categoryDetails?.flightInfo?.duration) ||
                (assignment.serviceCategory === "motor-tours" && service.categoryDetails?.routeDetails?.duration) ||
                (assignment.serviceCategory === "transfer" && service.categoryDetails?.routeDetails?.duration) ||
                (assignment.serviceCategory === "other" && service.categoryDetails?.serviceDuration?.value)) && (
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={backgroundStyle}
                    >
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <span 
                      className="font-bold"
                      style={{ color: textColor, fontFamily: 'Helvetica, Arial, sans-serif' }}
                    >Süre</span>
                  </div>
                  <p 
                    className="font-medium"
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: textColor }}
                  >
                    {assignment.serviceCategory === "balloon" && service.categoryDetails.flightInfo?.duration && 
                      `${service.categoryDetails.flightInfo.duration} dakika`}
                    {assignment.serviceCategory === "motor-tours" && service.categoryDetails.routeDetails?.duration && 
                      `${service.categoryDetails.routeDetails.duration} dakika`}
                    {assignment.serviceCategory === "transfer" && service.categoryDetails.routeDetails?.duration && 
                      `${service.categoryDetails.routeDetails.duration} dakika`}
                    {assignment.serviceCategory === "other" && service.categoryDetails.serviceDuration?.value && 
                      `${convertToMinutes(service.categoryDetails.serviceDuration.value)} dakika`}
                  </p>
                </div>
              )}

              {/* Başlangıç Noktası */}
              {((assignment.serviceCategory === "balloon" && service.categoryDetails?.flightInfo?.departurePoint) ||
                (assignment.serviceCategory === "motor-tours" && service.categoryDetails?.routeDetails?.startPoint) ||
                (assignment.serviceCategory === "transfer" && service.categoryDetails?.routeDetails?.startPoint)) && (
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={backgroundStyle}
                    >
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span 
                      className="font-bold"
                      style={{ color: textColor, fontFamily: 'Helvetica, Arial, sans-serif' }}
                    >Başlangıç Noktası</span>
                  </div>
                  <p 
                    className="font-medium"
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: textColor }}
                  >
                    {assignment.serviceCategory === "balloon" && service.categoryDetails.flightInfo?.departurePoint}
                    {assignment.serviceCategory === "motor-tours" && service.categoryDetails.routeDetails?.startPoint}
                    {assignment.serviceCategory === "transfer" && service.categoryDetails.routeDetails?.startPoint}
                  </p>
                </div>
              )}

              {/* Bitiş Noktası */}
              {((assignment.serviceCategory === "motor-tours" && service.categoryDetails?.routeDetails?.endPoint) ||
                (assignment.serviceCategory === "transfer" && service.categoryDetails?.routeDetails?.endPoint)) && (
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={backgroundStyle}
                    >
                      <MapPin className="w-4 h-4 text-white" />
                    </div>
                    <span 
                      className="font-bold"
                      style={{ color: textColor, fontFamily: 'Helvetica, Arial, sans-serif' }}
                    >Bitiş Noktası</span>
                  </div>
                  <p 
                    className="font-medium"
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: textColor }}
                  >
                    {assignment.serviceCategory === "motor-tours" && service.categoryDetails.routeDetails?.endPoint}
                    {assignment.serviceCategory === "transfer" && service.categoryDetails.routeDetails?.endPoint}
                  </p>
                </div>
              )}

              {/* Mesafe (km) */}
              {((assignment.serviceCategory === "motor-tours" && service.categoryDetails?.routeDetails?.distance) ||
                (assignment.serviceCategory === "transfer" && service.categoryDetails?.routeDetails?.distance)) && (
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={backgroundStyle}
                    >
                      <Route className="w-4 h-4 text-white" />
                    </div>
                    <span 
                      className="font-bold"
                      style={{ color: textColor, fontFamily: 'Helvetica, Arial, sans-serif' }}
                    >Mesafe</span>
                  </div>
                  <p 
                    className="font-medium"
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: textColor }}
                  >
                    {assignment.serviceCategory === "motor-tours" && service.categoryDetails.routeDetails?.distance} km
                    {assignment.serviceCategory === "transfer" && service.categoryDetails.routeDetails?.distance} km
                  </p>
                </div>
              )}

              {/* Zorluk Seviyesi */}
              {assignment.serviceCategory === "motor-tours" && service.categoryDetails?.difficulty && (
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={backgroundStyle}
                    >
                      <Zap className="w-4 h-4 text-white" />
                    </div>
                    <span 
                      className="font-bold"
                      style={{ color: textColor, fontFamily: 'Helvetica, Arial, sans-serif' }}
                    >Zorluk Seviyesi</span>
                  </div>
                  <p 
                    className="font-medium"
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: textColor }}
                  >
                    {service.categoryDetails.difficulty === "easy" ? "🟢 Kolay" :
                     service.categoryDetails.difficulty === "medium" ? "🟡 Orta" :
                     service.categoryDetails.difficulty === "hard" ? "🔴 Zor" : service.categoryDetails.difficulty}
                  </p>
                </div>
              )}

              {/* Minimum Katılımcı Yaşı */}
              {assignment.serviceCategory === "motor-tours" && service.categoryDetails?.minAge && (
                <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-white/40 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
                  <div className="flex items-center gap-3 mb-2">
                    <div 
                      className="w-8 h-8 rounded-lg flex items-center justify-center"
                      style={backgroundStyle}
                    >
                      <Users className="w-4 h-4 text-white" />
                    </div>
                    <span 
                      className="font-bold"
                      style={{ color: textColor, fontFamily: 'Helvetica, Arial, sans-serif' }}
                    >Minimum Katılımcı Yaşı</span>
                  </div>
                  <p 
                    className="font-medium"
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: textColor }}
                  >{service.categoryDetails.minAge} yaş</p>
                </div>
              )}
            </div>

            {/* Kalkış Saatleri (Region Tours) */}
            {assignment.serviceCategory === "region-tours" && service.categoryDetails?.departureTimes && service.categoryDetails.departureTimes.length > 0 && (
              <div className="space-y-3">
                <p 
                  className="font-bold text-lg flex items-center gap-3"
                  style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: textColor }}
                >
                  <Clock 
                    className="w-6 h-6"
                    style={{ color: textColor }}
                  />
                  Kalkış Saatleri ve Fiyatlar
                  <Sparkles 
                    className="w-5 h-5 animate-pulse"
                    style={{ color: textColor }}
                  />
                </p>
                <div className="grid gap-3">
                  {service.categoryDetails.departureTimes.map((time: any, index: number) => (
                    <div 
                      key={index} 
                      className="flex justify-between items-center p-4 bg-white/80 backdrop-blur-sm rounded-xl border-2 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300 animate-in slide-in-from-right-4" 
                      style={{ 
                        animationDelay: `${index * 100}ms`,
                        borderColor: textColor
                      }}
                    >
                      <div className="flex items-center gap-3">
                        <div 
                          className="w-10 h-10 rounded-lg flex items-center justify-center shadow-md" 
                          style={backgroundStyle}
                        >
                          <Clock className="w-5 h-5 text-white" />
                        </div>
                        <span 
                          className="font-bold text-lg"
                          style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: textColor }}
                        >{time.time}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span 
                          className="font-bold text-xl"
                          style={{ color: textColor, fontFamily: 'Helvetica, Arial, sans-serif' }}
                        >{time.price} ₺</span>
                        <Star 
                          className="w-5 h-5 fill-current animate-pulse"
                          style={{ color: textColor }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Region Tours Specific Details */}
            {assignment.serviceCategory === "region-tours" && (
              <div className="space-y-6">
                {/* Tur Bilgisi Açıklaması */}
                {service.categoryDetails?.tourInfo && (
                  <div className="space-y-3">
                    <p 
                      className="font-bold text-lg flex items-center gap-3"
                      style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: textColor }}
                    >
                      <Info 
                        className="w-6 h-6"
                        style={{ color: textColor }}
                      />
                      Tur Bilgisi Açıklaması
                    </p>
                    <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm">
                      <p 
                        className="leading-relaxed"
                        style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: textColor }}
                      >
                        {service.categoryDetails.tourInfo}
                      </p>
                    </div>
                  </div>
                )}

                {/* Tura Dahil Olanlar */}
                {service.categoryDetails?.included && (
                  <div className="space-y-3">
                    <p 
                      className="font-bold text-lg flex items-center gap-3"
                      style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: textColor }}
                    >
                      <Check 
                        className="w-6 h-6"
                        style={{ color: textColor }}
                      />
                      Tura Dahil Olanlar
                    </p>
                    <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm">
                      <p 
                        className="leading-relaxed"
                        style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: textColor }}
                      >
                        {service.categoryDetails.included}
                      </p>
                    </div>
                  </div>
                )}

                {/* Turda Hariç Olanlar */}
                {service.categoryDetails?.excluded && (
                  <div className="space-y-3">
                    <p 
                      className="font-bold text-lg flex items-center gap-3"
                      style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: textColor }}
                    >
                      <X 
                        className="w-6 h-6"
                        style={{ color: textColor }}
                      />
                      Turda Hariç Olanlar
                    </p>
                    <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm">
                      <p 
                        className="leading-relaxed"
                        style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: textColor }}
                      >
                        {service.categoryDetails.excluded}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* VIP Badge */}
            {assignment.serviceCategory === "region-tours" && service.categoryDetails?.isVIP && (
              <div className={`flex items-center gap-4 p-4 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-xl border border-amber-200 shadow-lg animate-in zoom-in-95 duration-500`}>
                <div className="w-12 h-12 bg-gradient-to-br from-amber-400 to-yellow-500 rounded-xl flex items-center justify-center shadow-lg animate-pulse">
                  <Award className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <span className="font-bold text-amber-900 text-lg">👑 VIP Tur - Özel Hizmet</span>
                  <p className="text-amber-700 text-sm" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Premium deneyim ve özel ayrıcalıklar</p>
                </div>
                <Sparkles className="w-6 h-6 text-amber-600 animate-spin" />
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}