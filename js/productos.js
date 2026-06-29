import {db, ref, push, set, update, onValue} from "./firebase.js";

let productos = [];
let productoEditando = null;

const $ = (id) => document.getElementById(id);

export function iniciarProductos() {
    const modal = $("modalProducto");
    $("btnNuevoProducto").onclick = abrirModalNuevo;
    $("cerrarModal").onclick = cerrarModal;
    $("cancelarProducto").onclick = cerrarModal;
    $("guardarProducto").onclick = guardarProducto;
    $("buscarProducto").oninput = buscarProductos;
    window.onclick = (e) => {
        if (e.target === modal) {
            cerrarModal();
        }
    };
    escucharProductos();
}

function abrirModalNuevo() {
    productoEditando = null;
    $("tituloModal").textContent = "Nuevo Producto";
    limpiarFormulario();
    $("modalProducto").classList.add("activo");
}

function cerrarModal() {
    $("modalProducto").classList.remove("activo");
}

function limpiarFormulario() {
    $("codigoProducto").value = "";
    $("nombreProducto").value = "";
    $("categoriaProducto").selectedIndex = 0;
    $("precioProducto").value = "";
    $("costoProducto").value = "";
    $("stockProducto").value = "";
    $("stockMinimoProducto").value = "";
}

function guardarProducto() {
    const producto = {
        codigo: $("codigoProducto").value.trim(),
        nombre: $("nombreProducto").value.trim(),
        categoria: $("categoriaProducto").value,
        precio: Number($("precioProducto").value),
        costo: Number($("costoProducto").value),
        stock: Number($("stockProducto").value),
        stockMinimo: Number($("stockMinimoProducto").value),
        activo: true,
        fechaAlta: new Date().toISOString(),
        ultimaActualizacion: new Date().toISOString()
    };

    if (producto.nombre === "") {
        alert("Ingrese un nombre");
        return;
    }

    if (productoEditando == null) {
        const nuevo = push(ref(db, "productos"));
        set(nuevo, producto);
    }

    else {
        update(
            ref(db, "productos/" + productoEditando),
            producto
        );
    }
    cerrarModal();
}

function escucharProductos() {
    onValue(
        ref(db, "productos"),
        (snapshot) => {
            productos = [];
            snapshot.forEach((item) => {
                productos.push({
                    id: item.key,
                    ...item.val()
                });
            });
            renderTabla(productos);
        }
    );
}

function renderTabla(lista) {
    const tbody = $("tablaProductos");
    tbody.innerHTML = "";
    lista.forEach((producto) => {
        tbody.innerHTML += `
<tr>
<td>${producto.codigo}</td>
<td>${producto.nombre}</td>
<td>${producto.categoria}</td>
<td>$${producto.precio}</td>
<td>$${producto.costo}</td>
<td>${producto.stock}</td>
<td>
<span class="badge ${producto.activo ? "verde" : "rojo"}">
${producto.activo ? "Activo" : "Inactivo"}
</span>
</td>
<td>
<button class="btn-icono editar"
onclick="editarProducto('${producto.id}')">
<i class="fa-solid fa-pen"></i>
</button>
<button class="btn-icono eliminar"
onclick="eliminarProducto('${producto.id}')">
<i class="fa-solid fa-trash"></i>
</button>
</td>
</tr>
`;
    });
    $("cantidadProductos").textContent =
        lista.length + " productos";
}

function buscarProductos() {
    const texto =
        $("buscarProducto").value.toLowerCase();
    const resultado = productos.filter((p) =>
        p.nombre.toLowerCase().includes(texto) ||
        p.codigo.toLowerCase().includes(texto) ||
        p.categoria.toLowerCase().includes(texto)
    );
    renderTabla(resultado);
}

window.editarProducto = function (id) {
    const producto =
        productos.find((p) => p.id === id);
    if (!producto) return;
    productoEditando = id;
    $("tituloModal").textContent = "Editar Producto";
    $("codigoProducto").value = producto.codigo;
    $("nombreProducto").value = producto.nombre;
    $("categoriaProducto").value = producto.categoria;
    $("precioProducto").value = producto.precio;
    $("costoProducto").value = producto.costo;
    $("stockProducto").value = producto.stock;
    $("stockMinimoProducto").value = producto.stockMinimo;
    $("modalProducto").classList.add("activo");
}

window.eliminarProducto = function (id) {
    if (!confirm("¿Eliminar producto?"))
        return;
    update(
        ref(db, "productos/" + id),
        {
            activo: false,
            ultimaActualizacion:
                new Date().toISOString()
        }
    );
}
