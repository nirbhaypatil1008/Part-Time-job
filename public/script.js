
// Our sample products

const products = [
    {
        id: 1,
        name: "Headphones",
        price: 1499
    },
    {
        id: 2,
        name: "Keyboard",
        price: 999
    },
    {
        id: 3,
        name: "Mouse",
        price: 499
    },
    {
        id: 4,
        name: "Smartwatch",
        price: 2499
    }
];

// Shopping cart

let cart = [];

// Display products

const productList = document.getElementById("productList");

function displayProducts() {

    productList.innerHTML = "";

    products.forEach(product => {

        productList.innerHTML += `
            <div class="product-card">

                <h3>${product.name}</h3>

                <p>Price: ₹${product.price}</p>

                <button onclick="addToCart(${product.id})">
                    Add to Cart
                </button>

                <button onclick="buyNow(${product.id})">
                    Buy Now
                </button>

            </div>
        `;
    });
}

// Add product to cart

function addToCart(productId) {

    const product = products.find(
        item => item.id === productId
    );

    const existingItem = cart.find(
        item => item.id === productId
    );

    if (existingItem) {
        existingItem.quantity++;
    } else {
        cart.push({
            ...product,
            quantity: 1
        });
    }

    updateCart();
}

// Update cart

function updateCart() {

    const cartItems = document.getElementById("cartItems");

    let total = 0;
    let count = 0;

    cartItems.innerHTML = "";

    cart.forEach(item => {

        total += item.price * item.quantity;
        count += item.quantity;

        cartItems.innerHTML += `
            <div class="cart-item">
                <span>
                    ${item.name} × ${item.quantity}
                </span>

                <span>
                    ₹${item.price * item.quantity}
                </span>
            </div>
        `;
    });

    document.getElementById("cartTotal").textContent = total;

    document.getElementById("cartCount").textContent = count;
}

// Initial display

displayProducts();
updateCart();

async function buyNow(productId) {

    try {
        // Step 1: Create order from backend
        const response = await fetch("/api/create-order", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                productId: productId
            })
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || "Order creation failed");
        }

        console.log("Order created:", data);

        // Step 2: Configure Razorpay Checkout
        const options = {
            key: data.keyId,
            amount: data.amount,
            currency: data.currency,
            name: "N-Shop",
            description: data.productName,
            order_id: data.orderId,

            handler: function (paymentResponse) {
                console.log("Payment response:", paymentResponse);

                alert("Payment completed. Verifying payment...");

                // Backend signature verification will be added next.
            },

            theme: {
                color: "#245b43"
            }
        };

        // Step 3: Open Razorpay payment interface
        const paymentObject = new Razorpay(options);

        paymentObject.open();

    } catch (error) {
        console.error("Payment Error:", error);
        alert("Error: " + error.message);
    }
}