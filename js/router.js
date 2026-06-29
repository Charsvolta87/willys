import { iniciarProductos } from "./productos.js";

export async function cargarPagina(nombre){

const contenido=document.getElementById("contenido");

const pagina=await fetch(`paginas/${nombre}.html`);

contenido.innerHTML=await pagina.text();

if(nombre==="productos"){

iniciarProductos();

}

}
