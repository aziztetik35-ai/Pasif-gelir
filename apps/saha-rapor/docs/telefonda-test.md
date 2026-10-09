# Telefonda Test Rehberi

Bu rehber, uygulamayı kendi telefonunuza kurmayı anlatır.
Yazım kuralı: Kısa cümle. Bir adımda bir iş.

---

## 0. Önce bunu okuyun

**Expo Go ile çalışmaz.** Uygulama ses tanıma ve abonelik için kendi yerel modüllerini kullanır. Expo Go bu modülleri içermez. Bu yüzden telefona özel bir test sürümü kurarsınız.

Test sürümünü Expo'nun bulut sunucusu (EAS) derler. Bilgisayarınızda Android Studio veya Mac gerekmez.

| Yol | Telefon | Bilgisayar gerekir mi? | Ücret | Ne zaman seçilir |
|---|---|---|---|---|
| **A. GitHub düğmesi** | Android | Hayır | Ücretsiz | İlk test için en kolay yol. **Önerilir.** |
| **B. Bilgisayardan komut** | Android veya iPhone | Evet (Windows olur) | Android ücretsiz. iPhone için Apple Developer $99/yıl | iPhone'da test için |
| **C. Geliştirici sürümü** | Android veya iPhone | Evet | Aynı | Kod değişikliğini telefonda anında görmek için |

Test sürümünün özellikleri:
- Rapor sınırı yoktur. 3 rapordan sonra abonelik ekranı açılmaz.
- Ayarlar ekranının altında **"Test araçları"** kartı vardır.
- AI adresi boşsa raporu ücretsiz çevrimdışı düzenleyici yazar.
- Mağaza sürümünde (production) bu özelliklerin hiçbiri yoktur.

---

## 1. Hazırlık (bir kez yapılır, ~5 dakika)

### 1.1 Expo hesabı açın
1. https://expo.dev/signup adresini açın.
2. Ücretsiz hesap açın.
3. E-postanızı onaylayın.

### 1.2 Expo erişim anahtarı (token) alın
1. expo.dev'e girin.
2. Sağ üstte profil resminize basın → **Account settings** → **Access tokens**.
3. **Create token** düğmesine basın. Ad olarak `github` yazın.
4. Görünen anahtarı kopyalayın. Bu anahtar bir kez görünür.

**Dikkat:** Bu anahtar bir şifredir. Kimseyle paylaşmayın. Sohbete yapıştırmayın.

### 1.3 Anahtarı GitHub'a ekleyin
1. GitHub'da `Pasif-gelir` deposunu açın.
2. **Settings** → **Secrets and variables** → **Actions** sayfasını açın.
3. **New repository secret** düğmesine basın.
4. Name: `EXPO_TOKEN`
5. Secret: kopyaladığınız anahtar.
6. **Add secret** düğmesine basın.

---

## 2. Yol A — Android, sadece GitHub ile (önerilir)

Bu yolu telefondan da yapabilirsiniz.

1. GitHub'da depoyu açın.
2. Üstte **Actions** sekmesine basın.
3. Soldaki listeden **"Telefon test sürümü"** iş akışını seçin.
4. Sağda **Run workflow** düğmesine basın.
5. Seçimler:
   - Telefon: `android`
   - Profil: `preview`
6. Yeşil **Run workflow** düğmesine basın.
7. 2–4 dakika bekleyin. İş yeşil tik alır. Bu, derlemenin Expo'da başladığı anlamına gelir.
8. Derleme Expo sunucusunda **10–30 dakika** sürer. Ücretsiz planda sıra bekleme süresi uzun olabilir.
9. Telefonda https://expo.dev adresini açın ve giriş yapın.
10. Derleme sayfasını açın: https://expo.dev/accounts/atetiks-team/projects/service-report-ai/builds
11. En üstteki derlemeye basın. Durum **Finished** olmalı.
12. **Install** düğmesine basın. APK dosyası iner.
13. İnen dosyayı açın.
14. Telefon "bilinmeyen kaynak" uyarısı verir. **Ayarlar** → **Bu kaynaktan izin ver** seçeneğini açın.
15. Google Play Protect uyarı verirse **Yine de yükle** seçeneğine basın. Sebep: uygulama henüz mağazada değil.
16. Uygulamayı açın. Bölüm 5'teki test listesini uygulayın.

Bilgisayardan da yapabilirsiniz: Derleme sayfasındaki QR kodu telefon kamerasıyla okutun.

**Yeni kod geldiğinde:** 1–16 arası adımları tekrarlayın. Yeni APK eski sürümün üzerine kurulur. Kayıtlı raporlar silinmez.

---

## 3. Yol B — Bilgisayardan komutla (Android veya iPhone)

### 3.1 Bilgisayarı hazırlayın (bir kez)
1. https://nodejs.org adresinden **Node.js 22 LTS** kurun.
2. https://git-scm.com adresinden **Git** kurun.
3. Terminal (Windows'ta PowerShell) açın. Şu komutları sırayla yazın:

```bash
git clone https://github.com/aziztetik35-ai/Pasif-gelir.git
cd Pasif-gelir/apps/saha-rapor
npm install
npx eas-cli@latest login
npx eas-cli@latest init
```

`init` komutu "proje oluşturulsun mu?" diye sorar. **Yes** yazın.

### 3.2 Android test sürümü

```bash
npm run build:test:android
```

Komut sonunda bir QR kod ve bağlantı çıkar. Telefon kamerasıyla QR kodu okutun. Sonra Bölüm 2'deki 13–16. adımları uygulayın.

### 3.3 iPhone test sürümü

iPhone için şunlar gerekir:
- **Apple Developer Program** üyeliği ($99/yıl). https://developer.apple.com/programs/
- Üyelik onayı 1–2 gün sürebilir.

Adımlar:
1. iPhone'unuzu kaydedin:
   ```bash
   npm run device:add
   ```
   Çıkan QR kodu iPhone kamerasıyla okutun. Açılan profili yükleyin: **Ayarlar** → **Profil İndirildi** → **Yükle**.
2. Test sürümünü derleyin:
   ```bash
   npm run build:test:ios
   ```
   Komut Apple hesabınızı sorar. Giriş yapın. Sertifikaları EAS kendisi oluşturur. Bütün sorulara **Yes** yazın.
3. Derleme bitince QR kodu iPhone kamerasıyla okutun. **Yükle** düğmesine basın.
4. iOS 16 ve sonrası: **Ayarlar** → **Gizlilik ve Güvenlik** → **Geliştirici Modu** seçeneğini açın. Telefon yeniden başlar.
5. Uygulamayı açın.

**Not:** Yeni bir iPhone eklerseniz 1. ve 2. adımları tekrarlayın.

İlk iPhone derlemesinden sonra GitHub düğmesi (Yol A) iPhone için de çalışır. Telefon olarak `ios` seçin.

---

## 4. Yol C — Geliştirici sürümü (isteğe bağlı)

Bu yol kod yazarken kullanılır. Kod değişikliği telefonda 1–2 saniyede görünür. Yeniden derleme gerekmez.

1. Geliştirici sürümünü bir kez derleyin ve kurun:
   ```bash
   npm run build:dev:android     # veya: npm run build:dev:ios
   ```
2. Bilgisayarda sunucuyu başlatın:
   ```bash
   npm run start:dev
   ```
3. Telefon ve bilgisayar aynı Wi-Fi ağında olmalı.
4. Telefonda "Service Report AI" geliştirici uygulamasını açın. Terminaldeki QR kodu okutun.
5. Aynı ağda değilseniz şu komutu kullanın:
   ```bash
   npm run start:tunnel
   ```

**Not:** Yeni bir yerel modül eklenirse 1. adımı tekrarlayın.

---

## 5. Test listesi

Her satırı deneyin. Sonucu "Sonuç" sütununa yazın: ✅ çalıştı, ❌ çalışmadı.

| # | Test | Beklenen sonuç | Sonuç |
|---|---|---|---|
| 1 | Uygulamayı ilk kez açın | Karşılama ekranı açılır. Animasyon akıcıdır. | |
| 2 | Meslek seçin, firma bilgisi ve logo girin | Ana ekran açılır. Selamlamada adınız görünür. | |
| 3 | **Yeni rapor** → müşteri adını yazın | Klavye alanı kapatmaz. | |
| 4 | Mikrofona basın. İzin isteğine **İzin ver** deyin | Mikrofon izni ve ses tanıma izni istenir. | |
| 5 | Türkçe konuşun (aşağıdaki örnek cümle) | Yazı ekranda konuşurken belirir. Ses çubukları sesinizle hareket eder. | |
| 6 | 20 saniye susun, sonra devam edin | Kayıt kesilmez veya kaldığı yerden devam eder. | |
| 7 | **Raporu oluştur** düğmesine basın | Bulgular, yapılan iş, parçalar ve öneriler doğru bölümlere girer. | |
| 8 | Bir parçayı düzenleyin, bir parça ekleyin | Değişiklik kalır. | |
| 9 | Kamera ile 2 fotoğraf çekin | Fotoğraflar listede görünür. | |
| 10 | Galeriden 1 fotoğraf seçin | Fotoğraf listede görünür. | |
| 11 | Müşteri imzasını parmakla atın | Çizgi parmağı takip eder. Sayfa kaymaz. | |
| 12 | **Kaydet ve paylaş** | Onay animasyonu ve titreşim olur. Paylaşma menüsü açılır. | |
| 13 | PDF'i WhatsApp ile kendinize gönderin | PDF açılır. Logo, fotoğraflar, imza ve Türkçe karakterler (ğ, ş, İ, ı) doğrudur. | |
| 14 | PDF'i e-posta ile gönderin | Dosya adı `Report_SR-2026-0001.pdf` gibidir. | |
| 15 | Uygulamayı tamamen kapatıp açın | Raporlar ve ayarlar durur. | |
| 16 | Kayıtlı raporu açın, değiştirin, tekrar kaydedin | Yeni rapor oluşmaz. Aynı rapor güncellenir. | |
| 17 | Uçak modunu açın. Yeni rapor oluşturun | Rapor yine oluşur (çevrimdışı düzenleyici). | |
| 18 | Ayarlar → Dil → English | Bütün ekranlar İngilizce olur. Dikte İngilizce dinler. | |
| 19 | Telefonda "Hareketi azalt" seçeneğini açın | Döngüsel animasyonlar durur. Uygulama çalışır. | |
| 20 | Telefonda yazı boyutunu en büyüğe getirin | Yazılar taşmaz. Düğmeler basılabilir. | |
| 21 | Karanlık modu açın | Uygulama açık renkte kalır. Yazılar okunur. | |
| 22 | Ayarlar → Test araçları → **Ücretsiz rapor sayacını sıfırla** | "Oluşturulan rapor" sayısı 0 olur. | |
| 23 | Ayarlar → Test araçları → **İlk kurulumu tekrar göster** | Karşılama ekranı açılır. Raporlar silinmez. | |

**Dikte için örnek cümle:** (müşteri adını konuşmayın, müşteri alanına yazın)
> Daikin split klima soğutmuyor. Dış ünitede gaz kaçağı buldum. Kaçağı kaynakla kapattım. Bir adet filtre drier ve iki kilo R32 gaz kullandım. Altı ay sonra bakım öneriyorum. Fan motoru ses yapıyor, parça gelince tekrar geleceğim.

Beklenen rapor (AI'sız, çevrimdışı düzenleyici):
- Bulgular: "Daikin split klima soğutmuyor", "Dış ünitede gaz kaçağı buldum".
- Yapılan iş: "Kaçağı kaynakla kapattım", parça cümlesi.
- Parçalar: 1 adet × filtre drier, 2 kilo × R32 gaz.
- Öneriler: bakım cümlesi ve fan motoru cümlesi.
- **Tekrar ziyaret gerekli** anahtarı açık.

Bu cümle birim testinde de var (`tests/logic.test.ts`). Telefon farklı sonuç verirse sebep ses tanımadır. Ekrandaki dikte metnini bana gönderin.

Çevrimdışı düzenleyici basit kurallarla çalışır. Cümleler kısa olursa sonuç daha iyi olur. Bölüm adlarını da söyleyebilirsiniz: "Tespitler: …", "Yapılan işler: …", "Parçalar: …", "Öneriler: …".

---

## 6. Sorun giderme

| Sorun | Çözüm |
|---|---|
| GitHub işi kırmızı: "EXPO_TOKEN secret is missing" | Bölüm 1.3'ü yapın. Sonra işi tekrar çalıştırın. |
| GitHub işi kırmızı: başka bir hata | İşe basın. Kırmızı adımı açın. Son 30 satırı kopyalayıp bana gönderin. |
| Expo'da derleme **Errored** | Derleme sayfasında kırmızı adımı açın. Hata metnini bana gönderin. |
| Android: "Uygulama yüklenmedi" | Telefondaki eski sürümü silin. Sonra tekrar yükleyin. Sebep: imza farklı olabilir. |
| Mikrofon çalışmıyor | Telefon Ayarları → Uygulamalar → Service Report AI → İzinler → Mikrofonu açın. |
| Android'de konuşma yazıya dönmüyor | Play Store'dan **Google** uygulamasını güncelleyin. Ayarlar → Sistem → Diller → Konuşma tanıma bölümünde Türkçe'yi indirin. |
| iPhone'da konuşma yazıya dönmüyor | Ayarlar → Genel → Klavye → **Dikte** seçeneğini açın. |
| iPhone: "Geliştirici doğrulanmadı" | Bölüm 3.3, 4. adımı yapın (Geliştirici Modu). |
| PDF paylaşmada WhatsApp yok | WhatsApp'ı bir kez açın. Sonra tekrar deneyin. |
| Rapor "AI ile" değil | Normal. AI servisi henüz kurulmadı. Kurulum: [`../../saha-rapor-ai/README.md`](../../saha-rapor-ai/README.md) |

---

## 7. Hata bildirme

Bir hata bulursanız bana şunları gönderin:
1. Test listesindeki satır numarası.
2. Telefon modeli ve sürümü (ör. Samsung A54, Android 15).
3. Ekran görüntüsü veya ekran kaydı.
4. Ne yaptınız, ne bekliyordunuz, ne oldu. Her biri bir cümle.

Ayarlar → Test araçları kartındaki "Sürüm" satırını da yazın.

---

## 8. Ücretler ve sınırlar

| Hizmet | Ücretsiz plan |
|---|---|
| Expo EAS derleme | Aylık sınırlı sayıda derleme. Sıra bekleme süresi uzun olabilir. Güncel sınır: https://expo.dev/pricing |
| GitHub Actions | Özel depoda aylık ücretsiz dakika vardır. Bir test işi ~3 dakika sürer. |
| Android test kurulumu | Ücretsiz. Google Play hesabı gerekmez. |
| iPhone test kurulumu | Apple Developer Program, $99/yıl. Bir yılda en fazla 100 iPhone kaydedilir. |
