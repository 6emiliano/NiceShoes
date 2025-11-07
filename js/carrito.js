// VARIABLES 

let carrito = [];
let descuentoActual = 0;
const IVA = 0.21;

// LOCALSTORAGE

function guardarEnStorage() {
    try {
        localStorage.setItem('niceshoes_productos', JSON.stringify(productos));
        localStorage.setItem('niceshoes_carrito', JSON.stringify(carrito));
        localStorage.setItem('niceshoes_descuento', descuentoActual.toString());
        localStorage.setItem('niceshoes_contador_id', Producto.contadorId.toString());
    } catch (error) {
        showNotification('Error al guardar datos localmente', 'error');
    }
}

function cargarDesdeStorage() {
    try {
        const productosStorage = localStorage.getItem('niceshoes_productos');
        if (productosStorage) {
            const productosData = JSON.parse(productosStorage);
            productos = productosData.map(p => {
                const producto = new Producto(p.nombre, p.precio, p.cantidad, p.categoria, p.stock, p.imagen);
                producto.id = p.id;
                producto.subtotal = p.subtotal;
                producto.fechaCreacion = p.fechaCreacion || new Date().toISOString();
                return producto;
            });
        }
        
        const carritoStorage = localStorage.getItem('niceshoes_carrito');
        if (carritoStorage) {
            carrito = JSON.parse(carritoStorage);
        }
        
        const descuentoStorage = localStorage.getItem('niceshoes_descuento');
        if (descuentoStorage) {
            descuentoActual = parseFloat(descuentoStorage);
        }
        
        const contadorStorage = localStorage.getItem('niceshoes_contador_id');
        if (contadorStorage) {
            Producto.contadorId = parseInt(contadorStorage);
        }
        
        return true;
    } catch (error) {
        return false;
    }
}

// CARRITO

function agregarAlCarrito(productoId) {
    const producto = productos.find(p => p.id === productoId);
    const qtyInput = document.getElementById(`qty-${productoId}`);
    
    if (!producto || !qtyInput) {
        showNotification('Producto no encontrado', 'error');
        return;
    }
    
    const cantidad = parseInt(qtyInput.value);
    
    if (producto.stock < cantidad) {
        showNotification(`Stock insuficiente. Solo hay ${producto.stock} unidades`, 'error');
        return;
    }
    
    const itemCarrito = {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: cantidad,
        subtotal: producto.precio * cantidad
    };
    
    const itemExistente = carrito.find(item => item.id === producto.id);
    if (itemExistente) {
        itemExistente.cantidad += cantidad;
        itemExistente.subtotal = itemExistente.precio * itemExistente.cantidad;
    } else {
        carrito.push(itemCarrito);
    }
    
    producto.stock -= cantidad;
    qtyInput.value = 1;
    
    showNotification(`✅ ${cantidad} ${producto.nombre} agregado(s) al carrito`, 'success');
    actualizarTodaLaUI();
}

function eliminarDelCarrito(index) {
    const item = carrito[index];
    if (item) {
        const producto = productos.find(p => p.id === item.id);
        if (producto) {
            producto.stock += item.cantidad;
        }
        
        carrito.splice(index, 1);
        showNotification(`${item.nombre} eliminado del carrito`, 'info');
        actualizarTodaLaUI();
    }
}

function vaciarCarrito() {
    if (carrito.length === 0) {
        showNotification('El carrito ya está vacío', 'warning');
        return;
    }
    
    carrito.forEach(item => {
        const producto = productos.find(p => p.id === item.id);
        if (producto) {
            producto.stock += item.cantidad;
        }
    });
    
    carrito = [];
    descuentoActual = 0;
    showNotification('Carrito vaciado exitosamente', 'info');
    actualizarTodaLaUI();
}

function renderizarCarrito() {
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    const cartCount = document.getElementById('cartCount');
    
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    cartCount.textContent = totalItems;
    
    cartItems.innerHTML = '';
    
    if (carrito.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">Tu carrito está vacío</p>';
        cartSummary.innerHTML = '';
        return;
    }
    
    let subtotal = 0;
    carrito.forEach((item, index) => {
        const cartItem = document.createElement('div');
        cartItem.className = 'cart-item';
        
        cartItem.innerHTML = `
            <div class="cart-item-info">
                <h4>${item.nombre}</h4>
                <div class="cart-item-details">
                    Precio: $${item.precio.toFixed(2)} | Cantidad: ${item.cantidad}
                </div>
            </div>
            <div style="display: flex; align-items: center; gap: 15px;">
                <div class="cart-item-price">$${item.subtotal.toFixed(2)}</div>
                <button class="remove-item" onclick="eliminarDelCarrito(${index})">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        `;
        
        cartItems.appendChild(cartItem);
        subtotal += item.subtotal;
    });
    
    let montoDescuento = 0;
    if (descuentoActual > 0) {
        montoDescuento = subtotal * (descuentoActual / 100);
    }
    
    let subtotalConDescuento = subtotal - montoDescuento;
    let impuestos = subtotalConDescuento * IVA;
    let total = subtotalConDescuento + impuestos;
    
    cartSummary.innerHTML = `
        <div class="summary-line">
            <span>Subtotal:</span>
            <span>$${subtotal.toFixed(2)}</span>
        </div>
        ${descuentoActual > 0 ? `
        <div class="summary-line">
            <span>Descuento (${descuentoActual}%):</span>
            <span>-$${montoDescuento.toFixed(2)}</span>
        </div>` : ''}
        <div class="summary-line">
            <span>IVA (21%):</span>
            <span>$${impuestos.toFixed(2)}</span>
        </div>
        <div class="summary-line total">
            <span>TOTAL:</span>
            <span>$${total.toFixed(2)}</span>
        </div>
    `;
}

// DESCUENTOS

function aplicarDescuento(porcentaje) {
    if (carrito.length === 0) {
        showNotification('No hay productos en el carrito', 'warning');
        return false;
    }
    
    descuentoActual = porcentaje;
    showNotification(`✅ Descuento del ${porcentaje}% aplicado`, 'success');
    renderizarCarrito();
    guardarEnStorage();
    return true;
}

// CHECKOUT

function finalizarCompra() {
    if (carrito.length === 0) {
        showNotification('No hay productos en el carrito', 'warning');
        return;
    }
    
    let subtotal = carrito.reduce((sum, item) => sum + item.subtotal, 0);
    let montoDescuento = descuentoActual > 0 ? subtotal * (descuentoActual / 100) : 0;
    let subtotalConDescuento = subtotal - montoDescuento;
    let impuestos = subtotalConDescuento * IVA;
    let total = subtotalConDescuento + impuestos;
    
    const checkoutSummary = document.getElementById('checkoutSummary');
    
    let resumenHTML = `
        <div style="margin-bottom: 20px;">
            <h4>📋 Resumen de tu compra:</h4>
            <div style="border: 1px solid var(--border-color); border-radius: var(--border-radius); padding: 15px; margin: 15px 0;">
    `;
    
    carrito.forEach(item => {
        resumenHTML += `
            <div style="display: flex; justify-content: space-between; margin: 8px 0;">
                <span>${item.nombre} x${item.cantidad}</span>
                <span>$${item.subtotal.toFixed(2)}</span>
            </div>
        `;
    });
    
    resumenHTML += `
            </div>
            <div style="border-top: 2px solid var(--border-color); padding-top: 15px;">
                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                    <span>Subtotal:</span>
                    <span>$${subtotal.toFixed(2)}</span>
                </div>
                ${descuentoActual > 0 ? `
                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                    <span>Descuento (${descuentoActual}%):</span>
                    <span>-$${montoDescuento.toFixed(2)}</span>
                </div>` : ''}
                <div style="display: flex; justify-content: space-between; margin: 5px 0;">
                    <span>IVA (21%):</span>
                    <span>$${impuestos.toFixed(2)}</span>
                </div>
                <div style="display: flex; justify-content: space-between; font-size: 1.2rem; font-weight: bold; color: var(--accent-color); border-top: 1px solid var(--border-color); padding-top: 10px; margin-top: 10px;">
                    <span>TOTAL:</span>
                    <span>$${total.toFixed(2)}</span>
                </div>
            </div>
        </div>
    `;
    
    checkoutSummary.innerHTML = resumenHTML;
    document.getElementById('checkoutModal').classList.remove('hidden');
}

function confirmarCompra() {
    const compra = {
        fecha: new Date().toISOString(),
        productos: [...carrito],
        descuento: descuentoActual,
        total: carrito.reduce((sum, item) => sum + item.subtotal, 0)
    };
    
    let historial = JSON.parse(localStorage.getItem('niceshoes_historial') || '[]');
    historial.push(compra);
    localStorage.setItem('niceshoes_historial', JSON.stringify(historial));
    
    carrito = [];
    descuentoActual = 0;
    
    document.getElementById('checkoutModal').classList.add('hidden');
    document.getElementById('cartModal').classList.add('hidden');
    
    showNotification('🎉 ¡Compra realizada exitosamente! Gracias por elegirnos', 'success');
    actualizarTodaLaUI();
}

// NOTIFICACIONES

function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    document.getElementById('notifications').appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 4000);
}

// UI

function actualizarTodaLaUI() {
    renderizarCatalogo();
    renderizarCarrito();
    guardarEnStorage();
}
