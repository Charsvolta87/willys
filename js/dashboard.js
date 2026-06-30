import {
    db,
    ref,
    onValue
} from "./firebase.js";

let ventas = [];
let compras = [];
let productos = [];
let caja = [];

const $ = (id) => document.getElementById(id);

export function iniciarDashboard() {

    cargarVentas();
    cargarCompras();
    cargarProductos();
    cargarCaja();

}

function cargarVentas() {

    onValue(ref(db, "ventas"), (snapshot) => {

        ventas = [];

        snapshot.forEach((item) => {

            ventas.push({
                id: item.key,
                ...item.val()
            });

        });

        actualizarDashboard();

    });

}

function cargarCompras() {

    onValue(ref(db, "compras"), (snapshot) => {

        compras = [];

        snapshot.forEach((item) => {

            compras.push({
                id: item.key,
                ...item.val()
            });

        });

        actualizarDashboard();

    });

}

function cargarProductos() {

    onValue(ref(db, "productos"), (snapshot) => {

        productos = [];

        snapshot.forEach((item) => {

            productos.push({
                id: item.key,
                ...item.val()
            });

        });

        actualizarDashboard();

    });

}

function cargarCaja() {

    onValue(ref(db, "caja"), (snapshot) => {

        caja = [];

        snapshot.forEach((item) => {

            caja.push({
                id: item.key,
                ...item.val()
            });

        });

        actualizarDashboard();

    });

}

function actualizarDashboard() {

    calcularResumenHoy();

    mostrarStockCritico();

    mostrarUltimasVentas();

    mostrarUltimosGastos();

}

function calcularResumenHoy() {

    const hoy = new Date().toDateString();

    let totalVentas = 0;
    let totalCompras = 0;
    let totalCaja = 0;

    ventas.forEach(v => {

        if (new Date(v.fecha).toDateString() === hoy) {

            totalVentas += Number(v.total);

        }

    });

    compras.forEach(c => {

        if (new Date(c.fecha).toDateString() === hoy) {

            totalCompras += Number(c.total);

        }

    });

    caja.forEach(m => {

        if (new Date(m.fecha).toDateString() !== hoy) return;

        switch (m.tipo) {

            case "apertura":
                totalCaja += Number(m.monto);
                break;

            case "ingreso":
                totalCaja += Number(m.monto);
                break;

            case "egreso":
                totalCaja -= Number(m.monto);
                break;

        }

    });

    $("dashVentas").textContent =
        "$" + totalVentas.toLocaleString("es-AR");

    $("dashCompras").textContent =
        "$" + totalCompras.toLocaleString("es-AR");

    $("dashCaja").textContent =
        "$" + totalCaja.toLocaleString("es-AR");

    const ganancia = totalVentas - totalCompras;

    $("dashGanancia").textContent =
        "$" + ganancia.toLocaleString("es-AR");

}
