import { iniciarProductos } from "./productos.js";

export async function cargarPagina(nombre) {

    const contenido = document.getElementById("contenido");
    try {

        const respuesta = await fetch(`paginas/${nombre}.html`);
        if (!respuesta.ok) {
            throw new Error("No se pudo cargar la página");
        }

        const html = await respuesta.text();
        contenido.innerHTML = html;
        switch (nombre) {
            case "productos":
                iniciarProductos();
                break;
            case "dashboard":
                break;

            case "stock":
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
