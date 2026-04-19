const productDB = {
    products: [],
    
    async load() {
        // Try localStorage first (admin added products)
        const adminProducts = localStorage.getItem('adminProducts');
        if (adminProducts) {
            this.products = JSON.parse(adminProducts);
            return this.products;
        }
        
        // Default farm products
        this.products = [
            {
                id: 1,
                name: "Fresh Tomatoes",
                price: 2500,
                category: "Vegetables",
                image: "https://images.unsplash.com/photo-1592924357228-91a4daadcfea?w=400",
                description: "Vine-ripened red tomatoes, perfect for stews and salads",
                stock: 20,
                unit: "basket",
                badge: "Best Seller"
            },
            {
                id: 2,
                name: "Sweet Bell Peppers",
                price: 1800,
                category: "Vegetables",
                image: "https://images.unsplash.com/photo-1563565375-f3fdf5d66970?w=400",
                description: "Colorful mix of red, yellow and green peppers",
                stock: 15,
                unit: "kg",
                badge: "Fresh"
            },
            {
                id: 3,
                name: "Leafy Spinach",
                price: 800,
                category: "Vegetables",
                image: "https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400",
                description: "Crisp fresh spinach leaves, rich in iron",
                stock: 30,
                unit: "bunch"
            },
            {
                id: 4,
                name: "Red Onions",
                price: 1200,
                category: "Vegetables",
                image: "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?w=400",
                description: "Pungent red onions, perfect for cooking",
                stock: 25,
                unit: "kg"
            },
            {
                id: 5,
                name: "Carrots",
                price: 1000,
                category: "Vegetables",
                image: "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?w=400",
                description: "Sweet, crunchy orange carrots",
                stock: 40,
                unit: "bunch"
            },
            {
                id: 6,
                name: "Cucumber",
                price: 600,
                category: "Vegetables",
                image: "https://images.unsplash.com/photo-1449300079323-02e209d9d3a6?w=400",
                description: "Cool, refreshing cucumbers for salads",
                stock: 35,
                unit: "piece"
            },
            {
                id: 7,
                name: "Fresh Plantain",
                price: 2000,
                category: "Fruits",
                image: "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400",
                description: "Ripe and unripe plantain available",
                stock: 20,
                unit: "bunch",
                badge: "Popular"
            },
            {
                id: 8,
                name: "Watermelon",
                price: 3500,
                category: "Fruits",
                image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?w=400",
                description: "Sweet, juicy watermelon. Perfect for hot days",
                stock: 12,
                unit: "piece"
            },
            {
                id: 9,
                name: "Pineapple",
                price: 1500,
                category: "Fruits",
                image: "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400",
                description: "Tropical sweet pineapple, ripe and ready",
                stock: 18,
                unit: "piece"
            },
            {
                id: 10,
                name: "Oranges",
                price: 2000,
                category: "Fruits",
                image: "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?w=400",
                description: "Juicy citrus oranges, vitamin C rich",
                stock: 25,
                unit: "kg"
            },
            {
                id: 11,
                name: "Sweet Potatoes",
                price: 1500,
                category: "Tubers",
                image: "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?w=400",
                description: "Orange flesh sweet potatoes, perfect for frying",
                stock: 50,
                unit: "heap"
            },
            {
                id: 12,
                name: "Fresh Eggs",
                price: 3500,
                category: "Poultry",
                image: "https://images.unsplash.com/photo-1582722872445-44dc5f7e3c8f?w=400",
                description: "Farm fresh eggs, 30 pieces per crate",
                stock: 15,
                unit: "crate",
                badge: "Organic"
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
        grid.innerHTML = '<p style="text-align: center; padding: 3rem; color: #64748b;">No products available.</p>';
        return;
    }
    
    grid.innerHTML = products.map(product => {
        const buttonHTML = isGuest 
            ? `<button class="btn-guest" onclick="auth.redirectToLogin('Login to buy ${product.name}')">🔒 Login to Buy</button>`
            : `<button class="btn-add" onclick="event.stopPropagation(); cart.addItem(${product.id})">+</button>`;
        
        const badgeHTML = product.badge ? `<span class="product-badge">${product.badge}</span>` : '';
        const stockHTML = product.stock < 5 ? `<span class="stock-badge">Only ${product.stock} left</span>` : '';
        
        return `
        <div class="product-card" onclick="viewProduct(${product.id})">
            <div class="product-image">
                <img src="${product.image}" alt="${product.name}" loading="lazy" onerror="this.src='https://via.placeholder.com/300x220?text=${encodeURIComponent(product.name)}'">
                ${badgeHTML}
                ${stockHTML}
            </div>
            <div class="product-info">
                <span class="product-category">${product.category}</span>
                <h3 class="product-title">${product.name}</h3>
                <p class="product-desc">${product.description}</p>
                <div class="product-footer">
                    <div class="price-box">
                        <span class="current-price">₦${product.price.toLocaleString()}</span>
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
    window.location.href = './pages/product-detail.html';
}

function filterCategory(category) {
    document.querySelectorAll('.pill').forEach(p => p.classList.remove('active'));
    event.target.closest('.pill').classList.add('active');
    renderProducts(productDB.getByCategory(category));
}

function loadMore() {
    alert('More products coming soon! Add products in admin panel.');
}

document.addEventListener('DOMContentLoaded', async () => {
    await productDB.load();
    renderProducts();
});
