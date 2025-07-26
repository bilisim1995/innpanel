
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getNotificationEmail, getWhatsAppNotificationNumber } from '@/lib/settings';
import { formatPhoneNumberForWhatsApp } from '@/lib/utils';

// --- E-POSTA ŞABLONLARI ---

const createAdminEmailHtml = (data: any): string => `
  <html lang="tr">
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            h1 { color: #0056b3; }
        </style>
    </head>
    <body>
      <div class="container">
        <h1>INNGET - Yeni Rezervasyon Bildirimi</h1>
        <p><strong>Hizmet Adı:</strong> ${data.serviceName}</p>
        <h3>Rezervasyon Detayları</h3>
        <ul>
          <li><strong>Tarih:</strong> ${new Date(data.reservationDetails.date).toLocaleDateString('tr-TR')}</li>
          <li><strong>Saat:</strong> ${data.reservationDetails.timeSlot}</li>
          <li><strong>Katılımcılar:</strong> ${data.reservationDetails.adults} Yetişkin, ${data.reservationDetails.children || 0} Çocuk</li>
        </ul>
        <h3>Müşteri Bilgileri</h3>
        <ul>
          <li><strong>Adı Soyadı:</strong> ${data.customerInfo.name}</li>
          <li><strong>Telefon:</strong> ${data.customerInfo.phone}</li>
          <li><strong>E-posta:</strong> ${data.customerInfo.email}</li>
          ${data.customerInfo.notes ? `<li><strong>Notlar:</strong> ${data.customerInfo.notes}</li>` : ''}
        </ul>
        <hr>
        <h3>Toplam Tutar: ${data.totalAmount} ${data.currency}</h3>
      </div>
    </body>
  </html>
`;

const createCustomerEmailHtml = (data: any): string => `
  <html lang="tr">
     <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            h1 { color: #28a745; }
        </style>
    </head>
    <body>
      <div class="container">
        <h1>Rezervasyon Onayınız</h1>
        <p>Sayın ${data.customerInfo.name},</p>
        <p><strong>${data.serviceName}</strong> hizmeti için yaptığınız rezervasyon başarıyla onaylanmıştır. Detayları aşağıda bulabilirsiniz:</p>
        <ul>
          <li><strong>Tarih:</strong> ${new Date(data.reservationDetails.date).toLocaleDateString('tr-TR')}</li>
          <li><strong>Saat:</strong> ${data.reservationDetails.timeSlot}</li>
          <li><strong>Katılımcılar:</strong> ${data.reservationDetails.adults} Yetişkin, ${data.reservationDetails.children || 0} Çocuk</li>
          <li><strong>Toplam Tutar:</strong> ${data.totalAmount} ${data.currency}</li>
        </ul>
        <p>İyi eğlenceler dileriz!</p>
      </div>
    </body>
  </html>
`;


// --- WHATSAPP ŞABLONLARI ---

const formatAdminWhatsAppMessage = (data: any): string => {
  const { serviceName, reservationDetails, customerInfo, totalAmount, currency } = data;
  return `*Yeni Rezervasyon Bildirimi!*

*Hizmet:* ${serviceName}
*Müşteri:* ${customerInfo.name}
*Telefon:* ${customerInfo.phone}
*Tarih:* ${new Date(reservationDetails.date).toLocaleDateString('tr-TR')}
*Saat:* ${reservationDetails.timeSlot}
*Katılımcılar:* ${reservationDetails.adults} Yetişkin, ${reservationDetails.children || 0} Çocuk
*Toplam Tutar:* ${totalAmount} ${currency}

*Müşteri Notu:*
_${customerInfo.notes || 'Not bırakılmadı'}_`;
};

const formatCustomerWhatsAppMessage = (data: any): string => {
  const { serviceName, reservationDetails, customerInfo, totalAmount, currency } = data;
  return `Sayın *${customerInfo.name}*,

INNGET aracılığıyla yapmış olduğunuz rezervasyonunuz başarıyla onaylanmıştır. ✅

*Hizmet:* ${serviceName}
*Tarih:* ${new Date(reservationDetails.date).toLocaleDateString('tr-TR')}
*Saat:* ${reservationDetails.timeSlot}
*Katılımcılar:* ${reservationDetails.adults} Yetişkin, ${reservationDetails.children || 0} Çocuk
*Toplam Tutar:* *${totalAmount} ${currency}*

Herhangi bir sorunuz olursa lütfen bizimle iletişime geçin.`;
};


// --- GÖNDERİM FONKSİYONLARI ---

const sendGreenApiMessage = (phoneNumber: string, message: string) => {
  const { GREEN_API_ID_INSTANCE, GREEN_API_API_TOKEN_INSTANCE } = process.env;
  if (!GREEN_API_ID_INSTANCE || !GREEN_API_API_TOKEN_INSTANCE) {
    console.error('Green API ortam değişkenleri (ID ve Token) ayarlanmamış.');
    return Promise.reject({ source: 'whatsapp', error: new Error('Green API credentials not set') });
  }
  const apiUrl = `https://7105.api.greenapi.com/waInstance${GREEN_API_ID_INSTANCE}/sendMessage/${GREEN_API_API_TOKEN_INSTANCE}`;
  return fetch(apiUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId: `${phoneNumber}@c.us`, message: message }),
  })
  .then(async response => {
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Green API Hatası: ${JSON.stringify(errorData)}`);
    }
    return response.json();
  })
  .catch(error => {
    console.error('Green API gönderim hatası:', error);
    return Promise.reject({ source: 'whatsapp', error });
  });
};


// --- ANA API ROTASI ---

export async function POST(req: NextRequest) {
  const reservationData = await req.json();
  const notificationPromises = [];
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  // 1. Yöneticiye E-posta Gönder
  const adminEmail = await getNotificationEmail();
  if (adminEmail) {
    notificationPromises.push(transporter.sendMail({
        from: `"INNGET Rezervasyon" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: `INNGET Yeni Rezervasyon: ${reservationData.serviceName}`,
        html: createAdminEmailHtml(reservationData),
    }).catch(err => console.error("Yönetici e-postası gönderilemedi:", err)));
  }

  // 2. Müşteriye E-posta Gönder
  const customerEmail = reservationData.customerInfo.email;
  if (customerEmail) {
    notificationPromises.push(transporter.sendMail({
        from: `"INNGET Rezervasyon Onayı" <${process.env.SMTP_USER}>`,
        to: customerEmail,
        subject: `Rezervasyon Onayınız: ${reservationData.serviceName}`,
        html: createCustomerEmailHtml(reservationData),
    }).catch(err => console.error("Müşteri e-postası gönderilemedi:", err)));
  }

  // 3. Yöneticiye WhatsApp Gönder
  const adminWhatsAppNumber = await getWhatsAppNotificationNumber();
  if (adminWhatsAppNumber) {
    const formattedAdminNumber = formatPhoneNumberForWhatsApp(adminWhatsAppNumber);
    if (formattedAdminNumber) {
        notificationPromises.push(sendGreenApiMessage(formattedAdminNumber, formatAdminWhatsAppMessage(reservationData)));
    }
  }

  // 4. Müşteriye WhatsApp Gönder
  const customerPhoneNumber = reservationData.customerInfo.phone;
  if (customerPhoneNumber) {
    const formattedCustomerPhone = formatPhoneNumberForWhatsApp(customerPhoneNumber);
    if (formattedCustomerPhone) {
        notificationPromises.push(sendGreenApiMessage(formattedCustomerPhone, formatCustomerWhatsAppMessage(reservationData)));
    }
  }
  
  // 5. Tüm bildirimleri gönder
  await Promise.allSettled(notificationPromises);

  return NextResponse.json({ message: 'Bildirimler işleme alındı.' }, { status: 200 });
}
