"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { FileText, Sparkles, ChevronDown, ChevronUp } from "lucide-react";

interface ServiceGeneralNotesProps {
  service: any;
  theme: any;
  isOpen: boolean;
  onToggle: (open: boolean) => void;
}

export function ServiceGeneralNotes({ service, theme, isOpen, onToggle }: ServiceGeneralNotesProps) {
  if (!service.notes) return null;

  // Get the background style from theme
  const backgroundStyle = theme.customStyle?.background ? 
    { background: theme.customStyle.background } : 
    { backgroundColor: theme.customStyle?.backgroundColor || '#dc2626' };
  
  // Get text color based on background style
  const textColor = theme.customStyle?.backgroundColor || '#dc2626';

  return (
    <Collapsible open={isOpen} onOpenChange={onToggle}>
      <Card 
        className="backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-500 animate-in fade-in-0 slide-in-from-right-4 delay-200 border-2"
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
                  className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md"
                  style={backgroundStyle}
                >
                  <FileText className="h-5 w-5 text-white" />
                </div>
                Hizmet Notları
                <Sparkles 
                  className="w-5 h-5 animate-pulse"
                  style={{ color: textColor }}
                />
              </div>
              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </CardTitle>
          </CardHeader>
        </CollapsibleTrigger>
        <CollapsibleContent>
          <CardContent>
            <p 
              className="leading-relaxed font-medium text-lg" 
              style={{ color: textColor }}
            >{service.notes}</p>
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}