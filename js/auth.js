// User Authentication System - ADMIN FORCE VERSION
const AUTH_CONFIG = {
    // Your admin email - TRIPLE CHECKED
    adminEmails: ['sjesuferanmi@gmail.com'],
};

const auth = {
    currentUser: null,
    userRole: 'guest',
    
    init() {
        // Clear any old cached data that might be corrupted
        const saved = localStorage.getItem('currentUser');
        
        if (saved) {
            try {
                this.currentUser = JSON.parse(saved);
                
                // FORCE ADMIN CHECK - case insensitive and trimmed
                const userEmail = (this.currentUser.email || '').toLowerCase().trim();
                const isAdmin = AUTH_CONFIG.adminEmails.some(e => 
                    e.toLowerCase().trim() === userEmail
                );
                
                // DEBUG: Show what we found
                console.log('User email:', userEmail);
                console.log('Admin list:', AUTH_CONFIG.adminEmails);
                console.log('Is admin:', isAdmin);
                
                if (isAdmin) {
                    this.userRole = 'admin';
                    // Force save admin status
                    localStorage.setItem('userRole', 'admin');
                    localStorage.setItem('isAdmin', 'true');
                } else {
                    this.userRole = 'customer';
                    localStorage.setItem('userRole', 'customer');
                    localStorage.removeItem('isAdmin');
                }
                
            } catch (e) {
                console.error('Error:', e);
                this.setGuestMode();
            }
        } else {
            this.setGuestMode();
        }
        
        this.updateUI();
    },
    
    setGuestMode() {
        this.currentUser = null;
        this.userRole = 'guest';
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole');
        localStorage.removeItem('isAdmin');
    },
    
    // Multiple ways to check admin
    isAdmin() {
        // Check 1: Current role
        if (this.userRole === 'admin') return true;
        
        // Check 2: LocalStorage flag
        if (localStorage.getItem('isAdmin') === 'true') return true;
        
        // Check 3: Email match
        if (!this.currentUser) return false;
        const userEmail = (this.currentUser.email || '').toLowerCase().trim();
        return AUTH_CONFIG.adminEmails.some(e => 
            e.toLowerCase().trim() === userEmail
        );
    },
    
    isLoggedIn() {
        return this.currentUser !== null;
    },
    
    updateUI() {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const userGreeting = document.getElementById('user-greeting');
        const userName = document.getElementById('user-name');
        const adminLink = document.getElementById('admin-link');
        const guestBanner = document.getElementById('guest-banner');
        
        // Update mobile nav if exists
        const mobileAccount = document.getElementById('mobile-account-link');
        
        if (this.currentUser) {
            // Logged in
            if (loginBtn) loginBtn.style.display = 'none';
            if (logoutBtn) logoutBtn.style.display = 'inline-block';
            
            if (userGreeting) {
                userGreeting.style.display = 'inline';
                // Show role in greeting
                const roleBadge = this.isAdmin() ? ' (Admin)' : '';
                if (userName) userName.textContent = this.currentUser.name + roleBadge;
            }
            
            // Admin link
            if (adminLink) {
                const showAdmin = this.isAdmin();
                adminLink.style.display = showAdmin ? 'inline-block' : 'none';
                console.log('Admin link show:', showAdmin);
            }
            
            // Mobile nav update
            if (mobileAccount) {
                mobileAccount.href = './pages/profile.html';
                mobileAccount.innerHTML = '<span>👤</span><span>Profile</span>';
            }
            
            if (guestBanner) guestBanner.style.display = 'none';
            
        } else {
            // Guest
            if (loginBtn) loginBtn.style.display = 'inline-block';
            if (logoutBtn) logoutBtn.style.display = 'none';
            if (userGreeting) userGreeting.style.display = 'none';
            if (adminLink) adminLink.style.display = 'none';
            
            if (mobileAccount) {
                mobileAccount.href = './pages/login.html';
                mobileAccount.innerHTML = '<span>👤</span><span>Login</span>';
            }
            
            if (guestBanner) guestBanner.style.display = 'block';
        }
    },
    
    redirectToLogin(message) {
        sessionStorage.setItem('loginRedirect', window.location.href);
        sessionStorage.setItem('loginMessage', message || 'Please login to continue');
        window.location.href = './pages/login.html';
    },
    
    signup(name, email, password, phone) {
        let users = JSON.parse(localStorage.getItem('users') || '[]');
        
        if (users.find(u => u.email === email)) {
            alert('❌ Email already registered!');
            return false;
        }
        
        const newUser = {
            id: Date.now(),
            name: name,
            email: email,
            password: password,
            phone: phone,
            createdAt: new Date().toISOString(),
        };
        
        users.push(newUser);
        localStorage.setItem('users', JSON.stringify(users));
        
        this.login(email, password);
        return true;
    },
    
    login(email, password) {
        const users = JSON.parse(localStorage.getItem('users') || '[]');
        const user = users.find(u => u.email === email && u.password === password);
        
        if (!user) {
            alert('❌ Invalid email or password!');
            return false;
        }
        
        this.currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            phone: user.phone
        };
        
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
        
        // Re-run role check
        this.init();
        
        const redirect = sessionStorage.getItem('loginRedirect');
        const message = sessionStorage.getItem('loginMessage');
        
        if (message) alert('✅ ' + message);
        
        if (redirect && !redirect.includes('login')) {
            sessionStorage.removeItem('loginRedirect');
            sessionStorage.removeItem('loginMessage');
            window.location.href = redirect;
        } else {
            window.location.href = './index.html';
        }
        
        return true;
    },
    
    logout() {
        this.setGuestMode();
        
        const currentPage = window.location.pathname;
        const protectedPages = ['cart.html', 'checkout.html', 'profile.html', 'admin-products.html'];
        
        if (protectedPages.some(page => currentPage.includes(page))) {
            window.location.href = './index.html';
        } else {
            location.reload();
        }
    },
    
    // EMERGENCY: Force yourself as admin (run in console if needed)
    forceAdmin() {
        if (!this.currentUser) {
            alert('Must be logged in first');
            return;
        }
        this.userRole = 'admin';
        localStorage.setItem('userRole', 'admin');
        localStorage.setItem('isAdmin', 'true');
        this.updateUI();
        alert('✅ Forced admin status. Refresh page.');
    },
    
    canAddToCart() {
        return this.userRole !== 'guest';
    },
    
    canCheckout() {
        return this.userRole === 'customer' || this.userRole === 'admin';
    }
};

document.addEventListener('DOMContentLoaded', () => {
    auth.init();
    
    // Make forceAdmin available globally for emergency
    window.forceAdmin = () => auth.forceAdmin();
});
