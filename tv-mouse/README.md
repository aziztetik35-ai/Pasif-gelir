# TV Fare (Android TV fare imleci)

Bu uygulama Android TV kutusunda (örnek: Next) fare imleci gösterir.
Uygulama bir erişilebilirlik hizmetidir. Hizmet arka planda her zaman çalışır.

## Kurulum

1. `TvFare.apk` dosyasını TV kutusuna kopyalayın (USB bellek, "Send Files to TV" vb.).
2. Dosya yöneticisi ile APK dosyasını açın ve kurun. "Bilinmeyen kaynaklar" izni isterse verin.
3. "TV Fare" uygulamasını açın.
4. "Erişilebilirlik ayarlarını aç" düğmesine basın.
5. "TV Fare İmleci" hizmetini AÇIK yapın. Onay penceresinde "Tamam" seçin.

## Kullanım

| Tuş | Normal mod | Fare modu |
|---|---|---|
| OK basılı + sol ok | Fare modunu AÇAR | Fare modunu KAPATIR |
| Yön tuşları | Normal gezinme | İmleci hareket ettirir (basılı tutun: hızlanır) |
| OK | Normal seçim | Tıklama |
| OK uzun basma | Normal | Uzun basma |
| Kanal ^ / v | Normal | Sayfayı yukarı / aşağı kaydırır |
| Geri, Ana ekran, ses | Normal | Normal |

İmleci ekranın kenarına itin. Sayfa o yöne kayar.

Sol oku basılı tutup OK tuşuna basmak da çalışır.

## Ayar kilitli ise (Android 13 ve sonrası)

Android, dışarıdan yüklenen uygulamada erişilebilirlik ayarını kilitleyebilir.

- Ayarlar > Uygulamalar > TV Fare > sağ üst menü > "Kısıtlanmış ayarlara izin ver".
- Bu menü yoksa bilgisayardan ADB kullanın:

```
adb connect <TV-IP-ADRESI>
adb shell appops set com.aziz.tvmouse ACCESS_RESTRICTED_SETTINGS allow
adb shell settings put secure enabled_accessibility_services com.aziz.tvmouse/.MouseService
adb shell settings put secure accessibility_enabled 1
```

Not: İkinci `settings put` komutu, açık olan diğer erişilebilirlik hizmetlerini kapatır.

## Derleme

```
echo "sdk.dir=/ANDROID/SDK/YOLU" > local.properties
./gradlew assembleRelease
```

Çıktı: `app/build/outputs/apk/release/app-release.apk`.
İmza anahtarı `app/tvmouse.keystore` dosyasındadır. Aynı anahtar ile güncelleme kurulur.
