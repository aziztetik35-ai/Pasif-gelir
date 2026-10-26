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

## Ayar kendiliğinden kapanıyorsa (Android 13 ve sonrası)

Android, dosya yöneticisi ile kurulan uygulamada erişilebilirlik ayarını kilitler ("kısıtlanmış ayar").
`TvFareKurucu.apk` bu sorunu bilgisayar olmadan çözer. Kurucu, TV Fare uygulamasını
PackageInstaller oturumu ile kurar. Android bu yöntemde kilit koymaz.

1. `TvFareKurucu.apk` dosyasını dosya yöneticisi ile kurun.
2. Kurucuyu açın. Adımları sırayla yapın:
   1. Eski TV Fare uygulamasını kaldır.
   2. Kurulum iznini ver.
   3. TV Fare uygulamasını kur.
   4. TV Fare uygulamasını aç.
3. "TV Fare İmleci" hizmetini AÇIK yapın.

TV Fare ekranı "Kısıtlanmış ayar: EVET / HAYIR" bilgisini ve son hatayı gösterir.

Bilgisayar varsa ADB de kullanabilirsiniz:

```
adb connect <TV-IP-ADRESI>
adb shell appops set com.aziz.tvmouse ACCESS_RESTRICTED_SETTINGS allow
```

## Derleme

```
echo "sdk.dir=/ANDROID/SDK/YOLU" > local.properties
./gradlew assembleRelease
```

Çıktı: `app/build/outputs/apk/release/app-release.apk` ve `installer/build/outputs/apk/release/installer-release.apk`.
İmza anahtarı `app/tvmouse.keystore` dosyasındadır. Aynı anahtar ile güncelleme kurulur.
