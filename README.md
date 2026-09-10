# OkuYol V11 — FINAL PWA

Bu paket mevcut V10 tasarımını ve uygulama içeriğini korur; PWA kurulumu, GitHub Pages uyumluluğu, logo/uygulama ikonları ve mobil performans tarafını düzeltir.

## GitHub Pages
ZIP içindeki `OkuYol-PWA-V11-FINAL` klasörünün **içindeki dosyaları** GitHub Pages tarafından yayınlanan dizine koy. Uygulamayı `github.io` adresinden aç. Manifest, service worker ve ikon yolları göreli olduğu için proje alt klasöründe de çalışır.

## Uygulama kurulumu
- Android / Chrome / Edge: Profil > Uygulamayı yükle. Tarayıcı kurulum olayını sunuyorsa doğrudan kurulum penceresi açılır.
- iPhone / iPad: Profil > Uygulamayı yükle, ekrandaki Safari > Paylaş > Ana Ekrana Ekle adımlarını kullan.
- Yüklendiğinde `display: standalone` ile tarayıcı çubuğu olmadan uygulama gibi açılır.

## V11 düzeltmeleri
- Yeni OkuYol uygulama logosu / ikonu.
- 32, 180, 192 ve 512 px PNG ikonlar + maskable ikon.
- GitHub Pages alt klasörlerinde çalışan göreli PWA yolları.
- V11 service worker cache sürümü; eski OkuYol cache'lerini temizler.
- Offline app-shell desteği.
- Profildeki mevcut Uygulamayı yükle butonu artık localhost mesajı vermez.
- iOS ve kurulum promptu desteklemeyen tarayıcılar için uygulama içi kurulum yönlendirmesi.
- Mobilde ağır backdrop blur ve animasyonlar azaltıldı.
- Sidebar aç/kapat gibi yalnızca görünümü etkileyen işlemler artık tüm uygulamayı baştan render etmez.
- Yüklenen profil/arkaplan görselleri cihazda küçültülerek saklanır; büyük görsellerin oluşturduğu takılma azaltılır.
- 10 font seçeneği korunur, fontlar ilk açılışta topluca yüklenmek yerine seçildikçe yüklenir.
- V10 ve önceki veriler V11'e otomatik taşınır.
