const { getDB } = require("../config/db");
const { ObjectId } = require("mongodb");
const { withCache, clearCache } = require("../utils/cache");
const { buildIdQuery } = require("../utils/buildIdQuery");

const createCategory = async (req, res) => {
    try {
        const db = getDB();
        const categoriesCollection = db.collection("categories");

        const category = {
            name: req.body.name.trim(),
            slug: req.body.slug.trim(),
            image: req.body.image || "",
            attributes: req.body.attributes || [],
            children: req.body.children || [],
            createdAt: new Date(),
            updatedAt: new Date()
        };

        const result = await categoriesCollection.insertOne(category);
        clearCache();

        res.status(201).send({
            message: "Category created successfully",
            insertedId: result.insertedId
        });

    } catch (error) {
        console.log(error);

        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

const getCategoriesWithCounts = async (req, res) => {
    try {
        const categoriesWithCounts = await withCache("categoriesWithCounts", 600, async () => {
            const db = getDB();
            const categoriesCollection = db.collection("categories");
            const productsCollection = db.collection("products");

            const categories = await categoriesCollection.find().sort({ createdAt: -1 }).toArray();

            const countResult = await productsCollection.aggregate([
                { $group: { _id: "$category", count: { $sum: 1 } } }
            ]).toArray();

            const countMap = new Map(countResult.map(r => [r._id, r.count]));

            return categories.map(parent => {
                let totalCount = 0;
                if (parent.slug) totalCount += countMap.get(parent.slug) ?? 0;
                if (parent.name) totalCount += countMap.get(parent.name) ?? 0;
                if (parent._id) totalCount += countMap.get(parent._id.toString()) ?? 0;

                for (const child of parent.children ?? []) {
                    if (child.slug) totalCount += countMap.get(child.slug) ?? 0;
                    if (child.name) totalCount += countMap.get(child.name) ?? 0;
                    for (const catSlug of child.categories ?? []) {
                        totalCount += countMap.get(catSlug) ?? 0;
                    }
                }
                return { ...parent, productCount: totalCount };
            });
        });

        res.send(categoriesWithCounts);
    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const getAllCategories = async (req, res) => {
    try {
        const db = getDB();
        const categoriesCollection = db.collection("categories");

        const page = req.query.page ? parseInt(req.query.page) : null;
        const limit = req.query.limit ? parseInt(req.query.limit) : null;
        const search = req.query.search || "";

        const query = {};
        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { slug: { $regex: search, $options: "i" } }
            ];
        }

        const cacheKey = `categories_${page}_${limit}_${search}`;
        const result = await withCache(cacheKey, 600, async () => {
            if (page && limit) {
                const skip = (page - 1) * limit;
                const totalCategories = await categoriesCollection.countDocuments(query);

                const categories = await categoriesCollection
                    .find(query)
                    .sort({ createdAt: -1 })
                    .skip(skip)
                    .limit(limit)
                    .toArray();

                return {
                    totalCategories,
                    currentPage: page,
                    totalPages: Math.ceil(totalCategories / limit),
                    categories
                };
            } else {
                const categories = await categoriesCollection
                    .find(query)
                    .sort({ createdAt: -1 })
                    .toArray();

                return categories;
            }
        });

        res.send(result);

    } catch (error) {
        res.status(500).send({
            message: "Internal Server Error"
        });
    }
};

const getSingleCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const categoriesCollection = db.collection("categories");

        const category = await categoriesCollection.findOne(buildIdQuery(id));

        if (!category) {
            return res.status(404).send({ message: "Category not found" });
        }

        res.send(category);

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const updateCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const categoriesCollection = db.collection("categories");

        const result = await categoriesCollection.updateOne(
            buildIdQuery(id),
            {
                $set: {
                    ...req.body,
                    updatedAt: new Date()
                }
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).send({ message: "Category not found" });
        }

        clearCache();
        res.send({ message: "Category updated successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

const deleteCategory = async (req, res) => {
    try {
        const { id } = req.params;
        const db = getDB();
        const categoriesCollection = db.collection("categories");

        const result = await categoriesCollection.deleteOne(buildIdQuery(id));

        if (result.deletedCount === 0) {
            return res.status(404).send({ message: "Category not found" });
        }

        clearCache();
        res.send({ message: "Category deleted successfully" });

    } catch (error) {
        console.log(error);
        res.status(500).send({ message: "Internal Server Error" });
    }
};

module.exports = {
    createCategory,
    getAllCategories,
    getCategoriesWithCounts,
    getSingleCategory,
    updateCategory,
    deleteCategory
};