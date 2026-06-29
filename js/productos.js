import {

db,
ref,
push,
set,
onValue

} from "./firebase.js";


let tabla = null;


export function iniciarProductos(){

    tabla = document.getElementById("tablaProductos");

    const boton =
    document.getElementById("btnNuevoProducto");

    if(!boton) return;

    boton.addEventListener("click",nuevoProducto);

    cargarProductos();

}



function nuevoProducto(){

    const nombre = prompt("Nombre");

    if(!nombre) return;

    const precio = Number(prompt("Precio"));

    const stock = Number(prompt("Stock"));

    const nuevo = push(ref(db,"productos"));

    set(nuevo,{

        nombre,

        precio,

        stock,

        activo:true

    });

}



function cargarProductos(){

    onValue(ref(db,"productos"),snapshot=>{

        tabla.innerHTML="";

        snapshot.forEach(producto=>{

            const p=producto.val();

            tabla.innerHTML+=`

            <tr>

                <td>${p.nombre}</td>

                <td>$${p.precio}</td>

                <td>${p.stock}</td>

                <td>${p.activo ? "🟢":"🔴"}</td>

            </tr>

            `;

        });

    });

}
