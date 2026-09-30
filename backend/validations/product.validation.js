const { z } = require("zod");

const createProductSchema = z.object({
    title: z.string().min(3, "Title must be at least 3 characters"),
    description: z.string().min(10, "Description must be at least 10 characters"),
    category: z.string().min(1, "Category is required"),
    price: z.coerce.number().positive("Price must be greater than 0"),
    discountPercentage: z.coerce.number().min(0).max(100).optional().default(0),
    stock: z.coerce.number().min(0),
    tags: z.array(z.string()).optional().default([]),
    brand: z.string().optional().default(""),
    weight: z.coerce.number().min(0).optional().default(0),

    dimensions: z.object({
        width: z.coerce.number().optional(),
        height: z.coerce.number().optional(),
        depth: z.coerce.number().optional()
    }).optional(),

    warrantyInformation: z.string().optional().default("No warranty"),
    shippingInformation: z.string().optional().default("Ships in 3-5 business days"),
    returnPolicy: z.string().optional().default("7 days return policy"),
    minimumOrderQuantity: z.coerce.number().min(1).optional().default(1),

    sizes: z.array(z.string()).optional().default([]),
    sizeMeasurements: z.array(z.object({
        size: z.string(),
    }).passthrough()).optional().default([]),

    colors: z.array(z.object({
        name: z.string(),
        image: z.string().optional().default("")
    })).optional().default([]),

    images: z.array(z.string()).optional().default([]),
    thumbnail: z.string().optional().default("")
});


const updateProductSchema = z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(10).optional(),
    category: z.string().optional(),
    price: z.coerce.number().positive().optional(),
    discountPercentage: z.coerce.number().min(0).max(100).optional(),
    stock: z.coerce.number().min(0).optional(),
    tags: z.array(z.string()).optional(),
    brand: z.string().optional(),
    weight: z.coerce.number().optional(),

    dimensions: z.object({
        width: z.coerce.number().optional(),
        height: z.coerce.number().optional(),
        depth: z.coerce.number().optional()
    }).optional(),

    warrantyInformation: z.string().optional(),
    shippingInformation: z.string().optional(),
    returnPolicy: z.string().optional(),
    minimumOrderQuantity: z.coerce.number().min(1).optional(),

    sizes: z.array(z.string()).optional(),
    sizeMeasurements: z.array(z.object({
        size: z.string(),
    }).passthrough()).optional(),

    colors: z.array(z.object({
        name: z.string(),
        image: z.string().optional().default("")
    })).optional(),

    images: z.array(z.string()).optional(),
    thumbnail: z.string().optional()
});

module.exports = {
    createProductSchema,
    updateProductSchema
};