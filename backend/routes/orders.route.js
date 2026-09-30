const express = require("express");

const {
    createOrder,
    createGuestOrder,
    getMyOrders,
    getAllOrders,
    getSingleOrder,
    trackOrder,
    updateOrderStatus,
    cancelOrder,
    sendInvoice,
    getDashboardStats,
    deleteOrder,
    getRecentSales,
} = require("../controllers/orders.controller");

const validate = require("../middlewares/validate");
const verifyToken = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");

const {
    createOrderSchema,
    createGuestOrderSchema,
    updateOrderStatusSchema
} = require("../validations/orders.validation");

const router = express.Router();

router.post(
    "/",
    verifyToken,
    validate(createOrderSchema),
    createOrder
);

router.post(
    "/guest",
    validate(createGuestOrderSchema),
    createGuestOrder
);

router.post(
    "/track",
    trackOrder
);

router.get(
    "/recent-sales",
    getRecentSales
);

router.post(
    "/:id/invoice",
    sendInvoice
);

router.get(
    "/",
    verifyToken,
    getMyOrders
);

router.get(
    "/all",
    verifyToken,
    verifyAdmin,
    getAllOrders
);

router.get(
    "/dashboard-stats",
    verifyToken,
    verifyAdmin,
    getDashboardStats
);

router.get(
    "/:id",
    verifyToken,
    getSingleOrder
);

router.patch(
    "/:id/status",
    verifyToken,
    verifyAdmin,
    validate(updateOrderStatusSchema),
    updateOrderStatus
);

router.patch(
    "/:id/cancel",
    verifyToken,
    cancelOrder
);

router.delete(
    "/:id",
    verifyToken,
    verifyAdmin,
    deleteOrder
);

module.exports = router;