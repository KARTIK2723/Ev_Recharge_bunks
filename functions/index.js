const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();
const db = admin.firestore();

exports.expireBookings = functions.pubsub
  .schedule("every 1 minutes")
  .onRun(async () => {
    const now = new Date();

    const snapshot = await db
      .collection("bookings")
      .where("status", "==", "active")
      .where("expiresAt", "<=", now)
      .get();

    if (snapshot.empty) return null;

    const batch = db.batch();

    snapshot.forEach((docSnap) => {
      const booking = docSnap.data();

      const bookingRef = docSnap.ref;
      const bunkRef = db.collection("ev_bunks").doc(booking.bunkId);

      // restore slots
      batch.update(bunkRef, {
        availableSlots: admin.firestore.FieldValue.increment(booking.slots),
      });

      // expire booking
      batch.update(bookingRef, {
        status: "expired",
        expiredAt: admin.firestore.FieldValue.serverTimestamp(),
      });
    });

    await batch.commit();
    return null;
  });
