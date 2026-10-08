# Aziz'in AI Pasif Gelir Sistemi — Strateji Raporu

Tarih: 8 Ekim 2026
Yazım kuralı: Kısa cümle. Etken çatı. Bir cümlede bir bilgi.

---

## 0. Kısa sonuç (önce bunu okuyun)

**Seçim:** CommissionPack.
IO listesini (TIA Portal etiket dışa aktarımı veya Excel/CSV) alır.
1 dakikada devreye alma doküman paketi üretir:
DI/DO test sayfaları, AI/AO çevrim testi, FAT protokolü, SAT protokolü, eksik listesi, onay sayfası.

**Müşteri:** Sistem entegratörleri, makine üreticileri, serbest devreye alma mühendisleri.

**Fiyat:** Ücretsiz (32 IO) → Project Pass $49 → Pro $39/ay → Team $119/ay.

**Neden bu:** Teknik geçmişinize tam uyar. Araştırmada bu işi yapan hazır ticari ürün bulamadım.
Genel şablonlar ücretsiz var, ama projeye özel doldurulmuş paket üreten araç yok.
Teslimat %100 otomatik. Global satılır. Veri bulut AI'ya gitmez. Bu bir güven avantajıdır.

**Dürüst risk:** Ödeme isteği henüz kanıtlı değil. İlk 30 günün işi bunu kanıtlamak.
30. günde 2'den az ödeme varsa Model 1'e (Makine Yönetmeliği kiti) geçin. Aynı altyapı kullanılır.

**Durum:** MVP kodu bu depoda çalışıyor. Test edildi. Bkz. `README.md`.

> "Bu fikirlerden CommissionPack'i seçiyorum. İlk 90 gün boyunca sadece buna odaklanmanızı öneriyorum."

---

## 1. Sizin analiziniz

### Güçlü yönler (rakip AI girişimcisinde olmayan)

| Alan | Neden avantaj |
|---|---|
| TIA Portal, S7-1200/1500, SCL | Siemens dosya formatlarını bilirsiniz. Ürünün çekirdeği bu formatları okumak. |
| Devreye alma, FAT/SAT | Müşterinin acısını yaşadınız. Doğru test adımını siz yazarsınız, AI değil. |
| S120/G120/S210, PROFINET | Sürücü ve ağ testlerini bilirsiniz. Ürüne modül olarak eklenir. |
| Arıza analizi | Sahada hangi hatanın pahalı olduğunu bilirsiniz. Satış metni buradan çıkar. |
| CNC, tüp lazer, plazma, CAD/CAM | İkinci ürün hattı için yedek pazar. |
| Teknik dokümantasyon | Ürünün çıktısı zaten doküman. |
| AI + Python + n8n | Tek kişi, küçük ekip işini yapar. |

### Zayıf yönler

- Profesyonel yazılımcı değilsiniz. Çözüm: basit stack (Python + Streamlit + Excel). Kodu Claude yazar, siz test edersiniz.
- Satış ve pazarlama deneyimi bilinmiyor. Çözüm: B2B doğrudan mesaj + LinkedIn. Az ama değerli müşteri.
- Türkiye'den ödeme almak zor (Stripe/PayPal yok). Çözüm: Merchant of Record (Polar.sh veya Paddle). Bkz. Bölüm 10.

### Sonuç

Siz + AI = "Endüstriyel otomasyon için niş yazılım evi".
En büyük avantajınız: **alan bilgisi**. AI kodu yazar. Ama hangi kodun para ettiğini siz bilirsiniz.

---

## 2. Bir otomasyon mühendisi neden avantajlı?

Sıradan AI girişimcisi "PDF yükle → özet" yapar. Bunu ChatGPT bedava yapar.
Siz şu problemleri bilirsiniz. Onlar bilmez.

### Rol bazında problem listesi

| Rol | Her gün yaşadığı problem | Dijital ürün olur mu? |
|---|---|---|
| PLC mühendisi | Etiket tablosunu Excel'e kopyalamak, IO listesi ile karşılaştırmak | **Evet** — CommissionPack çekirdeği |
| PLC mühendisi | Alarm metinlerini HMI'a tek tek girmek, çeviri | Evet — TIA alarm dışa aktarım modülü (Faz 2) |
| PLC mühendisi | Standart blok yazmak (motor, valf, eksen) | Evet ama talep zayıf (Siemens LGF ücretsiz) |
| Devreye alma mühendisi | IO test sayfası, çevrim testi, FAT/SAT protokolü hazırlamak | **Evet** — CommissionPack |
| Devreye alma mühendisi | Analog ölçekleme (27648, 4–20 mA) hesapları | Evet — ücretsiz SEO aracı (trafik mıknatısı) |
| Devreye alma mühendisi | Eksik (punch) listesini takip etmek | Evet — CommissionPack içinde |
| Makine üreticisi | CE teknik dosyası, risk değerlendirmesi, Uygunluk Beyanı | Evet — Model 1 (rekabet var) |
| Makine üreticisi | Kullanım kılavuzu, çok dilli çeviri | Evet ama hukuki risk ve inceleme yükü yüksek |
| Makine üreticisi | Teklif ve BOM hazırlamak | Evet — orta talep, şirkete özel |
| Pano üreticisi | IO listesinden kablo listesi, klemens planı, BOM | Evet — CommissionPack Faz 3 modülü |
| Bakım mühendisi | Arıza kayıtları, bakım planı | Evet ama CMMS pazarı çok kalabalık |
| Bakım mühendisi | Sürücü arıza kodu araştırmak | Hayır — ChatGPT bunu bedava yapar |
| CNC operatörü | Kesme süresi, malzeme, fiyat hesabı | Evet — rakip var (CutQuote $95–410/ay) |
| CNC operatörü | G-code düzeltme, post-processor | Zayıf — Mach3 eskiyor, pazar küçük |
| 3D baskı kullanıcısı | Fikstür, aparat tasarımı | Zayıf — ürün fiyatı düşük, rekabet yüksek |

**Çıkarım:** En değerli problem "devreye alma dokümantasyonu".
Neden: Her projede tekrarlar. Saatler alır. Hata pahalıdır. Hazır araç yok.

---

## 3. Pazar araştırması — bulgular

Bulamadığım veriyi "bulamadım" diye yazdım. Kaynaklar en sonda.

### 3.1 Devreye alma dokümantasyonu (CommissionPack)

- IO çevrim testi (loop check) "elle yapılan, tekrarlayan ve zaman alan" bir iş olarak tanımlanıyor (Honeywell patent başvurusu, US11934168).
- FAT/SAT için uluslararası standart var: **IEC 62381:2024 (3. baskı)**. 2024 baskısı formları kaldırdı, yerine kontrol listeleri koydu. Standart yaklaşık $484. Not: Ürün standart metnini kopyalamaz. Kendi ifadelerimizi kullanırız.
- **Ücretsiz genel şablonlar var:** plcprogramming.io (CSV, kayıtsız), Vention (PDF FAT/SAT). Sonuç: Boş şablon satmak zor. Değer, şablonu projeye göre **otomatik doldurmakta**.
- **Ticari araç:** CxPlanner (FAT/SAT takip, fiyat yok, demo ile satış, data center/bina odaklı). WAGO-I/O-CHECK (sadece WAGO donanımı).
- **IO listesinden FAT/SAT üreten ticari ürün bulamadım.** Bu bir boşluk. Ama "ürün yok" bazen "talep yok" demektir. Bu yüzden 1. hafta doğrulama zorunlu.
- Dokümantasyonun devreye almada ihmal edildiği sektör yazılarında tekrar ediyor (Mavtech, Industrial Monitor Direct).
- Reddit/forum şikâyet verisi: Arama aracım r/PLC başlıklarını getirmedi. **Veri yok.** Doğrulamayı doğrudan müşteri görüşmesi ile yapacağız.

### 3.2 AB Makine Yönetmeliği 2023/1230 (Model 1)

- 20 Ocak 2027'de 2006/42/AT direktifinin yerini alır. Bugün itibarıyla ~3,5 ay kaldı.
- Yeni gereklilikler: siber güvenlik (koruma, bozulmaya karşı), yazılım tabanlı güvenlik fonksiyonları, dijital kullanım talimatı, yeni Ek yapısı (teknik dosya Ek IV, EHSR Ek III).
- Uygunluk Beyanı yeni yönetmeliğe atıf yapmalı.
- Türkiye: makine ihracatı 2025 Ocak–Kasım ~$26 milyar (MAİB). İhracatın %54'ü AB + ABD'ye gidiyor (Invest in Türkiye).
- **Rakipler (yazılım):** Safety Software (€20–190/ay, AI asistan, 22 dil), Riskera (bulut, AI, ücretsiz başlangıç), Secutify (€125/ay), Safexpert (kurumsal), DOCUFY.
- **Rakipler (şablon):** Euronorm Excel risk analizi €44,95; 14 direktif paketi €125; teknik dosya şablonu €75.
- **Sonuç:** Talep gerçek ve acil. Ama rekabet zaten AI'lı ve ucuz. Hukuki sorumluluk riski var.

### 3.3 Siemens'in kendi AI'ı (kırmızı bayrak)

- Siemens, TIA Portal için "Engineering Copilot" sonra "Eigen Engineering Agent" çıkardı.
- SCL/LAD kod üretir, derleme hatalarını düzeltir, test mantığı ve proje dokümantasyonu üretir.
- Fiyat teklif ile. **Sonuç:** "AI PLC kod üretici" yapmayın. Platform sahibi ile yarışırsınız.
- Not: Bu ajan TIA projesinin **içini** belgeler. CommissionPack ise **sahadaki test kaydını** (imza, durum, ölçüm) üretir. Örtüşme kısmi. Bunu izleyeceğiz.

### 3.4 Diğer pazarlar (kısa)

- **Etsy CNC DXF:** "cnc dxf files" için 79.190 ilan; "dxf cut file" için 523.386 ilan. Ortalama fiyat ~$6. **Girmeyin.**
- **Lazer kesim teklif yazılımı:** CutQuote $95/ay (Starter) – $410/ay (Pro). Pazar var, rakip var, geometri/nesting zor.
- **OEE yazılımı:** Makine başına $30–150/ay + donanım $200–2.000. Kurulum ve donanım işi var. Pasif değil.
- **Siemens kütüphane:** SIMATIC Control Function Library ~€579 (lisans). Siemens LGF ücretsiz. Üçüncü taraf blok satan dükkan bulamadım. Talep zayıf.
- **Makine kılavuzu çevirisi:** €0,12/kelime (uzman), €0,05/kelime (post-edit). Çeviri şirketleri pazarı tutuyor.

---

## 4. 25 gelir modeli ve puanlama

Puan anahtarı: Talep 20 · Rekabet 10 (düşük rekabet = yüksek puan) · Marj 15 · Otomasyon 15 · Pasif gelir 15 · AI kaldıracı 10 · Teknik uyum 5 · Global 5 · Ölçek 5 = 100.

| # | Fikir | Kategori | Tal. | Rek. | Marj | Oto. | Pasif | AI | Uyum | Glob. | Ölç. | **Toplam** |
|---|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | CommissionPack: IO listesi → FAT/SAT/IO test paketi | Micro SaaS | 13 | 8 | 14 | 13 | 12 | 7 | 5 | 5 | 5 | **82** |
| 2 | Makine Yönetmeliği 2023/1230 geçiş kiti (TR/EN şablon) | Dijital ürün B2B | 15 | 5 | 14 | 13 | 12 | 7 | 4 | 3 | 3 | **76** |
| 3 | Makine siber güvenlik kanıt paketi (Ek III + IEC 62443 kontrol listesi) | Dijital ürün B2B | 11 | 7 | 14 | 12 | 11 | 7 | 5 | 4 | 4 | **75** |
| 4 | TIA Portal Openness eklentisi (toplu etiket/alarm/doküman) | Yazılım lisansı | 11 | 7 | 13 | 11 | 11 | 7 | 5 | 4 | 3 | **72** |
| 5 | IO listesinden pano BOM / kablo listesi üretici | Micro SaaS | 10 | 6 | 13 | 12 | 11 | 6 | 5 | 4 | 4 | **71** |
| 6 | Lazer/tüp lazer teklif hesaplayıcı | Micro SaaS | 12 | 5 | 13 | 12 | 11 | 5 | 4 | 4 | 4 | **70** |
| 7 | Çok dilli makine kılavuzu üretici | AI SaaS | 13 | 5 | 12 | 10 | 9 | 9 | 4 | 4 | 4 | **70** |
| 8 | SCL fonksiyon bloğu kütüphanesi | Dijital ürün | 8 | 6 | 14 | 13 | 12 | 5 | 5 | 4 | 3 | **70** |
| 9 | WinCC/HMI şablon ve faceplate paketi | Dijital ürün | 7 | 7 | 14 | 13 | 12 | 4 | 5 | 4 | 3 | **69** |
| 10 | Mühendislik Excel hesap araçları paketi | Dijital ürün | 8 | 3 | 14 | 13 | 12 | 6 | 5 | 4 | 3 | **68** |
| 11 | Genel AI CE risk değerlendirme SaaS | AI SaaS | 15 | 2 | 12 | 10 | 9 | 8 | 3 | 4 | 4 | **67** |
| 12 | Online kurs (TIA Portal / S120 devreye alma) | İçerik → ürün | 13 | 3 | 12 | 9 | 10 | 5 | 5 | 5 | 4 | **66** |
| 13 | Makine/pano üreticisi için teklif üretici | Micro SaaS | 11 | 5 | 12 | 10 | 9 | 7 | 4 | 4 | 4 | **66** |
| 14 | CMMS / bakım planlayıcı | Micro SaaS | 14 | 2 | 12 | 9 | 9 | 6 | 4 | 5 | 5 | **66** |
| 15 | Etsy plazma DXF dosyaları | Etsy | 10 | 2 | 13 | 12 | 11 | 6 | 3 | 5 | 3 | **65** |
| 16 | Endüstriyel arıza giderme PDF rehberleri | Dijital ürün | 6 | 4 | 14 | 13 | 12 | 3 | 5 | 4 | 3 | **64** |
| 17 | AI PLC kod üretici (SCL) | AI SaaS | 12 | 1 | 10 | 10 | 8 | 9 | 5 | 4 | 4 | **63** |
| 18 | G-code üretici / Mach3 makro / post-processor | Dijital ürün | 6 | 5 | 13 | 12 | 10 | 6 | 4 | 4 | 3 | **63** |
| 19 | Sürücü arıza kodu AI chatbot | AI wrapper | 7 | 2 | 12 | 12 | 11 | 5 | 5 | 5 | 4 | **63** |
| 20 | Endüstriyel 3D baskı fikstür STL | Dijital ürün | 8 | 3 | 12 | 12 | 10 | 4 | 4 | 5 | 3 | **61** |
| 21 | Vardiya/üretim rapor otomasyonu (Excel + n8n) | Otomasyon ürünü | 10 | 5 | 11 | 10 | 8 | 6 | 4 | 4 | 3 | **61** |
| 22 | OEE / duruş takibi (küçük atölye) | Micro SaaS + donanım | 13 | 4 | 10 | 8 | 8 | 5 | 5 | 4 | 4 | **61** |
| 23 | Otomasyon YouTube (yüzsüz) + affiliate | İçerik | 6 | 3 | 10 | 10 | 11 | 8 | 4 | 5 | 4 | **61** |
| 24 | PLC alarm log → AI rapor (tesise özel, n8n) | AI agent hizmeti | 10 | 6 | 11 | 8 | 6 | 8 | 5 | 3 | 3 | **60** |
| 25 | Fabrikalara Excel/PDF otomasyon ajansı | Hizmet | 14 | 6 | 10 | 6 | 4 | 8 | 5 | 3 | 2 | **58** |

### 10 soru filtresi (7/10 altı elenir)

Sorular: (1) Para öder mi? (2) Bugün nasıl çözüyor? (3) Neden benimki? (4) AI avantajı? (5) Tek kişi yapar mı? (6) Satış otomatik mi? (7) Teslimat otomatik mi? (8) Global mi? (9) Kopyalanması zor mu? (10) 3 yıl sonra değerli mi?

| Fikir | Geçen soru | Sonuç |
|---|---|---|
| 1 CommissionPack | 9/10 (1. soru doğrulanacak) | **GEÇTİ** |
| 2 MR 2023/1230 kiti | 8/10 (9 ve 8 zayıf) | GEÇTİ |
| 3 Siber güvenlik paketi | 8/10 | GEÇTİ |
| 4 TIA Openness eklentisi | 7/10 (bakım yükü: her TIA versiyonu) | GEÇTİ (sınırda) |
| 5 Pano BOM üretici | 7/10 | GEÇTİ → CommissionPack modülü olur |
| 6 Lazer teklif | 7/10 | GEÇTİ (sınırda) |
| 7 Kılavuz üretici | 6/10 (hukuk riski, inceleme yükü) | ELENDİ |
| 8 SCL kütüphane | 7/10 (talep zayıf) | GEÇTİ (sınırda) |
| 11 Genel AI CE SaaS | 5/10 (rekabet, kopyalama, hukuk) | ELENDİ |
| 15 Etsy DXF | 5/10 (rekabet, düşük fiyat) | ELENDİ |
| 17 AI PLC kod | 4/10 (Siemens kendisi yapıyor) | ELENDİ |
| 19 Arıza kodu chatbot | 4/10 (ChatGPT bedava yapıyor) | ELENDİ — saf AI wrapper |
| 24, 25 Hizmetler | 5/10 (pasif değil) | ELENDİ (sadece nakit için) |

---

## 5. En iyi 10 fikir

| Fikir | Başlangıç maliyeti | İlk gelir süresi | Aylık potansiyel (12–24 ay) | Otomasyon | Rekabet | Teknik zorluk | Skor |
|---|---|---|---|---|---|---|---|
| CommissionPack | $50–150 | 3–5 hafta | $2.000–8.000 | Çok yüksek | Düşük | Orta | **82** |
| MR 2023/1230 geçiş kiti | $50–100 | 1–3 hafta | $500–3.000 (zirve 2026 Q4–2027 Q1) | Çok yüksek | Orta | Düşük | 76 |
| Siber güvenlik kanıt paketi | $50–100 | 3–6 hafta | $500–2.000 | Çok yüksek | Düşük–orta | Orta | 75 |
| TIA Openness eklentisi | $0–500 (TIA lisansı varsa) | 6–10 hafta | $1.000–4.000 | Yüksek | Düşük | Yüksek (.NET, versiyonlar) | 72 |
| Pano BOM / kablo listesi | $50 | 6–8 hafta | $500–2.000 | Yüksek | Orta (EPLAN üst segment) | Orta | 71 |
| Lazer teklif hesaplayıcı | $100 | 8–12 hafta | $1.000–5.000 | Yüksek | Orta | Yüksek (geometri) | 70 |
| Kılavuz üretici | $100 | 6–10 hafta | $1.000–4.000 | Orta | Orta | Orta | 70 |
| SCL kütüphane | $0 | 2–4 hafta | $200–1.000 | Çok yüksek | Orta | Düşük | 70 |
| HMI şablon paketi | $0 | 2–4 hafta | $200–800 | Çok yüksek | Orta | Düşük | 69 |
| Excel hesap araçları | $0 | 1–2 hafta | $100–500 | Çok yüksek | Yüksek | Düşük | 68 |

Not: Aylık potansiyel bir tahmindir. Doğrulanmış pazar verisi değildir.

---

## 6. Üç finalist

### MODEL 1 — En hızlı gelir: Makine Yönetmeliği 2023/1230 Geçiş Kiti (TR + EN)

- **Ne:** Ek III EHSR kontrol listesi, Ek IV teknik dosya kontrol listesi, risk değerlendirme Excel'i (ISO 12100 yapısı), yeni Uygunluk Beyanı şablonu, siber güvenlik kontrol listesi, geçiş planı.
- **Kime:** AB'ye ihracat yapan Türk makine üreticileri (KOBİ).
- **Fiyat:** $149 kit / $490 "kit + 1 saat inceleme".
- **Neden hızlı:** Son tarih 20 Ocak 2027. Aciliyet var. Türkçe rakip içerik az.
- **Neden seçmedim:** Pencere dar. Rakipler ucuz ve AI'lı (Safety Software €20/ay). Hukuki sorumluluk riski. CE uzmanlığı listenizde açıkça yok.
- **Rolü:** Plan B. 30. gün kriteri tutmazsa buna geçin.

### MODEL 2 — En yüksek uzun vadeli potansiyel: CommissionPack → "Otomasyon Proje Dokümantasyon Platformu"

- Bugün: IO listesi → devreye alma paketi.
- Yarın: HMI alarm testi, sürücü devreye alma kaydı, pano BOM/kablo listesi, siber güvenlik kanıt dosyası, TIA Openness eklentisi.
- Her modül aynı müşteriye satılır. Müşteri başına gelir zamanla artar.

### MODEL 3 — En yüksek otomasyon/pasif gelir: Siemens SCL + HMI standart kütüphanesi

- İndirilebilir global kütüphane (.zal19/.zal20 vb.) + PDF doküman + örnek proje.
- Sunucu yok. Veri yok. Destek düşük.
- **Zayıf yön:** Talep zayıf. Siemens LGF ücretsiz. Mühendisler kendi bloklarını tercih eder.
- **Rolü:** CommissionPack müşterisine upsell olarak (Faz 3).

---

## 7. Seçimim ve nedeni

**"Ben siz olsaydım CommissionPack yapardım."**

| Soru | Cevap |
|---|---|
| Hangi ürün? | IO listesi → 10 sayfalık devreye alma paketi (Excel). Web uygulaması + lisans anahtarı. |
| Hangi müşteri? | 1) Sistem entegratörleri (5–50 kişi). 2) Makine üreticilerinin otomasyon ekibi. 3) Serbest devreye alma mühendisleri. Önce Siemens kullananlar. |
| Hangi problem? | Her projede IO test sayfası, çevrim testi, FAT/SAT protokolü elle hazırlanıyor. Saatler gidiyor. Format her mühendiste farklı. |
| Neden para öder? | Mühendis saati €40–80. Bir paket 4–16 saat kazandırır (tahmin, doğrulanacak). $49 bir projede kendini öder. Müşteriye profesyonel ve standart doküman verir. |
| Nerede satılır? | Kendi sitesi (landing page) + web uygulaması. Ödeme: Polar.sh (Merchant of Record). |
| Kaça? | Ücretsiz 32 IO · Project Pass $49 (30 gün) · Pro $39/ay veya $390/yıl · Team $119/ay · Done-for-you $249/proje. |
| Nasıl üretilir? | Python + openpyxl. Kural tabanlı ayrıştırma ve sınıflandırma. Kodu Claude yazar. Siz test edip doğru mühendislik içeriğini verirsiniz. |
| AI nerede? | Geliştirme (kod), içerik (LinkedIn, SEO sayfaları), destek taslakları, çeviri kontrolü. Faz 2'de opsiyonel: dağınık etiket isimlerini sınıflandırma, fonksiyon tanımından FAT fonksiyon testi üretme. Çekirdek deterministik kalır. |
| Hangi araçlar? | Python, Streamlit, GitHub, Cloudflare Pages, Polar.sh, MailerLite, n8n, Claude. |
| Nasıl pazarlanır? | LinkedIn (TR + EN), doğrudan mesaj (entegratör listeleri), forumlarda değerli cevaplar, ücretsiz araçlar ile SEO, kısa demo videoları. |
| Nasıl otomatik teslim? | Ödeme → Polar lisans anahtarını e-posta ile yollar → kullanıcı anahtarı uygulamaya girer → tam sürüm açılır. Siz dokunmazsınız. |
| Nasıl destek? | SSS + örnek dosyalar + video. E-postalara n8n + Claude taslak yazar, siz onaylarsınız. |
| Nasıl ölçeklenir? | Sunucu maliyeti neredeyse sabit. Yeni modüller (alarm, sürücü, BOM). Yeni dil. Rockwell/CODESYS içe aktarma. Team planı. Eğitmenler için affiliate. |

### "Neden ChatGPT kullanmasınlar?" (moat)

1. **Format bilgisi:** TIA Portal etiket dışa aktarımı, Almanca adres (E/A), :P çevresel erişim, M/DB eleme. ChatGPT her seferinde farklı sonuç verir. Biz her seferinde aynı sonucu veririz.
2. **Çalışan Excel:** Açılır listeler, otomatik OK/NOK formülleri, ilerleme özeti, yazdırma ayarı. Sohbet botu bunu tek seferde, güvenilir üretmez.
3. **Mühendislik içeriği:** Cihaz tipine göre test talimatı. Güvenlik IO'su işaretli. "Güvenlik çıkışını force etmeyin" kuralı. Bu sizin saha bilginiz.
4. **Veri gizliliği:** Proje dosyası AI'ya gitmez. Birçok fabrika bulut AI'ya proje yüklemeyi yasaklar. Bu bir satış argümanı.
5. **Değiştirme maliyeti:** Müşteri şirket logosu/şablonu ile standartlaştırınca başka araca geçmez (Team planı).
6. **Hız:** 1 dakika. ChatGPT ile 35 IO'luk liste için bile 30+ dakika ve kontrol gerekir.

---

## 8. Passive Income Machine — uçtan uca sistem

```
Trafik (LinkedIn, forum, SEO araçları, demo videoları)
  ↓
Landing page (commissionpack.io) — Cloudflare Pages
  ↓
Ücretsiz araç (32 IO) — kayıt yok, anında değer
  ↓
E-posta yakalama (ücretsiz FAT/SAT kontrol listesi) — MailerLite
  ↓
E-posta otomasyonu (5 e-postalık seri: ipucu + vaka + teklif)
  ↓
Ücretli ürün (Project Pass / Pro / Team)
  ↓
Otomatik ödeme + fatura + KDV — Polar.sh (Merchant of Record)
  ↓
Otomatik teslimat — lisans anahtarı e-posta ile
  ↓
Upsell (Project Pass → Pro; Pro → Team; Done-for-you)
  ↓
Abonelik yenileme — Polar otomatik
  ↓
Müşteri desteği — SSS + n8n/Claude taslak yanıt + siz onay
  ↓
Analitik — Cloudflare Web Analytics + Polar paneli + haftalık n8n raporu
  ↓
Retargeting — e-posta (ücretsiz kullanıcıya 7., 14., 30. gün hatırlatma). Ücretli reklam yok.
```

Sizin işiniz: haftada 1 strateji kontrolü, destek onayı, yeni modül kararı.

---

## 9. Teknoloji stack'i (en basit, en ucuz)

| İşlev | Araç | Aylık maliyet |
|---|---|---|
| Çekirdek | Python 3.12 + openpyxl | $0 |
| Web arayüz | Streamlit | $0 |
| Barındırma | Streamlit Community Cloud (başlangıç) → Hetzner VPS + Docker (müşteri artınca) | $0 → ~€5 |
| Landing page | Statik HTML, Cloudflare Pages | $0 |
| Alan adı | .io veya .com | ~$1–4 |
| Ödeme + lisans | Polar.sh (MoR, lisans anahtarı, Türkiye ödemesi Stripe Connect Express ile) | %5 + $0,50 (+%1,5 uluslararası kart) |
| Yedek ödeme | Paddle (yazılım kabul eder, USD ödeme) | işlem başı |
| E-posta | MailerLite (1.000 aboneye kadar ücretsiz) | $0 |
| Otomasyon | n8n (VPS'te self-host) | $0 |
| Analitik | Cloudflare Web Analytics | $0 |
| AI | Claude (mevcut abonelik) + API (destek taslakları) | $20 + ~$5–20 |
| Kod deposu | GitHub | $0 |

**Sabit maliyet:** ~$25–50/ay. Veritabanı MVP'de yok (durumsuz uygulama).

**Önemli (Türkiye):**
- Stripe ve PayPal Türkiye'deki satıcıya açık değil. Gumroad Türkiye'ye ödeme yapmıyor.
- Polar.sh Türkiye'yi Stripe Connect Express ile destekliyor (kaynak: bir geliştirici blogu; hesabı açmadan önce Polar'dan yazılı teyit alın).
- Paddle sadece yazılım/SaaS kabul eder. Bizim ürünümüz uygun.
- Yurt dışı gelir için şahıs şirketi ve mali müşavir gerekir. "Hizmet ihracatı" avantajlarını mali müşavire sorun.

---

## 10. No-code → AI-code → Full product yolu

| Aşama | Ne | Durum |
|---|---|---|
| 1. No-code MVP | Elle doldurulmuş örnek paket + Google Form ile "IO listeni gönder" | Atlandı. Doğrudan Aşama 2'ye geçtik. |
| 2. AI ile kodlanmış MVP | Python üretici + Streamlit arayüz + testler | **Bitti** (bu depo) |
| 3. Gerçek müşteriler | 5 entegratörün gerçek IO listesi ile deneme | Gün 1–21 |
| 4. Ürün geliştirme | Müşteri isteği ile: logo, PDF çıktısı, HMI alarm testi | Gün 22–60 |
| 5. Otomasyon | Polar → n8n → e-posta, destek taslağı, haftalık rapor | Gün 15–45 |
| 6. SaaS / abonelik | Pro ve Team planları, yıllık plan | Gün 30–90 |
| 7. AI agent operasyonu | Destek ajanı, içerik ajanı, SEO sayfa üretimi, müşteri onboarding | Gün 60–180 |

---

## 11. İlk 30 gün (haftalık, ölçülebilir)

### Hafta 1 — Doğrulama (en önemli hafta)
- Kendi geçmiş projelerinizden 3 IO listesini (isimleri gizleyerek) araçtan geçirin. Eksikleri not edin.
- 100 hedef firma listesi çıkarın: Siemens Solution Partner bulucu, CSIA üye dizini, LinkedIn ("system integrator" + Siemens), Türkiye OSB'leri.
- Günde 15–20 kişisel mesaj (LinkedIn/e-posta). Teklif: "IO listenizi gönderin, FAT/SAT paketini ücretsiz üreteyim."
- 1 LinkedIn demo videosu (60 sn ekran kaydı).
- **Hedef:** 100 firma listesi · 60 mesaj · 10 cevap · 5 gerçek IO listesi denemesi · 3 görüşme.

### Hafta 2 — Yayın
- Alan adı al. Landing page'i Cloudflare Pages'e koy.
- Uygulamayı Streamlit Cloud'a koy.
- Polar'da 3 ürün aç (Project Pass, Pro, Team). Lisans anahtarı faydasını bağla. Test satın alma yap.
- MailerLite formu + ücretsiz kontrol listesi PDF.
- **Hedef:** Canlı site · çalışan ödeme · 20 ücretsiz kullanıcı · 30 e-posta abonesi.

### Hafta 3 — İlk satış
- "Kurucu müşteri" teklifi: ilk 20 Pro müşteriye $19/ay ömür boyu.
- Hafta 1 denemelerinden gelen 5 ana isteği uygula.
- r/PLC, PLCtalk, sps-forum: değerli cevap ver (spam yok). Uygun yerde araç linki.
- **Hedef:** 3 ödeme (herhangi plan) · 50 ücretsiz kullanıcı · 60 abone.

### Hafta 4 — Geri bildirim + sistem
- Her ödeme yapan müşteri ile 15 dk görüşme. 2 referans/alıntı al.
- Polar webhook → n8n → hoş geldin e-postası + Telegram bildirimi.
- Done-for-you ($249) teklifini büyük projeler için sun.
- **Hedef:** Toplam 5 ödeyen müşteri · $200+ gelir · 100 abone · 3 referans.

### 30. gün karar kuralı
- 5+ ödeyen müşteri → devam, ölçekle.
- 2–4 ödeyen müşteri → fiyat/kanal değiştir, 30 gün daha dene.
- 0–1 ödeyen müşteri ve 10'dan az gerçek kullanım → Model 1'e geç (aynı site, aynı ödeme altyapısı).

---

## 12. İlk 90 gün

### Gün 1–7
Doğrulama (yukarıdaki Hafta 1). Kod hazır olduğu için tüm zamanı müşteriye harcayın.

### Gün 8–30
Yayın, ödeme, ilk satış, ilk otomasyon. Hedef: 5 ödeyen müşteri, 100 abone.

### Gün 31–60 — Ürünü derinleştir, trafiği otomatikleştir
- Özellikler: şirket logosu (Team), PDF çıktısı, TIA HMI alarm dışa aktarımından alarm test sayfası, sürücü devreye alma kontrol listesi.
- SEO: 3 ücretsiz araç sayfası (S7 analog ölçekleme hesaplayıcı, IO listesi temizleyici, FAT kontrol listesi üretici). Her biri ana ürüne yönlendirir.
- İçerik: Claude haftada 3 LinkedIn taslağı yazar. Siz 15 dk düzeltir, yayınlarsınız.
- Hedef: 15 ödeyen müşteri · $400–700 MRR · 300 abone.

### Gün 61–90 — Ölçek ve pasifleşme
- Opsiyonel AI özellikleri (kullanıcı izni ile): dağınık etiket sınıflandırma, yorum çevirisi.
- Almanca ve Türkçe landing sayfaları.
- Yıllık plan kampanyası (nakit akışı).
- Affiliate: PLC eğitmenleri ve YouTube kanalları için %30 komisyon (Polar/affiliate aracı ile).
- Destek ajanı: n8n + Claude, SSS üzerinden taslak.
- Hedef: 25–35 ödeyen müşteri · $700–1.200 MRR · otomatik teslimat ve onboarding · haftalık iş yükü ~10 saat.

**Dürüst not:** 90. günde $500–1.000/ay hedefi mümkün ama garanti değil. Daha olası aralık $300–1.000.

---

## 13. Gelir senaryoları (12. ay)

Fiyatlar: Project Pass $49 · Pro $39/ay · Team $119/ay · Done-for-you $249.
Maliyet: Polar ~%7 (işlem + uluslararası kart) + sabit giderler.

### Basit matematik
- $49 × 10 satış = $490
- $49 × 100 satış = $4.900
- $39 × 100 Pro abone = $3.900 MRR
- $119 × 20 Team = $2.380 MRR

### KÖTÜ senaryo
| Kalem | Adet | Gelir |
|---|---|---|
| Project Pass | 4 | $196 |
| Pro | 6 | $234 |
| Done-for-you | 1 | $249 |
| **Toplam gelir** | | **$679** |
| Ödeme ücreti (~%7) | | −$48 |
| Sabit gider | | −$35 |
| **Net kâr** | | **~$596/ay** |

### GERÇEKÇİ senaryo
| Kalem | Adet | Gelir |
|---|---|---|
| Project Pass | 10 | $490 |
| Pro | 35 | $1.365 |
| Team | 5 | $595 |
| Done-for-you | 2 | $498 |
| **Toplam gelir** | | **$2.948** |
| Ödeme ücreti (~%7) | | −$206 |
| Altyapı + araçlar | | −$100 |
| **Net kâr** | | **~$2.642/ay** |

### AGRESİF senaryo (18–24. ay)
| Kalem | Adet | Gelir |
|---|---|---|
| Project Pass | 30 | $1.470 |
| Pro | 150 | $5.850 |
| Team | 25 | $2.975 |
| **Toplam gelir** | | **$10.295** |
| Ödeme ücreti (~%7) | | −$721 |
| Altyapı + araçlar | | −$300 |
| Yarı zamanlı destek (freelancer) | | −$500 |
| **Net kâr** | | **~$8.774/ay** |

### Gerçekçi senaryonun huni matematiği
- Aylık iptal (churn) %5 kabul. 35 Pro abonede ayda ~2 kayıp. Büyümek için ayda 4–5 yeni Pro gerekir.
- Ücretsiz → ücretli dönüşüm %3 ise ayda ~150 ücretsiz kullanıcı gerekir.
- Ziyaretçi → ücretsiz kullanım %30 ise ayda ~500 hedefli ziyaretçi gerekir.
- 500 hedefli ziyaretçi, LinkedIn + forum + 3 SEO aracı ile ulaşılabilir bir sayıdır. Garanti değildir.

---

## 14. "Uyurken para kazanma" gerçeği

**Cevap: Yarı pasif.** Tamamen pasif değil.

| Dönem | Aktif çalışma | Ne yaparsınız |
|---|---|---|
| 0–3 ay | %80–100 (haftada 15–25 saat) | Müşteri görüşmesi, ürün düzeltme, yayın, ilk satışlar |
| 3–6 ay | %50 (haftada 8–12 saat) | Yeni modül, içerik onayı, destek |
| 6–12 ay | %20–30 (haftada 4–8 saat) | Strateji, yeni TIA versiyon testleri, kritik destek |
| 12+ ay | %10–15 (haftada 2–5 saat) | Kontrol, büyük müşteri, yeni ürün kararı |

**%5 mümkün mü?** Ödeyen B2B müşterisi olan bir SaaS için gerçekçi değil.
Nedenleri: TIA Portal her yıl yeni versiyon çıkarır. Müşteri soru sorar. Ödeme/vergi işleri olur.
Ama satış, ödeme, teslimat ve yenileme siz uyurken çalışır. Bu doğru.

---

## 15. Otomasyon haritası

| Alan | Nasıl otomatik |
|---|---|
| Satış | Landing page + ücretsiz araç + Polar checkout. İnsan gerekmez. |
| Ödeme | Polar: kart, KDV, fatura, iade. |
| Teslimat | Polar lisans anahtarını otomatik yollar. Uygulama anahtarı Polar API ile doğrular. |
| E-posta | MailerLite: hoş geldin serisi (5 e-posta), ücretsiz kullanıcı hatırlatması, yıllık plan kampanyası. |
| Müşteri desteği | SSS sayfası + uygulama içi yardım. Gelen e-posta → n8n → Claude taslak → Telegram'da siz onay → gönder. |
| Upsell | Ücretsiz sürüm 32 IO'da durur → uyarı + satın alma linki. Project Pass bitişinde Pro teklifi e-postası. |
| İçerik | Claude: haftalık 3 LinkedIn taslağı, ayda 2 blog/SEO sayfası. Siz onaylarsınız. |
| SEO | Programatik sayfalar: "FAT checklist for [makine tipi]", "IO checkout sheet [PLC]". Ücretsiz hesap araçları. |
| Analitik | Cloudflare Analytics (trafik) + Polar (gelir) → n8n haftalık özet → Telegram. |
| Ürün güncellemesi | GitHub'a push → Streamlit Cloud otomatik yayınlar. Testler (pytest) her değişiklikte çalışır. |

---

## 16. Tek kişilik şirket — iş bölümü

### AI'ın işleri
- Araştırma: rakip, fiyat, anahtar kelime.
- Kodlama: yeni modüller, hata düzeltme, testler.
- İçerik: LinkedIn, blog, video senaryosu, e-posta serisi.
- Destek: e-posta taslakları, SSS güncelleme.
- SEO: sayfa taslakları, meta metinleri.
- Dokümantasyon: kullanım kılavuzu, sürüm notları.
- Analiz: haftalık metrik yorumu.
- Çeviri: TR/DE metin kontrolü (son okuma sizde).

### Sizin işleriniz
- Stratejik karar: hangi modül, hangi fiyat.
- Mühendislik içeriğinin son kontrolü (test talimatları doğru mu?).
- Müşteri görüşmeleri ve geri bildirim.
- Kritik satış (Team, büyük entegratör).
- Finans: şirket, vergi, mali müşavir.

---

## 17. Red flag listesi — önermediğim işler

| Tip | Örnek | Neden önermiyorum |
|---|---|---|
| Aşırı rekabet | Etsy DXF, CMMS, genel AI CE SaaS | 79.000+ ilan; ücretsiz/ucuz rakipler |
| AI ile kolay kopyalanan | Arıza kodu chatbot, PDF özetleyici, genel PLC eğitim PDF'i | ChatGPT bunu bedava yapar |
| Platform sahibiyle yarış | AI PLC kod üretici | Siemens Eigen Engineering Agent |
| Düşük marj | DXF ($6), STL dosyaları | Saatlik getiri düşük |
| Sürekli destek | Tesise özel alarm analizi, ajans işleri | Her müşteri ayrı proje |
| Sürekli reklam | B2C dijital ürünler | Reklam maliyeti marjı yer |
| Stok / kargo | 3D baskı fiziksel ürün, pano satışı | Pasif değil |
| Yüksek hukuki risk | CE beyanı "hazırlayan" hizmet, kılavuz yazımı | Ürün sorumluluğu |
| Telif riski | Standart metnini (IEC/ISO) kopyalayan şablonlar, Siemens dokümanı yeniden satma | Telif ihlali |
| Platform bağımlılığı | Sadece Etsy, sadece Udemy, sadece Gumroad | Hesap kapanırsa gelir sıfır; Gumroad Türkiye'ye ödeme yapmıyor |

CommissionPack bu riskleri nasıl azaltır:
- Kendi sitesi, kendi müşteri listesi (e-posta).
- Standart metni kopyalamaz.
- "Çalışma dokümanıdır, sorumluluk mühendistedir" uyarısı her pakette var.
- Güvenlik doğrulamasını üstlenmez, sadece işaretler.

---

## 18. AZİZ'İN AI PASİF GELİR SİSTEMİ — tek yol haritası

| Başlık | Karar |
|---|---|
| **ÜRÜN** | CommissionPack — IO listesinden 1 dakikada devreye alma doküman paketi (Excel, 10 sayfa, EN/TR/DE). |
| **MÜŞTERİ** | Siemens kullanan sistem entegratörleri, makine üreticileri, serbest devreye alma mühendisleri. Önce AB + Türkiye + ABD. |
| **PROBLEM** | IO test sayfaları, çevrim testi, FAT/SAT protokolleri her projede elle hazırlanıyor. Zaman kaybı, hata, standart yok. |
| **FİYAT** | Ücretsiz (32 IO) · $49 Project Pass · $39/ay Pro · $119/ay Team · $249 Done-for-you. |
| **PLATFORM** | Kendi sitesi + Streamlit uygulaması. Ödeme Polar.sh (yedek Paddle). |
| **TRAFİK** | LinkedIn (TR+EN), doğrudan mesaj (Siemens Solution Partner, CSIA listeleri), r/PLC / PLCtalk / sps-forum cevapları, ücretsiz SEO araçları, kısa demo videoları, eğitmen affiliate. |
| **AI** | Kod, içerik, destek taslağı, SEO, çeviri kontrolü. Faz 2: opsiyonel etiket sınıflandırma ve FAT fonksiyon testi üretimi. |
| **OTOMASYON** | Ödeme, fatura, KDV, lisans teslimi, e-posta serisi, upsell, haftalık rapor, yayın. |
| **MALİYET** | ~$25–50/ay sabit + satışların ~%7'si. |
| **HEDEF 3 AY** | 25–35 ödeyen müşteri, $300–1.000 MRR, otomatik teslimat. |
| **HEDEF 6 AY** | 60+ ödeyen müşteri, $1.500–2.500 MRR, 2 yeni modül, haftada ~10 saat iş. |
| **HEDEF 12 AY** | $2.500–4.000 MRR, Team planında 5+ şirket, haftada ~5–8 saat iş. |
| **GELİR (12. ay)** | Kötü ~$600 · Gerçekçi ~$2.600 · Agresif (18–24 ay) ~$8.800 net/ay. |

---

## 19. Kaynaklar

Devreye alma / FAT / SAT
- [Honeywell patent — automated loop checking (US11934168)](https://patents.google.com/patent/US11934168)
- [IEC 62381:2024 — AFNOR katalog](https://www.boutique.afnor.org/en-gb/standard/iec-623812024/automation-systems-in-the-process-industry-factory-acceptance-test-fat-site/xs300545/431181)
- [plcprogramming.io — ücretsiz commissioning toolkit](https://plcprogramming.io/tools/commissioning-toolkit)
- [Vention — FAT checklist](https://vention.io/tools/checklists/fats)
- [CxPlanner — FAT/SAT yazılımı](https://cxplanner.com/data-centers/industries/modular)
- [Mavtech — PLC dokümantasyonu](https://mavtechglobal.com/?p=435)
- [Industrial Monitor Direct — proje dokümantasyonu](https://industrialmonitordirect.com/blogs/knowledgebase/project-documentation-best-practices-for-industrial-automation)
- [Automation.com — Itris PLC DocGen](https://www.automation.com/article/itris-announces-plc-docgen-documentation-tool-for)

Makine Yönetmeliği 2023/1230
- [Intertek — yaygın hatalar](https://w3inte.intertek.nl/resources/fact-sheets/2026/avoid-5-of-the-most-common-machinery-regulation-mistakes/)
- [Automation Magazine — CE dokümanlarını güncelleme](https://www.automationmagazine.co.uk/why-you-need-to-update-your-machinery-ce-marking-paperwork/)
- [TÜV SÜD — yeni yönetmelik](https://www.tuvsud.com/en-us/knowledge-hub/articles/new-eu-machinery-regulation-what-you-need-to-know)
- [Safety Software — fiyatlar](https://safetysoftware.eu/en/)
- [Riskera](https://riskera.eu/)
- [Secutify](https://secutify.com/en/)
- [Safexpert — Capterra](https://www.capterra.com/p/238529/Safexpert/)
- [Euronorm — CE risk analizi şablonları](https://www.euronorm.net/en/collections/risicoanalyses-ce-markering)
- [EcoComply — CE maliyeti](https://ecocomply.ai/blog/what-does-ce-marking-cost-for-your-product)
- [tolingo — çeviri gereklilikleri](https://www.tolingo.com/en/blog/eu-machinery-regulation-translation)
- [Invest in Türkiye — makine sektörü](https://f.invest.gov.tr/en/sectors/pages/machinery.aspx)
- [TradeInt — Türkiye–AB ticaret 2025](https://tradeint.com/insights/turkey-trade-with-europe-2025-import-export-analysis/)

Siemens / TIA Portal
- [ARC Advisory — Siemens Engineering Agent](https://www.arcweb.com/industry-best-practices/assistance-execution-engineering-agent-siemens-targets-automation)
- [Automation World — Siemens Engineering Copilot (SPS 2025)](https://www.automationworld.com/factory/digital-transformation/news/55332816/siemens-ag-siemens-unveils-generative-ai-copilot-for-autonomous-engineering-at-sps-2025)
- [TIA Portal Openness dokümantasyonu](https://docs.tia.siemens.cloud/r/en-us/v21/tia-portal-openness-api-for-automation-of-engineering-workflows)
- [SIMATIC CFL V3.0 fiyat (bayi)](https://industry-electronics.de/siemens/6av21560pm023lb0-6av2156-0pm02-3lb0-simatic-control-function-library-cfl-v3.0-druckansicht-1568243.htm)

Diğer pazarlar
- [CutQuote — Capterra](https://www.capterra.com/p/10040294/CutQuote/)
- [RankHero — "cnc dxf files" Etsy](https://www.rankhero.com/keywords/cnc-dxf-files)
- [RankHero — "cnc file" Etsy](https://www.rankhero.com/keywords/cnc-file)
- [Teeptrak — OEE yazılım maliyeti 2026](https://teeptrak.com/en/oee-software-cost/)
- [Fabrico — OEE fiyat rehberi 2026](https://www.fabrico.io/blog/oee-software-pricing-guide-2026/)

Ödeme altyapısı (Türkiye)
- [ceaksan.com — Türkiye'den SaaS ödemeleri](https://ceaksan.com/en/saas-payment-infrastructure-turkey)

### Bulamadığım veriler (dürüst liste)
- r/PLC / forum şikâyet başlıkları (arama aracı getirmedi).
- CommissionPack için arama hacmi (Google Trends/keyword aracı erişimim yok).
- Makine CE danışmanlığının Avrupa'daki tipik € fiyatı.
- Türkiye'deki makine üreticisi sayısı.
- Polar.sh'ın Türkiye ödemesinin resmî teyidi.
Bunları 1. hafta görüşmeleri ve hesap açılışı ile doğrulayacağız.
