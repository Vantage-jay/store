const productDB = {
    products: [],
    
    async load() {
        // Try localStorage first (admin added products)
        const adminProducts = localStorage.getItem('adminProducts');
        if (adminProducts) {
            this.products = JSON.parse(adminProducts);
            return this.products;
        }
        
        // Your real farm products
        this.products = [
            {
                id: 1,
                name: "Fresh Tomatoes",
                price: 2500,
                category: "Vegetables",
                image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400",
                description: "Vine-ripened red tomatoes, perfect for stews, soups and salads. Freshly harvested from our farm.",
                stock: 20,
                unit: "basket",
                badge: "Best Seller",
                inStock: true
            },
            {
                id: 2,
                name: "Fresh Pepper",
                price: 1500,
                category: "Vegetables",
                image: "https://i0.wp.com/ecofarmsandagroservices.com/wp-content/uploads/2021/12/IMG_20200208_142924.jpg?fit=1024%2C682&ssl=1",
                description: "Hot and flavorful peppers, freshly picked. Perfect for soups, stews and spicy dishes.",
                stock: 18,
                unit: "kg",
                badge: "Fresh",
                inStock: true
            },
            {
                id: 3,
                name: "Cucumber",
                price: 800,
                category: "Vegetables",
                image: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400",
                description: "Cool, refreshing cucumbers. Great for salads, juicing and snacking.",
                stock: 30,
                unit: "piece",
                inStock: true
            },
            {
                id: 4,
                name: "Pawpaw (Papaya)",
                price: 1200,
                category: "Fruits",
                image: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?w=400",
                description: "Sweet, ripe pawpaw rich in vitamins. Perfect for breakfast or as a healthy snack.",
                stock: 15,
                unit: "piece",
                badge: "Fresh",
                inStock: true
            },
            {
                id: 5,
                name: "Watermelon",
                price: 3500,
                category: "Fruits",
                image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400",
                description: "Big, sweet and juicy watermelon. Perfect for hot days and family gatherings.",
                stock: 10,
                unit: "piece",
                badge: "Popular",
                inStock: true
            },
            {
                id: 6,
                name: "Sweet Corn",
                price: 500,
                category: "Grains",
                image: "https://images.unsplash.com/photo-1551754655-cd27e38d2076?w=400",
                description: "Tender, sweet corn freshly harvested. Great for boiling, roasting and cooking.",
                stock: 50,
                unit: "cob",
                inStock: true
            },
            {
                id: 7,
                name: "Fresh Vegetables",
                price: 800,
                category: "Vegetables",
                image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400",
                description: "Mixed fresh leafy vegetables including spinach, ugu and other greens. Freshly harvested daily.",
                stock: 25,
                unit: "bunch",
                badge: "Daily Fresh",
                inStock: true
            },
            {
                id: 8,
                name: "Okro",
                price: 700,
                category: "Vegetables",
                image: "https://images.unsplash.com/photo-1627842068538-fc0d43bbd471?w=400",
                description: "Fresh, tender okro perfect for soups and stews. A Nigerian kitchen essential.",
                stock: 0,
                unit: "kg",
                inStock: false
            }
        ];
        
        return this.products;
    },
    
    getAll() { return this.products; },
    getById(id) { return this.products.find(p => p.id === id); },
    getByCategory(cat) { 
        return cat === 'all' ? this.products : this.products.filter(p => p.category === cat); 
    }
};

function renderProducts(productsToShow = null) {
    const grid = document.getElementById('product-grid');
    if (!grid) return;
    
    const products = productsToShow || productDB.getAll();
    const isGuest = !auth.isLoggedIn();
    
    if (products.length === 0) {
        grid.innerHTML = '<p style="text-align: center; padding: 3rem; color: #64748b;">No products in this category.</p>';
        return;
    }
    
    grid.innerHTML = products.map(product => {
        const isOutOfStock = !product.inStock || product.stock <= 0;

        // Button logic
        let buttonHTML;
        if (isOutOfStock) {
            buttonHTML = `<button class="btn-out-of-stock" disabled>Out of Stock</button>`;
        } else if (isGuest) {
            buttonHTML = `<button class="btn-guest" onclick="auth.redirectToLogin('Login to buy ${product.name}')">🔒 Login to Buy</button>`;
        } else {
            buttonHTML = `<button class="btn-add" onclick="event.stopPropagation(); cart.addItem(${product.id})">+</button>`;
        }
        
        const badgeHTML = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';
        
        // Stock warning - shows when 5 or less remaining
        const stockHTML = (!isOutOfStock && product.stock <= 5 && product.stock > 0)
            ? `<span class="stock-badge">Only ${product.stock} left!</span>`
            : '';

        // Out of stock overlay
        const outOfStockOverlay = isOutOfStock
            ? `<div class="out-of-stock-overlay"><span>Out of Stock</span></div>`
            : '';
        
        return `
        <div class="product-card ${isOutOfStock ? 'out-of-stock-card' : ''}">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x220?text=${encodeURIComponent(product.name)}'">
                ${badgeHTML}
                ${stockHTML}
                ${outOfStockOverlay}
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-footer">
                    <div class="price-box">
                        <span class="current-price" style="${isOutOfStock ? 'color: #94a3b8;' : ''}">₦${product.price.toLocaleString()}</span>
                        <span class="unit">per ${product.unit}</span>
                    </div>
                    ${buttonHTML}
                </div>
            </div>
        </div>
        `;
    }).join('');
}

function viewProduct(id) {
    const product = productDB.getById(id);
    if (!product) return;
    sessionStorage.setItem('currentProduct', JSON.stringify(product));
    // Works from both root and pages/ folder
    window.location.href = 'pages/product.html';
}

function filterCategory(category) {
    document.querySelectorAll('.pill, .cat-btn').forEach(p => p.classList.remove('active'));
    event.target.closest('.pill, .cat-btn').classList.add('active');
    renderProducts(productDB.getByCategory(category));
}

let currentlyShowing = 6;

function loadMore() {
    currentlyShowing += 6;
    const all = productDB.getAll();
    if (currentlyShowing >= all.length) {
        const btn = document.querySelector('.load-more');
        if (btn) btn.style.display = 'none';
    }
    renderProducts(all.slice(0, currentlyShowing));
}

document.addEventListener('DOMContentLoaded', async () => {
    await productDB.load();
    const all = productDB.getAll();
    if (all.length <= 6) {
        const btn = document.querySelector('.load-more');
        if (btn) btn.style.display = 'none';
    }
    renderProducts(all.slice(0, 6));
});
    
