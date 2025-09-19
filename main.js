
// DECLARACIÓN DE VARIABLES Y CONSTANTES
// Array de zapatillas disponibles en la tienda
const zapatillas = [
    { id: 1, nombre: "Air Jordan 1 Retro", precio: 180, categoria: "basquet", stock: 5 },
    { id: 2, nombre: "Nike Dunk Low", precio: 120, categoria: "moda", stock: 8 },
    { id: 3, nombre: "Adidas Forum", precio: 100, categoria: "basquet", stock: 3 },
    { id: 4, nombre: "Converse Chuck Taylor", precio: 80, categoria: "moda", stock: 10 },
    { id: 5, nombre: "Nike Air Force 1", precio: 110, categoria: "moda", stock: 6 },
    { id: 6, nombre: "Jordan 4 Retro", precio: 220, categoria: "basquet", stock: 2 }
];

// Variables 
let carrito = [];
let descuentoActual = 0;
const IVA = 0.21; // Constante para el impuesto (21%)

// FUNCIONES DEL SIMULADOR

// Función 1: Mostrar catálogo de zapatillas
function mostrarCatalogo() {
    console.log("=== CATÁLOGO NICESHOES ===");
    console.log("Zapatillas disponibles:");
    
    // Ciclo FOR para recorrer el array de zapatillas
    for (let i = 0; i < zapatillas.length; i++) {
        const zapatilla = zapatillas[i];
        console.log(`${zapatilla.id}. ${zapatilla.nombre} - $${zapatilla.precio} (${zapatilla.categoria}) - Stock: ${zapatilla.stock}`);
    }
    console.log("========================");
}

// Función 2: Agregar producto al carrito
function agregarAlCarrito() {
    mostrarCatalogo();
    
    // Crear lista de zapatillas para el prompt
    let listaZapatillas = "CATÁLOGO NICESHOES:\n\n";
    for (let i = 0; i < zapatillas.length; i++) {
        const zapatilla = zapatillas[i];
        listaZapatillas += `${zapatilla.id}. ${zapatilla.nombre}\n`;
        listaZapatillas += `   Precio: $${zapatilla.precio} | Categoría: ${zapatilla.categoria} | Stock: ${zapatilla.stock}\n\n`;
    }
    listaZapatillas += "Ingresa el ID de la zapatilla que deseas agregar (1-6):";
    
    // Entrada de datos del usuario
    let idProducto = prompt(listaZapatillas);
    
    // Validación con condicionales
    if (idProducto === null) {
        return false; // Usuario canceló
    }
    
    idProducto = parseInt(idProducto);
    
    // Validar que el ID sea válido
    if (isNaN(idProducto) || idProducto < 1 || idProducto > zapatillas.length) {
        alert("ID inválido. Por favor selecciona un número entre 1 y 6.");
        return true; // Continuar en el menú
    }
    
    // Buscar la zapatilla seleccionada
    let zapatillaSeleccionada = null;
    for (let i = 0; i < zapatillas.length; i++) {
        if (zapatillas[i].id === idProducto) {
            zapatillaSeleccionada = zapatillas[i];
            break;
        }
    }
    
    // Verificar stock
    if (zapatillaSeleccionada.stock <= 0) {
        alert("Lo siento, este producto está agotado.");
        return true;
    }
    
    // Pedir cantidad
    let cantidad = prompt(`¿Cuántas unidades de ${zapatillaSeleccionada.nombre} deseas? (Stock disponible: ${zapatillaSeleccionada.stock})`);
    
    if (cantidad === null) {
        return false; // Usuario canceló
    }
    
    cantidad = parseInt(cantidad);
    
    // Validar cantidad
    if (isNaN(cantidad) || cantidad <= 0) {
        alert("Cantidad inválida. Debe ser un número mayor a 0.");
        return true;
    }
    
    if (cantidad > zapatillaSeleccionada.stock) {
        alert(`No hay suficiente stock. Stock disponible: ${zapatillaSeleccionada.stock}`);
        return true;
    }
    
    // Agregar al carrito
    carrito.push({
        id: zapatillaSeleccionada.id,
        nombre: zapatillaSeleccionada.nombre,
        precio: zapatillaSeleccionada.precio,
        cantidad: cantidad,
        subtotal: zapatillaSeleccionada.precio * cantidad
    });
    
    // Actualizar stock
    zapatillaSeleccionada.stock -= cantidad;
    
    alert(`¡${cantidad} ${zapatillaSeleccionada.nombre} agregada(s) al carrito!`);
    console.log(`Producto agregado: ${cantidad}x ${zapatillaSeleccionada.nombre}`);
    
    return true; // Continuar en el menú
}

// Función 3: Calcular total del carrito
function calcularTotal() {
    let subtotal = 0;
    
    console.log("=== CARRITO DE COMPRAS ===");
    
    // Verificar si el carrito está vacío
    if (carrito.length === 0) {
        console.log("El carrito está vacío.");
        alert("Tu carrito está vacío. Agrega productos primero.");
        return;
    }
    
    // Mostrar productos en el carrito y calcular subtotal
    for (let i = 0; i < carrito.length; i++) {
        const item = carrito[i];
        console.log(`${item.nombre} x${item.cantidad} = $${item.subtotal}`);
        subtotal += item.subtotal;
    }
    
    // Aplicar descuento si existe
    let montoDescuento = 0;
    if (descuentoActual > 0) {
        montoDescuento = subtotal * (descuentoActual / 100);
        console.log(`Descuento (${descuentoActual}%): -$${montoDescuento.toFixed(2)}`);
    }
    
    // Calcular subtotal con descuento
    let subtotalConDescuento = subtotal - montoDescuento;
    
    // Calcular impuestos
    let impuestos = subtotalConDescuento * IVA;
    
    // Calcular total final
    let total = subtotalConDescuento + impuestos;
    
    // Mostrar resumen
    console.log("========================");
    console.log(`Subtotal: $${subtotal.toFixed(2)}`);
    if (montoDescuento > 0) {
        console.log(`Descuento: -$${montoDescuento.toFixed(2)}`);
        console.log(`Subtotal con descuento: $${subtotalConDescuento.toFixed(2)}`);
    }
    console.log(`IVA (21%): $${impuestos.toFixed(2)}`);
    console.log(`TOTAL: $${total.toFixed(2)}`);
    console.log("========================");
    
    // Mostrar también en alert
    let resumen = `RESUMEN DE COMPRA:\n`;
    resumen += `Subtotal: $${subtotal.toFixed(2)}\n`;
    if (montoDescuento > 0) {
        resumen += `Descuento (${descuentoActual}%): -$${montoDescuento.toFixed(2)}\n`;
    }
    resumen += `IVA (21%): $${impuestos.toFixed(2)}\n`;
    resumen += `TOTAL: $${total.toFixed(2)}`;
    
    alert(resumen);
}

// Función para aplicar descuento
function aplicarDescuento() {
    let nuevoDescuento = prompt("Ingresa el porcentaje de descuento (0-50):");
    
    if (nuevoDescuento === null) {
        return; // Usuario canceló
    }
    
    nuevoDescuento = parseFloat(nuevoDescuento);
    
    // Validar descuento
    if (isNaN(nuevoDescuento) || nuevoDescuento < 0 || nuevoDescuento > 50) {
        alert("Descuento inválido. Debe ser un número entre 0 y 50.");
        return;
    }
    
    descuentoActual = nuevoDescuento;
    alert(`Descuento del ${descuentoActual}% aplicado correctamente.`);
    console.log(`Descuento actualizado: ${descuentoActual}%`);
}

// Función para finalizar compra
function finalizarCompra() {
    if (carrito.length === 0) {
        alert("No puedes finalizar una compra con el carrito vacío.");
        return;
    }
    
    // Confirmar compra
    let confirmar = confirm("¿Estás seguro de que deseas finalizar la compra?");
    
    if (confirmar) {
        alert("¡Compra realizada con éxito! Gracias por elegir NiceShoes.");
        console.log("=== COMPRA FINALIZADA ===");
        console.log("¡Gracias por tu compra!");
        
        // Limpiar carrito
        carrito = [];
        descuentoActual = 0;
        
        console.log("Carrito limpiado. Puedes realizar una nueva compra.");
    } else {
        console.log("Compra cancelada. Puedes seguir agregando productos.");
    }
}

// FUNCIÓN PRINCIPAL DEL SIMULADOR

function iniciarSimulador() {
    console.log("🏀 ¡BIENVENIDO A NICESHOES! 🏀");
    console.log("Tu tienda de zapatillas de básquet y moda");
    console.log("==========================================");
    
    alert("¡Bienvenido a NiceShoes!\n\nTu simulador de tienda de zapatillas está listo.\nRevisa la consola para ver toda la información detallada.");
    
    let continuar = true;
    
    // Ciclo WHILE para el menú principal
    while (continuar) {
        let opcion = prompt(
            "¿Qué deseas hacer?\n\n" +
            "1. Ver catálogo\n" +
            "2. Agregar al carrito\n" +
            "3. Ver carrito y total\n" +
            "4. Aplicar descuento\n" +
            "5. Finalizar compra\n" +
            "6. Salir\n\n" +
            "Ingresa el número de tu opción:"
        );
        
        // Si el usuario cancela, salir
        if (opcion === null) {
            continuar = false;
            break;
        }
        
        // Convertir a número
        opcion = parseInt(opcion);
        
        // Switch para manejar las opciones del menú
        switch (opcion) {
            case 1:
                mostrarCatalogo();
                break;
            case 2:
                let seguirComprando = agregarAlCarrito();
                if (!seguirComprando) {
                    continuar = false;
                }
                break;
            case 3:
                calcularTotal();
                break;
            case 4:
                aplicarDescuento();
                break;
            case 5:
                finalizarCompra();
                break;
            case 6:
                continuar = confirm("¿Estás seguro de que deseas salir?");
                continuar = !continuar; // Invertir la respuesta
                break;
            default:
                alert("Opción inválida. Por favor selecciona un número del 1 al 6.");
                break;
        }
    }
    
    console.log("¡Gracias por visitar NiceShoes!");
    alert("¡Gracias por visitar NiceShoes! Vuelve pronto.");
}

// EVENT LISTENER PARA EL BOTÓN
// =============================
document.addEventListener('DOMContentLoaded', function() {
    const boton = document.getElementById('iniciarSimulador');
    const resultado = document.getElementById('resultado');
    
    if (boton) {
        boton.addEventListener('click', function() {
            resultado.innerHTML = '<p><strong>Simulador iniciado!</strong> Revisa la consola (F12) para interactuar.</p>';
            iniciarSimulador();
        });
    }
    
    console.log("NiceShoes cargado correctamente. Haz clic en 'Iniciar Simulador' para comenzar.");
});
