const { z } = require("zod");

const addCartSchema = z.object({
    productId: z.string().min(1, "Product id is required"),
    quantity: z.number().min(1, "Quantity must be at least 1"),
    size: z.string().optional().default("")
});

const updateCartSchema = z.object({
    quantity: z.number().min(1, "Quantity must be at least 1")
});

module.exports = {
    addCartSchema,
    updateCartSchema
};