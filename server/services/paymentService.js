const axios = require("axios");

const PAYSTACK_API_URL = "https://api.paystack.co";

const paystackClient = axios.create({
    baseURL: PAYSTACK_API_URL,
    headers: {
        Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        "Content-Type": "application/json",
    },
});

const initializePaystackTransaction = async ({
    email,
    amount,
    reference,
    callbackUrl,
}) => {
    const response = await paystackClient.post(
        "/transaction/initialize",
        {
            email,
            amount: Math.round(Number(amount) * 100),
            reference,
            callback_url: callbackUrl,
            currency: "NGN",
        }
    );

    return response.data;
};

const verifyPaystackTransaction = async (
    reference
) => {
    const response = await paystackClient.get(
        `/transaction/verify/${encodeURIComponent(
            reference
        )}`
    );

    return response.data;
};

module.exports = {
    initializePaystackTransaction,
    verifyPaystackTransaction,
};