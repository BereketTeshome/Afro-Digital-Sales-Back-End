const firebaseAdmin = require('firebase-admin');

const getFirestoreData = async (collectionName) => {
  const db = firebaseAdmin.firestore();
  const snapshot = await db.collection(collectionName).get();
  const data = snapshot.docs.map((doc) => doc.data());
  return data;
};

module.exports = { getFirestoreData };
