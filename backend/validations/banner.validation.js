const { z } = require("zod");

const createBannerSchema = z.object({
    title: z.string().min(2, "Title must be at least 2 characters"),
    image: z.string().min(1, "Image is required"),
    link: z.string().optional().default(""),
    isActive: z.boolean().optional().default(true)
});

const updateBannerSchema = z.object({
    title: z.string().min(2).optional(),
    image: z.string().min(1).optional(),
    link: z.string().optional(),
    isActive: z.boolean().optional()
});

module.exports = { createBannerSchema, updateBannerSchema };
