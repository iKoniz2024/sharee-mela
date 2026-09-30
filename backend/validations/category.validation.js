const { z } = require("zod");

const attributeDefSchema = z.object({
    key: z.string().min(1, "Attribute key is required"),
    label: z.string().min(1, "Attribute label is required"),
    type: z.enum(["text", "number", "select", "multi-select", "boolean"]).default("text"),
    options: z.array(z.string()).optional().default([]),
    required: z.boolean().optional().default(false),
    unit: z.string().optional().default(""),
    useAsVariant: z.boolean().optional().default(false)
});

const createCategorySchema = z.object({
    name: z.string().min(2, "Category name is required"),
    slug: z.string().min(2, "Slug is required"),
    image: z.string().optional().default(""),
    attributes: z.array(attributeDefSchema).optional().default([]),
    children: z.array(
        z.object({
            name: z.string().min(2, "Child name is required"),
            slug: z.string().min(2, "Child slug is required"),
            categories: z.array(z.string()).optional().default([]),
            attributes: z.array(attributeDefSchema).optional().default([])
        })
    ).optional().default([])
});

const updateCategorySchema = z.object({
    name: z.string().min(2).optional(),
    slug: z.string().min(2).optional(),
    image: z.string().optional(),
    attributes: z.array(attributeDefSchema).optional(),
    children: z.array(
        z.object({
            name: z.string().min(2),
            slug: z.string().min(2),
            categories: z.array(z.string()).optional().default([]),
            attributes: z.array(attributeDefSchema).optional()
        })
    ).optional()
});

module.exports = {
    createCategorySchema,
    updateCategorySchema
};