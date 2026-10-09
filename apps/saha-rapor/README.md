# Servis Raporu AI (Service Report AI) — Mobil Uygulama

Teknisyen işi anlatır. Uygulama raporu yazar. Müşteri imzalar. Logolu PDF müşteriye gider.

Yazım kuralı: Kısa cümle. Bir adımda bir iş.

---

## 1. Durum

| Parça | Durum |
|---|---|
| İlk kurulum (meslek, firma bilgisi, logo) | Bitti |
| Rapor listesi | Bitti |
| Müşteri ve cihaz bilgisi | Bitti |
| Sesle dikte (telefonun kendi ses tanıma özelliği, ücretsiz) | Bitti |
| AI'sız rapor düzenleme (ücretsiz, çevrimdışı) | Bitti |
| AI ile rapor düzenleme (Claude Haiku 5.5, ucuz) | Bitti — canlı API ile test edilmedi |
| Parçalar, öneriler, tekrar ziyaret | Bitti |
| Fotoğraf (kamera, galeri, en fazla 6) | Bitti |
| Müşteri imzası | Bitti |
| Logolu PDF + paylaşma (WhatsApp, e-posta) | Bitti |
| Abonelik ekranı (RevenueCat) | Bitti — mağaza ürünleri henüz yok |
| Ücretsiz sınır: 3 rapor | Bitti |
| 8 dil: EN, TR, DE, ES, FR, IT, PT, NL | Bitti |

Kontroller: 17 birim testi geçti. Tip kontrolü, lint ve expo-doctor (21/21) temiz. Web derlemesinde ilk kurulum, rapor oluşturma ve imza akışı denendi.

Örnek çıktı: [`docs/ornek-rapor.pdf`](docs/ornek-rapor.pdf). Ekran görüntüleri: [`docs/ekranlar/`](docs/ekranlar/).

### Tasarım sistemi

| Konu | Karar | Kaynak |
|---|---|---|
| Stil | Düz tasarım + mikro animasyonlar | ui-ux-pro-max-skill, "Home Services (Plumber/Electrician)" |
| Renk | Güven mavisi `#1E40AF`, güvenlik turuncusu `#EA580C`, başarı yeşili `#059669` | aynı kaynak |
| Yazı tipi | Plus Jakarta Sans | aynı kaynak, "Enterprise SaaS Mobile" |
| Hareket | Basma 150 ms yay animasyonu, liste girişleri 40 ms aralıklı (en fazla 8 öğe), yükleme iskeleti 1,3 sn | aynı kaynağın hareket tablosu |
| Hero | Hareketli "aurora" gradyan + ince ızgara çizgileri | motionsites.ai / 21st.dev hero arka planları |
| Ana ekran | Bento istatistik ızgarası, sayaçla artan rakamlar | 21st.dev "Stats & KPIs", "Numbers" |
| Butonlar | Gradyan + parlama efekti, dokunma titreşimi (haptic) | 21st.dev "shiny button" |
| Dikte | Nabız halkaları + sesin şiddetiyle hareket eden dalga çubukları + süre | özgün |
| Kayıt | Onay işareti animasyonu + başarı titreşimi | özgün |

Kurallar:
- Tüm değerler `src/theme.ts` dosyasında.
- "Hareketi azalt" açıksa döngüsel animasyonlar durur.
- Dokunma alanları en az 44 pt.
- İkonlu düğmelerin hepsinde erişilebilirlik etiketi var.
- Başlıklar otomatik büyük harfe çevrilmez. Sebep: Türkçede "i → İ" dönüşümü yanlış olur.

---

## 2. AI maliyeti

| Yol | Rapor başına maliyet | Ne zaman kullanılır |
|---|---|---|
| AI'sız düzenleme (telefonda) | $0 | AI adresi boşsa, internet yoksa veya AI hata verirse |
| Claude Haiku 5.5 (Cloudflare Worker üzerinden) | ~$0,0005 (tahmin) | Ücretsiz kullanıcının ilk 3 raporu ve Pro aboneler |

Hesap: Haiku 5.5 fiyatı 1 milyon token için $0,10 giriş, $0,50 çıkış. Bir rapor ~1.200 giriş + ~700 çıkış token'dır.
300 abone × ayda 40 rapor = 12.000 rapor ≈ ayda $6.

Fatura koruması (Worker'da):
- Ücretsiz kullanıcı: toplam 3 AI raporu.
- Pro kullanıcı: ayda 300 AI raporu.
- Tüm kullanıcılar: günde en fazla 5.000 AI raporu.
Sınır dolunca uygulama raporu AI'sız düzenler. Kullanıcı hiçbir zaman engellenmez.

---

## 3. Telefonda test

Adım adım rehber: **[`docs/telefonda-test.md`](docs/telefonda-test.md)**

En kolay yol (Android, bilgisayar gerekmez):
1. GitHub deposuna `EXPO_TOKEN` gizli anahtarını ekleyin.
2. GitHub → Actions → **"Telefon test sürümü"** → Run workflow.
3. expo.dev'deki derleme sayfasından APK'yı telefona kurun.

Test sürümünde rapor sınırı yoktur. Ayarlar ekranında "Test araçları" kartı vardır.

## 3.1 Bilgisayarınızda çalıştırma

Gerekli: Node.js 20+, bir iPhone veya Android telefon.

```bash
cd apps/saha-rapor
npm install
npm run typecheck
npm test
```

**Önemli:** Expo Go bu uygulamayı çalıştıramaz. Uygulama ses tanıma ve abonelik için kendi yerel modüllerini kullanır. Bir "development build" gerekir:

```bash
npx eas-cli@latest login
npx eas-cli@latest build --profile development --platform ios     # veya android
npx expo start --dev-client
```

Mac gerekmez. EAS, iOS sürümünü bulutta derler.

Abonelik anahtarı girilmemiş geliştirme sürümünde rapor sınırı yoktur. Bu, test için bilerek böyle yapıldı.

---

## 4. Yayın için yapılacaklar (sırayla)

### 4.1 Hesaplar
1. Apple Developer Program ($99/yıl).
2. Google Play Console ($25 bir kez).
3. Expo hesabı (ücretsiz).
4. RevenueCat hesabı (aylık $2.500 gelire kadar ücretsiz).
5. Cloudflare hesabı (ücretsiz plan yeterli).
6. Anthropic API hesabı (kullandıkça öde).

### 4.2 Uygulama kimliği
`app.json` içinde şunları kendi bilgilerinizle değiştirin:
- `name` (mağazada görünen ad)
- `ios.bundleIdentifier` ve `android.package` (şu an `com.aziztetik.servicereport`)
- Uygulama ikonu: `assets/icon.png`

### 4.3 AI servisi (Cloudflare Worker)
Bkz. [`../saha-rapor-ai/README.md`](../saha-rapor-ai/README.md). Sonra `app.json` → `extra` içine şunları yazın:
- `aiEndpoint`: Worker adresi (ör. `https://saha-rapor-ai.<hesap>.workers.dev`)
- `appKey`: Worker'a verdiğiniz `APP_KEY` değeri

### 4.4 Abonelik (RevenueCat)
1. App Store Connect'te iki abonelik ürünü açın: aylık $14,99 ve yıllık $79,99. Aynı abonelik grubuna koyun.
2. İki ürüne de "3 günlük ücretsiz deneme" (introductory offer) ekleyin.
3. Google Play Console'da aynı iki ürünü açın.
4. RevenueCat'te bir entitlement açın. Adı: `pro`.
5. RevenueCat'te "default" offering oluşturun. İçine Monthly ve Annual paketlerini ekleyin.
6. RevenueCat'teki iOS ve Android public API anahtarlarını `app.json` → `extra` → `revenueCatIosKey` / `revenueCatAndroidKey` alanlarına yazın.
7. RevenueCat secret API anahtarını Worker'a `REVENUECAT_SECRET` olarak verin.

### 4.5 Yasal sayfalar
Apple ve Google, abonelikli uygulamada gizlilik politikası ve kullanım şartları ister.
Bu iki sayfanın adresini `app.json` → `extra` → `privacyUrl` ve `termsUrl` alanlarına yazın.
Gizlilik politikasında şunu açıkça yazın: rapor metni AI için Anthropic API'ye gönderilir; fotoğraflar ve imza telefonda kalır.

### 4.6 Mağazaya gönderme
```bash
npx eas-cli@latest build --profile production --platform all
npx eas-cli@latest submit --platform ios
npx eas-cli@latest submit --platform android
```

---

## 5. Bilinen eksikler

- Canlı Claude API çağrısı test edilmedi (bu ortamda API anahtarı yoktu). Worker'ın mantığı sahte model ile test edildi.
- Gerçek telefonda test edilmedi. Ses tanıma, kamera ve PDF paylaşma telefonda denenmeli. Bkz. [`docs/telefonda-test.md`](docs/telefonda-test.md).
- `appKey` uygulamanın içinde durur. Bu yüzden gerçek bir sır değildir. Asıl koruma Worker'daki kullanıcı ve günlük sınırlardır.
- 8 dil var. Plan 20 dildi. Kalan diller sonraki sürümde eklenecek.
- Mağaza sayfası (ekran görüntüleri, anahtar kelimeler) henüz hazır değil.

---

## 6. Klasör yapısı

```
app/                    Ekranlar (Expo Router)
  _layout.tsx           Gezinme, yükleme ekranı
  index.tsx             Rapor listesi
  onboarding.tsx        İlk kurulum (3 adım)
  report/new.tsx        Yeni rapor
  report/[id].tsx       Kayıtlı rapor
  settings.tsx          Ayarlar
  paywall.tsx           Abonelik ekranı
src/theme.ts            Tasarım değerleri (renk, yazı, boşluk, hareket)
src/components/         Ekran parçaları (ui kiti, hero/aurora, ses girişi, imza, fotoğraf, form)
src/lib/                Mantık
  structure.ts          AI'sız rapor düzenleyici
  ai.ts                 AI servisi istemcisi (hata olursa AI'sız düzenleyiciye geçer)
  reportHtml.ts         PDF için HTML
  pdf.ts                PDF dosyası ve paylaşma
  purchases.ts          RevenueCat
  storage.ts            Telefonda kayıt
  i18n.ts               8 dilde tüm metinler
tests/                  Birim testleri (vitest)
docs/ornek-rapor.pdf    Örnek PDF çıktısı
```
