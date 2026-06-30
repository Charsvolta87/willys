import {
    db,
    ref,
    onValue
} from "./firebase.js";

let ventas = [];
let compras = [];
let productos = [];

const $ = (id) => document.getElementById(id);

export function iniciarEstadisticas() {

    cargarVentas();
    cargarCompras();
    cargarProductos();

    $("filtroEstadisticas").addEventListener(
        "change",
        actualizarEstadisticas
    );

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

        actualizarEstadisticas();

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

        actualizarEstadisticas();

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

        actualizarEstadisticas();

    });

}

function actualizarEstadisticas() {

    const filtro = $("filtroEstadisticas").value;

    const ventasFiltradas = filtrarPeriodo(ventas, filtro);

    const comprasFiltradas = filtrarPeriodo(compras, filtro);

    mostrarResumen(ventasFiltradas, comprasFiltradas);

    mostrarRankingProductos(ventasFiltradas);

    mostrarProductosSinStock();

    mostrarMetodosPago(ventasFiltradas);

}

function filtrarPeriodo(lista, periodo) {

    const hoy = new Date();

    return lista.filter(item => {

        const fecha = new Date(item.fecha);

        switch (periodo) {

            case "hoy":

                return fecha.toDateString() === hoy.toDateString();

            case "semana":

                return (hoy - fecha) <= 7 * 24 * 60 * 60 * 1000;

            case "mes":

                return fecha.getMonth() === hoy.getMonth() &&
                       fecha.getFullYear() === hoy.getFullYear();

            case "anio":

                return fecha.getFullYear() === hoy.getFullYear();

            default:

                return true;

        }

    });

}

function mostrarResumen(ventasLista, comprasLista) {

    let totalVentas = 0;
    let totalCompras = 0;

    ventasLista.forEach(v => {

        totalVentas += Number(v.total);

    });

    comprasLista.forEach(c => {

        totalCompras += Number(c.total);

    });

    $("estadVentas").textContent =
        "$" + totalVentas.toLocaleString("es-AR");

    $("estadCompras").textContent =
        "$" + totalCompras.toLocaleString("es-AR");

    $("estadGanancia").textContent =
        "$" + (totalVentas - totalCompras).toLocaleString("es-AR");

    $("estadCantidad").textContent =
        ventasLista.length;

}
