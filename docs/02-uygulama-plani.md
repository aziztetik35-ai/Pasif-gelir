# CommissionPack — Uygulama Planı (Bölüm 25)

Bu doküman sistemi kurma adımlarını verir. Kısa cümle. Bir adımda bir iş.

---

## 1. Ürünün kesin tanımı

CommissionPack, bir PLC IO listesini alır. 1 dakikada devreye alma doküman paketi üretir.

- **Girdi:** TIA Portal PLC etiket tablosu dışa aktarımı (.xlsx, "PLC Tags" sayfası) veya herhangi bir IO listesi (.xlsx / .xlsm / .csv).
- **Çıktı:** Tek Excel dosyası, 10 sayfa:
  1. Kapak — proje bilgisi, içerik, güvenlik IO sayısı, sorumluluk notu
  2. Özet — DI/DO/AI/AO için toplam, OK, NOK, N/A, açık, % tamamlanan (canlı formül)
  3. DI Test — her giriş için cihaz tipine göre test talimatı
  4. DO Test — her çıkış için test talimatı ("güvenlik çıkışını force etmeyin" dahil)
  5. AI Çevrim Testi — kanal başına 5 nokta (0/25/50/75/100 %), mA/V, S7 ham değer (27648), otomatik OK/NOK
  6. AO Çevrim Testi — aynı yapı
  7. FAT Protokolü — 26 madde, IO ilerlemesi canlı bağlı
  8. SAT Protokolü — 20 madde
  9. Eksik Listesi — A/B/C kategori, açık/kapalı
  10. Onay — FAT ve SAT imza blokları
- **Dil:** İngilizce, Türkçe, Almanca.
- **Ne değildir:** Güvenlik doğrulama aracı değildir. CE belgesi değildir. Kod üretmez.

## 2. Hedef müşteri

| Segment | Profil | Neden alır | Plan |
|---|---|---|---|
| A. Sistem entegratörü | 5–50 kişi, Siemens Solution Partner veya benzeri | Her ay birkaç proje; standart doküman ister | Team |
| B. Makine üreticisi | Otomasyon ekibi 1–10 kişi | Her makinede FAT; müşteriye profesyonel doküman | Pro / Team |
| C. Serbest devreye alma mühendisi | Tek kişi, proje bazlı | Zaman = para; müşteriye hazır protokol | Project Pass / Pro |

**İlk 90 gün odak:** Segment C ve A. Neden: karar verici tek kişi, satış döngüsü kısa.

## 3. Rakipler

| Rakip | Ne yapar | Fiyat | Zayıf yönü | Bizim farkımız |
|---|---|---|---|---|
| Boş Excel/Word şablonu (iç kullanım) | Elle doldurma | $0 | Saatler, hata | 1 dakika, otomatik |
| plcprogramming.io toolkit | Ücretsiz CSV şablonlar | $0 | Boş şablon; projeye özel değil | IO listesinden dolu paket |
| Vention FAT/SAT checklist | PDF kontrol listesi | $0 | Genel, IO yok | IO bazlı, formüllü |
| CxPlanner | FAT/SAT takip platformu | Demo ile (yüksek) | Data center/bina odaklı, kurumsal | Küçük ekip, self-serve, ucuz |
| WAGO-I/O-CHECK | WAGO IO testi | Donanım ile | Sadece WAGO | Marka bağımsız |
| Siemens Eigen Engineering Agent | TIA içinde AI kod/doküman | Teklif ile | Pahalı, proje içi; saha test kaydı değil | Saha test ve imza dokümanı |
| ChatGPT/Claude (elle) | İstenirse tablo üretir | $20/ay | Tutarsız, veri buluta gider, formül yok | Deterministik, gizli, çalışan Excel |

## 4. Ürün özellikleri

### MVP (bitti — v0.1.0)
- TIA Portal ve genel IO listesi okuma (EN/TR/DE sütun adları, `;` veya `,` CSV, Türkçe karakter).
- Adres çözümleme: %I/%Q/%IW/%QW/%ID/%QD, Almanca E/A, `:P`, %PIW. M/DB/sabitler elenir.
- Cihaz sınıflandırma (13 tip) ve güvenlik IO tespiti.
- Cihaz tipine göre test talimatı (3 dil).
- Analog çevrim testi: sinyal tipi seçimi, ham değer, beklenen değer, sapma, tolerans, otomatik durum.
- FAT/SAT protokolleri, eksik listesi, onay, özet (canlı formül, veri çubuğu).
- Ücretsiz sürüm: 32 IO (tüm sinyal tiplerinden dengeli seçim), sayfalarda uyarı bandı.
- Lisans anahtarı: Polar.sh doğrulama + yerel test anahtarı.
- Web arayüz (Streamlit) + komut satırı.
- 23 otomatik test (pytest).

### Faz 2 (gün 31–60, müşteri isteğine göre sıra değişir)
- Şirket logosu ve özel kapak (Team).
- PDF çıktısı.
- TIA HMI alarm dışa aktarımı → alarm test sayfası.
- Sürücü (G120/S120/S210) devreye alma kontrol listesi.
- Rockwell (Studio 5000 CSV) ve CODESYS içe aktarma.

### Faz 3 (gün 61–180)
- Opsiyonel AI: dağınık etiket isimlerini sınıflandırma, yorum çevirisi (kullanıcı izni ile).
- Fonksiyon tanımından (FS) FAT fonksiyon test adımları üretme.
- Pano BOM / kablo listesi modülü.
- Makine siber güvenlik kanıt sayfası (2023/1230 Ek III).

## 5. MVP

MVP hazır. Çalıştırma:

```bash
pip install -r requirements.txt
streamlit run app.py
```

Komut satırı:

```bash
python -m commissionpack samples/tia_plc_tags_sample.xlsx --lang tr --project "Hat 3"
```

## 6. Teknoloji stack

Bkz. strateji raporu Bölüm 9. Özet: Python + openpyxl + Streamlit + Polar.sh + Cloudflare Pages + MailerLite + n8n.

## 7. Klasör yapısı

```
Pasif-gelir/
├── app.py                     Streamlit web uygulaması
├── commissionpack/            Çekirdek paket
│   ├── __init__.py            Versiyon, ücretsiz limit
│   ├── __main__.py            Komut satırı
│   ├── model.py               IOPoint, ParseResult
│   ├── parser.py              Dosya okuma, adres çözümleme
│   ├── classify.py            Cihaz tipi ve güvenlik tespiti
│   ├── i18n.py                Tüm metinler (EN/TR/DE), FAT/SAT maddeleri
│   ├── generator.py           Excel paketi üretimi
│   └── license.py             Lisans kontrolü (Polar.sh)
├── samples/                   Örnek girdiler + üretici script
├── tests/                     pytest testleri
├── landing/                   Statik landing page + örnek çıktı
├── automation/                n8n akış tanımları
├── docs/                      Strateji ve plan dokümanları
├── Dockerfile                 VPS yayını için
└── requirements.txt
```

## 8. Veritabanı

**MVP: veritabanı yok.** Uygulama durumsuz. Dosya bellekte işlenir, saklanmaz.
Lisans ve müşteri verisi Polar.sh'ta durur. Abone listesi MailerLite'ta durur.

**Faz 2 (Team planı, logo, kullanım istatistiği) için Supabase şeması:**

```sql
-- Şirket (Team planı)
create table teams (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  polar_customer_id text unique,
  logo_url text,
  created_at timestamptz default now()
);

-- Kullanıcı
create table users (
  id uuid primary key default gen_random_uuid(),
  email text unique not null,
  team_id uuid references teams(id),
  created_at timestamptz default now()
);

-- Anonim kullanım olayı (proje içeriği SAKLANMAZ)
create table usage_events (
  id bigserial primary key,
  license_hash text,            -- anahtarın SHA-256 özeti, anahtarın kendisi değil
  event text not null,          -- 'parse', 'generate'
  io_count int,
  source_format text,           -- 'tia_portal' / 'generic'
  lang text,
  created_at timestamptz default now()
);
```

## 9. UI

- Kenar çubuğu: lisans anahtarı, durum, "tam sürümü al" butonu, örnek dosyalar.
- Ana alan: başlık, gizlilik notu, dosya yükleme, proje bilgileri (8 alan), doküman dili.
- Sonuç: DI/DO/AI/AO/güvenlik/elenen sayıları, uyarılar, önizleme tablosu, indirme butonu.
- Ücretsiz sürümde: "35 IO noktasından 32'si dahil" uyarısı + satın alma linki.

## 10. Landing page

Dosya: `landing/index.html`. Bölümler: başlık + 2 CTA, problem, 3 adım, paket içeriği, fiyat, SSS, e-posta formu.
Örnek çıktı: `landing/sample_commissioning_package.xlsx` (indirilebilir).

Yayından önce değiştirilecek yer tutucular:

| Yer tutucu | Değer |
|---|---|
| `APP_URL` | Streamlit uygulama adresi |
| `CHECKOUT_PROJECT`, `CHECKOUT_PRO`, `CHECKOUT_TEAM` | Polar checkout linkleri |
| `FORM_ACTION` | MailerLite form adresi |
| `hello@commissionpack.io` | Gerçek e-posta |

Not: "commissionpack" bir çalışma adıdır. Alan adı ve marka kontrolünü yapın. Gerekirse adı değiştirin.

## 11. Ödeme sistemi (Polar.sh)

1. polar.sh'ta hesap açın. Destek ekibine yazın: "Türkiye'de şahıs şirketiyim. Payout Türkiye bankasına çalışır mı?" Yazılı cevap alın.
2. Organization oluşturun. `Organization ID` değerini not edin.
3. 3 ürün oluşturun:
   - Project Pass — $49 tek seferlik — fayda: License Key, 30 gün geçerlilik.
   - Pro — $39/ay ve $390/yıl — fayda: License Key (abonelik bitince geçersiz).
   - Team — $119/ay — fayda: License Key.
4. Her ürünün checkout linkini landing page'e yazın.
5. Sunucuda ortam değişkeni: `POLAR_ORGANIZATION_ID=<id>`.
6. Test: sandbox ortamında satın alın. Anahtarı uygulamaya girin. "License valid" görmelisiniz.
7. Lisans doğrulama uç noktasını Polar dokümanından teyit edin (`commissionpack/license.py` başındaki not).

Yedek: Paddle (yazılım ürünü kabul eder, USD/EUR ödeme).
Türkiye içi satış (opsiyonel, sonra): iyzico veya PayTR.

## 12. Otomasyon

Bkz. `automation/README.md`. Dört akış:
1. Yeni satış → hoş geldin e-postası + MailerLite "müşteri" grubu + Telegram bildirimi + Google Sheet kaydı.
2. Haftalık metrik raporu → Telegram.
3. Destek e-postası → Claude taslak → Telegram onay → gönder.
4. Haftalık içerik taslağı → Telegram onay.

## 13. Marketing

### Mesaj
"IO listeniz girer. FAT/SAT paketiniz 1 dakikada çıkar."

### Kanallar (öncelik sırası)
1. **Doğrudan mesaj (Hafta 1–4):** Günde 15–20 kişisel mesaj. Teklif: ücretsiz paket üretimi.
   Örnek mesaj (EN):
   > Hi {name}, I'm a Siemens commissioning engineer. I built a small tool: you upload a TIA Portal tag export, and it creates IO checkout sheets, loop checks and FAT/SAT protocols in one minute. Can I run it on one of your IO lists for free? I want feedback from real integrators.
2. **LinkedIn:** Haftada 3 gönderi. Konu: devreye alma ipuçları, 27648 ölçekleme, FAT hataları, araç demosu.
3. **Forumlar:** r/PLC, PLCtalk.net, sps-forum.de, Siemens Industry Online Support forumu. Önce değerli cevap. Kurallara uyun.
4. **SEO araçları:** S7 analog ölçekleme hesaplayıcı, IO listesi temizleyici, FAT kontrol listesi üretici.
5. **Video:** 60 sn ekran kayıtları (LinkedIn, YouTube Shorts).
6. **Affiliate (gün 61+):** PLC eğitmenleri için %30.

### Ücretli reklam
İlk 90 günde yok. Organik kanal kanıtlanmadan reklam yapmayın.

## 14. Analytics

| Metrik | Kaynak | Hedef (gün 30) |
|---|---|---|
| Ziyaretçi | Cloudflare Web Analytics | 300 |
| Ücretsiz paket üretimi | Uygulama logu (anonim) | 50 |
| E-posta abonesi | MailerLite | 100 |
| Ödeyen müşteri | Polar | 5 |
| MRR | Polar | $100+ |
| Dönüşüm (ücretsiz → ücretli) | Hesap | %3+ |

Haftalık 15 dakika: n8n raporu okuyun. Tek soru sorun: "Bu hafta en çok ne işe yaradı?"

## 15. Deployment

### Seçenek A — Streamlit Community Cloud (başlangıç, ücretsiz)
1. GitHub deposunu bağlayın.
2. Ana dosya: `app.py`.
3. Secrets: `POLAR_ORGANIZATION_ID`, `CP_BUY_URL`.
4. Yayın. Her `git push` otomatik güncellenir.
Not: Ücretsiz planın özel depo ve kaynak sınırlarını Streamlit dokümanından kontrol edin.

### Seçenek B — Hetzner VPS + Docker (müşteri artınca, ~€5/ay)
```bash
docker build -t commissionpack .
docker run -d --restart unless-stopped -p 8501:8501 \
  -e POLAR_ORGANIZATION_ID=xxx -e CP_BUY_URL=https://commissionpack.io/#pricing \
  commissionpack
```
Önüne Caddy koyun (otomatik HTTPS). Aynı VPS'te n8n çalıştırın.

### Landing page — Cloudflare Pages
1. Cloudflare Pages → "Upload assets" veya GitHub bağlantısı.
2. Kök klasör: `landing/`.
3. Alan adını bağlayın.

### Yayın kontrol listesi
- [ ] `python -m pytest` geçiyor
- [ ] Yer tutucular değişti (APP_URL, CHECKOUT_*, FORM_ACTION)
- [ ] Polar sandbox satın alma testi geçti
- [ ] Gerçek bir IO listesi ile paket üretildi ve Excel'de açıldı
- [ ] Gizlilik politikası ve kullanım şartları sayfası eklendi (Polar MoR şartı)
