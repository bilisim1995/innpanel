"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User, Phone, AlertCircle, MessageSquare } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";

interface ReservationCustomerInfoProps {
  customerName: string;
  customerSurname: string;
  customerPhone: string;
  visitorNote: string;
  onCustomerNameChange: (value: string) => void;
  onCustomerSurnameChange: (value: string) => void;
  onCustomerPhoneChange: (value: string) => void;
  onVisitorNoteChange: (value: string) => void;
  themeColor: string;
  errors: {[key: string]: string};
}

export function ReservationCustomerInfo({
  customerName,
  customerSurname,
  customerPhone,
  visitorNote,
  onCustomerNameChange,
  onCustomerSurnameChange,
  onCustomerPhoneChange,
  onVisitorNoteChange,
  themeColor,
  errors
}: ReservationCustomerInfoProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle 
          className="flex items-center gap-2 text-lg"
          style={{ color: themeColor, fontFamily: 'Helvetica, Arial, sans-serif' }}
        >
          <User className="h-5 w-5" />
          Rezervasyon Yapan Kişi Bilgileri
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerName" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Ad *
            </Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              placeholder="Adınızı girin"
              className={errors.customerName ? "border-red-500" : ""}
            />
            {errors.customerName && (
              <p className="text-sm text-red-500">{errors.customerName}</p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="customerSurname" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Soyad *
            </Label>
            <Input
              id="customerSurname"
              value={customerSurname}
              onChange={(e) => onCustomerSurnameChange(e.target.value)}
              placeholder="Soyadınızı girin"
              className={errors.customerSurname ? "border-red-500" : ""}
            />
            {errors.customerSurname && (
              <p className="text-sm text-red-500">{errors.customerSurname}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPhone" className="flex items-center gap-2">
            <Phone className="h-4 w-4" />
            Cep Telefonu *
          </Label>
          <Input 
            id="customerPhone"
            value={customerPhone}
            onChange={(e) => onCustomerPhoneChange(e.target.value)}
            placeholder="5XX XXX XX XX"
            className={errors.customerPhone ? "border-red-500" : ""}
          />
          {errors.customerPhone && (
            <p className="text-sm text-red-500 flex items-center gap-1">
              <AlertCircle className="h-4 w-4" />
              {errors.customerPhone}
            </p>
          )}
          <p className="text-xs text-muted-foreground">
            Rezervasyon onayı ve bilgilendirme için kullanılacaktır
          </p>
        </div>
        <div className="space-y-2">
            <Label htmlFor="visitorNote" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Ziyaretçi Notu
            </Label>
            <Textarea
                id="visitorNote"
                value={visitorNote}
                onChange={(e) => onVisitorNoteChange(e.target.value)}
                placeholder="Eklemek istediğiniz notlar..."
            />
        </div>
      </CardContent>
    </Card>
  );
}
