# Otomasyon akışları (n8n)

n8n'i VPS'te Docker ile çalıştırın. Her akış için gereken düğümler aşağıda.
Not: Bu oturumda n8n MCP sunucusu bağlanamadı. Akışları n8n arayüzünde bu adımlarla kurun.
Bağlantı düzelince JSON olarak da üretebilirim.

---

## Akış 1 — Yeni satış

**Tetik:** Polar webhook (`order.created`, `subscription.created`).

1. **Webhook** düğümü (POST). URL'yi Polar → Settings → Webhooks'a girin. Polar webhook imzasını doğrulayın (secret).
2. **Set** düğümü: `email`, `product_name`, `amount`, `customer_name` alanlarını çıkarın.
3. **MailerLite** düğümü: aboneyi "customers" grubuna ekleyin. (Hoş geldin serisi MailerLite'ta otomatik başlar.)
4. **Google Sheets** düğümü: "Sales" sayfasına satır ekleyin (tarih, e-posta, ürün, tutar).
5. **Telegram** düğümü: "💰 Yeni satış: {product_name} — ${amount}".

## Akış 2 — Haftalık metrik raporu

**Tetik:** Schedule, Pazartesi 08:00.

1. **HTTP Request** → Polar API: son 7 günün siparişleri ve aktif abonelikler (Organization Access Token ile).
2. **HTTP Request** → MailerLite API: abone sayısı.
3. **Code** düğümü: toplam gelir, yeni müşteri, iptal, MRR hesapla.
4. **Telegram**: tek mesaj rapor.

## Akış 3 — Destek taslağı (insan onaylı)

**Tetik:** Gmail/IMAP, `hello@` kutusuna yeni e-posta.

1. **Anthropic (Claude)** düğümü veya HTTP Request. Sistem mesajı: SSS + ürün dokümanı. Görev: kısa, kibar, doğru taslak. Emin değilse "İNSAN GEREKLİ" yaz.
2. **Telegram** düğümü: müşteri e-postası + taslak + "Onay / Düzelt" butonları.
3. **Wait** (Telegram cevabı) → **Gmail Send**.

Kural: AI asla kendi başına gönderim yapmaz. İade ve fatura konuları her zaman size gelir.

## Akış 4 — Haftalık içerik taslağı

**Tetik:** Schedule, Perşembe 09:00.

1. **Code**: Son sürüm notları (GitHub) + SSS'den 3 konu seç.
2. **Claude**: 3 LinkedIn gönderisi (EN 2, TR 1). Kısa, teknik, satış dili az.
3. **Telegram**: taslakları gönder. Siz düzeltip elle paylaşırsınız.

---

## Ücretsiz kullanıcı takibi (opsiyonel, Faz 2)

Uygulama her üretimde anonim bir olay gönderebilir (IO sayısı, dil, format). Proje içeriği gönderilmez.
Hedef: hangi formatlar ve diller kullanılıyor, öğrenmek.
