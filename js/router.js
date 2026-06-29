import { iniciarProductos } from "./productos.js";
import { iniciarStock } from "./stock.js";

export async function cargarPagina(nombre) {

    const contenido = document.getElementById("contenido");

    try {

        const respuesta = await fetch(`paginas/${nombre}.html`);

        if (!respuesta.ok) {

            throw new Error("No se pudo cargar la página");

        }

        contenido.innerHTML = await respuesta.text();

        switch (nombre) {

            case "dashboard":
                break;

            case "productos":
                iniciarProductos();
                break;

            case "stock":
                iniciarStock();
                break;

            case "ventas":
                break;

            case "compras":
                break;

            case "clientes":
                break;

            case "empleados":
                break;

            case "estadisticas":
                break;

            case "configuracion":
                break;

        }

    }

    catch (error) {

        console.error(error);

        contenido.innerHTML = `

        <div class="tarjeta">

            <h2>Error</h2>

            <p>No se pudo cargar la página.</p>

        </div>

        `;

    }

}
