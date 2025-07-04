"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ReservationContactProps {
  assignment: any;
}

export function ReservationContact({ assignment }: ReservationContactProps) {
  return (
    <Card className="bg-gray-50">
      <CardHeader>
        <CardTitle className="text-xl" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>İletişim ve Bilgi</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-base text-gray-700 mb-4" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
          Rezervasyon hakkında sorularınız için bizimle iletişime geçebilirsiniz.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="font-medium text-base" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Telefon:</span>
            <p className="text-base text-gray-600" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>{assignment.serviceDetails?.contactNumber}</p>
          </div>
          <div>
            <span className="font-medium text-base" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>Sorumlu:</span>
            <p className="text-base text-gray-600" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>{assignment.serviceDetails?.manager}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}