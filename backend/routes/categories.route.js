const express = require("express");

const {
    createCategory,
    getAllCategories,
    getCategoriesWithCounts,
    getSingleCategory,
    updateCategory,
    deleteCategory
} = require("../controllers/categories.controller");

const validate = require("../middlewares/validate");
const verifyToken = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");

const {
    createCategorySchema,
    updateCategorySchema
} = require("../validations/category.validation");


const router = express.Router();

router.post(
    "/",
    verifyToken,
    verifyAdmin,
    validate(createCategorySchema),
    createCategory
);

router.get("/", getAllCategories);

router.get("/with-counts", getCategoriesWithCounts);

router.get("/:id", getSingleCategory);

router.patch(
    "/:id",
    verifyToken,
    verifyAdmin,
    validate(updateCategorySchema),
    updateCategory
);

router.delete(
    "/:id",
    verifyToken,
    verifyAdmin,
    deleteCategory
);

module.exports = router;