const firebaseConfig = {
  apiKey: "AIzaSyBqbDBQuYJffTHwcCwwwc-1dK6ZBsStWW8",
  authDomain: "celleste-skills-f6a96.firebaseapp.com",
  databaseURL: "https://celleste-skills-f6a96-default-rtdb.firebaseio.com",
  projectId: "celleste-skills-f6a96",
  storageBucket: "celleste-skills-f6a96.firebasestorage.app",
  messagingSenderId: "539018245628",
  appId: "1:539018245628:web:9c6892c02a07175c2cee79"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

async function firebaseAuth() {
  try {
    await firebase.auth().signInAnonymously();
  } catch (e) {
    console.warn('Firebase auth (optional):', e.message);
  }
}

async function saveFamilyMember(discordId, username) {
  try {
    const snap = await db.collection('family_members')
      .where('discordId', '==', discordId)
      .limit(1)
      .get();
    if (snap.empty) {
      await db.collection('family_members').add({
        discordId,
        username,
        verifiedAt: firebase.firestore.FieldValue.serverTimestamp(),
        role: 'Celleste'
      });
      console.log('[Celleste] User saved to family_members:', username);
      return true;
    }
    return false;
  } catch (e) {
    console.warn('[Celleste] Firestore save error:', e.message);
    return false;
  }
}