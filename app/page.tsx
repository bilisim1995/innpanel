"use client";

import {
  QrCodeIcon,
  PaperAirplaneIcon,
  SparklesIcon,
  MapIcon,
  BoltIcon,
  EllipsisHorizontalIcon
} from '@heroicons/react/24/outline';

export default function HomePage() {
  return (
    <main
      className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-cover bg-center text-white p-6 sm:p-8"
      style={{
        backgroundImage: "url('https://images.unsplash.com/photo-1532623471313-acb5d736d36e?q=80&w=2070&auto=format&fit=crop')",
      }}
    >
      {/* Ana arka planı karartarak yazının okunurluğunu artıran katman */}
      <div className="absolute inset-0 bg-black/60 z-0"></div>

      {/* YENİ: Arka plana eklenen saydam ve büyük sıcak hava balonu görseli */}
      <div className="absolute inset-0 z-[5] flex items-center justify-center overflow-hidden pointer-events-none">
        <img
          // Şeffaf arka planlı bir PNG görseli kullanıyoruz.
          src="https://www.pngall.com/wp-content/uploads/5/Hot-Air-Balloon-PNG-Free-Image.png"
          alt="Arka Plan Sıcak Hava Balonu"
          // Görselin yüksekliğini ekranın 3/4'ü kadar yapıp opaklığını %10'a düşürüyoruz.
          className="w-auto h-3/4 max-h-[80vh] object-contain opacity-10"
        />
      </div>

      {/* Ana İçerik Alanı */}
      <div className="relative z-10 flex flex-col items-center justify-center text-center w-full max-w-7xl mx-auto">
        
        {/* İçerik, saydam görselin üzerinde yer alır */}
        <div className="relative z-20 w-full p-4">

          {/* Ana Başlık ve Alt Başlık */}
          <div className="max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-4xl font-extrabold tracking-tight drop-shadow-lg">
              Konaklamanız <span className="text-amber-400">Unutulmaz Olsun</span>
            </h1>
            <p className="mt-4 text-lg md:text-xl max-w-3xl mx-auto text-gray-200 drop-shadow-md">
              Otelinizdeki transfer, sıcak hava balonu, bölge turları ve macera dolu motorlu aktiviteleri keşfedin.
            </p>
          </div>

          {/* Nasıl Çalışır? / QR Kod Eylem Çağrısı */}
          <div className="mt-16 bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20 max-w-2xl w-full mx-auto">
            <h2 className="text-2xl font-bold mb-6">Rezervasyon Çok Kolay!</h2>
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="flex-shrink-0">
                <QrCodeIcon className="w-28 h-28 text-amber-300" />
              </div>
              <div className="text-left">
                <ol className="list-decimal list-inside space-y-2 text-lg">
                  <li>Odanızda bulunan <strong className="font-semibold">QR kodu</strong> telefonunuzla taratın.</li>
                  <li>Size özel hazırlanmış aktivite listesinden seçiminizi yapın.</li>
                  <li>Anında rezervasyonunuzu tamamlayın ve maceraya katılın!</li>
                </ol>
              </div>
            </div>
          </div>

          {/* Aktiviteler Vitrini */}
          <div className="mt-20 w-full">
            <h3 className="text-3xl font-bold mb-8">Keşfedebileceğiniz Aktiviteler</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6">
              
              <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl text-center border border-white/10 transform hover:-translate-y-2 transition-transform duration-300">
                <PaperAirplaneIcon className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold">Havalimanı Transferi</h4>
                <p className="mt-2 text-gray-300 text-sm">Konforlu ve zamanında ulaşım ile tatilinize stressiz başlayın.</p>
              </div>

              <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl text-center border border-white/10 transform hover:-translate-y-2 transition-transform duration-300">
                <SparklesIcon className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold">Sıcak Hava Balonu</h4>
                <p className="mt-2 text-gray-300 text-sm">Bölgenin eşsiz manzarasını gökyüzünden izleyerek büyülü anlar yaşayın.</p>
              </div>

              <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl text-center border border-white/10 transform hover:-translate-y-2 transition-transform duration-300">
                <MapIcon className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold">Bölge Turları</h4>
                <p className="mt-2 text-gray-300 text-sm">Profesyonel rehberler eşliğinde yörenin tarihi ve doğal güzelliklerini keşfedin.</p>
              </div>

              <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl text-center border border-white/10 transform hover:-translate-y-2 transition-transform duration-300">
                <BoltIcon className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold">ATV & Motor Turları</h4>
                <p className="mt-2 text-gray-300 text-sm">Adrenalin dolu patikalarda hız ve maceranın keyfini çıkarın.</p>
              </div>
              
              <div className="bg-black/20 backdrop-blur-sm p-6 rounded-xl text-center border border-white/10 transform hover:-translate-y-2 transition-transform duration-300 flex flex-col justify-center">
                <EllipsisHorizontalIcon className="h-12 w-12 text-amber-400 mx-auto mb-4" />
                <h4 className="text-xl font-semibold">Ve Çok Daha Fazlası</h4>
                <p className="mt-2 text-gray-300 text-sm">QR kodu tarayarak tüm özel turlarımızı ve deneyimlerimizi görün.</p>
              </div>
              
            </div>
          </div>
        </div>
      </div>

      {/* İletişim bilgisi eklenmiş Footer */}
      <footer className="absolute bottom-0 left-0 w-full p-6 z-10 text-center text-gray-400 text-sm">
        <div>
          <p className="mt-2">
            © {new Date().getFullYear()} INNGET | Otel İçi Aktivite Portalı | <a href="mailto:reservation@inntur.com" className="font-semibold text-amber-300 hover:text-amber-200 transition-colors">reservation@inntur.com</a>
          </p>
        </div>
      </footer>
    </main>
  );
}