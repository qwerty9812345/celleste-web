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
const auth = firebase.auth();
const db = firebase.firestore();
