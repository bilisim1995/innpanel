"use client";

import { Badge } from "@/components/ui/badge";

interface ReservationHeaderProps {
  assignment: any;
  themeColor: string;
}

export function ReservationHeader({ assignment, themeColor }: ReservationHeaderProps) {
  return (
    <div className="text-center space-y-2">
      <h2 className="text-3xl font-bold text-gray-900" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Rezervasyon Yap</h2>
      <p className="text-lg text-gray-600" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>{assignment.serviceName}</p>
      <Badge 
        variant="secondary" 
        className="text-base"
        style={{ backgroundColor: `${themeColor}20`, color: themeColor, borderColor: `${themeColor}40`, fontFamily: 'Helvetica, Arial, sans-serif' }}
      >
        {assignment.companyName}
      </Badge>
    </div>
  );
}