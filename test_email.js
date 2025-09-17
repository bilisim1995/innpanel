
require('dotenv').config(); // Load environment variables from .env file

async function testEmailSending() {
  try {
    const response = await fetch('http://localhost:3000/api/send-reservation-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        serviceName: "Sadeleştirilmiş Test Mesajı",
        reservationDetails: {
          date: new Date().toISOString(),
          timeSlot: "Bilinmiyor",
          adults: 1,
          children: 0,
          flightCode: null,
        },
        customerInfo: {
          name: "Test",
          surname: "Kullanıcı",
          email: "bozkurt.bilisim@hotmail.com",
          phone: null,
          notes: "Bu sadeleştirilmiş bir test mesajıdır.",
        },
        totalAmount: 0,
        currency: "₺",
        locale: "tr",
      }),
    });

    const data = await response.json();

    if (response.ok) {
      console.log('API Response (Success):', data);
      console.log('Test e-postaları başarıyla gönderilmiş olmalı.');
      console.log('Lütfen bozkurt.bilisim@hotmail.com adresini ve yönetici e-posta adresinizi kontrol edin.');
    } else {
      console.error('API Response (Error):', data);
      console.error('E-posta gönderiminde bir sorun oluştu.');
    }
  } catch (error) {
    console.error('İstek gönderilirken bir hata oluştu:', error);
  }
}

testEmailSending();
