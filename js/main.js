
// MODAL Y TABS

function openModal(modalId) {
    document.getElementById(modalId).classList.remove('hidden');
}

function closeModal(modalId) {
    document.getElementById(modalId).classList.add('hidden');
}

function switchTab(tabName) {
    document.querySelectorAll('.tab-content').forEach(tab => {
        tab.classList.remove('active');
    });
    
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    document.getElementById(tabName + 'Tab').classList.add('active');
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
}

// CARGAR EL DOM

document.addEventListener('DOMContentLoaded', async function() {
    const hadStoredData = cargarDesdeStorage();
    
    if (productos.length === 0) {
        await cargarProductosHibridos();
    } else {
        renderizarCatalogo();
    }
    
    mostrarMensajeBienvenidaAleatorio();
    renderizarCarrito();
    
    // Event listeners modal
    document.getElementById('cartIcon').addEventListener('click', () => {
        openModal('cartModal');
    });
    
    document.getElementById('adminBtn').addEventListener('click', () => {
        openModal('adminModal');
    });
    
    document.getElementById('closeCart').addEventListener('click', () => {
        closeModal('cartModal');
    });
    
    document.getElementById('closeAdmin').addEventListener('click', () => {
        closeModal('adminModal');
    });
    
    document.getElementById('closeCheckout').addEventListener('click', () => {
        closeModal('checkoutModal');
    });
    
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.parentElement.classList.add('hidden');
            }
        });
    });
    
    // Event listeners carrito
    document.getElementById('clearCart').addEventListener('click', vaciarCarrito);
    document.getElementById('checkoutBtn').addEventListener('click', () => {
        closeModal('cartModal');
        finalizarCompra();
    });
    
    // Event listeners checkout
    document.getElementById('cancelCheckout').addEventListener('click', () => {
        closeModal('checkoutModal');
    });
    
    document.getElementById('confirmPurchase').addEventListener('click', confirmarCompra);
    
    // Event listeners admin
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    // PANEL ADMIN
    
    // Crear producto
    document.getElementById('formCrearProducto').addEventListener('submit', (e) => {
        e.preventDefault();
        const nombre = document.getElementById('nombreProducto').value.trim();
        const precio = parseFloat(document.getElementById('precioProducto').value);
        const stock = parseInt(document.getElementById('stockProducto').value);
        const categoria = document.getElementById('categoriaProducto').value;
        const imagen = document.getElementById('imagenProducto').value.trim() || null;
        
        const nuevoProducto = new Producto(nombre, precio, 1, categoria, stock, imagen);
        productos.push(nuevoProducto);
        
        const mensajeImagen = imagen ? ' con imagen personalizada' : ' con imagen genérica';
        showNotification(`✅ Producto "${nombre}" creado con ID ${nuevoProducto.id}${mensajeImagen}`, 'success');
        actualizarTodaLaUI();
        
        e.target.reset();
        closeModal('adminModal');
    });
    
    // Buscar producto
    document.getElementById('formBuscarProducto').addEventListener('submit', (e) => {
        e.preventDefault();
        const criterio = document.getElementById('criterioBusqueda').value;
        const valor = document.getElementById('valorBusqueda').value.trim();
        
        buscarProductos(criterio, valor);
        e.target.reset();
        closeModal('adminModal');
    });
    
    // Cambio de tipo de filtro
    document.getElementById('tipoFiltro').addEventListener('change', (e) => {
        document.getElementById('filtrosPrecio').classList.add('hidden');
        document.getElementById('filtrosCategoria').classList.add('hidden');
        document.getElementById('filtrosStock').classList.add('hidden');
        
        const tipo = e.target.value;
        if (tipo === 'precio') {
            document.getElementById('filtrosPrecio').classList.remove('hidden');
        } else if (tipo === 'categoria') {
            document.getElementById('filtrosCategoria').classList.remove('hidden');
        } else if (tipo === 'stock') {
            document.getElementById('filtrosStock').classList.remove('hidden');
        }
    });
    
    // Filtrar productos
    document.getElementById('formFiltrarProductos').addEventListener('submit', (e) => {
        e.preventDefault();
        const tipo = document.getElementById('tipoFiltro').value;
        let filtro = { tipo };
        
        switch (tipo) {
            case 'precio':
                filtro.min = parseFloat(document.getElementById('precioMin').value) || 0;
                filtro.max = parseFloat(document.getElementById('precioMax').value) || Infinity;
                break;
            case 'categoria':
                filtro.categoria = document.getElementById('categoriaFiltro').value;
                break;
            case 'stock':
                filtro.minimo = parseInt(document.getElementById('stockMinimo').value) || 0;
                break;
        }
        
        filtrarProductos(filtro);
        e.target.reset();
        closeModal('adminModal');
    });
    
    // Actualizar precios
    document.getElementById('formActualizarPrecios').addEventListener('submit', (e) => {
        e.preventDefault();
        const porcentaje = parseFloat(document.getElementById('porcentajeAumento').value);
        const confirmacion = document.getElementById('confirmarActualizacion').checked;
        
        if (!confirmacion) {
            showNotification('Debes confirmar la actualización de precios', 'warning');
            return;
        }
        
        actualizarPrecios(porcentaje);
        e.target.reset();
        closeModal('adminModal');
    });
    
    // Aplicar descuento
    document.getElementById('formDescuento').addEventListener('submit', (e) => {
        e.preventDefault();
        const porcentaje = parseFloat(document.getElementById('porcentajeDescuento').value);
        
        aplicarDescuento(porcentaje);
        e.target.reset();
        closeModal('adminModal');
    });
    
    // Limpiar resultados
    document.getElementById('clearResults').addEventListener('click', () => {
        document.getElementById('resultsSection').classList.add('hidden');
    });
    
    showNotification('Sistema inicializado correctamente', 'success');
});

// Exponer funciones
window.changeQuantity = changeQuantity;
window.agregarAlCarrito = agregarAlCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
