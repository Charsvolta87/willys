import {
    db,
    ref,
    onValue,
    push,
    set,
    update
} from "./firebase.js";

let productos = [];
let productoActual = null;

const $ = (id) => document.getElementById(id);

export function iniciarStock() {

    $("buscarStock").addEventListener("input", filtrarStock);

    $("cerrarModalStock").addEventListener("click", cerrarModal);

    $("cancelarMovimiento").addEventListener("click", cerrarModal);

    $("guardarMovimiento").addEventListener("click", guardarMovimiento);

    window.addEventListener("click", (e) => {

        if (e.target === $("modalStock")) {

            cerrarModal();

        }

    });

    cargarStock();

}

function cargarStock() {

    onValue(ref(db, "productos"), (snapshot) => {

        productos = [];

        snapshot.forEach((item) => {

            productos.push({

                id: item.key,

                ...item.val()

            });

        });

        renderTabla(productos);

    });

}

function renderTabla(lista) {

    const tbody = $("tablaStock");

    tbody.innerHTML = "";

    lista.forEach((producto) => {

        const estado = producto.stock <= producto.stockMinimo
            ? '<span class="badge rojo">Stock Bajo</span>'
            : '<span class="badge verde">Disponible</span>';

        tbody.innerHTML += `

<tr>

<td>${producto.codigo}</td>

<td>${producto.nombre}</td>

<td>${producto.categoria}</td>

<td>${producto.stock}</td>

<td>${producto.stockMinimo}</td>

<td>${estado}</td>

<td>

<button
class="btn btn-principal"
onclick="abrirMovimiento('${producto.id}')">

Movimiento

</button>

</td>

</tr>

`;

    });

    $("cantidadStock").textContent = `${lista.length} productos`;

}

function filtrarStock() {

    const texto = $("buscarStock").value.toLowerCase();

    const resultado = productos.filter((producto) =>

        producto.nombre.toLowerCase().includes(texto) ||

        producto.codigo.toLowerCase().includes(texto) ||

        producto.categoria.toLowerCase().includes(texto)

    );

    renderTabla(resultado);

}

window.abrirMovimiento = function(id) {

    productoActual = productos.find(p => p.id === id);

    if (!productoActual) return;

    $("stockProductoNombre").value = productoActual.nombre;

    $("cantidadMovimiento").value = "";

    $("observacionMovimiento").value = "";

    $("tipoMovimiento").value = "entrada";

    $("motivoMovimiento").value = "Compra";

    $("modalStock").classList.add("activo");

}

function cerrarModal() {

    $("modalStock").classList.remove("activo");

}

async function guardarMovimiento() {

    if (!productoActual) return;

    const cantidad = Number($("cantidadMovimiento").value);

    if (cantidad <= 0) {

        alert("Ingrese una cantidad válida.");

        return;

    }

    const tipo = $("tipoMovimiento").value;

    let nuevoStock = productoActual.stock;

    if (tipo === "entrada") {

        nuevoStock += cantidad;

    } else {

        nuevoStock -= cantidad;

        if (nuevoStock < 0) {

            alert("No hay stock suficiente.");

            return;

        }

    }

    await update(

        ref(db, "productos/" + productoActual.id),

        {

            stock: nuevoStock,

            ultimaActualizacion: new Date().toISOString()

        }

    );

    const movimiento = push(ref(db, "movimientosStock"));

    await set(movimiento, {

        productoId: productoActual.id,

        codigo: productoActual.codigo,

        producto: productoActual.nombre,

        categoria: productoActual.categoria,

        tipo,

        cantidad,

        motivo: $("motivoMovimiento").value,

        observacion: $("observacionMovimiento").value,

        stockAnterior: productoActual.stock,

        stockNuevo: nuevoStock,

        fecha: new Date().toISOString()

    });

    cerrarModal();

}
