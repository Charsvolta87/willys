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
const botones =
document.querySelectorAll(".menu");

/*---------------------*/
/********BOTONES********/
/*---------------------*/
botones.forEach(boton=>{
    boton.addEventListener("click",()=>{
        botones.forEach(b=>b.classList.remove("activo"));
        boton.classList.add("activo");
        const pagina =
        boton.dataset.pagina;
        document.querySelector("header h1").textContent =
        boton.textContent.trim();
        cargarPagina(pagina);
    });
});
