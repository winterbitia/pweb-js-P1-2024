async function fetchProduct(category, limit = 5) {
    try {
        let url = '';

        // Check if the user selected "All Categories"
        if (category === 'all') {
            // Fetch from all categories
            const categories = ['smartphones', 'groceries', 'kitchen-accessories']; // Add more categories as needed
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
            
            return generateProductHTML(products);
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        return `<p>Error fetching products. Please try again later.</p>`;
    }
}

// Extracted function to generate HTML for products
function generateProductHTML(products) {
    let productHTML = products.map(product => `
        <div class="product">
            <h2>${product.title}</h2>
            <img src="${product.thumbnail}" alt="${product.title}">
            <p>${product.category}</p>
            <p>Price: $${product.price}</p>
            <button class="add-to-cart" onclick="addToCart(${product.id}, '${product.title}', ${product.price})">Add to Cart</button>
        </div>
    `).join('');

    return productHTML;
}

// Default values
let category = 'all';
let limit = 3;
let cart = JSON.parse(localStorage.getItem('cart')) || {};

// Function to handle the category change
function changeCategory() {
    category = document.getElementById('category-select').value; // Get the selected category
    fetchProduct(category, limit).then(html => {
        document.getElementById('product-container').innerHTML = html;
    });
}

// Function to handle the limit change
function changeLimit() {
    limit = parseInt(document.getElementById('limit-select').value, 10); // Get the new limit
    fetchProduct(category, limit).then(html => {
        document.getElementById('product-container').innerHTML = html;
    });
}

// Function to add an item to the cart
function addToCart(id, title, price) {
    if (cart[id]) {
        cart[id].quantity += 1;
    } else {
        cart[id] = { title, price, quantity: 1 };
    }
    updateCart();
}

// Function to remove an item from the cart
function removeFromCart(id) {
    delete cart[id];
    updateCart();
}

// Function to increment the quantity of an item
function incrementItem(id) {
    cart[id].quantity += 1;
    updateCart();
}

// Function to decrement the quantity of an item
function decrementItem(id) {
    if (cart[id].quantity > 1) {
        cart[id].quantity -= 1;
    } else {
        removeFromCart(id);
    }
    updateCart();
}

// Function to update the cart in local storage and render it
function updateCart() {
    localStorage.setItem('cart', JSON.stringify(cart)); // Save cart to local storage
    renderCart();
}

// Function to render the cart
function renderCart() {
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
}

// Initial render for "All Categories"
document.addEventListener('DOMContentLoaded', () => {
    // Load all categories by default
    fetchProduct(category, limit).then(html => {
        document.getElementById('product-container').innerHTML = html;
    });
    renderCart();
});
