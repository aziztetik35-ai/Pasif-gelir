# Uygulama Fabrikası — Uygulama Listesi ve Sıralama

Tarih: 9 Ekim 2026.
Yazım kuralı: Kısa cümle. Etken çatı. Bir cümlede bir bilgi.

---

## 1. Nasıl puanladım

13 uygulama fikrini 100 puan üzerinden puanladım.

| Kriter | Puan | Soru |
|---|---|---|
| Ödeme isteği | 20 | Kullanıcı aylık ücret öder mi? Rakipler kaç para alıyor? |
| Arama talebi | 15 | İnsanlar mağazada bunu arıyor mu? (Rakip sayısı ve kategoriden tahmin. ASO aracıyla doğrulanacak.) |
| Rekabet | 15 | Düşük rekabet = yüksek puan. |
| AI farkı | 15 | AI ürüne gerçek bir değer katıyor mu? ChatGPT aynı işi bedava yapabiliyor mu? |
| Yapım kolaylığı | 10 | Tek kişi + AI 2–4 haftada yapar mı? |
| Pasiflik | 10 | Destek yükü ve AI maliyeti düşük mü? |
| Portföy sinerjisi | 10 | Aynı kitleye (sahada çalışan profesyoneller) satılır mı? Diğer uygulamaları tanıtır mı? |
| Teknik uyum | 5 | Sizin saha bilginiz kalite farkı yaratır mı? |

**Önemli kısıt — Apple kuralı 4.3 (spam):** Apple, aynı kalıptan çıkan ve sadece içeriği farklı olan uygulamaları reddeder. Bu yüzden portföydeki her uygulamanın **işlevi** farklı olmalı. Aynı işlevi farklı meslekler için ayrı uygulama yapmak yerine, tek uygulamada meslek seçimi sunacağız.

---

## 2. Sıralama (en mantıklıdan aşağıya)

| Sıra | Uygulama | Ödeme | Talep | Rekabet | AI | Yapım | Pasif | Sinerji | Uyum | **Toplam** | Karar |
|---|---|---|---|---|---|---|---|---|---|---|---|
| 1 | Saha Servis Raporu AI | 16 | 10 | 11 | 13 | 8 | 7 | 10 | 5 | **80** | **İLK YAPILACAK** |
| 2 | İş Fotoğraf Günlüğü (ucuz CompanyCam) | 15 | 11 | 10 | 9 | 9 | 9 | 10 | 4 | **77** | 2. uygulama |
| 3 | Sesli Teklif / Fatura AI | 16 | 14 | 3 | 9 | 8 | 8 | 9 | 3 | **70** | Ayrı uygulama değil, 1'e modül |
| 4 | Ekipman Bakım Defteri (QR) | 12 | 8 | 8 | 7 | 8 | 9 | 9 | 5 | **66** | 3. uygulama |
| 5 | Meslek Sınavı Hazırlık (tek uygulama, çok sınav) | 12 | 12 | 6 | 9 | 8 | 10 | 6 | 3 | **66** | Yedek |
| 6 | Kamyon Günlük Kontrolü (DVIR, ABD) | 11 | 10 | 7 | 6 | 9 | 9 | 7 | 4 | **63** | Yedek |
| 7 | Eksik / Snag Listesi | 7 | 9 | 9 | 10 | 9 | 9 | 7 | 3 | **63** | Yedek |
| 8 | Günlük İSG Kontrol Listesi | 10 | 9 | 3 | 8 | 9 | 9 | 9 | 5 | **62** | Hayır |
| 9 | Ev Muayene Raporu AI (ABD) | 18 | 8 | 5 | 12 | 4 | 6 | 6 | 2 | **61** | Hayır |
| 10 | Teknisyen Saat ve Malzeme Takibi | 9 | 11 | 3 | 7 | 9 | 9 | 9 | 4 | **61** | Hayır |
| 11 | Elektrikçi Hesap Paketi | 9 | 9 | 6 | 4 | 9 | 10 | 8 | 5 | **60** | Hayır |
| 12 | Cihaz Etiketi Okuyucu AI | 8 | 7 | 7 | 6 | 8 | 7 | 9 | 5 | **57** | Hayır (AI wrapper) |
| 13 | 3D Baskı Maliyet + Filament Takibi | 6 | 8 | 4 | 5 | 9 | 10 | 2 | 5 | **49** | Hayır |

---

## 3. Detaylar

### 1. Saha Servis Raporu AI — 80 puan — İLK YAPILACAK

- **Ne yapar:** Teknisyen 1 dakika konuşur ve fotoğraf çeker. AI konuşmayı profesyonel bir servis raporuna çevirir. Müşteri ekranda imza atar. Logolu PDF müşteriye gider.
- **Kime:** Klima, elektrik, asansör, beyaz eşya, makine bakım, güvenlik sistemi teknisyenleri. Bağımsız çalışanlar veya küçük firmalar.
- **Rakipler:**
  - ServiceProof: fotoğraf, imza, PDF. Ücretsiz 20 iş, Pro $19,99/ay. Sesle rapor yazma özelliği yok.
  - JobSlip: rapor, fotoğraf, imza, PDF. Sesle rapor yazma özelliği yok.
  - Cosysign: sadece Fransızca.
  - GoCanvas: kurumsal bir form platformu, ağır.
- **Boşluk:** Sesle rapor yazan, çok dilli, tek kişilik teknisyen için basit bir uygulama bulamadım.
- **Fiyat:** 3 gün deneme. Sonra $14,99/ay veya $79,99/yıl.
- **Neden 1. sırada:** Ödeme isteği kanıtlı ($19,99/ay rakip var). AI gerçek iş yapıyor (konuşma → düzgün rapor). Diğer uygulamaların temelini oluşturuyor (PDF, imza, logo, müşteri listesi).
- **Risk:** Arama hacmi henüz ölçülmedi. 1. hafta ASO aracıyla kontrol edeceğiz.

### 2. İş Fotoğraf Günlüğü — 77 puan — 2. uygulama

- **Ne yapar:** Her iş için fotoğraf zaman çizelgesi oluşturur. Fotoğraflara tarih, saat ve konum damgası koyar. Öncesi/sonrası karşılaştırması yapar. AI fotoğraflara açıklama yazar. Müşteriye tek link veya PDF gider.
- **Kime:** Tadilat, inşaat, boya, çatı, zemin, tesisat ustaları.
- **Rakip:** CompanyCam. Fiyatı $63–99/ay'dan başlıyor (kaynağa göre değişiyor). Bir rakip, CompanyCam'in en az 3 kullanıcı istediğini iddia ediyor. Bir kullanıcı yorumu: "Ayda ~$100 küçük firma için çok."
- **Boşluk:** Tek kişilik usta için $9,99/ay'lık sade bir uygulama bulamadım.
- **1'den farkı:** 1 numara "rapor ve imza" üretir. Bu uygulama "fotoğraf arşivi ve kanıt" tutar. İşlevleri farklı olduğu için Apple 4.3 riski düşük.
- **Risk:** CompanyCam çok güçlü bir marka. Biz sadece tek kişilik ve ucuz segmenti hedefliyoruz.

### 3. Sesli Teklif / Fatura AI — 70 puan — Ayrı uygulama değil, 1'e modül

- **Gerçek:** Bu alan çok kalabalık. Invoicely AI, Invox ($14,99/ay), Invoice Maker Voice, InvoPal, Caractiv ve EZ-Estimates zaten sesle teklif ve fatura yapıyor.
- **Karar:** Ayrı uygulama yapmayalım. 1 numaraya "rapordan teklif/fatura üret" özelliği olarak ekleyelim. Bu, aboneliğin değerini artırır.

### 4. Ekipman Bakım Defteri (QR) — 66 puan — 3. uygulama

- **Ne yapar:** Her cihaza bir QR etiket yapıştırılır. Telefonla okutunca cihazın bakım geçmişi açılır. Uygulama bakım zamanını hatırlatır. AI cihaz etiketinin fotoğrafından marka, model ve seri numarasını okur.
- **Kime:** Küçük atölyeler, servis firmaları, bina yöneticileri.
- **Rakipler:** Equipt ($14,99), QRmaint ($12–35/kullanıcı/ay). MaintainX ve UpKeep'in ücretsiz planları var.
- **Neden 3. sırada:** Sizin alanınıza en yakın fikir. 1 ve 2'nin kullanıcısına doğal çapraz satış olur ("raporu cihaza bağla").
- **Risk:** Ücretsiz büyük rakipler. Basitlik ve offline çalışma ile ayrışacağız.

### 5. Meslek Sınavı Hazırlık — 66 puan — Yedek

- **Fikir:** Tek uygulamada birden çok meslek sınavı: EPA 608 (klima soğutucu sertifikası), FAA Part 107 (drone pilotu) gibi.
- **Artı:** Çalışırken AI maliyeti yok. Destek yükü düşük. Education kategorisi yüksek gelirli.
- **Eksi:** Her sınav için zaten AI tutor'lu uygulamalar var. AppGoblin tahminine göre birçok sınav uygulamasının geliri $10.000/ay altında. Soruların doğruluğu ve telif riski var. Her sınavı ayrı uygulama yaparsak Apple 4.3 ile reddeder.

### 6. Kamyon Günlük Kontrolü (DVIR) — 63 puan — Yedek

- **Fırsat:** ABD'de elektronik DVIR ve dijital imza kuralı 23 Mart 2026'da yürürlüğe girdi (FMCSA).
- **Eksi:** Pazar sadece ABD. Rakipler var: Pre-Trip $9,99/ay; Fleetpal filolar için ücretsiz; SafetyCulture'ın ücretsiz planı var.

### 7. Eksik / Snag Listesi — 63 puan — Yedek

- **Fikir:** Yeni ev alan kişi veya müteahhit eksikleri fotoğraflar. AI her eksiği tanımlar ve PDF üretir.
- **Eksi:** Fiyatlar çok düşük (Snag List $1,99/ay, Snag-App $6,99 tek seferlik). Ödeme isteği zayıf.

### 8–13. Elenenler (kısa)

| Uygulama | Neden elendi |
|---|---|
| Günlük İSG Kontrol Listesi | SafetyCulture 10 kullanıcıya kadar ücretsiz. Pazara hakim. |
| Ev Muayene Raporu AI | Ödeme isteği yüksek ($79–129/ay), ama yeni AI rakipler hızla çıkıyor: Fielded ($49, InterNACHI üyelerine 2026 sonuna kadar ücretsiz), InspectPro ($49), Binsr, InspectionX. Ürün karmaşık: sözleşme, ödeme ve web portalı gerekir. Sadece ABD standartları. |
| Saat ve Malzeme Takibi | Clockify ücretsiz. Jobber gibi büyük platformların içinde zaten var. |
| Elektrikçi Hesap Paketi | Electrical Calc Elite $19,99 tek seferlik. Tahmini gelir $10.000/ay altında. Üreticiler ücretsiz uygulama veriyor. AI farkı yok. |
| Cihaz Etiketi Okuyucu AI | Google Lens ve ChatGPT bunu bedava yapıyor. Saf AI wrapper. 4 numaranın içine özellik olarak girer. |
| 3D Baskı Maliyet Takibi | Çok rakip var (Spoolo, Spool, PrintMate, 3DPCC). Fiyatlar $0,99–12,99/yıl. Diğer uygulamalarla sinerji yok. |

---

## 4. Önerilen yapım sırası

```
Ay 1:   [1] Saha Servis Raporu AI  →  yayın
Ay 2:   [1] + teklif/fatura modülü (3)  +  Android sürümü
Ay 3:   [2] İş Fotoğraf Günlüğü  →  yayın  →  1 ile çapraz tanıtım
Ay 4–5: [4] Ekipman Bakım Defteri  →  yayın
Ay 6+:  Verilere göre: 5, 6 veya 7
```

**Ortak kalıp:** Her uygulama aynı altyapıyı kullanır: onboarding, paywall, 20 dil, PDF motoru, imza, logo, ayarlar. Ama her uygulamanın ana işlevi farklıdır. Bu, Apple 4.3 kuralına uygun bir yöntemdir.

**Çapraz tanıtım:** Her uygulamada "Diğer Pro araçlarımız" ekranı olur. 1. uygulamanın kullanıcısı, 2. uygulama yayınlandığı gün hazır kitledir.

---

## 5. Veri kapısı (her uygulamadan önce, 1 gün)

ASO aracı (Astro veya Appfigures, ~$10/ay) ile ölçüm yapılır.

| Kontrol | Geçme kriteri |
|---|---|
| Ana anahtar kelimeler (EN + 4 dil) | En az 3 kelimede orta veya yüksek popülerlik |
| İlk 10 rakip | En az 4'ü zayıf: az yorum, 4,0 altı puan veya 1 yıldan eski güncelleme |
| Rakip fiyatı | En az 1 rakip $9,99/ay veya üstü alıyor (ödeme isteği kanıtı) |

Geçmezse listedeki bir sonraki uygulamaya geçilir.

---

## 6. Kaynaklar

- [ServiceProof — App Store](https://apps.apple.com/ca/app/serviceproof/id6746701427)
- [JobSlip — Product Hunt](https://www.producthunt.com/products/jobslip)
- [Cosysign](https://mwm.ai/apps/cosysign-bon-dintervention/6744638859)
- [GoCanvas — saha servis formu](https://www.gocanvas.com/mobile-forms-apps/33706-Field-Service-Report-Form)
- [CompanyCam fiyatı — Superdupr](https://superdupr.com/blog/companycam-pricing)
- [CompanyCam — Capterra](https://capterra.com/p/171143/CompanyCam/)
- [CompanyCam alternatifleri — Blitzz](https://blitzz.co/blog/best-companycam-alternatives)
- [Invoicely AI — App Store](https://apps.apple.com/app/id6767138733)
- [Invox — AppGoblin](https://appgoblin.info/apps/6758204607)
- [EZ-Estimates](https://peerpush.com/p/ez-estimates)
- [Equipt — App Store](https://apps.apple.com/app/id6758159313)
- [QRmaint — GetApp](https://www.getapp.com/operations-management-software/a/qrmaint-maintenance-management/)
- [Sınav uygulaması gelir tahmini — AppGoblin](https://appgoblin.info/apps/cst.exam)
- [EPA 608 uygulaması — App Store](https://apps.apple.com/app/id1528925410)
- [FAA Part 107 uygulaması — App Store](https://apps.apple.com/us/app/-/id6739544576)
- [Apple 4.3 spam reddi — geliştirici forumu](https://developer.apple.com/forums/thread/757046)
- [DVIR yazılımları — Guideflow](https://www.guideflow.com/blog/dvir-software)
- [Pre-Trip uygulaması — AppBrain](https://www.appbrain.com/appstore/pretrip/ios-6752937597)
- [Fleetpal ücretsiz DVIR — Work Truck](https://www.worktruckonline.com/news/fleetpal-makes-its-driver-inspection-app-free-for-qualified-fleets)
- [Snag List — App Store](https://apps.apple.com/app/id1214965242)
- [SafetyCulture fiyatı — Capterra](https://www.capterra.com/p/141080/iAuditor/pricing/)
- [Spectora fiyatı — Capterra](https://www.capterra.com/p/157144/Spectora/pricing/)
- [Fielded AI — InterNACHI](https://www.nachi.org/vendor-offers/fielded-ai-inspection-report-app-free-through-2026-then-20-off-for-life)
- [InspectPro — Capterra](https://www.capterra.com/p/10037492/InspectPro/)
- [Electrical Calc Elite — AppGoblin](https://appgoblin.info/apps/510284903)
- [Spoolo — App Store](https://apps.apple.com/us/app/-/id6743485278)
- [3DPCC](https://3dpcc.com/)

### Not
- Gelir ve indirme sayıları (AppGoblin) modele dayalı tahminlerdir. Resmî veri değildir.
- Arama talebi puanları tahmindir. Her uygulama öncesinde veri kapısıyla doğrulanacak.
