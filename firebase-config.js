// Firebase Configuration - Realtime Database
const firebaseConfig = {
  apiKey: "AIzaSyBm0mIvHVznIeF2PoFk6dtdaiT5r877wyA",
  authDomain: "meow-874ce.firebaseapp.com",
  databaseURL: "https://meow-874ce-default-rtdb.europe-west1.firebasedatabase.app",
  projectId: "meow-874ce",
  storageBucket: "meow-874ce.firebasestorage.app",
  messagingSenderId: "471541334599",
  appId: "1:471541334599:web:567af3e7dbe70a37572762"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
const auth = firebase.auth();
const database = firebase.database();
const storage = firebase.storage();
