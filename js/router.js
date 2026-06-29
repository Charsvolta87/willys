import { iniciarProductos } from "./productos.js";
import { iniciarStock } from "./stock.js";
import { iniciarMovimientos } from "./movimientos.js";
import { iniciarVentas } from "./ventas.js";
import { iniciarCaja } from "./caja.js";

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

            case "movimientos":
                iniciarMovimientos();
                break;

            case "ventas":
                iniciarVentas();
                break;

            case "caja":
                iniciarCaja();
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
