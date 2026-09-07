/**
 * Firestore data layer for Expedia-Clone.
 *
 * This module is the ONLY place in the app that talks to Firestore. Components
 * and Redux actions import from here and never import firebase/firestore
 * directly. That keeps queries, collection names, and shape normalization in
 * one file instead of scattered across fifteen call sites.
 *
 * Every function returns data in the same shape json-server used to return -
 * plain objects with an `id` field, or arrays of them - so converting a caller
 * means swapping the call, not rewriting the reducer or the JSX.
 *
 * Collections (renamed from db.json by scripts/migrate-to-firestore.js):
 *   hotels  flights  thingsToDo  giftcards  users  hotelCart  flightCart
 */

import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  setDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit as fsLimit,
  getCountFromServer,
  serverTimestamp,
} from "firebase/firestore";

import { db, auth } from "../01_firebase/config_firebase";

export const COLLECTIONS = {
  hotels: "hotels",
  flights: "flights",
  thingsToDo: "thingsToDo",
  giftcards: "giftcards",
  users: "users",
  hotelCart: "hotelCart",
  flightCart: "flightCart",
};

/* ------------------------------------------------------------------ helpers */

/** Firestore snapshot -> plain object with its document id, like json-server. */
const withId = (snap) => ({ id: snap.id, ...snap.data() });

const listAll = async (name) => {
  const snap = await getDocs(collection(db, name));
  return snap.docs.map(withId);
};

/**
 * Some price fields arrived from db.json as strings ("6999", "₹2,532") and
 * others as numbers (2300). Firestore compares types strictly, so anything
 * numeric has to be parsed before it can be sorted or filtered on.
 */
const toNumber = (value) => {
  if (typeof value === "number") return value;
  if (typeof value === "string") {
    const parsed = Number(value.replace(/[^0-9.]/g, ""));
    return Number.isNaN(parsed) ? 0 : parsed;
  }
  return 0;
};

/**
 * Firestore has no offset pagination - real paging needs startAfter() cursors,
 * which the existing page-number UI can't express. With at most 239 documents
 * in any collection, slicing a page out client-side is correct, costs one read
 * per document, and keeps the caller's `page` argument working unchanged.
 * Revisit this if a collection ever grows past a few thousand documents.
 */
const paginate = (rows, page, perPage) => {
  if (!page || !perPage) return rows;
  const start = (Number(page) - 1) * perPage;
  return rows.slice(start, start + perPage);
};

/* -------------------------------------------------------------------- users */

export const listUsers = () => listAll(COLLECTIONS.users);

/**
 * Login looks a user up by phone number. Querying by field beats fetching the
 * whole collection and scanning it in the browser, which is what the original
 * code did.
 */
export const getUserByPhone = async (number) => {
  const q = query(
    collection(db, COLLECTIONS.users),
    where("number", "==", String(number))
  );
  const snap = await getDocs(q);
  return snap.empty ? null : withId(snap.docs[0]);
};

/**
 * Registration. When the caller passes the Firebase Auth uid, the document is
 * created with that uid as its id, which is what firestore.rules keys ownership
 * on. Without it the rules will reject later reads of this document.
 */
export const createUser = async (userData, uid = auth?.currentUser?.uid) => {
  const payload = {
    ...userData,
    number: String(userData.number ?? ""),
    createdAt: serverTimestamp(),
  };
  if (uid) {
    await setDoc(doc(db, COLLECTIONS.users, uid), payload);
    return { id: uid, ...payload };
  }
  const ref = await addDoc(collection(db, COLLECTIONS.users), payload);
  return { id: ref.id, ...payload };
};

/* ------------------------------------------------------------------- hotels */

/**
 * hotel.price is numeric in the source data, so sorting and limiting can run
 * on the server.
 *
 * @param {object}  opts
 * @param {number} [opts.limit]  page size
 * @param {number} [opts.page]   1-based page number
 * @param {string} [opts.sort]   field to sort on, e.g. "price" or "rating"
 * @param {string} [opts.order]  "asc" | "desc"
 * @param {string} [opts.place]  filter to one city
 */
export const listHotels = async ({
  limit,
  page,
  sort,
  order = "asc",
  place,
} = {}) => {
  const clauses = [];
  if (place) clauses.push(where("place", "==", place));
  if (sort) clauses.push(orderBy(sort, order === "desc" ? "desc" : "asc"));
  // Over-fetch so the requested page can be sliced out below.
  if (limit && !place) clauses.push(fsLimit(limit * (Number(page) || 1)));

  const snap = await getDocs(query(collection(db, COLLECTIONS.hotels), ...clauses));
  return paginate(snap.docs.map(withId), page, limit);
};

export const getHotelById = async (id) => {
  const snap = await getDoc(doc(db, COLLECTIONS.hotels, String(id)));
  return snap.exists() ? withId(snap) : null;
};

export const createHotel = async (data) => {
  const ref = await addDoc(collection(db, COLLECTIONS.hotels), {
    ...data,
    price: toNumber(data.price),
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...data };
};

export const deleteHotel = (id) =>
  deleteDoc(doc(db, COLLECTIONS.hotels, String(id)));

/* ------------------------------------------------------------------ flights */

/**
 * flight.price is a STRING in the source data ("6999"), so Firestore cannot
 * range-filter or sort on it - comparing a number against string values matches
 * nothing, silently. The collection is 22 documents, so it is read whole and
 * filtered in JS. That is a deliberate trade, not an oversight.
 *
 * The alternative is normalizing price to a number during migration; worth
 * doing if this collection ever grows.
 */
export const listFlights = async ({
  limit,
  page,
  priceMin,
  priceMax,
  from,
  to,
} = {}) => {
  let rows = await listAll(COLLECTIONS.flights);

  if (from) rows = rows.filter((f) => f.from === from);
  if (to) rows = rows.filter((f) => f.to === to);
  if (priceMin != null)
    rows = rows.filter((f) => toNumber(f.price) >= Number(priceMin));
  if (priceMax != null)
    rows = rows.filter((f) => toNumber(f.price) <= Number(priceMax));

  rows.sort((a, b) => toNumber(a.price) - toNumber(b.price));
  return paginate(rows, page, limit) || rows.slice(0, limit);
};

export const getFlightById = async (id) => {
  const snap = await getDoc(doc(db, COLLECTIONS.flights, String(id)));
  return snap.exists() ? withId(snap) : null;
};

export const createFlight = async (data) => {
  const ref = await addDoc(collection(db, COLLECTIONS.flights), {
    ...data,
    createdAt: serverTimestamp(),
  });
  return { id: ref.id, ...data };
};

export const deleteFlight = (id) =>
  deleteDoc(doc(db, COLLECTIONS.flights, String(id)));

/* -------------------------------------------------------- things to do etc. */

/** `place` values in the source data are lowercase, e.g. "kolkata". */
export const listThingsToDo = async (place) => {
  if (!place) return listAll(COLLECTIONS.thingsToDo);
  const q = query(
    collection(db, COLLECTIONS.thingsToDo),
    where("place", "==", String(place).toLowerCase())
  );
  const snap = await getDocs(q);
  return snap.docs.map(withId);
};

export const listGiftcards = () => listAll(COLLECTIONS.giftcards);

/* --------------------------------------------------------------------- cart */

const cartName = (type) =>
  type === "hotel" ? COLLECTIONS.hotelCart : COLLECTIONS.flightCart;

/**
 * Cart documents carry the owner's uid because firestore.rules scopes carts to
 * their owner. Without a signed-in user the write is rejected, so callers should
 * gate "add to cart" behind auth.
 */
export const addToCart = async (type, item, uid = auth?.currentUser?.uid) => {
  const ref = await addDoc(collection(db, cartName(type)), {
    ...item,
    uid: uid ?? null,
    addedAt: serverTimestamp(),
  });
  return { id: ref.id, ...item };
};

export const listCart = async (type, uid = auth?.currentUser?.uid) => {
  if (!uid) return [];
  const q = query(collection(db, cartName(type)), where("uid", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map(withId);
};

export const removeFromCart = (type, id) =>
  deleteDoc(doc(db, cartName(type), String(id)));

/* ------------------------------------------------------------------ counts */

/**
 * The admin dashboard only needs sizes. getCountFromServer is a single billed
 * read per collection instead of one per document - 5 reads rather than ~350.
 * Falls back to counting documents if the aggregation query is unavailable.
 */
const countOf = async (name) => {
  try {
    const snap = await getCountFromServer(collection(db, name));
    return snap.data().count;
  } catch (err) {
    const snap = await getDocs(collection(db, name));
    return snap.size;
  }
};

export const getCounts = async () => {
  const [flights, hotels, users, giftcards, thingsToDo] = await Promise.all([
    countOf(COLLECTIONS.flights),
    countOf(COLLECTIONS.hotels),
    countOf(COLLECTIONS.users),
    countOf(COLLECTIONS.giftcards),
    countOf(COLLECTIONS.thingsToDo),
  ]);
  return { flights, hotels, users, giftcards, thingsToDo };
};
