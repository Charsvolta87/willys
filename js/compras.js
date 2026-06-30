import {db, ref, onValue, push, set, update} from "./firebase.js";

let productos = [];
let compra = [];

const $ = (id) => document.getElementById(id);
export function iniciarCompras() {
    $("buscarCompra").addEventListener("input", filtrarProductos);
    $("btnVaciarCompra").addEventListener("click", vaciarCompra);
    $("btnFinalizarCompra").addEventListener("click", finalizarCompra);
    cargarProductos();
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

        renderProductos(productos);

    });

}

function renderProductos(lista) {
    const contenedor = $("listaProductosCompra");
    contenedor.innerHTML = "";
    lista.forEach(producto => {
        contenedor.innerHTML += `
<div class="producto-venta"
onclick="agregarProductoCompra('${producto.id}')">
<strong>${producto.nombre}</strong>
<br>
Código: ${producto.codigo}
<br>
Stock actual: ${producto.stock}
</div>
`;
    });
}

window.agregarProductoCompra = function(id){
    const producto = productos.find(p=>p.id===id);
    if(!producto) return;

    const existente = compra.find(p=>p.id===id);
    if(existente){
        existente.cantidad++;
    }
    else{
        compra.push({
            id:producto.id,
            codigo:producto.codigo,
            nombre:producto.nombre,
            cantidad:1,
            costo:producto.costo || 0
        });
    }
    renderCompra();

}

function renderCompra(){

    const detalle = $("detalleCompra");
    detalle.innerHTML="";
    let total=0;
    compra.forEach((item,index)=>{
        const subtotal=item.cantidad*item.costo;
        total+=subtotal;
        detalle.innerHTML+=`
<div class="item-ticket">
<div>
<strong>${item.nombre}</strong>
<br>
Cantidad
<input
type="number"
min="1"
value="${item.cantidad}"
onchange="cambiarCantidadCompra(${index},this.value)">
<br>
Costo
<input
type="number"
min="0"
value="${item.costo}"
onchange="cambiarCostoCompra(${index},this.value)">
</div>
<div>
$${subtotal}
<br><br>
<button
onclick="eliminarProductoCompra(${index})">
❌
</button>
</div>
</div>
`;
    });
    $("totalCompra").textContent="$"+total;
}

window.cambiarCantidadCompra=function(index,valor){
    compra[index].cantidad=Number(valor);
    renderCompra();

}
window.cambiarCostoCompra=function(index,valor){
    compra[index].costo=Number(valor);
    renderCompra();
}

window.eliminarProductoCompra=function(index){
    compra.splice(index,1);
    renderCompra();

}
function filtrarProductos(){

    const texto=$("buscarCompra").value.toLowerCase();
    const resultado=productos.filter(p=>
        p.nombre.toLowerCase().includes(texto)||
        p.codigo.toLowerCase().includes(texto)
    );
    renderProductos(resultado);
}

function vaciarCompra(){
    compra=[];
    renderCompra();
}

async function finalizarCompra() {
    if (compra.length === 0) {
        alert("No hay productos en la compra.");
        return;
    }

    const proveedor = $("proveedorCompra").value.trim();
    if (proveedor === "") {
        alert("Ingrese el proveedor.");
        return;
    }
    let total = 0;
    compra.forEach(item => {
        total += item.cantidad * item.costo;
    });

    const compraRef = push(ref(db, "compras"));

    const compraId = compraRef.key;
    await set(compraRef, {
        id: compraId,
        proveedor,
        fecha: new Date().toISOString(),
        total,
        productos: compra
    });
    // Registrar egreso en Caja

    const cajaRef = push(ref(db, "caja"));
    await set(cajaRef, {
        tipo: "egreso",
        origen: "compra",
        proveedor,
        monto: total,
        fecha: new Date().toISOString()
    });
    // Actualizar productos

    for (const item of compra) {
        const producto = productos.find(p => p.id === item.id);
        if (!producto) continue;
        const nuevoStock = Number(producto.stock) + Number(item.cantidad);
        await update(
            ref(db, "productos/" + item.id),
            {
                stock: nuevoStock,
                costo: Number(item.costo),
                ultimaActualizacion: new Date().toISOString()
            }
        );

        const movimientoRef = push(ref(db, "movimientosStock"));

        await set(movimientoRef, {
            productoId: item.id,
            codigo: item.codigo,
            producto: item.nombre,
            categoria: producto.categoria,
            tipo: "entrada",
            cantidad: item.cantidad,
            motivo: "Compra",
            proveedor,
            costoUnitario: item.costo,
            stockAnterior: Number(producto.stock),
            stockNuevo: nuevoStock,
            fecha: new Date().toISOString()
        });
    }

    compra = [];
    $("proveedorCompra").value = "";
    renderCompra();
    alert("Compra registrada correctamente.");
}
