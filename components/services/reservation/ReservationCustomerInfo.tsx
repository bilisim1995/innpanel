
"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { PhoneInput } from "@/components/ui/phone-input";
import { User, Mail, Phone, MessageSquare } from "lucide-react";

interface ReservationCustomerInfoProps {
  customerName: string;
  customerSurname: string;
  customerEmail: string;
  customerPhone: string;
  visitorNote: string;
  onCustomerNameChange: (value: string) => void;
  onCustomerSurnameChange: (value: string) => void;
  onCustomerEmailChange: (value: string) => void;
  onCustomerPhoneChange: (value: string) => void;
  onVisitorNoteChange: (value: string) => void;
  themeColor: string;
  errors: { [key: string]: string };
}

export function ReservationCustomerInfo({
  customerName,
  customerSurname,
  customerEmail,
  customerPhone,
  visitorNote,
  onCustomerNameChange,
  onCustomerSurnameChange,
  onCustomerEmailChange,
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
          Müşteri Bilgileri
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="customerName">Ad</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={(e) => onCustomerNameChange(e.target.value)}
              placeholder="Adınız"
              className={errors.customerName ? 'border-red-500' : ''}
            />
            {errors.customerName && <p className="text-sm text-red-600">{errors.customerName}</p>}
          </div>
          <div className="space-y-2">
            <Label htmlFor="customerSurname">Soyad</Label>
            <Input
              id="customerSurname"
              value={customerSurname}
              onChange={(e) => onCustomerSurnameChange(e.target.value)}
              placeholder="Soyadınız"
              className={errors.customerSurname ? 'border-red-500' : ''}
            />
            {errors.customerSurname && <p className="text-sm text-red-600">{errors.customerSurname}</p>}
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerEmail" className="flex items-center gap-2"><Mail className="h-4 w-4" /> E-posta Adresi</Label>
          <Input
            id="customerEmail"
            type="email"
            value={customerEmail}
            onChange={(e) => onCustomerEmailChange(e.target.value)}
            placeholder="E-posta adresiniz"
            className={errors.customerEmail ? 'border-red-500' : ''}
          />
          {errors.customerEmail && <p className="text-sm text-red-600">{errors.customerEmail}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerPhone" className="flex items-center gap-2"><Phone className="h-4 w-4" /> Telefon Numarası</Label>
          <PhoneInput
            value={customerPhone}
            onChange={onCustomerPhoneChange}
            className={errors.customerPhone ? '[&>input]:border-red-500' : ''}
          />
          {errors.customerPhone && <p className="text-sm text-red-600">{errors.customerPhone}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="visitorNote" className="flex items-center gap-2"><MessageSquare className="h-4 w-4" /> Ziyaretçi Notu (İsteğe Bağlı)</Label>
          <Textarea
            id="visitorNote"
            value={visitorNote}
            onChange={(e) => onVisitorNoteChange(e.target.value)}
            placeholder="Özel istekleriniz veya notlarınız..."
          />
        </div>
      </CardContent>
    </Card>
  );
}
