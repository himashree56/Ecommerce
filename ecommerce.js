
let itemData = [];
let categories = [];
        
        
if (!localStorage.getItem('itemCart')) {
            localStorage.setItem('itemCart', JSON.stringify([]));
        }
async function fetchMenu() {

    document.getElementById("loading-spinner").classList.remove("hidden");
    document.getElementById("menu-sections").classList.add("hidden");

    fetch("https://api.npoint.io/1cf1f2a7c23660eb1842?t=")
        .then(response => response.json())
        .then(data => {
            itemData = data;
            initializeStore();
            document.querySelector(".footer").style.display = "block";
        })
        .catch(error => {
            console.error("Error fetching data:", error);
        })
        .finally(() => {
            document.getElementById("loading-spinner").classList.add("hidden");
            document.getElementById("menu-sections").classList.remove("hidden");
        });
}

document.addEventListener("DOMContentLoaded", fetchMenu);
                    
function initializeStore() {
            const categorySet = new Set();
            itemData.forEach(item => {
                if (item.item_category) {
                    categorySet.add(item.item_category);
                }
            });
            
            categories = Array.from(categorySet);
            createCategoryNav();
            displayItemsByCategory();
            updateCartCount();
        }

function createCategoryNav() {
            const nav = document.getElementById('category-nav');
            categories.forEach(category => {
                const categoryId = category.toLowerCase().replace(/\s+/g, '-');
                nav.innerHTML += `<li><a href="#${categoryId}" data-category="${category}">${category}</a></li>`;
            });

            document.querySelectorAll('#category-nav a').forEach(link => {
                link.addEventListener('click', function(e) {
                    
                    document.querySelectorAll('#category-nav a').forEach(l => {
                        l.classList.remove('active');
                    });
                    
                
                    this.classList.add('active');
                    
                    const category = this.getAttribute('data-category');
                    if (category === 'all') {
                
                        document.querySelectorAll('.item-section').forEach(section => {
                            section.style.display = 'block';
                        });
                    } else {
                        
                        document.querySelectorAll('.item-section').forEach(section => {
                            section.style.display = 'none';
                        });
                    
                        const categorySection = document.getElementById(`category-${category.toLowerCase().replace(/\s+/g, '-')}`);
                        if (categorySection) {
                            categorySection.style.display = 'block';
                        }
                    }
                });
            });
        }
function displayItemsByCategory(items = itemData) {
            const menuContainer = document.getElementById('menu-sections');
            let sectionsHTML = '';
            sectionsHTML += `
                <div id="all" class="item-section">
                    <h2 class="section-title">All Items</h2>
                    <div id="all-items" class="itemcards">
                        ${generateItemCards(items)}
                    </div>
                </div>
            `;
            categories.forEach(category => {
                const categoryItems = itemData.filter(item => item.item_category === category);
                
                const categoryId = category.toLowerCase().replace(/\s+/g, '-');
                sectionsHTML += `
                    <div id="category-${categoryId}" class="item-section" style="display: none;">
                        <h2 class="section-title">${category}</h2>
                        <div id="itemcards-${categoryId}" class="itemcards">
                            ${generateItemCards(categoryItems)}
                        </div>
                    </div>
                `;
            });
            
            menuContainer.innerHTML = sectionsHTML;
        }
document.getElementById('search-button').addEventListener('click', searchItems);

function searchItems() {
            const query = document.getElementById('search-input').value.toLowerCase();
            const filteredItems = itemData.filter(item => item.item_name.toLowerCase().includes(query));
            
            displayItemsByCategory(filteredItems); // Pass the filtered items to display
        }
function generateItemCards(items) {
            if (items.length === 0) {
                return '<p>No items available in this category.</p>';
            }
            
            let cardsHTML = '<div id="itemcards">';
            items.forEach((item) => {
                cardsHTML += `
                    <div class="card">
                        <img src="${item.item_image}" alt="${item.item_name}"/>
                        <h3>${item.item_name}</h3>
                        <h3>$${item.item_price.toFixed(2)}</h3>
                        <p>${item.item_description}</p>
                        <button onclick="addToCart(${item.item_id})">Add to Cart</button>
                    </div>
                `;
            });
            cardsHTML += '</div>';
            return cardsHTML;
        }

function addToCart(item_id) {
            const item = itemData.find(item => item.item_id === item_id);
            if (item) {
                let cart = JSON.parse(localStorage.getItem('itemCart'));
                const existingItemIndex = cart.findIndex(i => i.item_id === item.item_id);
                
                if (existingItemIndex >= 0) {
                    cart[existingItemIndex].quantity += 1;
                } else {
                    const newItem = {...item, quantity: 1};
                    cart.push(newItem);
                }
                
                localStorage.setItem('itemCart', JSON.stringify(cart));
                updateCartCount();
                showAddedToCartFeedback(item.item_name);
            }
        }

function showAddedToCartFeedback(itemName) {
            const feedback = document.createElement('div');
            feedback.textContent = `${itemName} added to cart!`;
            feedback.style.position = 'fixed';
            feedback.style.bottom = '80px';
            feedback.style.right = '20px';
            feedback.style.backgroundColor = '#4CAF50';
            feedback.style.color = 'white';
            feedback.style.padding = '10px 20px';
            feedback.style.borderRadius = '5px';
            feedback.style.zIndex = '1000';
            feedback.style.opacity = '0';
            feedback.style.transition = 'opacity 0.3s ease';
            
            document.body.appendChild(feedback);
        
            setTimeout(() => {
                feedback.style.opacity = '1';
            }, 10);
            
            setTimeout(() => {
                feedback.style.opacity = '0';
                setTimeout(() => {
                    document.body.removeChild(feedback);
                }, 300);
            }, 2000);
        }

function updateCartCount() {
            const cart = JSON.parse(localStorage.getItem('itemCart'));
            const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
            document.getElementById('cart-count').textContent = totalItems;
            document.getElementById('floating-cart-count').textContent = totalItems;
        }

function goToCheckout() {
            window.location.href = 'checkout.html';
        }

        