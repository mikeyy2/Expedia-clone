/**
 * One-time migration: db.json (json-server) -> Cloud Firestore.
 *
 * Setup:
 *   1. Firebase Console > Settings (gear) > Service accounts > Generate new private key
 *   2. Save the downloaded file as serviceAccountKey.json in the repo root (it is gitignored)
 *   3. npm install --save-dev firebase-admin
 *   4. node scripts/migrate-to-firestore.js
 *
 * Safe to re-run: documents are written by id, so a second run overwrites
 * rather than duplicating. Pass --dry to preview without writing.
 */

const fs = require("fs");
const path = require("path");
// firebase-admin v13+ removed the namespaced `admin.credential` / `admin.firestore`
// API. These subpath imports are the supported form.
const { initializeApp, cert } = require("firebase-admin/app");
const { getFirestore, FieldValue } = require("firebase-admin/firestore");

const DRY_RUN = process.argv.includes("--dry");
const ROOT = path.join(__dirname, "..");
const KEY_PATH = path.join(ROOT, "serviceAccountKey.json");
const DB_PATH = path.join(ROOT, "db.json");

// json-server key -> Firestore collection name.
// Renamed to consistent lowerCamelCase so queries in the app are predictable.
const COLLECTION_MAP = {
  hotel: "hotels",
  flight: "flights",
  users: "users",
  giftcards: "giftcards",
  Things_todo: "thingsToDo",
  hotelcart: "hotelCart",
  flightcart: "flightCart",
};

const BATCH_LIMIT = 500; // Firestore hard limit per batched write

async function main() {
  if (!fs.existsSync(KEY_PATH)) {
    console.error("Missing serviceAccountKey.json in the repo root. See the header of this file.");
    process.exit(1);
  }

  const serviceAccount = require(KEY_PATH);
  initializeApp({ credential: cert(serviceAccount) });
  const db = getFirestore();

  const raw = JSON.parse(fs.readFileSync(DB_PATH, "utf8"));
  let grandTotal = 0;

  for (const [sourceKey, collectionName] of Object.entries(COLLECTION_MAP)) {
    const items = raw[sourceKey];
    if (!Array.isArray(items)) {
      console.warn(`skip  ${sourceKey}: not present in db.json`);
      continue;
    }

    console.log(`\n${sourceKey} -> ${collectionName} (${items.length} docs)`);
    if (DRY_RUN) {
      console.log("  dry run, sample doc:", JSON.stringify(items[0]).slice(0, 200));
      grandTotal += items.length;
      continue;
    }

    let written = 0;
    for (let i = 0; i < items.length; i += BATCH_LIMIT) {
      const slice = items.slice(i, i + BATCH_LIMIT);
      const batch = db.batch();

      slice.forEach((item, n) => {
        // Preserve the original json-server id as the document id so existing
        // code that looks up by id keeps working.
        const id = item.id != null ? String(item.id) : `${collectionName}-${i + n}`;
        const { id: _drop, ...fields } = item;
        batch.set(db.collection(collectionName).doc(id), {
          ...fields,
          migratedAt: FieldValue.serverTimestamp(),
        });
      });

      await batch.commit();
      written += slice.length;
      console.log(`  committed ${written}/${items.length}`);
    }
    grandTotal += written;
  }

  console.log(`\nDone. ${grandTotal} documents ${DRY_RUN ? "would be written" : "written"}.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});
