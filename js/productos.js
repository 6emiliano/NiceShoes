// PRODUCTO

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

// VARIABLES GLOBALES DE PRODUCTOS

let productos = [];

const FAKESTORE_API_URL = 'https://fakestoreapi.com/products';
const CATEGORIA_MAPPING = {
    'electronics': 'basquet',
    'jewelery': 'moda',
    "men's clothing": 'casual',
    "women's clothing": 'running'
};

const mensajesBienvenida = [
    "¡Bienvenido a NiceShoes! 🏀 Las mejores zapatillas",
    "¡Hola! 👋 Encuentra tu estilo perfecto aquí",
    "¡Welcome to NiceShoes! 🎯 Donde cada paso cuenta",
    "¡Saludos! ⭐ Tu tienda de confianza para zapatillas premium",
    "¡Hola deportista! 🏃‍♀️ Las mejores marcas te esperan",
    "¡Hey! 🔥 Descubre las últimas tendencias en calzado"
];

const imagenesGenericas = {
    'basquet': 'https://media.a24.com/p/e857efde1da985b8bcdcef1867e9dcd1/adjuntos/296/imagenes/008/190/0008190498/las-medidas-la-cancha-basquetbol.jpeg',
    'casual': 'https://media.revistagq.com/photos/5ca5fc2033e7510376153a8b/master/w_1600,c_limit/dress_code_casual_chic_gq_4834.jpg',
    'moda': 'https://www.cursosypostgrados.com/blog/wp-content/uploads/2024/02/moda-modelos-1024x660.jpeg',
    'running': 'https://superiorcads.edu.ar/imgd/certificacion-running-maraton-fondo-medio-fondo-trail-2-019334.jpg'
};

// CARGA DE DATOS

async function cargarProductosDesdeJSON() {
    try {
        const response = await fetch('data/productos.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const productosData = await response.json();
        
        return productosData.map(p => {
            const producto = new Producto(p.nombre, p.precio, p.cantidad, p.categoria, p.stock, p.imagen);
            producto.id = p.id;
            producto.subtotal = p.precio * p.cantidad;
            return producto;
        });
    } catch (error) {
        showNotification('Error al cargar productos desde JSON', 'error');
        return [];
    }
}

async function cargarProductosFiltradosAPI() {
    try {
        const response = await fetch(FAKESTORE_API_URL);
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const apiProducts = await response.json();
        
        const productosRelevantes = apiProducts.filter(product => {
            const title = product.title.toLowerCase();
            const category = product.category.toLowerCase();
            
            return (category.includes('clothing') || category.includes('jewelery')) &&
                   (title.includes('shirt') || title.includes('jacket') || title.includes('bag') || 
                    title.includes('necklace') || title.includes('ring') || title.includes('cotton'));
        });
        
        const productosLimitados = productosRelevantes.slice(0, 6);
        
        return productosLimitados.map((apiProduct, index) => {
            const categoria = CATEGORIA_MAPPING[apiProduct.category] || 'moda';
            const precio = Math.round(apiProduct.price * 0.8);
            const stock = Math.floor(Math.random() * 8) + 3;
            
            const producto = new Producto(
                apiProduct.title,
                precio,
                1,
                categoria,
                stock,
                apiProduct.image
            );
            
            producto.id = 100 + index + 1;
            producto.apiId = apiProduct.id;
            return producto;
        });
        
    } catch (error) {
        return [];
    }
}

async function cargarProductosHibridos() {
    const loadingSpinner = document.getElementById('loadingSpinner');
    const catalogoGrid = document.getElementById('catalogoGrid');
    
    try {
        loadingSpinner.classList.remove('hidden');
        catalogoGrid.classList.add('hidden');
        
        const productosJSON = await cargarProductosDesdeJSON();
        const productosAPI = await cargarProductosFiltradosAPI();
        
        productos = [...productosJSON, ...productosAPI];
        
        Producto.contadorId = Math.max(...productos.map(p => p.id));
        
        const totalJSON = productosJSON.length;
        const totalAPI = productosAPI.length;
        
        showNotification(`✅ Catálogo híbrido cargado: ${totalJSON} productos desde JSON + ${totalAPI} de API`, 'success');
        guardarEnStorage();
        
    } catch (error) {
        showNotification('⚠️ Error en carga híbrida', 'warning');
        productos = [];
    } finally {
        loadingSpinner.classList.add('hidden');
        catalogoGrid.classList.remove('hidden');
        renderizarCatalogo();
    }
}

// Renderizado

function obtenerImagenProducto(producto) {
    if (producto.imagen) {
        return producto.imagen;
    }
    return imagenesGenericas[producto.categoria] || imagenesGenericas['casual'];
}

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
    
    catalogoGrid.innerHTML = '';
    contadorProductos.textContent = `${productos.length} productos disponibles`;
    
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

function mostrarResultados(resultados, titulo) {
    const resultsSection = document.getElementById('resultsSection');
    const resultsTitle = document.getElementById('resultsTitle');
    const resultsContent = document.getElementById('resultsContent');
    
    resultsTitle.textContent = titulo;
    resultsContent.innerHTML = '';
    
    if (resultados.length === 0) {
        resultsContent.innerHTML = '<p style="text-align: center; color: var(--text-light); padding: 40px;">No se encontraron resultados</p>';
    } else {
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

// busqueda

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

function mostrarMensajeBienvenidaAleatorio() {
    const mensajeBienvenida = document.getElementById('mensajeBienvenida');
    const indiceAleatorio = Math.floor(Math.random() * mensajesBienvenida.length);
    const mensaje = mensajesBienvenida[indiceAleatorio];
    
    mensajeBienvenida.innerHTML = `<h2>${mensaje}</h2>`;
}
