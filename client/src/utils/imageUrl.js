const API_URL =
    import.meta.env.VITE_API_URL ||
    "http://localhost:5000/api";

const SERVER_URL = API_URL.replace(
    /\/api\/?$/,
    ""
);

export const getImageUrl = (imageUrl) => {
    if (!imageUrl) {
        return "";
    }

    if (
        imageUrl.startsWith("http://") ||
        imageUrl.startsWith("https://")
    ) {
        return imageUrl;
    }

    if (imageUrl.startsWith("/")) {
        return `${SERVER_URL}${imageUrl}`;
    }

    return `${SERVER_URL}/${imageUrl}`;
};