const firebase = require("firebase-admin");
const firebase_key = require("../firebase_key.json");
const colors = require("colors");

firebase.initializeApp({
  credential: firebase.credential.cert(firebase_key),
});

const fb = firebase.firestore();
const connectFirebase = async () => {
  try {
    if (await fb !== undefined) {
      console.log("Connected to Firebase".underline.yellow);
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { connectFirebase, fb };

// try {
//   const fb = firebase.firestore();
//   module.exports = fb;
// } catch (error) {
//   console.log(error);
// }
