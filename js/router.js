export async function cargarPagina(nombre) {
    const contenedor =
        document.getElementById("contenido");
    try {
        const respuesta =
            await fetch(`paginas/${nombre}.html`);

        const html =
            await respuesta.text();

        contenedor.innerHTML = html;
    }

    catch (error) {
        contenedor.innerHTML =
        `
           <div class="tarjeta">
                <h2>Error</h2>
                <p>No se pudo cargar la página.</p>
            </div>
        `;

        console.error(error);
    }

}
