/* ==========================================
   WILLY'S ADMIN
   FIREBASE
========================================== */
// Firebase SDK
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.2.1/firebase-app.js";
import {getDatabase,ref,set,get,push,update,remove,onValue} from "https://www.gstatic.com/firebasejs/12.2.1/firebase-database.js";

// CONFIGURACIÓN

const firebaseConfig = {
    apiKey: "AIzaSyAz9XHfFQWgTClf8gLn4Ri12JHVitAmA4U",
    authDomain: "willy-s-6f6e4.firebaseapp.com",
    databaseURL: "https://willy-s-6f6e4-default-rtdb.firebaseio.com",
    projectId: "willy-s-6f6e4",
    storageBucket: "willy-s-6f6e4.firebasestorage.app",
    messagingSenderId: "852499850297",
    appId: "1:852499850297:web:1924f97dd688bbf4ac19e8",
    measurementId: "G-1HYXT4Z754"
};

// Inicializar Firebase

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

// Exportamos todo para el resto del sistema

export {db, ref, set, get, push, update, remove, onValue};
