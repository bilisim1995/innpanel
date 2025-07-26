import { NextRequest, NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { getNotificationEmail } from '@/lib/settings';

export async function POST(req: NextRequest) {
  // 1. SMTP ve yedek alıcı bilgilerini ortam değişkenlerinden al
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const fallbackReceiverEmail = process.env.RECEIVER_EMAIL; // Veritabanında ayar yoksa kullanılacak yedek e-posta

  // Gerekli ortam değişkenlerinin varlığını kontrol et
  if (!smtpUser || !smtpPass || !fallbackReceiverEmail) {
    console.error("HATA: SMTP ortam değişkenleri eksik. Lütfen .env.local dosyanızı kontrol edin.");
    return NextResponse.json({ success: false, message: 'Sunucu yapılandırması eksik.' }, { status: 500 });
  }

  try {
    // 2. Alıcı e-postasını veritabanındaki ayarlardan çek
    const dynamicReceiverEmail = await getNotificationEmail();
    
    // 3. Veritabanından gelen e-posta adresi varsa onu, yoksa yedek adresi kullan
    const receiverEmail = dynamicReceiverEmail || fallbackReceiverEmail;
    
    console.log(`LOG: Rezervasyon e-postası şu adrese gönderilecek: ${receiverEmail}`);

    // İstekten gelen rezervasyon verilerini al
    const { reservationDetails, customerInfo, serviceName, totalAmount, currency } = await req.json();

    // 4. Nodemailer transport objesini oluştur
    let transporter = nodemailer.createTransport({
      service: 'gmail', // veya başka bir e-posta servis sağlayıcısı
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });

    // E-posta içeriğini oluştur
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
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            h1 { color: #1a1a1a; }
            h3 { border-bottom: 1px solid #eee; padding-bottom: 5px; margin-top: 20px; }
            ul { list-style-type: none; padding: 0; }
            li { margin-bottom: 10px; }
            strong { color: #555; }
            hr { border: 0; border-top: 1px solid #eee; }
            .container { max-width: 600px; margin: 20px auto; padding: 20px; border: 1px solid #ddd; border-radius: 5px; }
            .footer { margin-top: 20px; font-size: 0.8em; color: #777; text-align: center; }
          </style>
        </head>
        <body>
          <div class="container">
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
            <div class="footer">
              <p>Bu e-posta INNGET rezervasyon sistemi tarafından otomatik olarak gönderilmiştir.</p>
            </div>
          </div>
        </body>
      </html>
    `;
    
    // 5. E-postayı gönder
    await transporter.sendMail({
      from: `"INNGET Rezervasyon" <${smtpUser}>`,
      to: receiverEmail,
      subject: subject,
      html: htmlContent,
      text: textContent,
    });

    return NextResponse.json({ success: true, message: 'Reservation email sent successfully.' });
  } catch (error) {
    console.error('Rezervasyon e-postası gönderilirken hata:', error);
    return NextResponse.json({ success: false, message: 'Failed to send email.' }, { status: 500 });
  }
}