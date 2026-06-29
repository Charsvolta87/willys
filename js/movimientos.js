import {db, ref, onValue} from "./firebase.js";

let movimientos = [];

const $ = (id) => document.getElementById(id);
export function iniciarMovimientos() {
    $("buscarMovimiento").addEventListener("input", filtrarMovimientos);
    cargarMovimientos();
}

function cargarMovimientos() {
    onValue(ref(db, "movimientosStock"), (snapshot) => {
        movimientos = [];
        snapshot.forEach((item) => {
            movimientos.push({
                id: item.key,
                ...item.val()
            });
        });
        movimientos.sort((a, b) => {
            return new Date(b.fecha) - new Date(a.fecha);
        });
        renderTabla(movimientos);
    });
}

function renderTabla(lista) {
    const tbody = $("tablaMovimientos");
    tbody.innerHTML = "";
    lista.forEach((movimiento) => {
        tbody.innerHTML += `
<tr>
<td>${formatearFecha(movimiento.fecha)}</td>
<td>${movimiento.codigo}</td>
<td>${movimiento.producto}</td>
<td>${iconoTipo(movimiento.tipo)}</td>
<td>${movimiento.cantidad}</td>
<td>${movimiento.stockAnterior}</td>
<td>${movimiento.stockNuevo}</td>
<td>${movimiento.motivo}</td>
</tr>
`;
    });
    $("cantidadMovimientos").textContent =
        `${lista.length} movimientos`;
}

function filtrarMovimientos() {
    const texto =
        $("buscarMovimiento").value.toLowerCase();
    const resultado = movimientos.filter((m) =>
        m.producto.toLowerCase().includes(texto) ||
        m.codigo.toLowerCase().includes(texto) ||
        m.motivo.toLowerCase().includes(texto)
    );
    renderTabla(resultado);
}

function formatearFecha(fechaISO) {
    const fecha = new Date(fechaISO);
    return fecha.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit"
    });
}

function iconoTipo(tipo) {
    if (tipo === "entrada") {
        return "🟢 Entrada";
    }
    return "🔴 Salida";
}
