# Yeni Yön: AI Mobil Uygulama Fabrikası

Tarih: 9 Ekim 2026. Bu doküman `01-strateji-raporu.md` içindeki seçimin yerine geçer.
Yazım kuralı: Kısa cümle. Etken çatı. Bir cümlede bir bilgi.

---

## 1. Asıl konuyu nasıl anladım

Hedefiniz bir ürün değil. Hedefiniz bir **makine**.

Makinenin üç parçası var:

1. **Otomatik trafik:** Müşteri sizi kendisi bulur.
2. **Otomatik satış ve ödeme:** Müşteri kendisi öder. Vergi, fatura, iade otomatik olur.
3. **Otomatik teslimat:** Ürün anında ve insansız teslim edilir.

CommissionPack'te 2. ve 3. parça vardı. 1. parça yoktu. Müşteriyi elle (mesaj, görüşme) bulmanız gerekiyordu.
Bu bir makine değil, bir iş. Seçim bu yüzden yanlıştı.

**Yeni kural:** Önce otomatik trafik kanalını seçiyorum. Ürünü sonra, kanala göre seçiyorum.

---

## 2. AI çağının ana kuralı: Üretim ucuzladı, dağıtım pahalandı

Veriler aynı şeyi gösteriyor:

- Shopify App Store'daki uygulama sayısı bir yılda ~%87 arttı. Mağazada 21.500–24.000 uygulama var. En üstteki %1, gelirin ~%72'sini alıyor (tahmin).
- Her ay ~15.000 yeni abonelikli mobil uygulama yayınlanıyor. Üç yıl önce bu sayı ~2.000 idi.
- AB GPSR kuralı çıkınca Shopify'da en az 10 kopya uygulama çıktı. Fiyatları $8–19/ay. Hiçbirinde yorum yok.

**Sonuç:** "AI ile kod yazabiliyorum" bir avantaj değil artık. Herkes yazabiliyor.
Avantaj üç yerde kalıyor:
1. Alıcının zaten arama yaptığı bir **kanal**.
2. Kopyalanması zor bir **kalite / iş akışı / veri**.
3. **Hız ve adet**: tek bir ürüne değil, bir portföye oynamak.

---

## 3. Otomatik trafik kanalları — karşılaştırma

| Kanal | Trafik otomatik mi? | Ödeme/vergi kimde? | Türkiye'ye ödeme | Ana risk | Karar |
|---|---|---|---|---|---|
| **Apple App Store + Google Play** | Evet. App Store indirmelerinin ~%65'i mağaza aramasından gelir (Apple). | Apple/Google (MoR). KDV, fatura, iade onlarda. | Evet (banka) | Yoğun rekabet, platform kuralı | **SEÇİLDİ** |
| Shopify App Store | Evet (mağaza araması) | Shopify faturalar | Hyperwallet ile mümkün (2021 duyurusu) | Kopya seli, satıcı desteği yükü | Yedek kanal |
| Atlassian Marketplace (Forge) | Evet | Atlassian | **Belirsiz** (forumda açık soru) | Türkiye ödemesi doğrulanmadı | Şimdilik hayır |
| WordPress eklentisi (Freemius) | Kısmen (wp.org dizini) | Freemius (MoR) | Evet (Freemius listesi) | Olgun, yavaşlayan pazar | Hayır |
| SEO araç siteleri | Zayıflıyor | Siz | Polar/Paddle | AI Overview varken organik tıklama ~%15'ten ~%8'e düştü (Pew) | Hayır |
| Yüzsüz AI YouTube | Evet ama riskli | YouTube | Evet | "Inauthentic content" politikası; toplu kanal kapatmaları | Hayır |
| ChatGPT uygulama dizini | Yeni | Henüz gelir paylaşımı yok | — | Para kazanma modeli yok | İzle |
| Etsy / şablon pazarları | Evet | Etsy | Evet | Aşırı kalabalık, düşük fiyat | Hayır |
| Hazır uygulama satın almak (Acquire/Flippa) | Evet (hazır trafik) | Değişir | Değişir | Sermaye gerekir: yıllık gelirin ~2,5–4 katı | Sermaye varsa sonra |

---

## 4. Seçim: Mobil Uygulama Fabrikası

**Ne:** Tek bir uygulama değil. Aynı kitleye hizmet eden **küçük, ücretli, AI destekli mobil uygulamalardan oluşan bir portföy**.
Her uygulama tek bir problemi çözer. Her uygulama aboneliklidir. Her yeni uygulama eskisinin kalıbından 2–4 haftada çıkar.

### Neden bu, "uyurken satış" hedefine en yakın model

| Makine parçası | Kim yapar |
|---|---|
| Trafik | App Store / Google Play araması (ASO). Siz uyurken 175 ülkede çalışır. |
| Satış ve ödeme | Apple / Google. Kart, KDV, fatura, iade onlarda. |
| Teslimat | Anında. Uygulama açılır. |
| Abonelik yenileme | Apple / Google otomatik. |
| Para size | Türk banka hesabına aylık ödeme. |
| Komisyon | %15 (Small Business Program, yıllık $1M altı). |

### Verilerle olasılık

RevenueCat 2026 raporu (115.000 uygulama, $16 milyar gelir):
- Yeni bir uygulamanın 2 yıl içinde **$1.000/ay** gelire çıkma olasılığı: **%17**.
- **$10.000/ay** gelire çıkma olasılığı: **%4,6**.
- Lansmandan 1 yıl sonra, en iyi %25'lik dilimin eşiği:
  - Business kategorisi: **$4.554/ay**
  - Education: $3.614/ay
  - Productivity: $1.250/ay
- Sert paywall (hard paywall) kullanıcıların ~%11'ini ödeyen aboneye çevirir. Freemium ~%2'sini çevirir.

**Portföy matematiği:** Bir uygulama %17 şansla $1.000/ay'a çıkıyorsa, 6 uygulamadan en az birinin çıkma olasılığı ~%67'dir. 10 uygulamada ~%84'tür.
(Hesap: 1 − 0,83ⁿ. Uygulamaları bağımsız sayar. Ortalama uygulamadan daha iyi iş çıkarırsak oran yükselir.)

### Türkiye kanıtı

Bu model Türkiye'de zaten çalışıyor:
- **HubX** (İzmir/İstanbul): 40+ uygulama, 600 milyon+ kullanıcı. $1,2 milyar değerleme ile yatırım aldı.
- **Codeway** (İstanbul): 60 uygulama, 400 milyon indirme (şirket açıklaması).
Bu şirketler büyük ölçüde ücretli reklam kullanır. Biz başlangıçta **reklamsız (ASO)** gideceğiz. Ölçek küçük olur, risk de küçük olur.

### Rakip AI girişimcisine karşı avantajınız

- **Teknik disiplin:** Test, doğrulama, kalite. Çoğu "vibe-coded" uygulama kalitesiz. 1 yıldızlı yorumlar onları düşürür.
- **Saha bilgisi:** İlk portföy kitlesi "sahada çalışan profesyoneller" (teknisyen, usta, servis mühendisi). Onların günlük işini bilirsiniz. Bu kitle aletine para öder.
- **AI ile 20+ dil:** Mağaza sayfası ve uygulama 20+ dilde yayınlanır. Japonya, Almanya, Brezilya, Kore gibi mağazalarda arama yerel dilde yapılır. Rekabet çoğu anahtar kelimede İngilizceden düşüktür (kaynaklar pazarlama firması; ilk ayda kendi verimizle doğrulayacağız).

---

## 5. İlk uygulama: "Saha Raporu AI" (çalışma adı)

### Problem
Teknisyen işi bitirir. Sonra servis raporu yazar: ne yaptı, hangi parça, fotoğraflar, müşteri imzası.
Bunu akşam evde, kâğıtta veya Word'de yapar. 20–40 dakika gider. Rapor kötü görünür.

### Çözüm
1. Teknisyen telefona **konuşur** (kendi dilinde, 1 dakika).
2. **Fotoğraf** çeker.
3. AI konuşmayı **profesyonel bir servis raporuna** çevirir: yapılan iş, kullanılan parçalar, sonraki öneriler.
4. Müşteri ekranda **imza** atar.
5. **Logolu PDF** müşteriye e-posta veya WhatsApp ile gider.
Süre: ~2 dakika.

### Müşteri
Bağımsız veya küçük firmada çalışan teknisyenler: klima/HVAC, elektrik, asansör, beyaz eşya servisi, makine bakım, güvenlik sistemi kurulumu, tesisat. Tüm dünyada.

### Rakipler (bulduklarım)
| Uygulama | Ne yapar | Fiyat | Eksik |
|---|---|---|---|
| ServiceProof (iPhone) | Fotoğraf, imza, PDF, çevrimdışı | Ücretsiz 20 iş, Pro $19,99/ay | Sesli AI yok |
| JobSlip | Rapor, fotoğraf, imza, PDF | — | Sesli AI yok |
| Cosysign (Fransızca) | Müdahale formu, imza, PDF | — | Tek dil, sesli AI yok |
| GoCanvas | Form platformu | Kurumsal | Ağır, pahalı |
| Jobber / Housecall Pro | Tam saha yönetim yazılımı | Yüksek aylık ücret | Tek kişilik teknisyen için fazla |

**Boşluk:** Sesle rapor yazan, çok dilli, basit, tek kişilik teknisyene yönelik uygulama bulamadım.

### Fiyat (ilk test)
- 3 gün ücretsiz deneme → sert paywall.
- **$14,99/ay** veya **$79,99/yıl**.
- Sonraki test: haftalık plan, yaşam boyu plan.

### Moat (neden ChatGPT değil)
- Tek ekranda konuş + fotoğraf + imza + logolu PDF + gönder. ChatGPT bunu bir iş akışı olarak vermez.
- Mesleğe özel rapor şablonları (klima, elektrik, asansör...).
- Müşteri ve geçmiş rapor arşivi telefonda birikir. Bu, değiştirme maliyetidir.

### 1. hafta veri kapısı (bu testi geçmezse 2. fikre geçeriz)
ASO aracı (Astro veya Appfigures, ~$10/ay) ile ölçüm:
- "service report", "work order", "job report", "technician report" ve 5 dildeki karşılıkları.
- Kriter: En az 3 anahtar kelimede orta+ popülerlik. İlk 10 sonuçta zayıf rakip (az yorum veya 4,0 altı puan).
- Geçemezse sıradaki fikir alınır (aşağıdaki liste).

### Portföyün sonraki uygulamaları (aynı kitle, çapraz satış)
| # | Uygulama | Ne yapar |
|---|---|---|
| 2 | Sesli Teklif AI | Teknisyen konuşur → fiyat teklifi PDF'i |
| 3 | Günlük Kontrol Listesi | Forklift, iskele, makine için vardiya öncesi kontrol + fotoğraf + kayıt |
| 4 | Ekipman Bakım Defteri | QR etiket → cihaz geçmişi, bakım hatırlatma |
| 5 | Saat ve Malzeme Takibi | Serbest teknisyen için iş saati, malzeme, aylık özet |

Her uygulama diğerlerini uygulama içinde tanıtır. Bu, **kendi trafik kanalınızı** oluşturur. Kitle büyüdükçe yeni uygulama sıfırdan başlamaz.

---

## 6. Teknoloji stack'i (Mac gerekmez)

| İşlev | Araç | Maliyet |
|---|---|---|
| Uygulama | Expo (React Native) + TypeScript | $0 |
| iOS derleme ve yükleme | EAS Build + EAS Submit (bulutta derler, Windows'tan çalışır) | Ücretsiz plan: ayda 15 iOS + 15 Android derleme |
| Apple hesabı | Apple Developer Program | $99/yıl |
| Google hesabı | Google Play Console | $25 bir kez |
| Abonelik / paywall | RevenueCat | $2.500/ay gelire kadar ücretsiz, sonra %1 |
| Ses → metin | Cihazın kendi konuşma tanıma özelliği (ücretsiz) | $0 |
| Metin → rapor (AI) | Claude veya başka LLM API, Cloudflare Worker üzerinden (API anahtarı telefonda durmaz) | Rapor başına ~1 sentten az (tahmin) |
| PDF | Uygulama içinde üretilir | $0 |
| ASO araştırması | Astro veya Appfigures | ~$10/ay |
| Analitik | RevenueCat paneli + App Store Connect + Play Console | $0 |
| Kod | Claude Code + GitHub | Mevcut |

**Sabit maliyet:** ~$20–40/ay + Apple yıllık $99.

---

## 7. Makine şeması

```
App Store / Google Play araması (20+ dil, ASO)
  ↓
Mağaza sayfası (AI ile üretilen ekran görüntüleri + yerel dil metin)
  ↓
İndirme
  ↓
Onboarding (3 ekran: meslek seç, logo ekle, ilk rapor)
  ↓
İlk raporu ücretsiz üret → "aha" anı
  ↓
Paywall (3 gün deneme, aylık/yıllık)
  ↓
Ödeme, vergi, fatura: Apple/Google
  ↓
Abonelik yenileme: otomatik
  ↓
Uygulama içi çapraz tanıtım → portföydeki diğer uygulamalar
  ↓
Puanlama isteği (iyi deneyimden sonra) → daha iyi sıralama → daha çok indirme
  ↓
Destek: uygulama içi SSS + e-posta (AI taslak, siz onay)
  ↓
Haftalık rapor: RevenueCat → n8n → Telegram
```

---

## 8. İlk 30 gün

| Hafta | İş | Ölçülebilir hedef |
|---|---|---|
| 1 | ASO veri kapısı. Apple ve Google hesaplarını aç. Şirket/vergi için mali müşavir. | 1. fikir geçti veya 2. fikir seçildi. Hesaplar açık. |
| 2 | Uygulama kalıbı (onboarding, paywall, ayarlar, 20 dil) + ana özellik (ses → rapor → PDF). | Kendi telefonunuzda çalışan sürüm (TestFlight). |
| 3 | 10 gerçek teknisyene test (tanıdık çevre). Hata düzeltme. Mağaza sayfası 10 dilde. | 10 test kullanıcısı, 30+ gerçek rapor. App Store'a gönderim. |
| 4 | Yayın. Paywall fiyat testi. Puan isteme akışı. | Uygulama yayında. İlk ödeyen abone. |

**Not:** Apple incelemesi birkaç gün sürebilir. İlk ret olasılığı var. Plan bunu kapsar.

---

## 9. İlk 90 gün

- **Gün 1–7:** Veri kapısı, hesaplar, uygulama kalıbı başlangıcı.
- **Gün 8–30:** 1. uygulama yayında. İlk aboneler.
- **Gün 31–60:** ASO iyileştirme (anahtar kelime, ekran görüntüsü). Android sürümü. 2. uygulama (Sesli Teklif AI) kalıptan geliştirme.
- **Gün 61–90:** 2. uygulama yayında. Çapraz tanıtım açık. 3. uygulama başlar. Haftalık otomatik rapor.
- **90. gün hedefi:** 2 uygulama yayında, 30–80 ödeyen abone, $200–700/ay. Bu bir tahmindir.

**Karar kuralı (90. gün):** Hiçbir uygulama günde 20 organik indirmeye ulaşmadıysa ASO stratejisini değiştir veya niş değiştir. Kalıp (kod) aynen kullanılır.

---

## 10. Gelir senaryoları

Varsayım: Ortalama abone geliri ~$9/ay brüt (aylık $14,99 ve yıllık $79,99 karışık). Apple/Google %15. RevenueCat %0–1. AI + altyapı maliyeti ayrı.

| Senaryo | Zaman | Uygulama | Ödeyen abone | Brüt/ay | Net/ay (yaklaşık) |
|---|---|---|---|---|---|
| Kötü | 12. ay | 3 | 40 | $360 | ~$270 |
| Gerçekçi | 12. ay | 4 | 300 | $2.700 | ~$2.150 |
| Agresif | 24. ay | 6–8 | 1.200 | $10.800 | ~$8.700 |

Hesap örneği (gerçekçi): 300 × $9 = $2.700 → %15 komisyon sonrası $2.295 → RevenueCat %1 (~$27) ve AI/altyapı (~$100) sonrası ~$2.150.

---

## 11. Gerçekten pasif mi?

**Yarı pasif.** Ama önceki seçimden çok daha pasif.

| Dönem | Haftalık iş | Ne yaparsınız |
|---|---|---|
| 0–3 ay | 20–25 saat | Kalıp, ilk 2 uygulama, test |
| 3–12 ay | 10–15 saat | Yeni uygulama, ASO düzeltme |
| 12+ ay | 3–6 saat | Güncelleme, yeni iOS sürüm uyumu, destek onayı |

Müşteri görüşmesi, soğuk mesaj, satış toplantısı **yok**. Bu, bu modelin en büyük farkı.

---

## 12. 10 soru testi

| Soru | Cevap |
|---|---|
| İnsan para öder mi? | Evet. Rakipler $19,99/ay alıyor. Business kategorisi en yüksek gelirli kategori. |
| Bugün nasıl çözüyor? | Kâğıt, Word, ağır saha yazılımı. |
| Neden benimki? | Sesle 2 dakikada rapor, kendi dilinde, logolu PDF. |
| AI avantajı? | Ses → profesyonel metin. 20+ dil. Kodu AI yazar. |
| Tek kişi yapar mı? | Evet. Expo + EAS + RevenueCat. |
| Satış otomatik mi? | Evet. Mağaza araması. |
| Teslimat otomatik mi? | Evet. |
| Global mi? | Evet. 175 ülke. |
| Kopyalanması zor mu? | Orta. Kalite, şablonlar, yorumlar, portföy çapraz trafiği korur. |
| 3 yıl sonra değerli mi? | Evet. Saha raporu ihtiyacı kalıcı. |

Sonuç: **9/10.** Zayıf nokta: kopyalanabilirlik. Önlem: hız, kalite, portföy.

---

## 13. Kalan riskler (dürüst liste)

- **Rekabet:** Uygulama mağazaları kalabalık. Ortalama uygulama 1 yılda ayda ~$72 kazanıyor. Portföy ve kalite bu riski azaltır, sıfırlamaz.
- **Platform bağımlılığı:** Apple/Google kural değiştirebilir veya uygulamayı reddedebilir. İki platformda yayın riski böler.
- **AI maliyeti kötüye kullanımı:** Rapor sayısına sınır koyarız (ör. ayda 300 rapor).
- **Gizlilik:** Müşteri adı ve adresi rapora girer. Veriler telefonda kalır. AI'ya sadece rapor metni gider. Gizlilik politikası şart.
- **Apple'ın daha fazla arama reklamı göstermesi (Mart 2026'dan itibaren):** Organik görünürlüğü azaltabilir.

---

## 14. AZİZ'İN AI PASİF GELİR SİSTEMİ (v2)

| Başlık | Karar |
|---|---|
| **ÜRÜN** | Sahada çalışan profesyoneller için AI mobil uygulama portföyü. 1. uygulama: Saha Raporu AI. |
| **MÜŞTERİ** | Dünya genelinde bağımsız ve küçük firma teknisyenleri. |
| **PROBLEM** | Servis raporu, teklif, kontrol listesi yazmak zaman alıyor ve kötü görünüyor. |
| **FİYAT** | 3 gün deneme → $14,99/ay veya $79,99/yıl. |
| **PLATFORM** | Apple App Store + Google Play. |
| **TRAFİK** | Mağaza araması (20+ dil ASO) + uygulamalar arası çapraz tanıtım. Ücretli reklam yok. |
| **AI** | Ses → rapor, çeviri, mağaza metinleri, kod, destek taslakları. |
| **OTOMASYON** | Trafik, ödeme, vergi, teslimat, yenileme, haftalık rapor. |
| **MALİYET** | ~$20–40/ay + $99/yıl Apple + $25 Google (bir kez). |
| **HEDEF 3 AY** | 2 uygulama yayında, 30–80 abone, $200–700/ay. |
| **HEDEF 6 AY** | 3–4 uygulama, 120–200 abone, $1.000–1.800/ay. |
| **HEDEF 12 AY** | 4–5 uygulama, ~300 abone, ~$2.000+/ay net. |

> "Bu fikirlerden Mobil Uygulama Fabrikası'nı seçiyorum. İlk 90 gün boyunca sadece buna odaklanmanızı öneriyorum."

CommissionPack kodu depoda kalır. İsterseniz silebilirim.

---

## 15. Kaynaklar

Uygulama mağazaları ve abonelik verisi
- [RevenueCat — State of Subscription Apps 2026](https://www.revenuecat.com/state-of-subscription-apps)
- [PPC Land — RevenueCat 2026 verisi özeti](https://ppc.land/the-app-middle-class-is-dying-and-revenuecats-data-shows-exactly-how-fast/)
- [9to5Mac — RevenueCat raporu](https://9to5mac.com/?p=1042212)
- [Apple — App Store Small Business Program](https://developer.apple.com/app-store/small-business-program/?page=2)
- [Webtonic — ASO istatistikleri 2026](https://www.webtonic.io/blog/app-store-optimization-statistics)
- [AppDrift — ASO istatistikleri](https://appdrift.co/aso-statistics)
- [Superwall / App Masters — ASO vaka](https://superwall.com/blog/the-fastest-aso-strategy-for-a-6-figure-business-proven-by-app-masters)
- [AppTweak — mağaza yerelleştirme rehberi](https://www.apptweak.com/en/aso-blog/guide-to-app-store-localization?format=md)
- [Appsops — yerelleştirme verisi 2026](https://appsops.store/blog/why-app-store-localization-matters)
- [Expo — FAQ (Mac olmadan iOS derleme)](https://docs.expo.dev/faq.md)
- [Newly — EAS Build rehberi (Eylül 2026)](https://newly.app/guides/eas-build)
- [Apppricinglab — RevenueCat incelemesi](https://apppricinglab.com/playbook/revenuecat-review)

Türkiye ekosistemi
- [Daily Sabah — HubX unicorn](https://www.dailysabah.com/business/tech/mobile-sector-optimistic-as-hubx-becomes-turkiyes-8th-unicorn)
- [Pulse 2.0 — HubX yatırımı](https://pulse2.com/hubx-raises-50-million-from-point72-at-1-2-billion-pre-money-valuation-with-option-for-another-25-million)
- [Caplight — Codeway](https://www.caplight.com/company/codeway)

Rakip saha raporu uygulamaları
- [ServiceProof — App Store](https://apps.apple.com/ca/app/serviceproof/id6746701427)
- [JobSlip — Product Hunt](https://www.producthunt.com/products/jobslip)
- [Cosysign](https://mwm.ai/apps/cosysign-bon-dintervention/6744638859)
- [GoCanvas — saha servis formu](https://www.gocanvas.com/mobile-forms-apps/33706-Field-Service-Report-Form)

Diğer kanallar
- [Shopify — geliştirici gelir paylaşımı](https://shopify.dev/docs/apps/launch/distribution/revenue-share)
- [RevenueHunt — Shopify uygulama ekonomisi](https://revenuehunt.com/state-of-the-shopify-app-economy/)
- [ADSX — Shopify App Store istatistikleri 2026](https://adsx.com/blog/shopify-app-store-statistics-2026)
- [Shopify — partner ödeme yöntemleri](https://www.shopify.com/partners/blog/payout-methods)
- [Shopify GPSR uygulama örneği](https://apps.shopify.com/gpsr-compliance-manager)
- [Atlassian — gelir paylaşımı takvimi](https://www.atlassian.com/blog/developer/extended-timelines-for-marketplace-revenue-share-changes)
- [Atlassian forum — Türkiye'den satış sorusu](https://community.developer.atlassian.com/t/can-an-individual-sole-proprietor-based-in-turkey-publish-and-sell-paid-marketplace-apps/102081)
- [Freemius — desteklenen ülkeler](https://freemius.com/help/documentation/selling-with-freemius/supported-countries.md)
- [Wholewhale — Pew: AI Overviews ve tıklamalar](https://wholewhale.com/resources/googles-gaslighting-pew-research-confirms-what-seos-already-know-about-ai-overviews/)
- [AIR Media-Tech — YouTube AI politikası 2026](https://air.io/en/news-air/how-youtube-treats-ai-in-2026-new-update)
- [OutlierKit — yüzsüz kanal demonetizasyonu](https://outlierkit.com/resources/faceless-youtube-channel-demonetized/)
- [VentureBeat — ChatGPT uygulama başvuruları](https://venturebeat.com/technology/openai-now-accepting-chatgpt-app-submissions-from-third-party-devs-launches)
- [Beancount — Acquire.com değerleme çarpanları 2026](https://beancount.io/de/blog/2026/07/11/bootstrapped-saas-valuation-multiples-2026-acquire-com-indie-founders-guide)

### Doğrulanmamış / bulamadığım veriler
- Apple'ın Türkiye'ye ödeme detayları (TRY/USD). Apple Developer hesabı açılırken teyit edilecek.
- Saha raporu anahtar kelimelerinin arama hacmi (ASO aracı gerekir; 1. hafta).
- Yerel dil mağazalarında rekabetin daha düşük olduğu iddiası (kaynaklar pazarlama firması).
