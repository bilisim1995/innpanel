
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getNotificationEmail, getWhatsAppNotificationNumber } from '@/lib/settings';
import { formatPhoneNumberForWhatsApp } from '@/lib/utils';
import path from 'path';
import fs from 'fs/promises';

// Function to load translations
async function loadTranslations(locale: string) {
  const filePath = path.join(process.cwd(), `public/locales/${locale}/common.json`);
  try {
    const fileContents = await fs.readFile(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error(`Error loading translations for locale ${locale}:`, error);
    // Fallback to English if translation fails
    const fallbackFilePath = path.join(process.cwd(), `public/locales/en/common.json`);
    const fallbackFileContents = await fs.readFile(fallbackFilePath, 'utf8');
    return JSON.parse(fallbackFileContents);
  }
}

const CURRENCY_SYMBOLS: Record<string, string> = {
  TRY: '₺',
  USD: '$',
  EUR: '€',
  TL: '₺',
};

function formatAmount(amount: number, currency: string): string {
  const symbol = CURRENCY_SYMBOLS[currency?.toUpperCase()] || currency;
  return `${parseFloat(amount.toFixed(2)).toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbol}`;
}

// --- E-POSTA ŞABLONLARI ---

const createAdminEmailHtml = (data: any, t: any): string => `
  <html lang="${data.locale || 'en'}">
    <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            h1 { color: #0056b3; }
        </style>
    </head>
    <body>
      <div class="container">
        <h1>${t['admin_email_title']}</h1>
        <p><strong>${t['admin_email_service_name']}:</strong> ${data.serviceName}</p>
        <h3>${t['admin_email_reservation_details_title']}</h3>
        <ul>
          <li><strong>${t['admin_email_date']}:</strong> ${data.reservationDetails.date ? new Date(data.reservationDetails.date).toLocaleDateString(data.locale || 'tr-TR', { timeZone: 'Europe/Istanbul' }) : 'Tarih belirtilmedi'}</li>
          <li><strong>${t['admin_email_time']}:</strong> ${data.reservationDetails.timeSlot}</li>
          <li><strong>${t['admin_email_participants']}:</strong> ${data.reservationDetails.adults} ${t['admin_email_adults']}, ${data.reservationDetails.children || 0} ${t['admin_email_children']}</li>
          ${data.reservationDetails.flightCode ? `<li><strong>${t['admin_email_flight_code']}:</strong> ${data.reservationDetails.flightCode}</li>` : ''}
        </ul>
        <h3>${t['admin_email_customer_info_title']}</h3>
        <ul>
          <li><strong>${t['admin_email_name_surname']}:</strong> ${data.customerInfo.name} ${data.customerInfo.surname}</li>
          <li><strong>${t['admin_email_phone']}:</strong> ${data.customerInfo.phone}</li>
          <li><strong>${t['admin_email_email']}:</strong> ${data.customerInfo.email}</li>
          ${data.customerInfo.notes ? `<li><strong>${t['admin_email_notes']}:</strong> ${data.customerInfo.notes}</li>` : ''}
        </ul>
        <hr>
        <h3>${t['admin_email_total_amount']}: ${formatAmount(data.totalAmount, data.currency)}</h3>
      </div>
    </body>
  </html>
`;

const createCustomerEmailHtml = (data: any, t: any): string => `
  <html lang="${data.locale || 'en'}">
     <head>
        <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px; }
            h1 { color: #28a745; }
        </style>
    </head>
    <body>
      <div class="container">
        <h1>${t['customer_email_title']}</h1>
        <p>${t['customer_email_greeting'].replace('{{customerName}}', data.customerInfo.name)},</p>
        <p>${t['customer_email_confirmation_message'].replace('{{serviceName}}', data.serviceName)}</p>
        <ul>
          <li><strong>${t['customer_email_date']}:</strong> ${data.reservationDetails.date ? new Date(data.reservationDetails.date).toLocaleDateString(data.locale || 'tr-TR', { timeZone: 'Europe/Istanbul' }) : 'Tarih belirtilmedi'}</li>
          <li><strong>${t['customer_email_time']}:</strong> ${data.reservationDetails.timeSlot}</li>
          <li><strong>${t['customer_email_participants']}:</strong> ${data.reservationDetails.adults} ${t['customer_email_adults']}, ${data.reservationDetails.children || 0} ${t['customer_email_children']}</li>
          ${data.reservationDetails.flightCode ? `<li><strong>${t['customer_email_flight_code']}:</strong> ${data.reservationDetails.flightCode}</li>` : ''}
          <li><strong>${t['customer_email_total_amount']}:</strong> ${formatAmount(data.totalAmount, data.currency)}</li>
        </ul>
        <p>${t['customer_email_enjoy_message']}</p>
      </div>
    </body>
  </html>
`;


// --- WHATSAPP ŞABLONLARI ---

const formatAdminWhatsAppMessage = (data: any, t: any): string => {
  const { serviceName, reservationDetails, customerInfo, totalAmount, currency } = data;
  const adultsText = `${reservationDetails.adults} ${t['admin_whatsapp_adults']}`;
  const childrenText = reservationDetails.children > 0 ? `, ${reservationDetails.children} ${t['admin_whatsapp_children']}` : '';
  
  return `*${t['admin_whatsapp_new_reservation_title']}*

*${t['admin_whatsapp_service']}*: ${serviceName}
*${t['admin_whatsapp_customer']}*: ${customerInfo.name} ${customerInfo.surname || ''}
*${t['admin_whatsapp_phone']}*: ${customerInfo.phone}
*${t['admin_whatsapp_date']}*: ${data.reservationDetails.date ? new Date(data.reservationDetails.date).toLocaleDateString(data.locale || 'tr-TR', { timeZone: 'Europe/Istanbul' }) : 'Tarih belirtilmedi'}
*${t['admin_whatsapp_time']}*: ${reservationDetails.timeSlot}
*${t['admin_whatsapp_participants']}*: ${adultsText}${childrenText}
${reservationDetails.flightCode ? `*${t['admin_whatsapp_flight_code']}*: ${reservationDetails.flightCode}\n` : ''}*${t['admin_whatsapp_total_amount']}*: ${formatAmount(totalAmount, currency)}

*${t['admin_whatsapp_customer_note']}*:
_${customerInfo.notes || t['admin_whatsapp_no_note']}_`;
};

const formatCustomerWhatsAppMessage = (data: any, t: any): string => {
  const { serviceName, reservationDetails, customerInfo, totalAmount, currency } = data;
  const adultsText = `${reservationDetails.adults} ${t['customer_whatsapp_adults']}`;
  const childrenText = reservationDetails.children > 0 ? `, ${reservationDetails.children} ${t['customer_whatsapp_children']}` : '';

  return `${t['customer_whatsapp_greeting'].replace('{{customerName}}', customerInfo.name)}

${t['customer_whatsapp_reservation_confirmed']}

*${t['customer_whatsapp_service']}*: ${serviceName}
*${t['customer_whatsapp_date']}*: ${data.reservationDetails.date ? new Date(data.reservationDetails.date).toLocaleDateString(data.locale || 'tr-TR', { timeZone: 'Europe/Istanbul' }) : 'Tarih belirtilmedi'}
*${t['customer_whatsapp_time']}*: ${reservationDetails.timeSlot}
*${t['customer_whatsapp_participants']}*: ${adultsText}${childrenText}
${reservationDetails.flightCode ? `*${t['customer_whatsapp_flight_code']}*: ${reservationDetails.flightCode}\n` : ''}*${t['customer_whatsapp_total_amount']}*: *${formatAmount(totalAmount, currency)}*

${t['customer_whatsapp_contact_us']}`;
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
    secure: process.env.SMTP_SECURE === 'true' || process.env.SMTP_PORT === '465',
    auth: { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS },
  });

  const locale = reservationData.locale || 'en'; // Default to 'en' if not provided
  console.log('Received locale:', locale); // Eklenen loglama satırı
  const t = await loadTranslations(locale);

  // 1. Yöneticiye E-posta Gönder
  const adminEmail = await getNotificationEmail() || process.env.RECEIVER_EMAIL;
  if (adminEmail) {
    notificationPromises.push(transporter.sendMail({
        from: `"${process.env.SENDER_NAME || 'INNGET Rezervasyon'}" <${process.env.SMTP_USER}>`,
        to: adminEmail,
        subject: t['admin_email_subject'].replace('{{serviceName}}', reservationData.serviceName),
        html: createAdminEmailHtml(reservationData, t),
    }).catch(err => console.error("Yönetici e-postası gönderilemedi:", err)));
  }

  // 2. Müşteriye E-posta Gönder
  const customerEmail = reservationData.customerInfo.email;
  if (customerEmail) {
    notificationPromises.push(transporter.sendMail({
        from: `"${process.env.SENDER_NAME || 'INNGET'} Rezervasyon Onayı" <${process.env.SMTP_USER}>`,
        to: customerEmail,
        subject: t['customer_email_subject'].replace('{{serviceName}}', reservationData.serviceName),
        html: createCustomerEmailHtml(reservationData, t),
    }).catch(err => console.error("Müşteri e-postası gönderilemedi:", err)));
  }

  // 3. Yöneticiye WhatsApp Gönder
  const adminWhatsAppNumber = await getWhatsAppNotificationNumber();
  if (adminWhatsAppNumber) {
    const formattedAdminNumber = formatPhoneNumberForWhatsApp(adminWhatsAppNumber);
    if (formattedAdminNumber) {
        notificationPromises.push(sendGreenApiMessage(formattedAdminNumber, formatAdminWhatsAppMessage(reservationData, t)));
    }
  }

  // 4. Müşteriye WhatsApp Gönder
  const customerPhoneNumber = reservationData.customerInfo.phone;
  if (customerPhoneNumber) {
    const formattedCustomerPhone = formatPhoneNumberForWhatsApp(customerPhoneNumber);
    if (formattedCustomerPhone) {
        notificationPromises.push(sendGreenApiMessage(formattedCustomerPhone, formatCustomerWhatsAppMessage(reservationData, t)));
    }
  }
  
  // 5. Tüm bildirimleri gönder
  await Promise.allSettled(notificationPromises);

  return NextResponse.json({ message: 'Bildirimler işleme alındı.' }, { status: 200 });
}
