const express = require("express");

const {
    addToCart,
    getCart,
    updateCart,
    removeFromCart
} = require("../controllers/cart.controller");

const verifyToken = require("../middlewares/verifyToken");
const validate = require("../middlewares/validate");

const {
    addCartSchema,
    updateCartSchema
} = require("../validations/cart.validation");

const router = express.Router();

router.post(
    "/",
    verifyToken,
    validate(addCartSchema),
    addToCart
);

router.get(
    "/",
    verifyToken,
    getCart
);

router.patch(
    "/:productId",
    verifyToken,
    validate(updateCartSchema),
    updateCart
);

router.delete(
    "/:productId",
    verifyToken,
    removeFromCart
);

module.exports = router;