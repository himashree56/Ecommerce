const cart = JSON.parse(localStorage.getItem('itemCart') || '[]');
const users = [
    {
        id: 1,
        name: 'John Doe',
        email: 'john@example.com',
        password: 'password123',
        loyaltyPoints: 500
    }
];
const validCoupons = {
    'WELCOME10': { discount: 10, type: 'percentage' },
    'SAVE20': { discount: 20, type: 'percentage' },
    'SAVE15': { discount: 15, type: 'percentage' },
    'FLAT30': { discount: 30, type: 'fixed' }
};
let currentUser = null;
let appliedCoupon = null;
let appliedPoints = 0;
document.addEventListener('DOMContentLoaded', function() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        updateAuthDisplay();
    }
    
    displayCheckout();
});

function showAuthForm(tab) {
    const authForm = document.getElementById('authForm');
    authForm.classList.add('active');
    switchTab(tab);
}

function switchTab(tab) {
    const signinTab = document.getElementById('signinTab');
    const signupTab = document.getElementById('signupTab');
    const signinContent = document.getElementById('signinContent');
    const signupContent = document.getElementById('signupContent');
    
    signinTab.classList.remove('active');
    signupTab.classList.remove('active');
    signinContent.classList.remove('active');
    signupContent.classList.remove('active');
    
    if (tab === 'signin') {
        signinTab.classList.add('active');
        signinContent.classList.add('active');
    } else {
        signupTab.classList.add('active');
        signupContent.classList.add('active');
    }
}

function signIn() {
    const email = document.getElementById('signin-email').value;
    const password = document.getElementById('signin-password').value;
    const user = users.find(u => u.email === email && u.password === password);
    
    if (user) {
        currentUser = {
            id: user.id,
            name: user.name,
            email: user.email,
            loyaltyPoints: user.loyaltyPoints
        };
        
        localStorage.setItem('currentUser', JSON.stringify(currentUser));
        updateAuthDisplay();
        displayCheckout();
        document.getElementById('authForm').classList.remove('active');
    } else {
        alert('Invalid email or password.');
    }
}

function signUp() {
    const name = document.getElementById('signup-name').value;
    const email = document.getElementById('signup-email').value;
    const password = document.getElementById('signup-password').value;
    
    if (!name || !email || !password) {
        alert('Please fill in all fields');
        return;
    }
    currentUser = {
        id: users.length + 1,
        name: name,
        email: email,
        loyaltyPoints: 100 
    };
    
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    updateAuthDisplay();
    displayCheckout();
    document.getElementById('authForm').classList.remove('active');
    
    alert('Account created successfully! Welcome bonus: 100 loyalty points!');
}

function updateAuthDisplay() {
    const authButtonsContainer = document.getElementById('authButtonsContainer');
    
    if (currentUser) {
        authButtonsContainer.innerHTML = `
            <div class="user-info">
                <div class="user-name">Welcome, ${currentUser.name}</div>
                <button class="logout-btn" onclick="logout()">Logout</button>
            </div>
        `;
    } else {
        authButtonsContainer.innerHTML = `
            <button class="auth-btn signin-btn" onclick="showAuthForm('signin')">Sign In</button>
            <button class="auth-btn signup-btn" onclick="showAuthForm('signup')">Sign Up</button>
        `;
    }
}

function logout() {
    currentUser = null;
    localStorage.removeItem('currentUser');
    appliedPoints = 0;
    updateAuthDisplay();
    displayCheckout();
}

function displayCheckout() {
    const checkoutContent = document.getElementById('checkout-content');
    
    if (cart.length === 0) {
        displayEmptyCart(checkoutContent);
    } else {
        displayCartItems(checkoutContent);
    }
}

function displayEmptyCart(container) {
    container.innerHTML = `
        <div class="empty-cart">
            <i class="fas fa-shopping-cart"></i>
            <h2>Your cart is empty</h2>
            <p>Looks like you haven't added any items to your cart yet.</p>
            <a href="ecommerce.html" class="shop-now-btn">Shop Now</a>
        </div>
    `;
}

function displayCartItems(container) {
    let subtotal = 0;
    const tax = 0;
    const shipping = 5.99;
    cart.forEach(item => {
        subtotal += item.item_price * item.quantity;
    });
    let discountAmount = 0;
    let discountText = '';
    
    if (appliedCoupon) {
        if (appliedCoupon.type === 'percentage') {
            discountAmount = (subtotal * appliedCoupon.discount) / 100;
            discountText = `${appliedCoupon.discount}% off`;
        } else {
            discountAmount = appliedCoupon.discount;
            discountText = `$${appliedCoupon.discount.toFixed(2)} off`;
        }
    }
    let pointsDiscountAmount = 0;
    if (appliedPoints > 0) {
        pointsDiscountAmount = appliedPoints / 100; 
    }
    
    const total = subtotal + tax + shipping - discountAmount - pointsDiscountAmount;
    let cartItemsHTML = '';
    cart.forEach(item => {
        const itemTotal = item.item_price * item.quantity;
        
        cartItemsHTML += `
            <div class="cart-item">
                <img src="${item.item_image}" alt="${item.item_name}" class="item-image" onerror="this.src='https://via.placeholder.com/80x80'" >
                <div class="item-details">
                    <h3>${item.item_name}</h3>
                    <p class="item-price">$${item.item_price.toFixed(2)} each</p>
                    <button class="remove-btn" onclick="removeItem(${item.item_id})">Remove</button>
                </div>
                <div class="item-quantity">
                    <button class="quantity-btn" onclick="updateQuantity(${item.item_id}, ${item.quantity - 1})">-</button>
                    <span class="quantity-display">${item.quantity}</span>
                    <button class="quantity-btn" onclick="updateQuantity(${item.item_id}, ${item.quantity + 1})">+</button>
                </div>
            </div>
        `;
    });
    
    let loyaltyHTML = '';
    if (currentUser) {
        loyaltyHTML = `
            <div class="loyalty-section">
                <h2>Loyalty Rewards</h2>
                <div class="loyalty-info">
                    <div class="points-available">Available Points: ${currentUser.loyaltyPoints - appliedPoints}</div>
                    <p>Use your points for discounts. 100 points = $1.00 off</p>
                    <div class="use-points-form">
                        <input type="number" class="points-input" id="points-input" placeholder="Points" min="0" max="${currentUser.loyaltyPoints}" value="${appliedPoints}">
                        <button class="apply-btn" onclick="applyLoyaltyPoints()">Apply Points</button>
                    </div>
                </div>
            </div>
        `;
    }
    
    container.innerHTML = `
        <div class="checkout-grid">
            <div>
                <div class="cart-items">
                    ${cartItemsHTML}
                </div>
                
                ${loyaltyHTML}
                
                <div class="customer-info">
                    <h2>Shipping Information</h2>
                    <div class="form-group">
                        <label for="name">Full Name</label>
                        <input type="text" id="name" placeholder="Enter your full name" value="${currentUser ? currentUser.name : ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="email">Email Address</label>
                        <input type="email" id="email" placeholder="Enter your email" value="${currentUser ? currentUser.email : ''}">
                    </div>
                    
                    <div class="form-group">
                        <label for="address">Street Address</label>
                        <input type="text" id="address" placeholder="Enter your address">
                    </div>
                    
                    <div class="form-row">
                        <div class="form-group">
                            <label for="city">City</label>
                            <input type="text" id="city" placeholder="City">
                        </div>
                        
                        <div class="form-group">
                            <label for="zip">Zip Code</label>
                            <input type="text" id="zip" placeholder="Zip code">
                        </div>
                    </div>
                </div>
            </div>
            
            <div>
                <div class="order-summary">
                    <h2>Order Summary</h2>
                    <div class="summary-row">
                        <span>Subtotal</span>
                        <span>$${subtotal.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Tax</span>
                        <span>$${tax.toFixed(2)}</span>
                    </div>
                    <div class="summary-row">
                        <span>Shipping</span>
                        <span>$${shipping.toFixed(2)}</span>
                    </div>
        ${discountAmount > 0 ? `
        <div class="summary-row discount-row">
            <span>Discount (${discountText})</span>
            <span>-$${discountAmount.toFixed(2)}</span>
        </div>` : ''}
        ${pointsDiscountAmount > 0 ? `
        <div class="summary-row discount-row">
            <span>Loyalty Points (${appliedPoints} points)</span>
            <span>-$${pointsDiscountAmount.toFixed(2)}</span>
        </div>` : ''}
        <div class="total-row">
            <span>Total</span>
            <span>$${total.toFixed(2)}</span>
        </div>

        <div class="coupon-form">
            <input type="text" id="coupon-code" class="coupon-input" placeholder="Enter coupon code">
            <button class="apply-btn" onclick="applyCoupon()">Apply</button>
            </div>

    <button class="checkout-btn" onclick="processCheckout()">Checkout Now</button>
    <button class="invoice-btn" onclick="showInvoice()">Preview Invoice</button>
</div>
</div>
</div>
`;
}

function updateQuantity(itemId, newQuantity) {
    if (newQuantity <= 0) {
        removeItem(itemId);
    return;
}

const itemIndex = cart.findIndex(item => item.item_id === itemId);
    if (itemIndex !== -1) {
        cart[itemIndex].quantity = newQuantity;
        saveCart();
        displayCheckout();
}
}

function removeItem(itemId) {
const itemIndex = cart.findIndex(item => item.item_id === itemId);
if (itemIndex !== -1) {
        cart.splice(itemIndex, 1);
        saveCart();
        displayCheckout();
}
}

function saveCart() {
    localStorage.setItem('itemCart', JSON.stringify(cart));
}

function applyCoupon() {
    const couponCode = document.getElementById('coupon-code').value.trim().toUpperCase();

    if (couponCode === '') {
        alert('Please enter a coupon code');
    return;
}

if (validCoupons[couponCode]) {
    appliedCoupon = validCoupons[couponCode];
    alert(`Coupon applied successfully! ${appliedCoupon.type === 'percentage' ? 
    `${appliedCoupon.discount}% discount` : 
    `$${appliedCoupon.discount.toFixed(2)} discount`}`);
    displayCheckout();
} else {
    alert('Invalid coupon code. Try WELCOME10, SAVE20, SAVE15 or FLAT30');
}
}

function applyLoyaltyPoints() {
    if (!currentUser) {
        alert('Please sign in to use loyalty points');
        return;
}

const pointsInput = document.getElementById('points-input');
const points = parseInt(pointsInput.value);

if (isNaN(points) || points < 0) {
    alert('Please enter a valid number of points');
    return;
}

if (points > currentUser.loyaltyPoints) {
    alert(`You only have ${currentUser.loyaltyPoints} points available`);
    return;
}

appliedPoints = points;
    displayCheckout();
}

function processCheckout() {

    const name = document.getElementById('name').value;
    const email = document.getElementById('email').value;
    const address = document.getElementById('address').value;
    const city = document.getElementById('city').value;
    const zip = document.getElementById('zip').value;

if (!name || !email || !address || !city || !zip) {
    alert('Please fill in all shipping information fields');
    return;
}
alert('Thank you for your order! It will be processed shortly.');
localStorage.removeItem('itemCart');
appliedCoupon = null;
appliedPoints = 0;
window.location.href = 'ecommerce.html';
}

function showInvoice() {
    let subtotal = 0;
    const tax = 0;
    const shipping = 5.99;

    cart.forEach(item => {
    subtotal += item.item_price * item.quantity;
});

let discountAmount = 0;
let discountText = '';

if (appliedCoupon) {
if (appliedCoupon.type === 'percentage') {
    discountAmount = (subtotal * appliedCoupon.discount) / 100;
    discountText = `${appliedCoupon.discount}% off`;
} else {
    discountAmount = appliedCoupon.discount;
    discountText = `$${appliedCoupon.discount.toFixed(2)} off`;
}
}

let pointsDiscountAmount = 0;
if (appliedPoints > 0) {
pointsDiscountAmount = appliedPoints / 100;
}

const total = subtotal + tax + shipping - discountAmount - pointsDiscountAmount;
let invoiceItemsHTML = '';
cart.forEach(item => {
const itemTotal = item.item_price * item.quantity;

invoiceItemsHTML += `
    <tr>
        <td>${item.item_name}</td>
        <td>$${item.item_price.toFixed(2)}</td>
        <td>${item.quantity}</td>
        <td>$${itemTotal.toFixed(2)}</td>
    </tr>
`;
});

const invoiceContent = document.getElementById('invoiceContent');
invoiceContent.innerHTML = `
<div class="invoice">
    <div class="invoice-header">
        <div class="company-info">
            <div class="company-name">TECHZWONE E-Commerce Store</div>
            <div>Bangalore, India 560075</div>
            <div>Phone: +91 7022989390</div>
            <div>Email: info@TECHZWONE.com</div>
        </div>
        <div class="invoice-details">
            <div class="invoice-id">Invoice #: INV-${Date.now().toString().substring(5)}</div>
            <div>Date: ${new Date().toLocaleDateString()}</div>
            <div>Customer: ${document.getElementById('name').value || 'Guest'}</div>
            <div>Email: ${document.getElementById('email').value || 'N/A'}</div>
        </div>
    </div>
    
    <table class="invoice-table">
        <thead>
            <tr>
                <th>Item</th>
                <th>Price</th>
                <th>Quantity</th>
                <th>Total</th>
            </tr>
        </thead>
        <tbody>
            ${invoiceItemsHTML}
        </tbody>
    </table>
    
    <div class="invoice-totals">
        <div class="invoice-total-row">Subtotal: $${subtotal.toFixed(2)}</div>
        <div class="invoice-total-row">Tax: $${tax.toFixed(2)}</div>
        <div class="invoice-total-row">Shipping: $${shipping.toFixed(2)}</div>
        ${discountAmount > 0 ? `<div class="invoice-total-row">Discount (${discountText}): -$${discountAmount.toFixed(2)}</div>` : ''}
        ${pointsDiscountAmount > 0 ? `<div class="invoice-total-row">Loyalty Points (${appliedPoints} points): -$${pointsDiscountAmount.toFixed(2)}</div>` : ''}
        <div class="grand-total">Total: $${total.toFixed(2)}</div>
    </div>
    
    <div class="invoice-footer">
        <p>Thank you for your business!</p>
        <p>Terms & Conditions Apply</p>
    </div>
</div>
`;


document.getElementById('invoiceModal').style.display = 'block';
}

function closeInvoice() {
    document.getElementById('invoiceModal').style.display = 'none';
}
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
    closeInvoice();
}
});


window.addEventListener('click', function(event) {
    const modal = document.getElementById('invoiceModal');
    if (event.target === modal) {
    closeInvoice();
}
});
window.addEventListener("pageshow", function (event) {
    if (event.persisted) {
        location.reload();
    }
});
