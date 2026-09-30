const { z } = require("zod");

const createOrderSchema = z.object({
    paymentMethod: z.enum(
        ["Cash on Delivery"],
        {
            error: "Only Cash on Delivery is supported"
        }
    ),

    deliveryArea: z.enum(["inside_dhaka", "outside_dhaka"]),

    shippingAddress: z.object({
        fullName: z.string().min(2, "Full name is required"),
        phone: z.string().min(11, "Phone number is required"),
        email: z.union([z.string().email("Invalid email address"), z.literal(""), z.undefined()]).optional().default(""),
        address: z.string().min(5, "Address is required"),
        city: z.string().min(2, "City is required")
    })
});

const createGuestOrderSchema = z.object({
    items: z.array(z.object({
        productId: z.string().min(1),
        quantity: z.number().min(1),
        size: z.string().optional().default(""),
        color: z.string().optional().default(""),
        colorImage: z.string().optional().default("")
    })).min(1, "At least one item is required"),

    paymentMethod: z.enum(
        ["Cash on Delivery"],
        {
            error: "Only Cash on Delivery is supported"
        }
    ),

    deliveryArea: z.enum(["inside_dhaka", "outside_dhaka"]),

    shippingAddress: z.object({
        fullName: z.string().min(2, "Full name is required"),
        phone: z.string().min(11, "Phone number is required"),
        email: z.union([z.string().email("Invalid email address"), z.literal(""), z.undefined()]).optional().default(""),
        address: z.string().min(5, "Address is required"),
        city: z.string().min(2, "City is required")
    })
});

const updateOrderStatusSchema = z.object({
    orderStatus: z.enum(
        ["pending", "confirmed", "processing", "shipped", "delivered", "cancelled"],
        {
            error: "Invalid order status"
        }
    )
});

module.exports = {
    createOrderSchema,
    createGuestOrderSchema,
    updateOrderStatusSchema
};