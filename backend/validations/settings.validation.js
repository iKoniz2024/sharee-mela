const { z } = require("zod");

const metaPixelSchema = z.object({
  name: z.string().trim().optional().default(""),
  pixelId: z.string().trim().regex(/^[0-9]*$/, "Pixel ID must contain numbers only").optional().default(""),
  accessToken: z.string().trim().optional().default(""),
  testEventCode: z.string().trim().optional().default(""),
});

const updateSettingsSchema = z.object({
  siteName: z.string().trim().min(1, "Site name is required"),
  logo: z.string().min(1, "Logo cannot be empty"),
  contactEmail: z.string().trim().optional().default(""),
  contactPhone: z.string().trim().optional().default(""),
  address: z.string().trim().optional().default(""),
  googleMapLink: z.string().trim().optional().default(""),
  facebookUrl: z.string().trim().optional().default(""),
  instagramUrl: z.string().trim().optional().default(""),
  tiktokUrl: z.string().trim().optional().default(""),
  youtubeUrl: z.string().trim().optional().default(""),
  metaPixelId: z.string().trim().regex(/^[0-9,\s]*$/, "Meta Pixel ID must contain numbers and commas only").optional().default(""),
  metaAccessToken: z.string().trim().optional().default(""),
  metaTestEventCode: z.string().trim().optional().default(""),
  metaPixels: z.array(metaPixelSchema).optional().default([]),
});

module.exports = {
  updateSettingsSchema,
};
