
const express = require("express");
const Razorpay = require("razorpay");
require("dotenv").config();

const app = express();

// Middleware
app.use(express.json());
app.use(express.static("public"));

// Check API keys
if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
    throw new Error("Razorpay API keys are missing from .env");
}

// Razorpay configuration
const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET
});

// Temporary product database
const products = [
    { id: 1, name: "Headphones", price: 1499 },
    { id: 2, name: "Keyboard", price: 999 },
    { id: 3, name: "Mouse", price: 499 },
    { id: 4, name: "Smartwatch", price: 2499 }
];

// Create payment order
app.post("/api/create-order", async (req, res) => {

    try {

        const { productId } = req.body;

        const product = products.find(
            item => item.id === Number(productId)
        );

        if (!product) {
            return res.status(404).json({
                message: "Product not found"
            });
        }

        const amountInPaise = product.price * 100;

        const order = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            receipt: `nshop_${Date.now()}`
        });

        res.json({
            success: true,
            keyId: process.env.RAZORPAY_KEY_ID,
            orderId: order.id,
            amount: order.amount,
            currency: order.currency,
            productName: product.name
        });

    } catch (error) {
    console.error("Razorpay Error:", error);

    res.status(500).json({
        success: false,
        message: error.error?.description || error.message
    });
}

});

// Server port
const PORT = process.env.PORT || 5000;

// Start server
app.listen(PORT, () => {
    console.log(`N-Shop running at http://localhost:${PORT}`);
});
