import {
    db,
    ref,
    onValue,
    push,
    set,
    update
} from "./firebase.js";


export function escucharProductos(callback) {

    onValue(ref(db, "productos"), (snapshot) => {

        const productos = [];

        snapshot.forEach((item) => {

            productos.push({

                id: item.key,

                ...item.val()

            });

        });

        callback(productos);

    });

}


export async function registrarMovimiento(producto, datos) {

    let nuevoStock = producto.stock;

    if (datos.tipo === "entrada") {

        nuevoStock += datos.cantidad;

    } else {

        nuevoStock -= datos.cantidad;

    }

    await update(

        ref(db, "productos/" + producto.id),

        {

            stock: nuevoStock,

            ultimaActualizacion: new Date().toISOString()

        }

    );

    const movimiento = push(ref(db, "movimientosStock"));

    await set(movimiento, {

        productoId: producto.id,

        codigo: producto.codigo,

        producto: producto.nombre,

        categoria: producto.categoria,

        tipo: datos.tipo,

        cantidad: datos.cantidad,

        motivo: datos.motivo,

        observacion: datos.observacion,

        stockAnterior: producto.stock,

        stockNuevo: nuevoStock,

        fecha: new Date().toISOString()

    });

}
