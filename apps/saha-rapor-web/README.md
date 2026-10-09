# Servis Raporu AI — Tanıtım Sitesi

Statik site. Sunucu gerekmez. Cloudflare Pages'te ücretsiz yayınlanır.

| Dosya | İçerik |
|---|---|
| `public/index.html` | Tanıtım sayfası (derlenmiş) |
| `public/privacy.html` | Gizlilik politikası şablonu |
| `public/terms.html` | Kullanım şartları şablonu |
| `public/assets/report-sample.png` | Örnek PDF rapor görseli |
| `src/index.template.html` | Düzenlenecek kaynak |
| `src/icons.json` | Lucide ikon şekilleri (ISC lisansı) |
| `build.py` | İkonları şablona yerleştirir → `public/index.html` |

## Düzenleme

1. `src/index.template.html` dosyasını değiştirin.
2. `python3 build.py` komutunu çalıştırın.
3. `public/` klasörünü yayınlayın.

## Yayın (Cloudflare Pages)

1. Cloudflare → Workers & Pages → Create → Pages → "Upload assets".
2. `public/` klasörünü yükleyin.
3. Kendi alan adınızı bağlayın.
4. Gizlilik ve şartlar adreslerini uygulamanın `app.json` → `extra.privacyUrl` / `extra.termsUrl` alanlarına yazın.

## Yayından önce değiştirilecekler

- App Store ve Google Play butonlarındaki `href="#"` → gerçek mağaza linkleri.
- `privacy.html` ve `terms.html` içindeki `[COMPANY NAME]`, `[ADDRESS]`, `[E-MAIL]`, `[DATE]` alanları. Bu metinleri bir hukukçuya kontrol ettirin.
- Alt bilgideki `hello@example.com`.

## Tasarım

- **Tasarım sistemi:** ui-ux-pro-max-skill verisi (MIT lisanslı), "Home Services" ürün tipi. Güven mavisi + güvenlik turuncusu, düz tasarım + mikro animasyonlar, Plus Jakarta Sans yazı tipi.
- **21st.dev kalıplarından esinlenme:** spot ışıklı kartlar (fareyi takip eden ışık), dönen parlak kenarlı fiyat kartı, parlama efektli buton, sonsuz kayan meslek bandı (marquee), bento ızgarası.
- **motionsites.ai kalıplarından esinlenme:** hareketli gradyan hero arka planı ve telefon içinde canlı ürün demosu (ses → AI → imzalı rapor).
- Kodun tamamı özgündür. 21st.dev'den bileşen kodu kopyalanmadı.
- Kullanıcı sistemde "hareketi azalt" seçeneğini açtıysa tüm animasyonlar durur ve demo son adımı sabit gösterir.
- Kontrol edilen ekran genişlikleri: 1366 px ve 360 px. Yatay kaydırma yok. Konsol hatası yok.
