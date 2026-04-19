const cart = {
    items: [],
    
    init() {
        // Only load cart if user is logged in
        if (!auth.isLoggedIn()) {
            return;
        }
        
        const saved = localStorage.getItem(`cart_${auth.currentUser?.id}`);
        if (saved) {
            this.items = JSON.parse(saved);
        }
        this.updateUI();
    },
    
    addItem(productId) {
        // CHECK: Must be logged in
        if (!auth.canAddToCart()) {
            auth.redirectToLogin('Please login to add items to your cart');
            return;
        }
        
        const product = productDB.getById(productId);
        if (!product) {
            alert('Product not found!');
            return;
        }
        
        if (product.stock <= 0) {
            alert('Sorry, this item is out of stock!');
            return;
        }
        
        const existing = this.items.find(item => item.id === productId);
        
        if (existing) {
            if (existing.quantity >= product.stock) {
                alert(`Only ${product.stock} items available!`);
                return;
            }
            existing.quantity++;
        } else {
            this.items.push({
                id: product.id,
                name: product.name,
                price: product.price,
                image: product.image,
                quantity: 1,
                maxStock: product.stock,
                seller: product.seller || 'FarmFresh Store'
            });
        }
        
        this.save();
        this.updateUI();
        this.showNotification('✅ Added to cart!');
    },
    
    removeItem(productId) {
        if (!auth.isLoggedIn()) return;
        
        this.items = this.items.filter(item => item.id !== productId);
        this.save();
        this.updateUI();
        if (window.location.pathname.includes('cart')) {
            renderCartPage();
        }
    },
    
    updateQuantity(productId, newQty) {
        if (!auth.isLoggedIn()) return;
        
        const item = this.items.find(i => i.id === productId);
        if (!item) return;
        
        if (newQty < 1) {
            this.removeItem(productId);
            return;
        }
        
        if (newQty > item.maxStock) {
            alert(`Only ${item.maxStock} items available!`);
            return;
        }
        
        item.quantity = newQty;
        this.save();
        this.updateUI();
        if (window.location.pathname.includes('cart')) {
            renderCartPage();
        }
    },
    
    save() {
        if (!auth.isLoggedIn() || !auth.currentUser) return;
        localStorage.setItem(`cart_${auth.currentUser.id}`, JSON.stringify(this.items));
    },
    
    clear() {
        this.items = [];
        if (auth.isLoggedIn() && auth.currentUser) {
            localStorage.removeItem(`cart_${auth.currentUser.id}`);
        }
        this.updateUI();
    },
    
    updateUI() {
        const badge = document.getElementById('cart-count');
        if (badge) {
            const count = this.items.reduce((sum, item) => sum + item.quantity, 0);
            badge.textContent = count;
        }
    },
    
    getTotal() {
        return this.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    },
    
    showNotification(message) {
        const toast = document.createElement('div');
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            z-index: 1000;
            animation: slideIn 0.3s ease;
            font-weight: 500;
        `;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.remove(), 3000);
    }
};

// Render cart page
function renderCartPage() {
    const container = document.getElementById('cart-items');
    const summary = document.getElementById('cart-summary');
    
    if (!container) return;
    
    // Redirect if not logged in
    if (!auth.isLoggedIn()) {
        auth.redirectToLogin('Please login to view your cart');
        return;
    }
    
    if (cart.items.length === 0) {
        container.innerHTML = `
            <div class="empty-cart">
                <div style="font-size: 4rem; margin-bottom: 1rem;">🛒</div>
                <h3>Your cart is empty</h3>
                <p>Add some fresh farm products!</p>
                <a href="/pages/products.html" class="btn-primary" style="display: inline-block; margin-top: 1rem; padding: 0.75rem 1.5rem; background: #2563eb; color: white; text-decoration: none; border-radius: 6px;">Browse Products</a>
            </div>
        `;
        if (summary) summary.style.display = 'none';
        return;
    }
    
    container.innerHTML = cart.items.map(item => `
        <div class="cart-item">
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p class="item-price">₦${item.price.toLocaleString()} each</p>
                <p class="item-seller">Sold by: ${item.seller}</p>
            </div>
            <div class="quantity-controls">
                <button onclick="cart.updateQuantity(${item.id}, ${item.quantity - 1})">−</button>
                <span>${item.quantity}</span>
                <button onclick="cart.updateQuantity(${item.id}, ${item.quantity + 1})">+</button>
            </div>
            <p class="item-total">₦${(item.price * item.quantity).toLocaleString()}</p>
            <button class="remove-btn" onclick="cart.removeItem(${item.id})">🗑️</button>
        </div>
    `).join('');
    
    if (summary) {
        summary.style.display = 'block';
        const subtotal = cart.getTotal();
        const shipping = subtotal > 10000 ? 0 : 1500; // Free shipping over ₦10,000
        const total = subtotal + shipping;
        
        summary.innerHTML = `
            <h3>Order Summary</h3>
            <div class="summary-row">
                <span>Subtotal (${cart.items.length} items)</span>
                <span>₦${subtotal.toLocaleString()}</span>
            </div>
            <div class="summary-row">
                <span>Delivery</span>
                <span>${shipping === 0 ? 'FREE' : '₦' + shipping.toLocaleString()}</span>
            </div>
            <div class="summary-row total">
                <span>Total</span>
                <span>₦${total.toLocaleString()}</span>
            </div>
            <button class="checkout-btn" onclick="location.href='checkout.html'">
                Proceed to Checkout →
            </button>
        `;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    cart.init();
    if (window.location.pathname.includes('cart')) {
        renderCartPage();
    }
});
