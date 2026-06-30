import {db, ref, onValue} from "./firebase.js";

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

/*==================================================
    RANKING DE PRODUCTOS
==================================================*/

function mostrarRankingProductos(listaVentas) {

    const contenedor = $("rankingProductos");
    if (!contenedor) return;
    contenedor.innerHTML = "";
    const ranking = {};
    listaVentas.forEach(venta => {
        if (!venta.productos) return;
        venta.productos.forEach(producto => {
            if (!ranking[producto.nombre]) {
                ranking[producto.nombre] = 0;
            }
            ranking[producto.nombre] += Number(producto.cantidad);
        });
    });

    const ordenados = Object.entries(ranking)
        .sort((a, b) => b[1] - a[1]);

    if (ordenados.length === 0) {

        contenedor.innerHTML = `
            <div class="item-estadistica">
                No hay ventas para este período.
            </div>
        `;

        return;
    }

    const maximo = ordenados[0][1];
    ordenados.forEach(([nombre, cantidad]) => {

        const porcentaje = (cantidad / maximo) * 100;
        contenedor.innerHTML += `
        <div class="item-estadistica">
            <div style="flex:1;">
                <strong>${nombre}</strong>
                <div class="barra-ranking"
                    style="width:${porcentaje}%;">
                </div>
            </div>
            <div>
                ${cantidad}
            </div>
        </div>
        `;
    });
}

/*==================================================
    MÉTODOS DE PAGO
==================================================*/

function mostrarMetodosPago(listaVentas) {
    const contenedor = $("metodosPago");
    if (!contenedor) return;
    contenedor.innerHTML = "";
    const metodos = {};
    listaVentas.forEach(venta => {
        const metodo = venta.metodoPago || "Sin especificar";
        if (!metodos[metodo]) {
            metodos[metodo] = 0;
        }
        metodos[metodo]++;
    });
    const lista = Object.entries(metodos)
        .sort((a, b) => b[1] - a[1]);

    if (lista.length === 0) {

        contenedor.innerHTML = `
            <div class="item-estadistica">
                No hay información.
            </div>
        `;

        return;
    }

    lista.forEach(([metodo, cantidad]) => {

        contenedor.innerHTML += `

        <div class="item-estadistica">
            <strong>${metodo}</strong>
            <span>${cantidad} ventas</span>
        </div>
        `;
    });
}

/*==================================================
    PRODUCTOS SIN STOCK
==================================================*/

function mostrarProductosSinStock() {

    const contenedor = $("productosSinStock");
    if (!contenedor) return;
    contenedor.innerHTML = "";
    const sinStock = productos.filter(p => Number(p.stock) <= 0);
    if (sinStock.length === 0) {
        contenedor.innerHTML = `
            <div class="item-estadistica">
                ✅ Todos los productos tienen stock.
            </div>
        `;
        return;
    }

    sinStock.forEach(producto => {
        contenedor.innerHTML += `
        <div class="item-estadistica">
            <div>
                <strong>${producto.nombre}</strong>
            </div>
            <span style="color:#EA5455;">
                Sin stock
            </span>
        </div>
        `;
    });
}
