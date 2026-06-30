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


/*==================================================
    STOCK CRÍTICO
==================================================*/

function mostrarStockCritico() {

    const contenedor = $("stockCritico");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    const criticos = productos
        .filter(p => Number(p.stock) <= 5)
        .sort((a, b) => Number(a.stock) - Number(b.stock));

    if (criticos.length === 0) {

        contenedor.innerHTML = `
            <div class="item-dashboard">
                <span>✅ No hay productos con stock crítico.</span>
            </div>
        `;

        return;
    }

    criticos.forEach(producto => {

        contenedor.innerHTML += `

        <div class="item-dashboard">

            <div>

                <strong>${producto.nombre}</strong><br>
                Código: ${producto.codigo}

            </div>

            <div class="stock-bajo">

                ${producto.stock}

            </div>

        </div>

        `;

    });

}


/*==================================================
    ÚLTIMAS VENTAS
==================================================*/

function mostrarUltimasVentas() {

    const contenedor = $("ultimasVentas");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    const lista = [...ventas]
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 10);

    if (lista.length === 0) {

        contenedor.innerHTML = `
            <div class="item-dashboard">
                No hay ventas registradas.
            </div>
        `;

        return;
    }

    lista.forEach(venta => {

        contenedor.innerHTML += `

        <div class="item-dashboard">

            <div>

                ${new Date(venta.fecha).toLocaleString("es-AR")}

            </div>

            <div>

                $${Number(venta.total).toLocaleString("es-AR")}

            </div>

        </div>

        `;

    });

}


/*==================================================
    ÚLTIMOS GASTOS
==================================================*/

function mostrarUltimosGastos() {

    const contenedor = $("ultimosGastos");

    if (!contenedor) return;

    contenedor.innerHTML = "";

    const gastos = caja
        .filter(m => m.tipo === "egreso")
        .sort((a, b) => new Date(b.fecha) - new Date(a.fecha))
        .slice(0, 10);

    if (gastos.length === 0) {

        contenedor.innerHTML = `
            <div class="item-dashboard">
                No hay gastos registrados.
            </div>
        `;

        return;
    }

    gastos.forEach(gasto => {

        contenedor.innerHTML += `

        <div class="item-dashboard">

            <div>

                <strong>${gasto.origen || gasto.motivo || "Egreso"}</strong><br>

                ${new Date(gasto.fecha).toLocaleString("es-AR")}

            </div>

            <div>

                $${Number(gasto.monto).toLocaleString("es-AR")}

            </div>

        </div>

        `;

    });

}


/*==================================================
    PRODUCTO MÁS VENDIDO
==================================================*/

function obtenerProductoMasVendido() {

    const contador = {};

    ventas.forEach(venta => {

        if (!venta.productos) return;

        venta.productos.forEach(item => {

            if (!contador[item.nombre]) {

                contador[item.nombre] = 0;

            }

            contador[item.nombre] += Number(item.cantidad);

        });

    });

    let nombre = "-";
    let cantidad = 0;

    Object.keys(contador).forEach(producto => {

        if (contador[producto] > cantidad) {

            cantidad = contador[producto];
            nombre = producto;

        }

    });

    return {
        nombre,
        cantidad
    };

}


/*==================================================
    CANTIDAD DE VENTAS
==================================================*/

function cantidadVentasHoy() {

    const hoy = new Date().toDateString();

    return ventas.filter(v =>
        new Date(v.fecha).toDateString() === hoy
    ).length;

}


/*==================================================
    TICKET PROMEDIO
==================================================*/

function ticketPromedioHoy() {

    const hoy = new Date().toDateString();

    const ventasHoy = ventas.filter(v =>
        new Date(v.fecha).toDateString() === hoy
    );

    if (ventasHoy.length === 0)
        return 0;

    let total = 0;

    ventasHoy.forEach(v => {

        total += Number(v.total);

    });

    return total / ventasHoy.length;

}



/*==================================================
    UTILIDADES
==================================================*/

function formatearDinero(valor) {

    return "$" + Number(valor).toLocaleString("es-AR");

}

function obtenerVentasHoy() {

    const hoy = new Date().toDateString();

    return ventas.filter(v =>
        new Date(v.fecha).toDateString() === hoy
    );

}


/*==================================================
    INDICADORES
==================================================*/

function actualizarIndicadores() {

    agregarIndicadores();

    actualizarColores();

}


/*==================================================
    CREA LAS TARJETAS SI NO EXISTEN
==================================================*/

function agregarIndicadores() {

    const grid = document.querySelector(".dashboard-grid");

    if (!grid) return;

    if (document.getElementById("cardProducto")) return;

    grid.insertAdjacentHTML("beforeend", `

<div class="card-dashboard" id="cardProducto">

    <h3>🌭 Más vendido</h3>

    <h2 id="productoTop">-</h2>

    <small id="cantidadTop">0 unidades</small>

</div>

<div class="card-dashboard" id="cardTicket">

    <h3>🧾 Ticket Promedio</h3>

    <h1 id="ticketPromedio">$0</h1>

</div>

<div class="card-dashboard" id="cardCantidad">

    <h3>🛒 Ventas Hoy</h3>

    <h1 id="cantidadVentas">0</h1>

</div>

<div class="card-dashboard" id="cardActualizacion">

    <h3>🕒 Actualización</h3>

    <h2 id="horaDashboard">--:--</h2>

</div>

`);

    refrescarIndicadores();

}


/*==================================================
    ACTUALIZA LOS INDICADORES
==================================================*/

function refrescarIndicadores() {

    const top = obtenerProductoMasVendido();

    $("productoTop").textContent = top.nombre;

    $("cantidadTop").textContent =
        top.cantidad + " unidades";

    $("ticketPromedio").textContent =
        formatearDinero(ticketPromedioHoy());

    $("cantidadVentas").textContent =
        cantidadVentasHoy();

    $("horaDashboard").textContent =
        new Date().toLocaleTimeString("es-AR");

}


/*==================================================
    ALERTAS
==================================================*/

function actualizarColores() {

    colorearGanancia();

    colorearCaja();

}


function colorearGanancia() {

    const tarjeta = $("dashGanancia");

    if (!tarjeta) return;

    const texto = tarjeta.textContent
        .replace("$", "")
        .replace(/\./g, "")
        .replace(",", ".");

    const valor = Number(texto);

    if (valor > 0) {

        tarjeta.style.color = "#00C853";

    }

    else if (valor < 0) {

        tarjeta.style.color = "#FF5252";

    }

    else {

        tarjeta.style.color = "#FFC107";

    }

}


function colorearCaja() {

    const tarjeta = $("dashCaja");

    if (!tarjeta) return;

    const texto = tarjeta.textContent
        .replace("$", "")
        .replace(/\./g, "")
        .replace(",", ".");

    const valor = Number(texto);

    if (valor <= 0) {

        tarjeta.style.color = "#FF5252";

    }

    else {

        tarjeta.style.color = "#00C853";

    }

}


/*==================================================
    REEMPLAZAMOS actualizarDashboard()
==================================================*/

const actualizarDashboardOriginal = actualizarDashboard;

actualizarDashboard = function () {

    actualizarDashboardOriginal();

    refrescarIndicadores();

    actualizarIndicadores();

};
