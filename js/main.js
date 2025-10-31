
class Producto {
    static contadorId = 0;
    
    constructor(nombre, precio, cantidad, categoria = "basquet", stock = 0, imagen = null) {
        Producto.contadorId++;
        this.id = Producto.contadorId;
        this.nombre = nombre;
        this.precio = Number(precio);
        this.cantidad = Number(cantidad);
        this.categoria = categoria;
        this.stock = Number(stock);
        this.imagen = imagen;
        this.subtotal = this.calcularSubtotal();
        this.fechaCreacion = new Date().toISOString();
    }
    
    calcularSubtotal() {
        return this.precio * this.cantidad;
    }
    
    actualizarCantidad(nuevaCantidad) {
        this.cantidad = Number(nuevaCantidad);
        this.subtotal = this.calcularSubtotal();
    }
}


// VARIABLES GLOBALES Y CONSTANTES

let productos = [];
let carrito = [];
let descuentoActual = 0;
const IVA = 0.21;

// Configuración FakeStore API
const FAKESTORE_API_URL = 'https://fakestoreapi.com/products';
const CATEGORIA_MAPPING = {
    'electronics': 'basquet',
    'jewelery': 'moda',
    "men's clothing": 'casual',
    "women's clothing": 'running'
};

// Mensajes de bienvenida aleatorios
const mensajesBienvenida = [
    "¡Bienvenido a NiceShoes! 🏀 Las mejores zapatillas",
    "¡Hola! 👋 Encuentra tu estilo perfecto aquí",
    "¡Welcome to NiceShoes! 🎯 Donde cada paso cuenta",
    "¡Saludos! ⭐ Tu tienda de confianza para zapatillas premium",
    "¡Hola deportista! 🏃‍♀️ Las mejores marcas te esperan",
    "¡Hey! 🔥 Descubre las últimas tendencias en calzado"
];

// Imágenes genericas
const imagenesGenericas = {
    'basquet': 'https://media.a24.com/p/e857efde1da985b8bcdcef1867e9dcd1/adjuntos/296/imagenes/008/190/0008190498/las-medidas-la-cancha-basquetbol.jpeg',
    'casual': 'https://media.revistagq.com/photos/5ca5fc2033e7510376153a8b/master/w_1600,c_limit/dress_code_casual_chic_gq_4834.jpg',
    'moda': 'https://www.cursosypostgrados.com/blog/wp-content/uploads/2024/02/moda-modelos-1024x660.jpeg',
    'running': 'https://superiorcads.edu.ar/imgd/certificacion-running-maraton-fondo-medio-fondo-trail-2-019334.jpg'
};

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

// FUNCIONES DE CARGA DE DATOS

function crearProductosOriginales() {
    // Resetear contador para productos originales
    Producto.contadorId = 0;
    
    return [
        new Producto("Air Jordan 1 Retro", 18000, 1, "basquet", 5, "https://acdn-us.mitiendanube.com/stores/001/160/313/products/f6c4b46e1-e4854ab78d79c1611016052167644378-1024-1024.webp"),
        new Producto("Nike Dunk Low", 12000, 1, "casual", 8, "https://acdn-us.mitiendanube.com/stores/986/786/products/img_68031-78526e419e0fb103c516915072797706-1024-1024.webp"),
        new Producto("Adidas Forum", 10000, 1, "basquet", 3, "https://images-cdn.ubuy.com.ar/65c519e2c2b3562b9e488927-adidas-forum-low-men-039-s.jpg"),
        new Producto("Converse Chuck Taylor", 8000, 1, "casual", 10, "https://acdn-us.mitiendanube.com/stores/001/159/143/products/img_0783-6756beb465decda3dc17134505504531-1024-1024.webp"),
        new Producto("Nike Air Force 1", 11000, 1, "moda", 6, "https://www.gotemkicks.com/cdn/shop/products/IMG_0207_720x.jpg?v=1677195765"),
        new Producto("Jordan 4 Retro", 22000, 1, "basquet", 2, "http://admin.digitalsport.com.ar/files/uploads/DIONYSOS%202025/JORDAN%204%20SB/3e3aa5a2-da92-4bac-9ee1-f6de30d3c8d1.jpg")
    ];
}

async function cargarProductosFiltradosAPI() {
    try {
        const response = await fetch(FAKESTORE_API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiProducts = await response.json();
        
        // Filtrar solo productos relevantes de ropa/calzado
        const productosRelevantes = apiProducts.filter(product => {
            const title = product.title.toLowerCase();
            const category = product.category.toLowerCase();
            
            // Filtrar por categorías de ropa y palabras clave relacionadas con calzado/deportes
            return (category.includes('clothing') || category.includes('jewelery')) &&
                   (title.includes('shirt') || title.includes('jacket') || title.includes('bag') || 
                    title.includes('necklace') || title.includes('ring') || title.includes('cotton'));
        });
        
        // Limitar a 6 productos para balance
        const productosLimitados = productosRelevantes.slice(0, 6);
        
        // Mapear productos API a nuestra estructura con IDs a partir del 100
        return productosLimitados.map((apiProduct, index) => {
            const categoria = CATEGORIA_MAPPING[apiProduct.category] || 'moda';
            const precio = Math.round(apiProduct.price * 100); // Convertir a pesos argentinos
            const stock = Math.floor(Math.random() * 8) + 3; // Stock aleatorio entre 3-10
            
            const producto = new Producto(
                apiProduct.title,
                precio,
                1,
                categoria,
                stock,
                apiProduct.image
            );
            
            // Asignar ID personalizado para evitar conflictos
            producto.id = 100 + index + 1;
            producto.apiId = apiProduct.id;
            return producto;
        });
        
    } catch (error) {
        return []; // Retornar array vacío si falla la API
    }
}

async function cargarProductosHibridos() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const catalogoGrid = document.getElementById('catalogoGrid');
    
    try {
        // Mostrar loading spinner
        loadingSpinner.classList.remove('hidden');
        catalogoGrid.classList.add('hidden');
        
        // 1. Crear productos originales
        const productosOriginales = crearProductosOriginales();
        
        // 2. Cargar productos filtrados de API
        const productosAPI = await cargarProductosFiltradosAPI();
        
        // 3. Combinar ambos arrays
        productos = [...productosOriginales, ...productosAPI];
        
        // Ajustar contador de IDs para futuras creaciones
        Producto.contadorId = Math.max(...productos.map(p => p.id));
        
        const totalOriginales = productosOriginales.length;
        const totalAPI = productosAPI.length;
        
        showNotification(`✅ Catálogo híbrido cargado: ${totalOriginales} productos originales + ${totalAPI} de API`, 'success');
        guardarEnStorage();
        
    } catch (error) {
        showNotification('⚠️ Error en carga híbrida, usando solo productos originales', 'warning');
        productos = crearProductosOriginales();
    } finally {
        // Ocultar loading spinner
        loadingSpinner.classList.add('hidden');
        catalogoGrid.classList.remove('hidden');
        renderizarCatalogo();
    }
}

function inicializarProductosDefault() {
    if (productos.length === 0) {
        productos = [
            new Producto("Air Jordan 1 Retro", 18000, 1, "basquet", 5, "https://acdn-us.mitiendanube.com/stores/001/160/313/products/f6c4b46e1-e4854ab78d79c1611016052167644378-1024-1024.webp"),
            new Producto("Nike Dunk Low", 12000, 1, "casual", 8, "https://acdn-us.mitiendanube.com/stores/986/786/products/img_68031-78526e419e0fb103c516915072797706-1024-1024.webp"),
            new Producto("Adidas Forum", 10000, 1, "basquet", 3, "https://images-cdn.ubuy.com.ar/65c519e2c2b3562b9e488927-adidas-forum-low-men-039-s.jpg"),
            new Producto("Converse Chuck Taylor", 8000, 1, "casual", 10, "https://acdn-us.mitiendanube.com/stores/001/159/143/products/img_0783-6756beb465decda3dc17134505504531-1024-1024.webp"),
            new Producto("Nike Air Force 1", 11000, 1, "moda", 6, "https://www.gotemkicks.com/cdn/shop/products/IMG_0207_720x.jpg?v=1677195765"),
            new Producto("Jordan 4 Retro", 22000, 1, "basquet", 2, "http://admin.digitalsport.com.ar/files/uploads/DIONYSOS%202025/JORDAN%204%20SB/3e3aa5a2-da92-4bac-9ee1-f6de30d3c8d1.jpg")
        ];
        guardarEnStorage();
    }
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

// FUNCIONES DE UI/DOM

function mostrarMensajeBienvenidaAleatorio() {
    const mensajeBienvenida = document.getElementById('mensajeBienvenida');
    const indiceAleatorio = Math.floor(Math.random() * mensajesBienvenida.length);
    const mensaje = mensajesBienvenida[indiceAleatorio];
    
    mensajeBienvenida.innerHTML = `<h2>${mensaje}</h2>`;
}

// Imagen para prod
function obtenerImagenProducto(producto) {
    
    if (producto.imagen) {
        return producto.imagen;
    }
    
        return imagenesGenericas[producto.categoria] || imagenesGenericas['casual'];
}

// Función auxiliar para crear elemento imagen con fallback
function crearElementoImagen(producto) {
    const categoryEmoji = {
        'basquet': '🏀',
        'casual': '👟', 
        'moda': '✨',
        'running': '🏃'
    };
    
    const imagenUrl = obtenerImagenProducto(producto);
    const emojiPorDefecto = categoryEmoji[producto.categoria] || '👟';
    
    return `
        <img src="${imagenUrl}" 
             alt="${producto.nombre}"
             loading="lazy"
             onerror="this.style.display='none'; this.parentElement.querySelector('.emoji-fallback').style.display='flex'"
             style="width: 100%; height: 100%; object-fit: cover; object-position: center;">
        <div class="emoji-fallback" style="display: none; width: 100%; height: 100%; justify-content: center; align-items: center; font-size: 3rem; color: var(--text-light);">
            ${emojiPorDefecto}
        </div>
    `;
}

function renderizarCatalogo() {
    const catalogoGrid = document.getElementById('catalogoGrid');
    const contadorProductos = document.getElementById('contadorProductos');
    
    // Limpiar contenido
    catalogoGrid.innerHTML = '';
    
    // Actualizar contador
    contadorProductos.textContent = `${productos.length} productos disponibles`;
    
    // Renderizar cada producto
    productos.forEach(producto => {
        const productCard = document.createElement('div');
        productCard.className = 'product-card fade-in';
        
        const stockBadge = producto.stock > 0 ? 
            `<div class="product-badge">Stock: ${producto.stock}</div>` :
            `<div class="product-badge out-of-stock">Agotado</div>`;
        
        productCard.innerHTML = `
            <div class="product-image">
                ${crearElementoImagen(producto)}
                ${stockBadge}
            </div>
            <div class="product-info">
                <h3 class="product-name">${producto.nombre}</h3>
                <div class="product-price">$${producto.precio.toFixed(2)}</div>
                <div class="product-details">📂 ${producto.categoria}</div>
                <div class="product-details">🆔 ID: ${producto.id}</div>
                <div class="product-actions">
                    <div class="quantity-selector">
                        <button class="qty-btn" onclick="changeQuantity(${producto.id}, -1)">-</button>
                        <input type="number" class="qty-input" id="qty-${producto.id}" value="1" min="1" max="${producto.stock}">
                        <button class="qty-btn" onclick="changeQuantity(${producto.id}, 1)">+</button>
                    </div>
                    <button class="add-to-cart-btn" 
                            onclick="agregarAlCarrito(${producto.id})"
                            ${producto.stock === 0 ? 'disabled' : ''}>
                        ${producto.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                    </button>
                </div>
            </div>
        `;
        
        catalogoGrid.appendChild(productCard);
    });
}

function changeQuantity(productoId, delta) {
    const qtyInput = document.getElementById(`qty-${productoId}`);
    const producto = productos.find(p => p.id === productoId);
    
    if (!qtyInput || !producto) return;
    
    let newValue = parseInt(qtyInput.value) + delta;
    newValue = Math.max(1, Math.min(newValue, producto.stock));
    qtyInput.value = newValue;
}

function renderizarCarrito() {
    const cartItems = document.getElementById('cartItems');
    const cartSummary = document.getElementById('cartSummary');
    const cartCount = document.getElementById('cartCount');
    
    // Actualizar contador en el header
    const totalItems = carrito.reduce((sum, item) => sum + item.cantidad, 0);
    cartCount.textContent = totalItems;
    
    // Limpiar contenido del modal
    cartItems.innerHTML = '';
    
    if (carrito.length === 0) {
        cartItems.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">Tu carrito está vacío</p>';
        cartSummary.innerHTML = '';
        return;
    }
    
    // Renderizar items del carrito
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
    
    // Calcular totales
    let montoDescuento = 0;
    if (descuentoActual > 0) {
        montoDescuento = subtotal * (descuentoActual / 100);
    }
    
    let subtotalConDescuento = subtotal - montoDescuento;
    let impuestos = subtotalConDescuento * IVA;
    let total = subtotalConDescuento + impuestos;
    
    // Mostrar resumen
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

function mostrarResultados(resultados, titulo) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsContent = document.getElementById('resultsContent');
    
    resultsTitle.textContent = titulo;
    resultsContent.innerHTML = '';
    
    if (resultados.length === 0) {
        resultsContent.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">No se encontraron resultados</p>';
    } else {
        // misma logica catlogo principal
        resultados.forEach(producto => {
            const productCard = document.createElement('div');
            productCard.className = 'product-card fade-in';
            
            const stockBadge = producto.stock > 0 ? 
                `<div class="product-badge">Stock: ${producto.stock}</div>` :
                `<div class="product-badge out-of-stock">Agotado</div>`;
            
            productCard.innerHTML = `
                <div class="product-image">
                    ${crearElementoImagen(producto)}
                    ${stockBadge}
                </div>
                <div class="product-info">
                    <h3 class="product-name">${producto.nombre}</h3>
                    <div class="product-price">$${producto.precio.toFixed(2)}</div>
                    <div class="product-details">📂 ${producto.categoria}</div>
                    <div class="product-details">🆔 ID: ${producto.id}</div>
                    <div class="product-actions">
                        <div class="quantity-selector">
                            <button class="qty-btn" onclick="changeQuantity(${producto.id}, -1)">-</button>
                            <input type="number" class="qty-input" id="qty-${producto.id}" value="1" min="1" max="${producto.stock}">
                            <button class="qty-btn" onclick="changeQuantity(${producto.id}, 1)">+</button>
                        </div>
                        <button class="add-to-cart-btn" 
                                onclick="agregarAlCarrito(${producto.id})"
                                ${producto.stock === 0 ? 'disabled' : ''}>
                            ${producto.stock === 0 ? 'Agotado' : 'Agregar al Carrito'}
                        </button>
                    </div>
                </div>
            `;
            
            resultsContent.appendChild(productCard);
        });
    }
    
    resultsSection.classList.remove('hidden');
    
    resultsSection.scrollIntoView({ behavior: 'smooth' });
}


// carrito

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
    
    // Crear item 
    const itemCarrito = {
        id: producto.id,
        nombre: producto.nombre,
        precio: producto.precio,
        cantidad: cantidad,
        subtotal: producto.precio * cantidad
    };
    
    // Verificar si ya existe en el carrito
    const itemExistente = carrito.find(item => item.id === producto.id);
    if (itemExistente) {
        itemExistente.cantidad += cantidad;
        itemExistente.subtotal = itemExistente.precio * itemExistente.cantidad;
    } else {
        carrito.push(itemCarrito);
    }
    
    // Actualizar stock
    producto.stock -= cantidad;
    
    // Resetear quantity selector
    qtyInput.value = 1;
    
    showNotification(`✅ ${cantidad} ${producto.nombre} agregado(s) al carrito`, 'success');
    actualizarTodaLaUI();
}

function eliminarDelCarrito(index) {
    const item = carrito[index];
    if (item) {
        // Devolver stock 
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
    
    // Devolver stock a todos 
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

function buscarProductos(criterio, valor) {
    let resultados = [];
    
    switch (criterio) {
        case 'nombre':
            resultados = productos.filter(p => 
                p.nombre.toLowerCase().includes(valor.toLowerCase())
            );
            break;
        case 'id':
            const id = parseInt(valor);
            if (!isNaN(id)) {
                resultados = productos.filter(p => p.id === id);
            }
            break;
        case 'categoria':
            resultados = productos.filter(p => 
                p.categoria.toLowerCase().includes(valor.toLowerCase())
            );
            break;
    }
    
    mostrarResultados(resultados, `🔍 Búsqueda: "${valor}"`);
    return resultados;
}

function filtrarProductos(filtro) {
    let resultados = [];
    
    switch (filtro.tipo) {
        case 'precio':
            resultados = productos.filter(p => 
                p.precio >= (filtro.min || 0) && p.precio <= (filtro.max || Infinity)
            );
            break;
        case 'categoria':
            resultados = productos.filter(p => 
                p.categoria === filtro.categoria
            );
            break;
        case 'stock':
            resultados = productos.filter(p => 
                p.stock >= (filtro.minimo || 0)
            );
            break;
    }
    
    mostrarResultados(resultados, `🎯 Filtro: ${filtro.tipo}`);
    return resultados;
}

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

async function actualizarPrecios(porcentaje) {
    const result = await Swal.fire({
        title: '¿Confirmar actualización?',
        text: `Se actualizarán todos los precios con ${porcentaje}% de aumento`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#007bff',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Sí, actualizar',
        cancelButtonText: 'Cancelar'
    });

    if (!result.isConfirmed) {
        return false;
    }
    
    productos.forEach(producto => {
        const nuevoPrecio = producto.precio * (1 + porcentaje / 100);
        producto.precio = Math.round(nuevoPrecio * 100) / 100;
        producto.subtotal = producto.calcularSubtotal();
    });
    
    await Swal.fire({
        title: '¡Actualización exitosa!',
        text: `Precios actualizados (+${porcentaje}%)`,
        icon: 'success',
        timer: 2000,
        showConfirmButton: false
    });
    
    actualizarTodaLaUI();
    return true;
}

function finalizarCompra() {
    if (carrito.length === 0) {
        showNotification('No hay productos en el carrito', 'warning');
        return;
    }
    
    // Calcular totales
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
    // Registrar compra
    const compra = {
        fecha: new Date().toISOString(),
        productos: [...carrito],
        descuento: descuentoActual,
        total: carrito.reduce((sum, item) => sum + item.subtotal, 0)
    };
    
    // Guardar historial
    let historial = JSON.parse(localStorage.getItem('niceshoes_historial') || '[]');
    historial.push(compra);
    localStorage.setItem('niceshoes_historial', JSON.stringify(historial));
    
    // Limpiar carrito
    carrito = [];
    descuentoActual = 0;
    
    // Cerrar modales
    document.getElementById('checkoutModal').classList.add('hidden');
    document.getElementById('cartModal').classList.add('hidden');
    
    showNotification('🎉 ¡Compra realizada exitosamente! Gracias por elegirnos', 'success');
    actualizarTodaLaUI();
}

function actualizarTodaLaUI() {
    renderizarCatalogo();
    renderizarCarrito();
    guardarEnStorage();
}


// GESTIÓN DE MODALES Y TABS

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


// EVENT LISTENERS

document.addEventListener('DOMContentLoaded', async function() {
    // Cargar datos
    const hadStoredData = cargarDesdeStorage();
    
    // Si no hay productos almacenados, cargar catálogo híbrido
    if (productos.length === 0) {
        await cargarProductosHibridos();
    } else {
        renderizarCatalogo();
    }
    
    mostrarMensajeBienvenidaAleatorio();
    renderizarCarrito();
    
    
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
    
    // Botones del carrito
    document.getElementById('clearCart').addEventListener('click', vaciarCarrito);
    document.getElementById('checkoutBtn').addEventListener('click', () => {
        closeModal('cartModal');
        finalizarCompra();
    });
    
    // Botones del checkout
    document.getElementById('cancelCheckout').addEventListener('click', () => {
        closeModal('checkoutModal');
    });
    
    document.getElementById('confirmPurchase').addEventListener('click', confirmarCompra);
    
    // Tabs del admin
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            switchTab(btn.dataset.tab);
        });
    });
    
    
    
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
    
    // Filtrar productos
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
    
    
    document.getElementById('clearResults').addEventListener('click', () => {
        document.getElementById('resultsSection').classList.add('hidden');
    });
    
    showNotification('Sistema inicializado correctamente', 'success');
});


window.changeQuantity = changeQuantity;
window.agregarAlCarrito = agregarAlCarrito;
window.eliminarDelCarrito = eliminarDelCarrito;
