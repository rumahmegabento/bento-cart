// Cart functionality and mobile menu
document.addEventListener('DOMContentLoaded', function() {
    // Cart state
    let cart = JSON.parse(localStorage.getItem('bentoCart')) || [];
    
    // DOM elements
    const mobileToggle = document.getElementById('mobile-toggle');
    const navbarMenu = document.querySelector('.navbar-menu');
    const cartToggle = document.getElementById('cart-toggle');
    const cartSidebar = document.getElementById('cart-sidebar');
    const cartOverlay = document.getElementById('cart-overlay');
    const cartClose = document.getElementById('cart-close');
    const cartCount = document.getElementById('cart-count');
    const cartItems = document.getElementById('cart-items');
    const cartSubtotal = document.getElementById('cart-subtotal');
    const cartDiscount = document.getElementById('cart-discount');
    const cartTotal = document.getElementById('cart-total');
    const clearCartBtn = document.getElementById('clear-cart');
    const checkoutWhatsAppBtn = document.getElementById('checkout-whatsapp');
    const addToCartBtns = document.querySelectorAll('.add-to-cart');

    // Cart functionality
    function saveCart() {
        localStorage.setItem('bentoCart', JSON.stringify(cart));
    }

    function formatRupiah(number) {
    return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(number);
}

    function updateCartCount() {
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        cartCount.textContent = totalItems;
        cartCount.classList.toggle('hidden', totalItems === 0);
    }

    function calculateDiscount(subtotal) {
        // Discount tiers based on subtotal
        if (subtotal >= 100000) {
            // 15% discount for orders over Rp 100,000
            return subtotal * 0.15;
        } else if (subtotal >= 50000) {
            // 10% discount for orders over Rp 50,000
            return subtotal * 0.10;
        } else if (subtotal >= 25000) {
            // 5% discount for orders over Rp 25,000
            return subtotal * 0.05;
        }
        return 0; // No discount for smaller orders
    }

    function updateCartTotals() {
        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = calculateDiscount(subtotal);
        const total = subtotal - discount;
        
        cartSubtotal.textContent = formatRupiah(subtotal);
        cartDiscount.textContent = formatRupiah(discount);
        cartTotal.textContent = formatRupiah(total);
        
        // Show or hide discount row based on whether there's a discount
        const discountRow = document.querySelector('.discount-row');
        if (discountRow) {
            discountRow.style.display = discount > 0 ? 'flex' : 'none';
        }
    }

    function getProductImage(productId) {
        const productCard = document.querySelector(`[data-product-id="${productId}"]`);
        const img = productCard?.querySelector('img');
        return img?.src || 'https://img.icons8.com/external-those-icons-lineal-those-icons/96/external-Alert-images-and-image-files-those-icons-lineal-those-icons.png';
    }

    function renderCartItems() {
        if (cart.length === 0) {
            cartItems.innerHTML = `
                <div class="empty-cart">
                    <i class="fas fa-shopping-cart"></i>
                    <p>Keranjang belanja kosong</p>
                    <p class="empty-cart-subtitle">Silakan masukkan produk ke keranjang lalu klik tombol checkout dibawah untuk membuat pesanan.</p>
                </div>
            `;
            return;
        }

        cartItems.innerHTML = cart.map(item => `
            <div class="cart-item" data-product-id="${item.id}">
                <div class="cart-item-image">
                    <img src="${getProductImage(item.id)}" alt="${item.name}" loading="lazy">
                </div>
                <div class="cart-item-details">
                    <div class="cart-item-name">${item.name}</div>
                    <div class="cart-item-price">${formatRupiah(item.price)} /pack</div>
                    <div class="cart-item-controls">
                        <button class="quantity-btn decrease-qty" data-product-id="${item.id}">-</button>
                        <span class="quantity-display">${item.quantity}</span>
                        <button class="quantity-btn increase-qty" data-product-id="${item.id}">+</button>
                        <button class="remove-item" data-product-id="${item.id}">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
            </div>
        `).join('');

        // Add event listeners for quantity controls
        document.querySelectorAll('.decrease-qty').forEach(btn => {
            btn.addEventListener('click', () => decreaseQuantity(btn.dataset.productId));
        });

        document.querySelectorAll('.increase-qty').forEach(btn => {
            btn.addEventListener('click', () => increaseQuantity(btn.dataset.productId));
        });

        document.querySelectorAll('.remove-item').forEach(btn => {
            btn.addEventListener('click', () => removeFromCart(btn.dataset.productId));
        });
    }

    function addToCart(productId, productName, productPrice) {
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            existingItem.quantity += 1;
        } else {
            cart.push({
                id: productId,
                name: productName,
                price: parseFloat(productPrice),
                quantity: 1
            });
        }

        saveCart();
        updateCartCount();
        updateCartTotals();
        renderCartItems();

        // Show success feedback
        showAddToCartFeedback(productName);
    }

    function removeFromCart(productId) {
        cart = cart.filter(item => item.id !== productId);
        saveCart();
        updateCartCount();
        updateCartTotals();
        renderCartItems();
    }

    function increaseQuantity(productId) {
        const item = cart.find(item => item.id === productId);
        if (item) {
            item.quantity += 1;
            saveCart();
            updateCartCount();
            updateCartTotals();
            renderCartItems();
        }
    }

    function decreaseQuantity(productId) {
        const item = cart.find(item => item.id === productId);
        if (item && item.quantity > 1) {
            item.quantity -= 1;
            saveCart();
            updateCartCount();
            updateCartTotals();
            renderCartItems();
        } else if (item && item.quantity === 1) {
            removeFromCart(productId);
        }
    }

    function clearCart() {
        cart = [];
        saveCart();
        updateCartCount();
        updateCartTotals();
        renderCartItems();
    }

    function showAddToCartFeedback(productName) {
        // Create and show a temporary notification
        const notification = document.createElement('div');
        notification.className = 'cart-notification';
        notification.innerHTML = `
            <i class="fas fa-check-circle"></i>
            <span>${productName} ditambahkan ke keranjang!</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('show');
        }, 100);
        
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => {
                document.body.removeChild(notification);
            }, 300);
        }, 2000);
    }

    function generateWhatsAppMessage() {
        if (cart.length === 0) {
            return "Halo bun! Saya mau pesan bento.";
        }

        const orderDetails = cart.map(item => 
            `• ${item.name} x${item.quantity} - ${formatRupiah(item.price * item.quantity)}`
        ).join('\n');

        const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const discount = calculateDiscount(subtotal);
        const total = subtotal - discount;

        let message = `Halo bun! Saya mau pesan bento. Ini daftar pesanan saya:

📋 *Rincian Pesanan:*
${orderDetails}

💵 *Subtotal: ${formatRupiah(subtotal)}*`;

        // Add discount information if applicable
        if (discount > 0) {
            message += `
🎁 *Diskon: ${formatRupiah(discount)}*`;
        }

        message += `
💰 *Total: ${formatRupiah(total)}*

Ditunggu konfirmasinya ya bun. Terimakasih!`;

        return message;
    }

    function openCart() {
        cartSidebar.classList.add('active');
        cartOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    }

    function closeCart() {
        cartSidebar.classList.remove('active');
        cartOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }

    // Event listeners for cart
    cartToggle.addEventListener('click', (e) => {
        e.preventDefault();
        openCart();
    });

    cartClose.addEventListener('click', closeCart);
    cartOverlay.addEventListener('click', closeCart);

    clearCartBtn.addEventListener('click', () => {
        if (confirm('Kosongkan keranjang belanja?')) {
            clearCart();
        }
    });

    checkoutWhatsAppBtn.addEventListener('click', () => {
        const message = generateWhatsAppMessage();
        const whatsappUrl = `https://wa.me/6287774626242?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    });

    // Add to cart button listeners
    addToCartBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const productCard = btn.closest('.product-card');
            const productId = productCard.dataset.productId;
            const productName = productCard.dataset.productName;
            const productPrice = productCard.dataset.productPrice;
            
            addToCart(productId, productName, productPrice);
        });
    });

    // Initialize cart display
    updateCartCount();
    updateCartTotals();
    renderCartItems();

    // Mobile menu functionality
    const mobileMenuOverlay = document.createElement('div');
    mobileMenuOverlay.className = 'mobile-menu-overlay';
    mobileMenuOverlay.innerHTML = `
        <div class="mobile-menu-content">
            <div class="mobile-menu-header">
                <span class="brand-name">Mega Bento&trade;</span>
                <button class="mobile-menu-close">&times;</button>
            </div>
            <ul class="mobile-menu-list">
                <li><a href="#home">Home</a></li>
                <li><a href="#products">Products</a></li>
                <li><a href="#video">About</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
        </div>
    `;
    document.body.appendChild(mobileMenuOverlay);
    
    // Mobile menu toggle
    mobileToggle.addEventListener('click', function() {
        mobileMenuOverlay.classList.add('active');
        document.body.style.overflow = 'hidden';
    });
    
    // Close mobile menu
    const closeBtn = mobileMenuOverlay.querySelector('.mobile-menu-close');
    const menuLinks = mobileMenuOverlay.querySelectorAll('.mobile-menu-list a');
    
    function closeMobileMenu() {
        mobileMenuOverlay.classList.remove('active');
        document.body.style.overflow = '';
    }
    
    closeBtn.addEventListener('click', closeMobileMenu);
    mobileMenuOverlay.addEventListener('click', function(e) {
        if (e.target === mobileMenuOverlay) {
            closeMobileMenu();
        }
    });
    
    // Close menu when clicking on links
    menuLinks.forEach(link => {
        link.addEventListener('click', closeMobileMenu);
    });
    
    // Smooth scrolling for navigation links
    const allNavLinks = document.querySelectorAll('a[href^="#"]');
    allNavLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            const targetSection = document.querySelector(targetId);
            
            if (targetSection) {
                const offsetTop = targetSection.offsetTop - 80; // Account for fixed navbar
                window.scrollTo({
                    top: offsetTop,
                    behavior: 'smooth'
                });
            }
        });
    });
    
    // Navbar scroll effect
    const navbar = document.getElementById('navbar');
    let lastScrollTop = 0;
    
    window.addEventListener('scroll', function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
        
        lastScrollTop = scrollTop;
    });
    
    // Image lazy loading with fade-in effect
    const images = document.querySelectorAll('.product-image img');
    
    const imageObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                img.addEventListener('load', function() {
                    img.classList.add('loaded');
                });
                
                // If image is already cached and loaded
                if (img.complete) {
                    img.classList.add('loaded');
                }
                
                observer.unobserve(img);
            }
        });
    });
    
    images.forEach(img => {
        imageObserver.observe(img);
    });
    
    // Product card hover effects
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-8px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // WhatsApp order tracking
    const orderButtons = document.querySelectorAll('.btn-order');
    
    orderButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const productName = this.closest('.product-card').querySelector('h3').textContent;
            
            // Add click animation
            this.style.transform = 'scale(0.95)';
            setTimeout(() => {
                this.style.transform = 'scale(1)';
            }, 150);
            
            // Optional: Track order analytics
            if (typeof gtag !== 'undefined') {
                gtag('event', 'order_click', {
                    'product_name': productName,
                    'event_category': 'ecommerce',
                    'event_label': 'whatsapp_order'
                });
            }
        });
    });
    
    // Scroll reveal animation
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };
    
    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
            }
        });
    }, observerOptions);
    
    // Add reveal animation to elements
    const revealElements = document.querySelectorAll('.product-card, .section-header, .contact-item');
    revealElements.forEach(el => {
        el.classList.add('reveal');
        revealObserver.observe(el);
    });
    
    // Form validation for contact (if added later)
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }
    
    // Keyboard navigation support
    document.addEventListener('keydown', function(e) {
        // Close mobile menu with Escape key
        if (e.key === 'Escape' && mobileMenuOverlay.classList.contains('active')) {
            closeMobileMenu();
        }
        
        // Close cart with Escape key
        if (e.key === 'Escape' && cartSidebar.classList.contains('active')) {
            closeCart();
        }
    });
    
    // Performance optimization: Debounce scroll events
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    // Apply debounce to scroll handler
    const debouncedScrollHandler = debounce(function() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        
        if (scrollTop > 100) {
            navbar.classList.add('scrolled');
        } else {
            navbar.classList.remove('scrolled');
        }
    }, 10);
    
    window.addEventListener('scroll', debouncedScrollHandler);
});

// Add CSS for cart notification and mobile menu
const additionalStyles = `
    .cart-notification {
        position: fixed;
        top: 100px;
        right: 20px;
        background: var(--primary-purple);
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 15px rgba(107, 70, 193, 0.3);
        z-index: 10001;
        display: flex;
        align-items: center;
        gap: 0.5rem;
        transform: translateX(100%);
        opacity: 0;
        transition: all 0.3s ease;
    }
    
    .cart-notification.show {
        transform: translateX(0);
        opacity: 1;
    }
    
    .cart-notification i {
        color: #10b981;
    }

    .mobile-menu-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        z-index: 9999;
        opacity: 0;
        visibility: hidden;
        transition: all 0.3s ease;
    }
    
    .mobile-menu-overlay.active {
        opacity: 1;
        visibility: visible;
    }
    
    .mobile-menu-content {
        position: absolute;
        top: 0;
        right: 0;
        width: 280px;
        height: 100%;
        background: white;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        box-shadow: -5px 0 15px rgba(0, 0, 0, 0.1);
    }
    
    .mobile-menu-overlay.active .mobile-menu-content {
        transform: translateX(0);
    }
    
    .mobile-menu-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        padding: 1.5rem;
        border-bottom: 1px solid #E5E7EB;
    }
    
    .mobile-menu-close {
        background: none;
        border: none;
        font-size: 2rem;
        color: #6B46C1;
        cursor: pointer;
    }
    
    .mobile-menu-list {
        list-style: none;
        padding: 2rem 0;
    }
    
    .mobile-menu-list li {
        margin-bottom: 0.5rem;
    }
    
    .mobile-menu-list a {
        display: block;
        padding: 1rem 1.5rem;
        text-decoration: none;
        color: #1F2937;
        font-weight: 500;
        transition: all 0.3s ease;
    }
    
    .mobile-menu-list a:hover {
        background: #F3F4F6;
        color: #6B46C1;
    }
    
    .navbar.scrolled {
        background: rgba(255, 255, 255, 0.95);
        backdrop-filter: blur(10px);
    }
    
    .reveal {
        opacity: 0;
        transform: translateY(30px);
        transition: all 0.6s ease;
    }
    
    .reveal.revealed {
        opacity: 1;
        transform: translateY(0);
    }
    
    @media (min-width: 768px) {
        .mobile-menu-overlay {
            display: none;
        }
        
        .cart-notification {
            right: 420px;
        }
    }
`;

// Inject additional styles
const styleSheet = document.createElement('style');
styleSheet.textContent = additionalStyles;
document.head.appendChild(styleSheet);
