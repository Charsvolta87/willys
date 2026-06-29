import {db, ref, onValue} from "./firebase.js";

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

            const producto = {
                id: item.key,
                ...item.val()
            };
            if (producto.activo) {
                productos.push(producto);
            }
        });
        renderProductos(productos);
    });
}

function renderProductos(lista) {
    const contenedor = $("listaProductosVenta");
    contenedor.innerHTML = "";
    lista.forEach((producto) => {
        contenedor.innerHTML += `
<div class="producto-venta"
onclick="agregarProductoVenta('${producto.id}')">
<strong>${producto.nombre}</strong>
<br>
${producto.codigo}
<br>
$${producto.precio}
<br>
Stock: ${producto.stock}
</div>
`;
    });
}

window.agregarProductoVenta = function(id){

    const producto = productos.find(p => p.id === id);
    if(!producto) return;
    const existente = carrito.find(i => i.id === id);
    if(existente){
        if(existente.cantidad >= producto.stock){
            alert("No hay más stock.");
            return;
        }
        existente.cantidad++;
    }
    else{
        if(producto.stock <= 0){
            alert("Sin stock.");
            return;
        }
        carrito.push({
            id: producto.id,
            codigo: producto.codigo,
            nombre: producto.nombre,
            precio: producto.precio,
            cantidad:1
        });
    }
    renderTicket();
}

function renderTicket(){

    const detalle = $("detalleVenta");
    detalle.innerHTML="";
    let total = 0;
    carrito.forEach((item,index)=>{
        const subtotal = item.precio * item.cantidad;
        total += subtotal;
        detalle.innerHTML += `
<div class="item-ticket">
<div>
<strong>${item.nombre}</strong>
<br>
${item.cantidad} x $${item.precio}
</div>
<div>
$${subtotal}

<button
onclick="eliminarItem(${index})">

❌

</button>

</div>

</div>

`;

    });

    $("totalVenta").textContent="$"+total;

}

window.eliminarItem=function(indice){

    carrito.splice(indice,1);

    renderTicket();

}

function filtrarProductos(){

    const texto = $("buscarVenta").value.toLowerCase();

    const resultado = productos.filter((p)=>

        p.nombre.toLowerCase().includes(texto) ||

        p.codigo.toLowerCase().includes(texto)

    );

    renderProductos(resultado);

}

function vaciarVenta(){

    carrito=[];

    renderTicket();

}

function finalizarVenta(){

    if(carrito.length===0){

        alert("No hay productos.");

        return;

    }

    alert("En el próximo paso la venta se guardará en Firebase.");

}
