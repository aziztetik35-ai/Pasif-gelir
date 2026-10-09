# CommissionPack

IO listesi girer. Devreye alma doküman paketi 1 dakikada çıkar.

- **Girdi:** TIA Portal PLC etiket dışa aktarımı (.xlsx) veya herhangi bir IO listesi (.xlsx / .xlsm / .csv).
- **Çıktı:** 10 sayfalık Excel: Kapak, Özet, DI Test, DO Test, AI/AO Çevrim Testi, FAT, SAT, Eksik Listesi, Onay.
- **Dil:** EN / TR / DE.
- **Gizlilik:** Dosya bellekte işlenir. Saklanmaz. AI servisine gitmez.

## Dokümanlar

- **[Yeni yön (güncel seçim) — AI Mobil Uygulama Fabrikası](docs/03-yeni-yon-uygulama-fabrikasi.md)**
- **[Uygulama listesi ve sıralama — 13 fikir, puanlama, yapım sırası](docs/04-uygulama-listesi.md)**
- [İlk strateji raporu (CommissionPack seçimi, artık güncel değil) — 25 fikir, puanlama, seçim, 30/90 gün planı, gelir senaryoları](docs/01-strateji-raporu.md)
- [Uygulama planı — ürün, müşteri, rakipler, stack, ödeme, deployment](docs/02-uygulama-plani.md)
- [Otomasyon akışları (n8n)](automation/README.md)

## Hızlı başlangıç

```bash
pip install -r requirements.txt

# Web uygulaması
streamlit run app.py

# Komut satırı
python -m commissionpack samples/tia_plc_tags_sample.xlsx --lang tr --project "Hat 3" -o paket.xlsx

# Testler
pip install pytest
python -m pytest
```

Tam sürümü yerelde denemek için test anahtarı:

```bash
CP_DEV_LICENSE_KEYS=TEST123 streamlit run app.py   # kenar çubuğuna TEST123 yazın
```

## TIA Portal'dan dışa aktarma

1. Proje ağacında **PLC tags** klasörünü açın.
2. Etiket tablosunu seçin. Sağ tık → **Export** (veya araç çubuğundaki dışa aktarma ikonu).
3. `.xlsx` dosyasını CommissionPack'e yükleyin.

## Ortam değişkenleri

| Değişken | Amaç |
|---|---|
| `POLAR_ORGANIZATION_ID` | Polar.sh lisans doğrulamasını açar |
| `CP_DEV_LICENSE_KEYS` | Virgülle ayrılmış test anahtarları (sadece yerel test) |
| `CP_BUY_URL` | Ücretsiz kullanıcıya gösterilen satın alma linki |

## Sorumluluk

Üretilen paket bir çalışma dokümanıdır. Sorumlu mühendis paketi onaylı çizimlere, fonksiyon tanımına ve güvenlik doğrulama planına göre kontrol etmelidir.
