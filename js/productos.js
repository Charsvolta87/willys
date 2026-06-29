import{db,ref,push,set,onValue}from "./firebase.js";

const tabla=document.getElementById("tablaProductos");

export function iniciarProductos(){

const boton=document.getElementById("btnNuevoProducto");
if(!boton)return;
boton.addEventListener("click",nuevoProducto);
cargarProductos();
}

function nuevoProducto(){
const nombre=prompt("Nombre");
if(!nombre)return;
const precio=prompt("Precio");
const stock=prompt("Stock");
const id=push(ref(db,"productos"));
set(id,{

nombre,
precio:Number(precio),
stock:Number(stock),
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
<td>${p.activo?"🟢":"🔴"}</td>
</tr>
`;
});
});
}
