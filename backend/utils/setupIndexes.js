const setupIndexes = async (db) => {
    try {
        console.log("Setting up MongoDB indexes...");

        const productsCollection = db.collection("products");
        const ordersCollection = db.collection("orders");
        const cartsCollection = db.collection("carts");

        // Indexes for products collection
        await productsCollection.createIndex({ category: 1 });
        await productsCollection.createIndex({ brand: 1 });
        await productsCollection.createIndex({ price: 1 });
        await productsCollection.createIndex({ price: -1 });
        await productsCollection.createIndex({ discountPercentage: -1 });
        await productsCollection.createIndex({ rating: -1 });
        await productsCollection.createIndex({ "meta.createdAt": -1 });

        // Compound index for category + price
        await productsCollection.createIndex({ category: 1, price: 1 });

        // Text index for fast search on products
        await productsCollection.createIndex(
            { title: "text", brand: "text", tags: "text" },
            { name: "product_search_text_idx" }
        );

        // Indexes for orders collection
        await ordersCollection.createIndex({ orderShortId: 1 });
        await ordersCollection.createIndex({ userId: 1 });
        await ordersCollection.createIndex({ guestPhone: 1 });
        await ordersCollection.createIndex({ "shippingAddress.phone": 1 });
        await ordersCollection.createIndex({ "items.productId": 1 });
        await ordersCollection.createIndex({ createdAt: -1 });
        await ordersCollection.createIndex({ orderStatus: 1, createdAt: -1 });

        // Indexes for carts collection
        await cartsCollection.createIndex({ userId: 1 }, { unique: true });

        console.log("MongoDB indexes setup successfully.");
    } catch (error) {
        console.error("Error setting up MongoDB indexes:", error);
    }
};

module.exports = { setupIndexes };

