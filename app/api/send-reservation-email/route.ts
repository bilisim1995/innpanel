
import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getNotificationEmail } from '@/lib/settings';

export async function POST(req: NextRequest) {
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fallbackReceiverEmail = process.env.RECEIVER_EMAIL; // Yedek e-posta

  if (!smtpUser || !smtpPass || !fallbackReceiverEmail) {
    console.error("HATA: SMTP ortam değişkenleri eksik.");
    return NextResponse.json({ success: false, message: 'Sunucu yapılandırması eksik.' }, { status: 500 });
  }

  try {
    // Alıcı e-postasını veritabanından çek
    const dynamicReceiverEmail = await getNotificationEmail();
    const receiverEmail = dynamicReceiverEmail || fallbackReceiverEmail;
    
    console.log(`LOG: Rezervasyon e-postası şu adrese gönderilecek: ${receiverEmail}`);

    const { reservationDetails, customerInfo, serviceName, totalAmount, currency } = await req.json();

    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    const subject = `INNGET Yeni Rezervasyon: ${serviceName}`;
    const textContent = `
      INNGET - YENİ REZERVASYON BİLDİRİMİ
      -----------------------------------------
      Hizmet Adı: ${serviceName}
      Tarih: ${new Date(reservationDetails.date).toLocaleDateString('tr-TR')}
      Saat: ${reservationDetails.timeSlot}
      Yetişkin: ${reservationDetails.adults}
      Çocuk: ${reservationDetails.children}
      -----------------------------------------
      Müşteri Adı Soyadı: ${customerInfo.name}
      Telefon: ${customerInfo.phone}
      E-posta: ${customerInfo.email}
      ${customerInfo.notes ? `Notlar: ${customerInfo.notes}` : ''}
      -----------------------------------------
      TOPLAM TUTAR: ${totalAmount} ${currency}
    `;
    const htmlContent = `
      <html lang="tr">
        <body>
          <h1>INNGET Yeni Rezervasyon</h1>
          <p><strong>Hizmet Adı:</strong> ${serviceName}</p>
          <h3>Rezervasyon Detayları</h3>
          <ul>
            <li><strong>Tarih:</strong> ${new Date(reservationDetails.date).toLocaleDateString('tr-TR')}</li>
            <li><strong>Saat:</strong> ${reservationDetails.timeSlot}</li>
            <li><strong>Yetişkin:</strong> ${reservationDetails.adults}</li>
            <li><strong>Çocuk:</strong> ${reservationDetails.children}</li>
          </ul>
          <h3>Müşteri Bilgileri</h3>
          <ul>
            <li><strong>Adı Soyadı:</strong> ${customerInfo.name}</li>
            <li><strong>Telefon:</strong> ${customerInfo.phone}</li>
            <li><strong>E-posta:</strong> ${customerInfo.email}</li>
            ${customerInfo.notes ? `<li><strong>Notlar:</strong> ${customerInfo.notes}</li>` : ''}
          </ul>
          <hr>
          <h3>Toplam Tutar: ${totalAmount} ${currency}</h3>
        </body>
      </html>
    `;
    
    await transporter.sendMail({
      from: `"INNGET Rezervasyon" <${smtpUser}>`,
      to: receiverEmail,
      subject: subject,
      html: htmlContent,
      text: textContent,
    });

    return NextResponse.json({ success: true, message: 'Reservation email sent successfully.' });
  } catch (error) {
    console.error('Rezervasyon e-postası (Gmail) gönderilirken hata:', error);
    return NextResponse.json({ success: false, message: 'Failed to send email.' }, { status: 500 });
  }
}
