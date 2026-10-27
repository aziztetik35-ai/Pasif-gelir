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
| Açma/kapama tuşu (varsayılan: OK + sol ok birlikte) | Fare modunu AÇAR | Fare modunu KAPATIR |
| Yön tuşları | Normal gezinme | İmleci hareket ettirir (basılı tutun: hızlanır) |
| OK | Normal seçim | Tıklama |
| OK uzun basma | Normal | Uzun basma |
| Geri | Normal | Geri |
| Geri 1 saniye basılı | Normal | Fare modunu her zaman KAPATIR |
| Kanal ^ / v | Normal | Sayfayı yukarı / aşağı kaydırır |
| Ana ekran, ses | Normal | Normal |

İmleci ekranın kenarına itin. Sayfa o yöne kayar.

## Ayarlar (TV Fare uygulamasında)

- **Açma/kapama tuşu:** düğmeye basın. Sonra kumandada tuşa basın. Uygulama tuşu kaydeder.
  - İki tuş birlikte: ilk tuşu basılı tutun, ikinci tuşa basın.
  - Tek basış: tuşa bir kez basın (örnek: Profil veya TV tuşu).
  - Uzun basma: tuşu 1 saniye basılı tutun.
  - Çift basma: tuşa iki kez hızlı basın.
  - Uygulama, normal kullanımı bozan seçimleri kabul etmez (örnek: tek basış ile OK).
- **İmleç hızı** ve **İmleç boyutu.**
- **Tıklama yöntemi:**
  - Otomatik (önerilen): önce imlecin altındaki öğeye erişilebilirlik tıklaması yapar. Öğe yoksa dokunma hareketi gönderir.
  - Sadece dokunma hareketi.
  - Sadece erişilebilirlik tıklaması.
- **İmleci gizle:** 5 saniye hareketsiz kalınca imleç gizlenir. Bir tuşa basınca imleç tekrar görünür.
- **Fare modunu otomatik kapat:** hareketsiz kalınca fare modu kapanır (1, 5 veya 15 dakika).
- **Kenara itince sayfayı kaydır.**
- **Açma/kapama mesajını göster.**

## Ayar kendiliğinden kapanıyorsa (Android 13 ve sonrası)

Android, dosya yöneticisi ile kurulan uygulamada erişilebilirlik ayarını kilitler ("kısıtlanmış ayar").
`TvFareKurucu.apk` bu sorunu bilgisayar olmadan çözer. Kurucu, TV Fare uygulamasını
PackageInstaller oturumu ile kurar. Android bu yöntemde kilit koymaz.

1. `TvFareKurucu.apk` dosyasını dosya yöneticisi ile kurun.
2. Kurucuyu açın. Dosya yöneticisi ile kurulan eski TV Fare varsa, önce "Eski TV Fare uygulamasını kaldır" seçin.
3. "Kurulum iznini ver" seçin. Sonra "TV Fare uygulamasını kur" seçin.
4. "TV Fare uygulamasını aç" seçin.
5. "TV Fare İmleci" hizmetini AÇIK yapın.

Güncelleme için yeni Kurucuyu kurun ve "Güncelle" seçin. Kaldırmanız gerekmez.

TV Fare ekranı "Kısıtlanmış ayar: EVET / HAYIR" bilgisini ve son hatayı gösterir.

Bilgisayar varsa ADB de kullanabilirsiniz:

```
adb connect <TV-IP-ADRESI>
adb shell appops set com.aziz.tvmouse ACCESS_RESTRICTED_SETTINGS allow
```

## Sorun giderme

- **Kumanda kilitlendi gibi:** fare modundasınız. Geri tuşunu 1 saniye basılı tutun. Fare modu kapanır.
- **Tıklama çalışmıyor (örnek: reklamdaki çarpı):** aynı yere tekrar tıklayın. İkinci tıklama gerçek
  dokunma kullanır. Yine çalışmazsa TV Fare > "Tıklama yöntemi" ayarını değiştirin.
  "Otomatik" yöntem büyük öğelerde (ekranın %12'sinden büyük) ve WebView/video yüzeylerinde her zaman
  gerçek dokunma kullanır. Bu öğelerin içindeki çizilmiş düğmeler (örnek: reklam çarpısı) ayrı öğe değildir.
- **Hata kaydı:** uygulama çökerse, TV Fare ekranı "SON HATA" metnini gösterir.
- **Ayrıntılı kayıt (ADB):** `adb shell setprop log.tag.TvMouse DEBUG` ve `adb logcat -s TvMouse`.

## Test

```
./gradlew :app:testReleaseUnitTest
```

Robolectric testleri tuş mantığını gerçek zamanlama ile dener (kombinasyon, tek/uzun/çift basma,
tuş kaydı, tıklama, kaydırma, Geri ile çıkış, otomatik gizleme ve kapanma). Bir test binlerce rastgele
tuş basışı ile şu kuralı kontrol eder: uygulamaya giden her DOWN olayının UP olayı da uygulamaya gider.

## Derleme

```
echo "sdk.dir=/ANDROID/SDK/YOLU" > local.properties
./gradlew assembleRelease
```

Çıktı: `app/build/outputs/apk/release/app-release.apk` ve `installer/build/outputs/apk/release/installer-release.apk`.
İmza anahtarı `app/tvmouse.keystore` dosyasındadır. Aynı anahtar ile güncelleme kurulur.
