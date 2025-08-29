"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Info, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { AssignmentData } from "@/lib/assignments";
import { ServiceData } from "@/lib/services";

interface ServiceTourInformationProps {
    assignment: AssignmentData;
    service: ServiceData;
    theme: any;
    isOpen: boolean;
    onToggle: (open: boolean) => void;
}

const getTourInfoForCategory = (category: string, details: any): string | null => {
    if (!details) return null;

    switch (category) {
        case "region-tours":
            return details.tourInfo || null;
        case "motor-tours":
            return details.routeDetails?.description || details.tourDetails || null;
        case "balloon":
            return details.flightInfo?.flightArea || null;
        case "transfer":
            return details.routeDetails?.notes || null;
        case "other":
            return details.tourDetails || null;
        default:
            return null;
    }
};

export function ServiceTourInformation({ assignment, service, theme, isOpen, onToggle }: ServiceTourInformationProps) {
    const backgroundStyle = theme.customStyle?.background ?
        { background: theme.customStyle.background } :
        { backgroundColor: theme.customStyle?.backgroundColor || '#dc2626' };

    const textColor = theme.customStyle?.backgroundColor || '#dc2626';

    const tourInfoText = getTourInfoForCategory(assignment.serviceCategory, service.categoryDetails);

    if (!tourInfoText) {
        return null;
    }

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
                                    <Info className="h-5 w-5 text-white" />
                                </div>
                                Tur Bilgisi
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
                            style={{ color: 'red', fontFamily: 'Helvetica, Arial, sans-serif', fontSize: '1.1rem' }}
                        >
                            {tourInfoText}
                        </p>
                    </CardContent>
                </CollapsibleContent>
            </Card>
        </Collapsible>
    );
}

export default ServiceTourInformation;