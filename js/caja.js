import {
    db,
    ref,
    push,
    set,
    onValue
} from "./firebase.js";

let ventas = [];
let cajaMovimientos = [];

const $ = (id) => document.getElementById(id);

export function iniciarCaja() {

    $("btnAbrirCaja").addEventListener("click", abrirCajaManual);

    // 🔥 NUEVO: registrar egresos manuales
    agregarBotonGasto();

    cargarVentas();
    cargarCaja();

}

function agregarBotonGasto() {

    const panel = document.querySelector(".caja-panel");

    const btn = document.createElement("button");

    btn.textContent = "Registrar Gasto";

    btn.className = "btn";

    btn.style.marginTop = "10px";

    btn.onclick = registrarGasto;

    panel.appendChild(btn);

}

function registrarGasto() {

    const motivo = prompt("Motivo del gasto (insumos, limpieza, etc):");

    if (!motivo) return;

    const monto = Number(prompt("Monto del gasto:"));

    if (monto <= 0) return;

    const mov = push(ref(db, "caja"));

    set(mov, {

        tipo: "egreso",
        motivo,
        monto,
        fecha: new Date().toISOString()

    });

}

function abrirCajaManual() {

    const monto = Number($("montoApertura").value);

    if (monto <= 0) {
        alert("Ingrese un monto válido");
        return;
    }

    const mov = push(ref(db, "caja"));

    set(mov, {

        tipo: "apertura",
        monto,
        fecha: new Date().toISOString()

    });

    $("montoApertura").value = "";

}

function cargarVentas() {

    onValue(ref(db, "ventas"), (snapshot) => {

        ventas = [];

        snapshot.forEach((item) => {
            ventas.push(item.val());
        });

        calcularCaja();

    });

}

function cargarCaja() {

    onValue(ref(db, "caja"), (snapshot) => {

        cajaMovimientos = [];

        snapshot.forEach((item) => {
            cajaMovimientos.push(item.val());
        });

        renderCaja();
        calcularCaja();

    });

}

function calcularCaja() {

    const hoy = new Date().toDateString();

    let ventasDia = 0;
    let ingresos = 0;
    let egresos = 0;
    let apertura = 0;

    ventas.forEach(v => {

        if (new Date(v.fecha).toDateString() === hoy) {
            ventasDia += v.total;
        }

    });

    cajaMovimientos.forEach(m => {

        if (new Date(m.fecha).toDateString() === hoy) {

            if (m.tipo === "apertura") apertura += m.monto;

            if (m.tipo === "ingreso") ingresos += m.monto;

            if (m.tipo === "egreso") egresos += m.monto;

        }

    });

    const total = apertura + ventasDia + ingresos - egresos;

    $("ventasDia").textContent = "$" + ventasDia;
    $("ingresosExtra").textContent = "$" + ingresos;
    $("egresosExtra").textContent = "$" + egresos;
    $("totalCaja").textContent = "$" + total;

}

function renderCaja() {

    const contenedor = $("listaCaja");

    contenedor.innerHTML = "";

    cajaMovimientos.forEach(m => {

        contenedor.innerHTML += `

<div class="item-caja">

<div>

<strong>${m.tipo.toUpperCase()}</strong>
<br>
${m.motivo ? m.motivo : ""}
<br>
${formatearFecha(m.fecha)}

</div>

<div>

$${m.monto || 0}

</div>

</div>

`;

    });

}

function formatearFecha(fecha) {

    return new Date(fecha).toLocaleString("es-AR");

}
