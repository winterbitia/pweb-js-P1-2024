async function fetchProduct(category, limit = 5) {
    try {
        let url = '';

        // Check if the user selected "All Categories"
        if (category === 'all') {
            // Fetch from all categories
            const categories = ['smartphones', 'laptops', 'fragrances']; // Add more categories as needed
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

            // Generate HTML for all products
            let productHTML = allProducts.map(product => `
                <div class="product">
                    <h2>${product.title}</h2>
                    <img src="${product.thumbnail}" alt="${product.title}">
                    <p>${product.description}</p>
                    <p>Price: $${product.price}</p>
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
            `).join('');

            return productHTML;

        } else {
            // Fetch products for a specific category
            url = `https://dummyjson.com/products/category/${category}?limit=${limit}`;
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            const products = data.products;
            
            // Generate HTML for each product
            let productHTML = products.map(product => `
                <div class="product">
                    <h2>${product.title}</h2>
                    <img src="${product.thumbnail}" alt="${product.title}">
                    <p>${product.description}</p>
                    <p>Price: $${product.price}</p>
                    <button class="add-to-cart" data-id="${product.id}">Add to Cart</button>
                </div>
                `).join('');
                
                return productHTML;
            }
    } catch (error) {
        console.error('Error fetching products:', error);
        return `<p>Error fetching products. Please try again later.</p>`;
    }
}

let category = 'all';
let limit = 5;

// Function to handle the category change
function changeCategory() {
    category = document.getElementById('category-select').value; // Get the selected category
    fetchProduct(category, limit).then(html => {
        document.getElementById('product-container').innerHTML = html;
    });
}

// Initial render for "All Categories"
document.addEventListener('DOMContentLoaded', () => {
    // Load all categories by default
    fetchProduct(category, limit).then(html => {
        document.getElementById('product-container').innerHTML = html;
    });
});
