const addressModel = require("../models/addressModel");

// GET /api/addresses
const getMyAddresses = async (req, res) => {
    try {
        const addresses =
            await addressModel.getAddressesByUserId(
                req.user.id
            );

        res.json({
            success: true,
            data: addresses,
        });
    } catch (error) {
        console.error("Get addresses error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get addresses",
        });
    }
};

// GET /api/addresses/:id
const getMyAddress = async (req, res) => {
    try {
        const address =
            await addressModel.getAddressById(
                req.params.id,
                req.user.id
            );

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found",
            });
        }

        res.json({
            success: true,
            data: address,
        });
    } catch (error) {
        console.error("Get address error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to get address",
        });
    }
};

// POST /api/addresses
const createMyAddress = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            phone,
            address,
            city,
            state,
            country,
            postal_code,
            is_default,
        } = req.body;

        if (
            !first_name ||
            !last_name ||
            !phone ||
            !address ||
            !city ||
            !state
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "First name, last name, phone, address, city and state are required",
            });
        }

        const newAddress =
            await addressModel.createAddress({
                userId: req.user.id,
                firstName: first_name.trim(),
                lastName: last_name.trim(),
                phone: phone.trim(),
                address: address.trim(),
                city: city.trim(),
                state: state.trim(),
                country:
                    country?.trim() || "Nigeria",
                postalCode:
                    postal_code?.trim() || null,
                isDefault: Boolean(is_default),
            });

        res.status(201).json({
            success: true,
            message: "Address created successfully",
            data: newAddress,
        });
    } catch (error) {
        console.error("Create address error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to create address",
        });
    }
};

// PUT /api/addresses/:id
const updateMyAddress = async (req, res) => {
    try {
        const {
            first_name,
            last_name,
            phone,
            address,
            city,
            state,
            country,
            postal_code,
            is_default,
        } = req.body;

        if (
            !first_name ||
            !last_name ||
            !phone ||
            !address ||
            !city ||
            !state
        ) {
            return res.status(400).json({
                success: false,
                message:
                    "First name, last name, phone, address, city and state are required",
            });
        }

        const updatedAddress =
            await addressModel.updateAddress(
                req.params.id,
                req.user.id,
                {
                    firstName: first_name.trim(),
                    lastName: last_name.trim(),
                    phone: phone.trim(),
                    address: address.trim(),
                    city: city.trim(),
                    state: state.trim(),
                    country:
                        country?.trim() || "Nigeria",
                    postalCode:
                        postal_code?.trim() || null,
                    isDefault: Boolean(is_default),
                }
            );

        if (!updatedAddress) {
            return res.status(404).json({
                success: false,
                message: "Address not found",
            });
        }

        res.json({
            success: true,
            message: "Address updated successfully",
            data: updatedAddress,
        });
    } catch (error) {
        console.error("Update address error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to update address",
        });
    }
};

// PUT /api/addresses/:id/default
const setDefaultMyAddress = async (req, res) => {
    try {
        const address =
            await addressModel.setDefaultAddress(
                req.params.id,
                req.user.id
            );

        if (!address) {
            return res.status(404).json({
                success: false,
                message: "Address not found",
            });
        }

        res.json({
            success: true,
            message: "Default address updated",
            data: address,
        });
    } catch (error) {
        console.error(
            "Set default address error:",
            error
        );

        res.status(500).json({
            success: false,
            message:
                "Failed to set default address",
        });
    }
};

// DELETE /api/addresses/:id
const deleteMyAddress = async (req, res) => {
    try {
        const deleted =
            await addressModel.deleteAddress(
                req.params.id,
                req.user.id
            );

        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Address not found",
            });
        }

        res.json({
            success: true,
            message: "Address deleted successfully",
        });
    } catch (error) {
        console.error("Delete address error:", error);

        res.status(500).json({
            success: false,
            message: "Failed to delete address",
        });
    }
};

module.exports = {
    getMyAddresses,
    getMyAddress,
    createMyAddress,
    updateMyAddress,
    setDefaultMyAddress,
    deleteMyAddress,
};