"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Phone, User, Building2, Heart, ChevronDown, ChevronUp } from "lucide-react";

interface ServiceContactProps {
  service: any;
  theme: any;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

export function ServiceContact({ service, theme, isOpen, onToggle }: ServiceContactProps) {
  // Get the background style from theme
  const backgroundStyle = theme.customStyle?.background ? 
    { background: theme.customStyle.background } : 
    { backgroundColor: theme.customStyle?.backgroundColor || '#dc2626' };
  
  // Get text color based on background style
  const textColor = theme.customStyle?.backgroundColor || '#dc2626';
  
  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card 
        className="backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 animate-in fade-in-0 slide-in-from-left-4 delay-700 border-2"
        style={{ 
          backgroundColor: `${textColor}10`,
          borderColor: `${textColor}20`
        }}
      >
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-white/20 transition-colors duration-200">
            <CardTitle 
              className="flex items-center justify-between text-lg"
              style={{ color: textColor }}
            >
              <div className="flex items-center gap-3">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md animate-pulse"
                  style={backgroundStyle}
                >
                  <Phone className="h-5 w-5 text-white" />
                </div>
                İletişim ve Rezervasyon
                <Heart 
                  className="w-5 h-5 fill-current animate-pulse"
                  style={{ color: textColor, fontFamily: 'Helvetica, Arial, sans-serif' }}
                />
              </div>
              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent className="space-y-6">
            <p 
              className="leading-relaxed font-medium"
              style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: textColor }}
            >
              Bu hizmet hakkında daha fazla bilgi almak veya rezervasyon yapmak için aşağıdaki iletişim bilgilerini kullanabilirsiniz.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                  style={backgroundStyle}
                >
                  <Phone className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p 
                    className="font-bold"
                    style={{ color: textColor, fontFamily: 'Helvetica, Arial, sans-serif' }}
                  >Telefon</p>
                  <p 
                    className="font-medium"
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: textColor }}
                  >{service.contactNumber}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                  style={backgroundStyle}
                >
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p 
                    className="font-bold"
                    style={{ color: textColor, fontFamily: 'Helvetica, Arial, sans-serif' }}
                  >Sorumlu</p>
                  <p 
                    className="font-medium"
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: textColor }}
                  >{service.manager}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-white/40 shadow-sm hover:shadow-md hover:scale-105 transition-all duration-300">
                <div 
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                  style={backgroundStyle}
                >
                  <Building2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p 
                    className="font-bold"
                    style={{ color: textColor, fontFamily: 'Helvetica, Arial, sans-serif' }}
                  >Firma</p>
                  <p 
                    className="font-medium"
                    style={{ fontFamily: 'Helvetica, Arial, sans-serif', color: textColor }}
                  >{service.companyName}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}