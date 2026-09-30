const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");

const addToCart = async (req, res) => {
    try {
        const { productId, quantity, size, color, colorImage } = req.body;
        const db = getDB();
        const cartsCollection = db.collection("carts");

        const cart = await cartsCollection.findOne({
            userId: new ObjectId(req.user.id)
        });

        if (!cart) {
            const newCart = {
                userId: new ObjectId(req.user.id),
                items: [
                    {
                        productId: new ObjectId(productId),
                        quantity: Number(quantity),
                        size: size || "",
                        color: color || "",
                        colorImage: colorImage || ""
                    }
                ],
                createdAt: new Date(),
                updatedAt: new Date()
            };

            await cartsCollection.insertOne(newCart);

            return res.send({
                message: "Product added to cart"
            });
        }

        const existingProduct = cart.items.find(
            item => item.productId.toString() === productId && (item.size || "") === (size || "") && (item.color || "") === (color || "")
        );

        if (existingProduct) {
            await cartsCollection.updateOne(
                {
                    userId: new ObjectId(req.user.id),
                    items: {
                        $elemMatch: {
                            productId: new ObjectId(productId),
                            size: size || "",
                            color: color || ""
                        }
                    }
                },
                {
                    $inc: {
                        "items.$.quantity": Number(quantity)
                    },
                    $set: {
                        updatedAt: new Date()
                    }
                }
            );
        } else {
            await cartsCollection.updateOne(
                {
                    userId: new ObjectId(req.user.id)
                },
                {
                    $push: {
                        items: {
                            productId: new ObjectId(productId),
                            quantity: Number(quantity),
                            size: size || "",
                            color: color || "",
                            colorImage: colorImage || ""
                        }
                    },
                    $set: {
                        updatedAt: new Date()
                    }
                }
            );
        }

        res.send({
            message: "Product added to cart"
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

const getCart = async (req, res) => {
    try {
        const db = getDB();
        const cartsCollection = db.collection("carts");

        const cart = await cartsCollection.aggregate([
            {
                $match: {
                    userId: new ObjectId(req.user.id)
                }
            },
            {
                $unwind: "$items"
            },
            {
                $lookup: {
                    from: "products",
                    localField: "items.productId",
                    foreignField: "_id",
                    as: "product"
                }
            },
            {
                $unwind: "$product"
            },
            {
                $project: {
                    _id: 0,
                    productId: "$product._id",
                    title: "$product.title",
                    thumbnail: { $ifNull: ["$items.colorImage", "$product.thumbnail"] },
                    price: "$product.price",
                    stock: "$product.stock",
                    brand: "$product.brand",
                    category: "$product.category",
                    size: "$items.size",
                    color: "$items.color",
                    colorImage: "$items.colorImage",
                    quantity: "$items.quantity",
                    subtotal: {
                        $multiply: [
                            "$items.quantity",
                            "$product.price"
                        ]
                    }
                }
            }
        ]).toArray();

        if (!cart.length) {
            return res.send({
                totalItems: 0,
                totalPrice: 0,
                items: []
            });
        }

        const totalItems = cart.reduce(
            (sum, item) => sum + item.quantity,
            0
        );

        const totalPrice = cart.reduce(
            (sum, item) => sum + item.subtotal,
            0
        );

        res.send({
            totalItems,
            totalPrice,
            items: cart
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

const updateCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const { quantity, size = "", color = "" } = req.body;

        const db = getDB();
        const cartsCollection = db.collection("carts");

        const targetElem = {
            productId: new ObjectId(productId),
            size: String(size || ""),
            color: String(color || "")
        };

        if (Number(quantity) <= 0) {
            const result = await cartsCollection.updateOne(
                {
                    userId: new ObjectId(req.user.id)
                },
                {
                    $pull: {
                        items: targetElem
                    },
                    $set: {
                        updatedAt: new Date()
                    }
                }
            );

            if (result.modifiedCount === 0) {
                return res.status(404).send({
                    message: "Product not found in cart"
                });
            }

            return res.send({
                message: "Product removed from cart"
            });
        }

        const result = await cartsCollection.updateOne(
            {
                userId: new ObjectId(req.user.id),
                items: {
                    $elemMatch: targetElem
                }
            },
            {
                $set: {
                    "items.$.quantity": Number(quantity),
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({
                message: "Product not found in cart"
            });
        }

        res.send({
            message: "Cart updated successfully"
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

const removeFromCart = async (req, res) => {
    try {
        const { productId } = req.params;
        const { size = "", color = "" } = req.query || req.body || {};

        const db = getDB();
        const cartsCollection = db.collection("carts");

        const targetElem = {
            productId: new ObjectId(productId),
            size: String(size || ""),
            color: String(color || "")
        };

        const result = await cartsCollection.updateOne(
            {
                userId: new ObjectId(req.user.id)
            },
            {
                $pull: {
                    items: targetElem
                },
                $set: {
                    updatedAt: new Date()
                }
            }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).send({
                message: "Product not found in cart"
            });
        }

        res.send({
            message: "Product removed from cart"
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

module.exports = {
    addToCart,
    getCart,
    updateCart,
    removeFromCart
};