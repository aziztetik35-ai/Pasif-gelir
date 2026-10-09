# Servis Raporu AI — AI Servisi (Cloudflare Worker)

Teknisyenin dikte ettiği metni yapılandırılmış bir servis raporuna çevirir.

- Model: **Claude Haiku 5.5** (`claude-haiku-5-5`). Effort "low", thinking kapalı. Çıktı JSON şemasına zorlanır (structured outputs).
- Maliyet: rapor başına ~$0,0005 (tahmin). Fiyat: 1 milyon token için $0,10 giriş, $0,50 çıkış.
- Kota: ücretsiz kullanıcıya toplam 3 rapor, Pro kullanıcıya ayda 300 rapor, herkese toplam günde 5.000 rapor.
- Model değiştirmek için `wrangler.jsonc` → `vars.MODEL` değerini değiştirin. Kod değişmez.

## API

```
POST /v1/structure
x-app-key: <APP_KEY>
{ "transcript": "...", "language": "tr", "trade": "hvac", "equipment": "Daikin FTXM35", "appUserId": "$RCAnonymousID:..." }

200 → { "report": { "title", "summary", "workPerformed", "findings", "partsUsed", "recommendations", "followUpRequired" }, "model": "..." }
400 hatalı istek · 401 yanlış anahtar · 429 sınır doldu · 422 model reddetti · 502/503 model hatası
```

`GET /health` → `{ "ok": true }`

Uygulama 200 dışındaki her cevapta raporu telefonda AI'sız düzenler.

## Kurulum

```bash
cd apps/saha-rapor-ai
npm install
npm test            # 12 test
npm run typecheck

npx wrangler login
npx wrangler kv namespace create USAGE     # çıkan id'yi wrangler.jsonc içine yazın
npx wrangler secret put ANTHROPIC_API_KEY
npx wrangler secret put APP_KEY            # uzun rastgele bir metin; aynısını app.json → extra.appKey alanına yazın
npx wrangler secret put REVENUECAT_SECRET  # RevenueCat secret API key (v1)
npx wrangler deploy
```

Deneme:

```bash
curl -s https://<worker-adresi>/v1/structure \
  -H "content-type: application/json" -H "x-app-key: <APP_KEY>" \
  -d '{"transcript":"Dış ünitede gaz kaçağı vardı. Kaynak yaptım, 2 kg R32 gaz doldurdum.","language":"tr","trade":"hvac","equipment":"","appUserId":"test-user-001"}'
```

## Güvenlik notları

- `APP_KEY` uygulamanın içinde durur, gerçek bir sır değildir. Asıl koruma kotalardır.
- Pro durumu RevenueCat'ten okunur ve 1 saat önbelleğe alınır.
- Sayaçlar Cloudflare KV'de tutulur. KV sayaçları atomik değildir. Aynı anda gelen isteklerde küçük bir aşım olabilir.
- Rapor metni saklanmaz. Sadece sayaçlar saklanır.
