import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyD-0_rdciu-3DdHMocVAcg6YJRqdkATnRM",
  authDomain: "opsmerge-9458c.firebaseapp.com",
  projectId: "opsmerge-9458c",
  storageBucket: "opsmerge-9458c.appspot.com",
  messagingSenderId: "660867155766",
  appId: "1:660867155766:web:007047b8033db3540dd597",
  measurementId: "G-BYR4DB9N2G"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

export { auth, db, analytics };
