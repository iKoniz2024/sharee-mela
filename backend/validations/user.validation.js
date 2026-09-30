const { z } = require("zod");

const updateProfileSchema = z.object({
    name: z.string().min(2, "Name must be at least 2 characters").optional(),
    profilePhoto: z.string().url("Invalid image URL").optional(),
    phone: z.string().min(10, "Invalid phone number").optional(),
    address: z.string().min(3, "Address is required").optional()
});

const changePasswordSchema = z.object({
    oldPassword: z.string().min(6, "Old password must be at least 6 characters"),
    newPassword: z.string().min(6, "New password must be at least 6 characters")
});

module.exports = {
    updateProfileSchema,
    changePasswordSchema
};