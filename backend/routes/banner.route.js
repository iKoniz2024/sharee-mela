const express = require("express");

const {
    createBanner, getAllBanners, getSingleBanner, updateBanner, deleteBanner
} = require("../controllers/banner.controller");

const validate = require("../middlewares/validate");
const verifyToken = require("../middlewares/verifyToken");
const verifyAdmin = require("../middlewares/verifyAdmin");

const { createBannerSchema, updateBannerSchema } = require("../validations/banner.validation");

const router = express.Router();

router.post(
    "/",
    verifyToken,
    verifyAdmin,
    validate(createBannerSchema),
    createBanner
);

router.get("/", getAllBanners);

router.get("/:id", getSingleBanner);

router.patch(
    "/:id",
    verifyToken,
    verifyAdmin,
    validate(updateBannerSchema),
    updateBanner
);

router.delete(
    "/:id",
    verifyToken,
    verifyAdmin,
    deleteBanner
);

module.exports = router;
