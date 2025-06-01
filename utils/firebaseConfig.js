import { initializeApp } from 'firebase/app';

const firebaseConfig = {
  apiKey: "AIzaSyCBM0zmpnXz3hdsexDVjn2w45HtU1ux5gQ",
  authDomain: "gestor-eventos-97d45.firebaseapp.com",
  projectId: "gestor-eventos-97d45",
  storageBucket: "gestor-eventos-97d45.appspot.com",
  messagingSenderId: "820367238137",
  appId: "1:820367238137:web:981ed05c8f5524136e1328"
};

const app = initializeApp(firebaseConfig);

export { app };
