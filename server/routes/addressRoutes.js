const express = require("express");

const {
    getMyAddresses,
    getMyAddress,
    createMyAddress,
    updateMyAddress,
    setDefaultMyAddress,
    deleteMyAddress,
} = require("../controllers/addressController");

const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get(
    "/",
    protect,
    getMyAddresses
);

router.get(
    "/:id",
    protect,
    getMyAddress
);

router.post(
    "/",
    protect,
    createMyAddress
);

router.put(
    "/:id",
    protect,
    updateMyAddress
);

router.put(
    "/:id/default",
    protect,
    setDefaultMyAddress
);

router.delete(
    "/:id",
    protect,
    deleteMyAddress
);

module.exports = router;