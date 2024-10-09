let category = 'all';
let limit = 3;
let cart = JSON.parse(localStorage.getItem('cart')) || {}; 

async function fetchProduct(category, limit = 5) {
    try {
        let url = '';

        if (category === 'all') {
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

            const categoryResults = await Promise.all(categoryPromises);
            const allProducts = categoryResults.flat();

            return generateProductHTML(allProducts);

        } else {
            url = `https://dummyjson.com/products/category/${category}?limit=${limit}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            const products = data.products;
            
        }
    } catch (error) {
        console.error('Error fetching products:', error);
        return `<p>Error fetching products. Please try again later.</p>`;
    }
}

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

function changeCategory() {
    try {
        category = document.getElementById('category-select').value; 
        fetchProduct(category, limit).then(html => {
            document.getElementById('product-container').innerHTML = html;
        }).catch(error => {
            console.error('Error changing category:', error);
        });
    } catch (error) {
        console.error('Error handling category change:', error);
    }
}

function changeLimit() {
    try {
        limit = parseInt(document.getElementById('limit-select').value, 10); 
        fetchProduct(category, limit).then(html => {
            document.getElementById('product-container').innerHTML = html;
        }).catch(error => {
            console.error('Error changing limit:', error);
        });
    } catch (error) {
        console.error('Error handling limit change:', error);
    }
}

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

function removeFromCart(id) {
    try {
        delete cart[id];
        updateCart();
    } catch (error) {
        console.error('Error removing item from cart:', error);
    }
}

function incrementItem(id) {
    try {
        cart[id].quantity += 1;
        updateCart();
    } catch (error) {
        console.error('Error incrementing item quantity:', error);
    }
}

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

function updateCart() {
    try {
        localStorage.setItem('cart', JSON.stringify(cart)); 
        renderCart();
    } catch (error) {
        console.error('Error updating cart:', error);
    }
}

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
        checkout();
    } catch (error) {
        console.error('Error rendering cart:', error);
    }
}

function checkout() {
    try {
        let totalItems = 0;
        let totalPrice = 0;

        Object.keys(cart).forEach(id => {
            totalItems += cart[id].quantity;
            totalPrice += cart[id].price * cart[id].quantity;
        });

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

function completePurchase() {
    try {
        alert('Thank you for your purchase!');
        cart = {}; 
        updateCart(); 
        localStorage.removeItem('cart'); 
        document.getElementById('checkout-container').innerHTML = ''; 
    } catch (error) {
        console.error('Error completing purchase:', error);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        fetchProduct(category, limit).then(html => {
            document.getElementById('product-container').innerHTML = html;
        });
        renderCart();
    } catch (error) {
        console.error('Error during initial render:', error);
    }
});
