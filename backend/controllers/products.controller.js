const { ObjectId } = require("mongodb");
const { getDB } = require("../config/db");
const { withCache, clearCache } = require("../utils/cache");
const { buildIdQuery } = require("../utils/buildIdQuery");

const createProduct = async (req, res) => {
    try {
        const db = getDB();
        const productsCollection = db.collection("products");

        const {
            title,
            description,
            category,
            price,
            discountPercentage,
            stock,
            tags,
            brand,
            weight,
            dimensions,
            warrantyInformation,
            shippingInformation,
            returnPolicy,
            minimumOrderQuantity,
            sizes,
            sizeMeasurements,
            colors,
            images,
            thumbnail,
            attributes
        } = req.body;

        const normalizedPrice = Number(price ?? 0);
        const normalizedDiscountPercentage = Number(discountPercentage ?? 0);
        const normalizedStock = Number(stock ?? 0);
        const normalizedMinimumOrderQuantity = Number(minimumOrderQuantity ?? 1);

        const newProduct = {
            title,
            description,
            category,
            price: normalizedPrice,
            discountPercentage: normalizedDiscountPercentage,
            rating: 0,
            stock: normalizedStock,
            tags,
            brand,
            sku: `SKU-${Date.now()}`,
            weight: Number(weight ?? 0),

            dimensions: {
                width: dimensions?.width || null,
                height: dimensions?.height || null,
                depth: dimensions?.depth || null
            },

            warrantyInformation,
            shippingInformation,

            availabilityStatus: normalizedStock > 0
                ? "In Stock"
                : "Out of Stock",

            reviews: [],

            returnPolicy,
            minimumOrderQuantity: normalizedMinimumOrderQuantity,
            sizes: sizes || [],
            sizeMeasurements: sizeMeasurements || [],
            colors: colors || [],
            attributes: attributes || {},

            meta: {
                createdAt: new Date(),
                updatedAt: new Date(),
                barcode: "",
                qrCode: ""
            },

            images,
            thumbnail
        };

        const result = await productsCollection.insertOne(newProduct);
        clearCache("product");

        res.status(201).send({
            message: "Product created successfully",
            insertedId: result.insertedId
        });

    } catch (error) {
        console.log(error);
        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

const getBestSellingProductsInternal = async (db) => {
    const productsCollection = db.collection("products");
    const ordersCollection = db.collection("orders");

    let products = await ordersCollection
        .aggregate([
            { $match: { orderStatus: { $ne: "Cancelled" } } },
            { $sort: { createdAt: -1 } },
            { $limit: 1000 },
            { $unwind: "$items" },
            {
                $project: {
                    productId: {
                        $cond: {
                            if: { $eq: [{ $type: "$items.productId" }, "string"] },
                            then: {
                                $convert: {
                                    input: "$items.productId",
                                    to: "objectId",
                                    onError: "$items.productId",
                                    onNull: "$items.productId"
                                }
                            },
                            else: "$items.productId"
                        }
                    },
                    quantity: "$items.quantity"
                }
            },
            {
                $group: {
                    _id: "$productId",
                    totalSold: { $sum: "$quantity" }
                }
            },
            { $sort: { totalSold: -1 } },
            { $limit: 15 },
            {
                $lookup: {
                    from: "products",
                    localField: "_id",
                    foreignField: "_id",
                    as: "product"
                }
            },
            { $unwind: "$product" },
            {
                $replaceRoot: {
                    newRoot: {
                        $mergeObjects: ["$product", { totalSold: "$totalSold" }]
                    }
                }
            },
            {
                $project: {
                    description: 0,
                    dimensions: 0,
                    reviews: 0,
                    images: 0,
                    sizeMeasurements: 0,
                    warrantyInformation: 0,
                    shippingInformation: 0,
                    returnPolicy: 0,
                    meta: 0,
                    tags: 0,
                    sku: 0,
                    weight: 0,
                    availabilityStatus: 0,
                    minimumOrderQuantity: 0
                }
            }
        ])
        .toArray();

    if (products.length === 0) {
        products = await productsCollection
            .find({})
            .project({
                description: 0,
                dimensions: 0,
                reviews: 0,
                images: 0,
                sizeMeasurements: 0,
                warrantyInformation: 0,
                shippingInformation: 0,
                returnPolicy: 0,
                meta: 0,
                tags: 0,
                sku: 0,
                weight: 0,
                availabilityStatus: 0,
                minimumOrderQuantity: 0
            })
            .sort({ rating: -1, price: -1 })
            .limit(12)
            .toArray();
    }

    return products.map(product => ({
        ...product,
        badge: "best-seller"
    }));
};

const getBestSellingIds = async (db) => {
    return await withCache("bestSellingIdsSet", 600, async () => {
        try {
            const bestProducts = await getBestSellingProductsInternal(db);
            return Array.from(new Set(bestProducts.map(p => (p._id ? p._id.toString() : ""))));
        } catch (e) {
            console.error("Error fetching best selling IDs:", e.message);
            return [];
        }
    });
};

const escapeRegex = (str) => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Helper function to dynamically resolve category hierarchy identifiers
const getCategoryIdentifiers = async (db, categoryInput) => {
    if (!categoryInput || !categoryInput.trim()) return [];

    const allCategories = await withCache("allCategoriesRaw", 600, async () => {
        const categoriesCollection = db.collection("categories");
        return await categoriesCollection.find({}).toArray();
    });

    const inputs = categoryInput.split(",").map(c => c.trim()).filter(Boolean);
    const matchedStrings = new Set();

    for (const input of inputs) {
        matchedStrings.add(input);
        const lowerInput = input.toLowerCase();

        for (const parent of allCategories) {
            const isParentMatch =
                parent.slug?.toLowerCase() === lowerInput ||
                parent.name?.toLowerCase() === lowerInput ||
                (parent._id && parent._id.toString() === input);

            if (isParentMatch) {
                // Selected category is a PARENT: Include parent and ALL of its child subcategories
                if (parent.slug) matchedStrings.add(parent.slug);
                if (parent.name) matchedStrings.add(parent.name);
                if (parent._id) matchedStrings.add(parent._id.toString());

                for (const child of parent.children ?? []) {
                    if (child.slug) matchedStrings.add(child.slug);
                    if (child.name) matchedStrings.add(child.name);
                    for (const cat of child.categories ?? []) {
                        if (cat) matchedStrings.add(cat);
                    }
                }
            } else {
                // Check if input matches a CHILD subcategory specifically
                for (const child of parent.children ?? []) {
                    const isChildMatch =
                        child.slug?.toLowerCase() === lowerInput ||
                        child.name?.toLowerCase() === lowerInput ||
                        (child.categories ?? []).some(c => c?.toLowerCase() === lowerInput);

                    if (isChildMatch) {
                        // Selected category is a CHILD: Include ONLY this specific child category & its sub-categories
                        if (child.slug) matchedStrings.add(child.slug);
                        if (child.name) matchedStrings.add(child.name);
                        for (const cat of child.categories ?? []) {
                            if (cat) matchedStrings.add(cat);
                        }
                    }
                }
            }
        }
    }

    return Array.from(matchedStrings);
};

const getAllProducts = async (req, res) => {

    try {
        const db = getDB();
        const productsCollection = db.collection("products");

        const page = req.query.page ? parseInt(req.query.page) : null;
        const limit = req.query.limit ? parseInt(req.query.limit) : null;

        const search = req.query.search || "";
        const category = req.query.category || "";
        const brand = req.query.brand || "";
        const sort = req.query.sort || "";

        const queryConditions = [];

        // 1. Resolve Category Filtering (Parent vs Child category hierarchy)
        if (category && category.trim()) {
            const categoryIdentifiers = await getCategoryIdentifiers(db, category.trim());

            if (categoryIdentifiers.length > 0) {
                const catRegexes = categoryIdentifiers.map(str => new RegExp(`^${escapeRegex(str)}$`, 'i'));
                const catObjectIds = categoryIdentifiers
                    .filter(str => ObjectId.isValid(str))
                    .map(str => new ObjectId(str));

                const catOrList = [
                    { category: { $in: catRegexes } },
                    ...(catObjectIds.length > 0 ? [{ category: { $in: catObjectIds } }] : [])
                ];

                queryConditions.push({ $or: catOrList });
            }
        }

        // 2. Resolve Search Query Filtering
        if (search && search.trim()) {
            const cleanSearch = search.trim();
            const searchRegex = new RegExp(escapeRegex(cleanSearch), "i");

            // Also check if search query matches any category hierarchy
            const categorySearchIdentifiers = await getCategoryIdentifiers(db, cleanSearch);
            const searchCatRegexes = categorySearchIdentifiers.map(str => new RegExp(`^${escapeRegex(str)}$`, 'i'));

            const searchOrConditions = [
                { title: searchRegex },
                { description: searchRegex },
                { brand: searchRegex },
                { tags: searchRegex },
                { category: searchRegex },
                { sku: searchRegex }
            ];

            if (searchCatRegexes.length > 0) {
                searchOrConditions.push({ category: { $in: searchCatRegexes } });
            }

            queryConditions.push({ $or: searchOrConditions });
        }

        // 3. Resolve Brand Filtering
        if (brand && brand.trim()) {
            queryConditions.push({ brand: brand.trim() });
        }

        // Combine all conditions using $and so search + category + brand work seamlessly together
        const query = queryConditions.length > 0
            ? (queryConditions.length === 1 ? queryConditions[0] : { $and: queryConditions })
            : {};

        let sortOption = { _id: -1 };

        if (sort === "asc") {
            sortOption = { price: 1 };
        } else if (sort === "desc") {
            sortOption = { price: -1 };
        }

        const cacheKey = `products_${page}_${limit}_${encodeURIComponent(search)}_${encodeURIComponent(category)}_${encodeURIComponent(brand)}_${sort}`;
        const result = await withCache(cacheKey, 600, async () => {
            const bestSellingIds = await getBestSellingIds(db);
            const bestSellingIdsSet = new Set(bestSellingIds);

            const formatProducts = (prods) => prods.map(p => ({
                ...p,
                badge: p.badge || (bestSellingIdsSet.has(p._id ? p._id.toString() : "") ? "best-seller" : null)
            }));

            if (page && limit) {
                const skip = (page - 1) * limit;
                const totalProducts = Object.keys(query).length === 0 
                    ? await productsCollection.estimatedDocumentCount()
                    : await productsCollection.countDocuments(query);

                const products = await productsCollection
                    .find(query)
                    .project({ 
                        description: 0, 
                        dimensions: 0, 
                        reviews: 0, 
                        images: 0, 
                        sizeMeasurements: 0, 
                        warrantyInformation: 0, 
                        shippingInformation: 0, 
                        returnPolicy: 0, 
                        tags: 0,
                        sku: 0,
                        weight: 0,
                        availabilityStatus: 0,
                        minimumOrderQuantity: 0
                    })
                    .sort(sortOption)
                    .skip(skip)
                    .limit(limit)
                    .toArray();

                return {
                    totalProducts,
                    currentPage: page,
                    totalPages: Math.ceil(totalProducts / limit),
                    products: formatProducts(products),
                };
            } else {
                const products = await productsCollection
                    .find(query)
                    .project({ 
                        description: 0, 
                        dimensions: 0, 
                        reviews: 0, 
                        images: 0, 
                        sizeMeasurements: 0, 
                        warrantyInformation: 0, 
                        shippingInformation: 0, 
                        returnPolicy: 0, 
                        tags: 0,
                        sku: 0,
                        weight: 0,
                        availabilityStatus: 0,
                        minimumOrderQuantity: 0
                    })
                    .sort(sortOption)
                    .toArray();

                return {
                    totalProducts: products.length,
                    products: formatProducts(products),
                };
            }
        });

        res.send(result);

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getSingleProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const productsCollection = db.collection("products");

        const result = await withCache(`product_${id}`, 600, async () => {
            return await productsCollection.findOne(buildIdQuery(id));
        });

        if (!result) {
            return res.status(404).send({ message: "Product not found" });
        }

        res.send(result);
    } catch (error) {
        console.error(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const productsCollection = db.collection("products");

        const updatedFields = {
            ...req.body,
            ...(req.body.price !== undefined && { price: Number(req.body.price) }),
            ...(req.body.discountPercentage !== undefined && { discountPercentage: Number(req.body.discountPercentage) }),
            ...(req.body.stock !== undefined && { stock: Number(req.body.stock) }),
            ...(req.body.weight !== undefined && { weight: Number(req.body.weight) }),
            ...(req.body.minimumOrderQuantity !== undefined && { minimumOrderQuantity: Number(req.body.minimumOrderQuantity) }),
            "meta.updatedAt": new Date()
        };

        const result = await productsCollection.updateOne(
            buildIdQuery(id),
            { $set: updatedFields }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ message: "Product not found" });
        }

        clearCache("product");
        res.send({ message: "Product updated successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const deleteProduct = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const productsCollection = db.collection("products");

        const result = await productsCollection.deleteOne(buildIdQuery(id));

        if (result.deletedCount === 0) {
            return res.status(404).send({ message: "Product not found" });
        }

        clearCache("product");
        res.send({ message: "Product deleted successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getFlashSaleProducts = async (req, res) => {
    try {
        const { products, maxStock } = await withCache("flashSaleProducts", 600, async () => {
            const db = getDB();
            const productsCollection = db.collection("products");

            const products = await productsCollection
                .aggregate([
                    {
                        $match: {
                            discountPercentage: { $gte: 50 },
                            stock: { $gt: 0 }
                        }
                    },
                    {
                        $project: {
                            description: 0,
                            dimensions: 0,
                            reviews: 0,
                            images: 0,
                            sizeMeasurements: 0,
                            warrantyInformation: 0,
                            shippingInformation: 0,
                            returnPolicy: 0,
                            meta: 0,
                            tags: 0,
                            sku: 0,
                            weight: 0,
                            availabilityStatus: 0,
                            minimumOrderQuantity: 0
                        }
                    },
                    {
                        $sort: {
                            discountPercentage: -1
                        }
                    },
                    {
                        $limit: 8
                    }
                ])
                .toArray();

            const maxStockResult = await productsCollection
                .aggregate([
                    {
                        $match: {
                            discountPercentage: { $gte: 50 },
                            stock: { $gt: 0 }
                        }
                    },
                    {
                        $group: {
                            _id: null,
                            maxStock: { $max: "$stock" }
                        }
                    }
                ])
                .toArray();

            const maxStock = maxStockResult.length > 0 ? maxStockResult[0].maxStock : 1;
            return { products, maxStock };
        });

        res.send({ products, maxStock });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getBestSellingProducts = async (req, res) => {
    try {
        const result = await withCache("bestSellingProducts", 600, async () => {
            const db = getDB();
            return await getBestSellingProductsInternal(db);
        });

        res.send({ products: result });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getNewArrivals = async (req, res) => {
    try {
        const products = await withCache("newArrivals", 600, async () => {
            const db = getDB();
            const productsCollection = db.collection("products");

            return await productsCollection
                .find({})
                .project({
                    description: 0,
                    dimensions: 0,
                    reviews: 0,
                    images: 0,
                    sizeMeasurements: 0,
                    warrantyInformation: 0,
                    shippingInformation: 0,
                    returnPolicy: 0,
                    meta: 0,
                    tags: 0,
                    sku: 0,
                    weight: 0,
                    availabilityStatus: 0,
                    minimumOrderQuantity: 0
                })
                .sort({
                    _id: -1
                })
                .limit(12)
                .toArray();
        });

        res.send({ products });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getLatestReviews = async (req, res) => {
    try {
        const reviews = await withCache("latestReviews", 600, async () => {
            const db = getDB();
            const productsCollection = db.collection("products");

            // We only look at products that have reviews to reduce the pipeline size
            return await productsCollection.aggregate([
                { $match: { "reviews.0": { $exists: true } } },
                { $unwind: "$reviews" },
                { $replaceRoot: { newRoot: { $mergeObjects: ["$reviews", { productName: "$title" }] } } },
                { $sort: { date: -1 } },
                { $limit: 10 }
            ]).toArray();
        });

        res.send({ reviews });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getFeaturedProducts = async (req, res) => {
    try {
        const products = await withCache("featuredProducts", 600, async () => {
            const db = getDB();
            const productsCollection = db.collection("products");

            return await productsCollection
                .find({})
                .project({
                    description: 0,
                    dimensions: 0,
                    reviews: 0,
                    images: 0,
                    sizeMeasurements: 0,
                    warrantyInformation: 0,
                    shippingInformation: 0,
                    returnPolicy: 0,
                    meta: 0,
                    tags: 0,
                    sku: 0,
                    weight: 0,
                    availabilityStatus: 0,
                    minimumOrderQuantity: 0
                })
                .sort({ rating: -1 })
                .limit(20)
                .toArray();
        });

        res.send({ products });
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports = {
    createProduct,
    getAllProducts,
    getSingleProduct,
    updateProduct,
    deleteProduct,
    getFlashSaleProducts,
    getBestSellingProducts,
    getNewArrivals,
    getLatestReviews,
    getFeaturedProducts
};