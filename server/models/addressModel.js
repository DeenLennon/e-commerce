const db = require("../config/db");

// Get all addresses belonging to a user
const getAddressesByUserId = async (userId) => {
    const [rows] = await db.query(
        `
        SELECT
            id,
            user_id,
            first_name,
            last_name,
            phone,
            address,
            city,
            state,
            country,
            postal_code,
            is_default,
            created_at,
            updated_at
        FROM addresses
        WHERE user_id = ?
        ORDER BY
            is_default DESC,
            created_at DESC
        `,
        [userId]
    );

    return rows;
};

// Get one address by ID for a specific user
const getAddressById = async (addressId, userId) => {
    const [rows] = await db.query(
        `
        SELECT
            id,
            user_id,
            first_name,
            last_name,
            phone,
            address,
            city,
            state,
            country,
            postal_code,
            is_default,
            created_at,
            updated_at
        FROM addresses
        WHERE id = ?
          AND user_id = ?
        LIMIT 1
        `,
        [addressId, userId]
    );

    return rows[0] || null;
};

// Create an address
const createAddress = async ({
    userId,
    firstName,
    lastName,
    phone,
    address,
    city,
    state,
    country = "Nigeria",
    postalCode = null,
    isDefault = false,
}) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        // If this address is default,
        // remove default status from existing addresses.
        if (isDefault) {
            await connection.query(
                `
                UPDATE addresses
                SET is_default = 0
                WHERE user_id = ?
                `,
                [userId]
            );
        }

        const [result] = await connection.query(
            `
            INSERT INTO addresses
            (
                user_id,
                first_name,
                last_name,
                phone,
                address,
                city,
                state,
                country,
                postal_code,
                is_default
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
                userId,
                firstName,
                lastName,
                phone,
                address,
                city,
                state,
                country,
                postalCode,
                isDefault ? 1 : 0,
            ]
        );

        await connection.commit();

        return getAddressById(result.insertId, userId);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Update an address
const updateAddress = async (
    addressId,
    userId,
    {
        firstName,
        lastName,
        phone,
        address,
        city,
        state,
        country,
        postalCode,
        isDefault,
    }
) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        if (isDefault) {
            await connection.query(
                `
                UPDATE addresses
                SET is_default = 0
                WHERE user_id = ?
                `,
                [userId]
            );
        }

        const [result] = await connection.query(
            `
            UPDATE addresses
            SET
                first_name = ?,
                last_name = ?,
                phone = ?,
                address = ?,
                city = ?,
                state = ?,
                country = ?,
                postal_code = ?,
                is_default = ?
            WHERE id = ?
              AND user_id = ?
            `,
            [
                firstName,
                lastName,
                phone,
                address,
                city,
                state,
                country,
                postalCode,
                isDefault ? 1 : 0,
                addressId,
                userId,
            ]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return null;
        }

        await connection.commit();

        return getAddressById(addressId, userId);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Set an address as default
const setDefaultAddress = async (addressId, userId) => {
    const connection = await db.getConnection();

    try {
        await connection.beginTransaction();

        await connection.query(
            `
            UPDATE addresses
            SET is_default = 0
            WHERE user_id = ?
            `,
            [userId]
        );

        const [result] = await connection.query(
            `
            UPDATE addresses
            SET is_default = 1
            WHERE id = ?
              AND user_id = ?
            `,
            [addressId, userId]
        );

        if (result.affectedRows === 0) {
            await connection.rollback();
            return null;
        }

        await connection.commit();

        return getAddressById(addressId, userId);
    } catch (error) {
        await connection.rollback();
        throw error;
    } finally {
        connection.release();
    }
};

// Delete an address
const deleteAddress = async (addressId, userId) => {
    const [result] = await db.query(
        `
        DELETE FROM addresses
        WHERE id = ?
          AND user_id = ?
        `,
        [addressId, userId]
    );

    return result.affectedRows > 0;
};

module.exports = {
    getAddressesByUserId,
    getAddressById,
    createAddress,
    updateAddress,
    setDefaultAddress,
    deleteAddress,
};