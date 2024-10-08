let category = 'all'; // Default category
let limit = 3; // Default limit
let cart = JSON.parse(localStorage.getItem('cart')) || {}; // Load cart from local storage

async function fetchProduct(category, limit = 5) {
    try {
        let url = '';

        // Check if the user selected "All Categories"
        if (category === 'all') {
            // Fetch from all categories
            const categories = ['smartphones', 'groceries', 'kitchen-accessories']; 
            const categoryPromises = categories.map(cat =>
                fetch(`https://dummyjson.com/products/category/${cat}?limit=${limit}`)
                    .then(response => {
                        if (!response.ok) {
                            throw new Error(`HTTP error! Status: ${response.status}`);
                        }
                        return response.json();
                    })
                    .then(data => data.products)
            );

            // Wait for all promises and merge products from all categories
            const categoryResults = await Promise.all(categoryPromises);
            const allProducts = categoryResults.flat(); // Combine products into a single list

            // Call result from generateProductHTML
            return generateProductHTML(allProducts);

        } else {
            // Fetch products for a specific category
            url = `https://dummyjson.com/products/category/${category}?limit=${limit}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            const products = data.products;
            
            // Call result from generateProductHTML
            return generateProductHTML(products);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        return `<p>Error fetching products. Please try again later.</p>`;
    }
}

// Function to generate HTML for products
function generateProductHTML(products) {
    try {
        let productHTML = products.map(product => `
            <div class="product">
                <h2>${product.title}</h2>
                <img src="${product.thumbnail}" alt="${product.title}" width="90vw">
                <p>Category: ${product.category}</p>
                <p>Price: $${product.price}</p>
                <button class="add-to-cart" onclick="addToCart(${product.id}, '${product.title}', ${product.price})">Add to Cart</button>
            </div>
        `).join('');
    
        return productHTML;
    } catch (error) {
        console.error('Error generating product HTML:', error);
        return `<p>Could not generate product list. Please try again later.</p>`;
    }
}

// Function to handle category change
function changeCategory() {
    try {
        category = document.getElementById('category-select').value; // Get the selected category
        fetchProduct(category, limit).then(html => {
            document.getElementById('product-container').innerHTML = html;
        }).catch(error => {
            console.error('Error changing category:', error);
        });
    } catch (error) {
        console.error('Error handling category change:', error);
    }
}

// Function to handle limit change
function changeLimit() {
    try {
        limit = parseInt(document.getElementById('limit-select').value, 10); // Get the new limit
        fetchProduct(category, limit).then(html => {
            document.getElementById('product-container').innerHTML = html;
        }).catch(error => {
            console.error('Error changing limit:', error);
        });
    } catch (error) {
        console.error('Error handling limit change:', error);
    }
}

// Function to add an item to the cart
function addToCart(id, title, price) {
    try {
        if (cart[id]) {
            cart[id].quantity += 1;
        } else {
            cart[id] = { title, price, quantity: 1 };
        }
        updateCart();
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

// Function to remove an item from the cart
function removeFromCart(id) {
    try {
        delete cart[id];
        updateCart();
    } catch (error) {
        console.error('Error removing item from cart:', error);
    }
}

// Function to increment the quantity of an item
function incrementItem(id) {
    try {
        cart[id].quantity += 1;
        updateCart();
    } catch (error) {
        console.error('Error incrementing item quantity:', error);
    }
}

// Function to decrement the quantity of an item
function decrementItem(id) {
    try {
        if (cart[id].quantity > 1) {
            cart[id].quantity -= 1;
        } else {
            removeFromCart(id);
        }
        updateCart();
    } catch (error) {
        console.error('Error decrementing item quantity:', error);
    }
}

// Function to update the cart in local storage and render it
function updateCart() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart)); // Save cart to local storage
        renderCart();
    } catch (error) {
        console.error('Error updating cart:', error);
    }
}

// Function to render the cart
function renderCart() {
    try {
        const cartContainer = document.getElementById('cart-container');
        let cartHTML = '';

        if (Object.keys(cart).length === 0) {
            cartHTML = '<p>Your cart is empty.</p>';
        } else {
            cartHTML = Object.keys(cart).map(id => `
                <div class="cart-item">
                    <h3>${cart[id].title}</h3>
                    <p>Price: $${cart[id].price}</p>
                    <p>Quantity: 
                        <button onclick="decrementItem(${id})">-</button> 
                        ${cart[id].quantity} 
                        <button onclick="incrementItem(${id})">+</button>
                    </p>
                    <button onclick="removeFromCart(${id})">Remove</button>
                </div>
            `).join('');
        }

        cartContainer.innerHTML = cartHTML;
    } catch (error) {
        console.error('Error rendering cart:', error);
    }
}

// Function to handle the checkout process
function checkout() {
    try {
        let totalItems = 0;
        let totalPrice = 0;

        // Iterate through the cart and calculate totals
        Object.keys(cart).forEach(id => {
            totalItems += cart[id].quantity;
            totalPrice += cart[id].price * cart[id].quantity;
        });

        // Display the checkout summary
        const checkoutContainer = document.getElementById('checkout-container');
        checkoutContainer.innerHTML = `
            <div class="checkout-summary">
                <h2>Checkout Summary</h2>
                <p>Total Items: ${totalItems}</p>
                <p>Total Price: $${totalPrice.toFixed(2)}</p>
                <button onclick="completePurchase()">Complete Purchase</button>
            </div>
        `;
    } catch (error) {
        console.error('Error during checkout:', error);
    }
}

// Function to complete the purchase (placeholder)
function completePurchase() {
    try {
        alert('Thank you for your purchase!');
        cart = {}; // Clear the cart
        updateCart(); // Update the cart UI
        localStorage.removeItem('cart'); // Clear local storage
        document.getElementById('checkout-container').innerHTML = ''; // Clear checkout display
    } catch (error) {
        console.error('Error completing purchase:', error);
    }
}

// Initial render
document.addEventListener('DOMContentLoaded', () => {
    try {
        // Load all categories by default
        fetchProduct(category, limit).then(html => {
            document.getElementById('product-container').innerHTML = html;
        });
        renderCart();
    } catch (error) {
        console.error('Error during initial render:', error);
    }
});
