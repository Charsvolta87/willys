import {
    db,
    ref,
    push,
    set,
    update,
    onValue
} from "./firebase.js";

let productos = [];
let carrito = [];

const $ = (id) => document.getElementById(id);

export function iniciarVentas() {

    actualizarHora();
    setInterval(actualizarHora, 1000);

    $("buscarVenta").addEventListener("input", filtrarProductos);
    $("btnVaciarVenta").addEventListener("click", vaciarVenta);
    $("btnFinalizarVenta").addEventListener("click", finalizarVenta);

    cargarProductos();
}

function actualizarHora() {
    $("horaActual").textContent = new Date().toLocaleString("es-AR");
}

function cargarProductos() {

    onValue(ref(db, "productos"), (snapshot) => {

        productos = [];

        snapshot.forEach((item) => {

            const p = { id: item.key, ...item.val() };

            if (p.activo) productos.push(p);

        });

        renderProductos(productos);
    });
}

function renderProductos(lista) {

    const contenedor = $("listaProductosVenta");
    contenedor.innerHTML = "";

    lista.forEach((p) => {

        contenedor.innerHTML += `
<div class="producto-venta"
onclick="agregarProductoVenta('${p.id}')">

<strong>${p.nombre}</strong><br>
${p.codigo}<br>
$${p.precio}<br>
Stock: ${p.stock}

</div>
`;
    });
}

window.agregarProductoVenta = function (id) {

    const producto = productos.find(p => p.id === id);
    if (!producto) return;

    const item = carrito.find(p => p.id === id);

    if (item) {

        if (item.cantidad >= producto.stock) {
            alert("No hay stock suficiente.");
            return;
        }

        item.cantidad++;

    } else {

        if (producto.stock <= 0) {
            alert("Sin stock.");
            return;
        }

        carrito.push({
            id: producto.id,
            codigo: producto.codigo,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad: 1
        });

    }

    renderTicket();
}

function renderTicket() {

    const detalle = $("detalleVenta");
    detalle.innerHTML = "";

    let total = 0;

    carrito.forEach((item, index) => {

        const subtotal = item.precio * item.cantidad;
        total += subtotal;

        detalle.innerHTML += `
<div class="item-ticket">

<div>
<strong>${item.nombre}</strong><br>
${item.cantidad} x $${item.precio}
</div>

<div>
$${subtotal}
<button onclick="eliminarItem(${index})">❌</button>
</div>

</div>
`;
    });

    $("totalVenta").textContent = "$" + total;
}

window.eliminarItem = function (index) {
    carrito.splice(index, 1);
    renderTicket();
}

function filtrarProductos() {

    const texto = $("buscarVenta").value.toLowerCase();

    const resultado = productos.filter(p =>
        p.nombre.toLowerCase().includes(texto) ||
        p.codigo.toLowerCase().includes(texto)
    );

    renderProductos(resultado);
}

function vaciarVenta() {
    carrito = [];
    renderTicket();
}

async function finalizarVenta() {

    if (carrito.length === 0) {
        alert("No hay productos en la venta.");
        return;
    }

    const metodoPago = $("formaPago").value;

    const total = carrito.reduce((acc, item) =>
        acc + item.precio * item.cantidad, 0
    );

    const ventaRef = push(ref(db, "ventas"));

    const ventaId = ventaRef.key;

    const venta = {
        id: ventaId,
        fecha: new Date().toISOString(),
        metodoPago,
        total,
        productos: carrito
    };

    await set(ventaRef, venta);

    // 🔥 NUEVO: registrar ingreso en caja
    const cajaRef = push(ref(db, "caja"));

    await set(cajaRef, {

        tipo: "ingreso",
        origen: "venta",
        monto: total,
        fecha: new Date().toISOString()

    });

    for (const item of carrito) {

        const prodRef = ref(db, "productos/" + item.id);

        const snapshot = await new Promise((resolve) => {
            onValue(prodRef, (snap) => resolve(snap), { onlyOnce: true });
        });

        const prod = snapshot.val();

        const nuevoStock = prod.stock - item.cantidad;

        await update(prodRef, {
            stock: nuevoStock,
            ultimaActualizacion: new Date().toISOString()
        });

        const movRef = push(ref(db, "movimientosStock"));

        await set(movRef, {

            productoId: item.id,
            codigo: item.codigo,
            producto: item.nombre,
            tipo: "salida",
            cantidad: item.cantidad,
            motivo: "Venta",
            stockAnterior: prod.stock,
            stockNuevo: nuevoStock,
            fecha: new Date().toISOString()

        });

    }

    carrito = [];
    renderTicket();

    alert("Venta registrada correctamente ✔");
}
