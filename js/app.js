/* ==========================================
   WILLY'S ADMIN
   APP PRINCIPAL
========================================== */
import { cargarPagina } from "./router.js";
import {db, ref, get} from "./firebase.js";

const estadoFirebase = document.getElementById("firebase");

// Intentamos leer la raíz de la base

get(ref(db, "/"))
.then(() => {
    estadoFirebase.innerHTML =
        "🟢 Firebase conectado correctamente";
    estadoFirebase.style.color = "#00C853";
})

.catch((error) => {
    estadoFirebase.innerHTML =
        "🔴 Error al conectar con Firebase";
    estadoFirebase.style.color = "#FF5252";
    console.error(error);
});
cargarPagina("dashboard");
