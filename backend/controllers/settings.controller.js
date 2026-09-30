const { getDB } = require("../config/db");
const { withCache, clearCache } = require("../utils/cache");

const getSettings = async (req, res) => {
  try {
    const settings = await withCache("settings", 600, async () => {
      const db = getDB();
      const settingsCollection = db.collection("settings");
      return await settingsCollection.findOne({});
    });

    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch settings",
      error: error.message,
    });
  }
};

const updateSettings = async (req, res) => {
  try {
    const { siteName, logo, contactEmail, contactPhone, address, googleMapLink, facebookUrl, instagramUrl, tiktokUrl, youtubeUrl, metaPixelId, metaAccessToken, metaTestEventCode, metaPixels } = req.body;

    const updateData = {};

    if (siteName !== undefined) updateData.siteName = siteName;
    if (logo !== undefined) updateData.logo = logo;
    if (contactEmail !== undefined) updateData.contactEmail = contactEmail;
    if (contactPhone !== undefined) updateData.contactPhone = contactPhone;
    if (address !== undefined) updateData.address = address;
    if (googleMapLink !== undefined) updateData.googleMapLink = googleMapLink;
    if (facebookUrl !== undefined) updateData.facebookUrl = facebookUrl;
    if (instagramUrl !== undefined) updateData.instagramUrl = instagramUrl;
    if (tiktokUrl !== undefined) updateData.tiktokUrl = tiktokUrl;
    if (youtubeUrl !== undefined) updateData.youtubeUrl = youtubeUrl;
    if (metaPixelId !== undefined) updateData.metaPixelId = metaPixelId;
    if (metaAccessToken !== undefined) updateData.metaAccessToken = metaAccessToken;
    if (metaTestEventCode !== undefined) updateData.metaTestEventCode = metaTestEventCode;
    if (metaPixels !== undefined) updateData.metaPixels = metaPixels;

    if (Object.keys(updateData).length === 0) {
      return res.status(400).json({ message: "No data to update" });
    }

    const db = getDB();
    const settingsCollection = db.collection("settings");

    await settingsCollection.updateOne(
      {},
      { $set: updateData },
      { upsert: true }
    );

    clearCache("settings");
    const updatedSettings = await settingsCollection.findOne({});

    res.status(200).json({
      message: "Settings updated successfully",
      data: updatedSettings,
    });
  } catch (error) {
    res.status(500).json({
      message: "Failed to update settings",
      error: error.message,
    });
  }
};

const getSettingsLogo = async (req, res) => {
  try {
    const db = getDB();
    const settingsCollection = db.collection("settings");
    const settings = await settingsCollection.findOne({});

    if (!settings || !settings.logo) {
      return res.status(404).send("Logo not found");
    }

    const logoStr = settings.logo;
    // Handle base64 format (e.g., data:image/png;base64,iVBORw0KGgo...)
    if (logoStr.startsWith("data:image/")) {
      const matches = logoStr.match(/^data:image\/([a-zA-Z+]+);base64,(.+)$/);
      if (!matches || matches.length !== 3) {
        return res.status(400).send("Invalid logo image data");
      }
      const contentType = `image/${matches[1] === "jpg" ? "jpeg" : matches[1]}`;
      const imgBuffer = Buffer.from(matches[2], "base64");

      res.set("Content-Type", contentType);
      res.set("Cache-Control", "public, max-age=3600"); // Cache for 1 hour
      return res.send(imgBuffer);
    } else {
      // If it's already a URL, redirect to it
      return res.redirect(logoStr);
    }
  } catch (error) {
    res.status(500).send("Failed to retrieve settings logo");
  }
};

module.exports = {
  getSettings,
  updateSettings,
  getSettingsLogo,
};
