# ShelfSense

ShelfSense is a mobile-friendly web app for a household pantry. It tracks what you have, reads labels and barcodes, and points you at meals that use food before it expires.

## Run it

You need Node 20+ and MongoDB.

```bash
docker compose up -d
cp server/.env.example server/.env
npm install
npm run dev
```

Open http://localhost:5173 and choose **Try the demo kitchen**.

Demo account: `dev@shelfsense.app` / `demo1234`

The API runs at http://localhost:4000. The Vite dev server proxies `/api` and `/uploads`.

## Label reading

Barcode lookup uses the public [Open Food Facts](https://world.openfoodfacts.org) database and does not need a key. It never includes the expiry printed on your pack, so you confirm that date yourself.

Photographing a label uses OpenAI when `OPENAI_API_KEY` is set in `server/.env`. Without a key, the photo is saved and you fill the fields by hand. The same key unlocks **Invent a recipe with AI** on the Cook page.

```bash
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4o-mini
```

Set `DEMO_LOGIN=false` before any public deployment, and replace `JWT_SECRET`.

## What’s in this version

- Email sign up, sign in, password reset, and a demo kitchen
- Pantry you can add by hand, edit, open, use, or toss
- Fridge, freezer, and cupboard
- Printed expiry plus a separate finish-by date after opening
- Label photo and barcode lookup, with a required confirmation step
- Nutrition label reading and a plain score (not medical advice)
- “You already have this” when a scan matches food in the kitchen
- Use-it-up meals, mark ingredients used, and save leftovers
- Money kept versus money tossed
- Shopping list and “you may be out” suggestions
- Streaks and badges

## Good things to build next

1. **Receipt capture.** One photo of a supermarket bill adds the whole shop, then you only fill expiry dates.
2. **Household pantry.** One shelf shared by the people who actually cook and shop.
3. **A Sunday shop list.** On a chosen grocery day, show everything that will expire before the next trip.
4. **Price memory.** Remember what you last paid for milk and say when this pack costs more.
5. **Freezer age.** Track the day something was frozen, not only the printed date.
6. **Actionable reminders.** “Milk, spinach, and cheese expire tomorrow. Here is one meal that uses all three.”
7. **Google sign-in** and real reset emails.
