import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useState,
} from "react";

import { getCart } from "../services/cartService";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [cartCount, setCartCount] = useState(0);
    const [cartLoading, setCartLoading] = useState(false);

    const refreshCartCount = useCallback(async () => {
        try {
            setCartLoading(true);

            const response = await getCart();

            const cart = response?.cart;

            setCartCount(
                Number(cart?.itemCount) || 0
            );
        } catch (error) {
            // Guests may not have a cart yet.
            setCartCount(0);
        } finally {
            setCartLoading(false);
        }
    }, []);

    useEffect(() => {
        refreshCartCount();
    }, [refreshCartCount]);

    const increaseCartCount = (quantity = 1) => {
        setCartCount((current) => {
            return current + Number(quantity || 1);
        });
    };

    const setCartItemCount = (count) => {
        setCartCount(Number(count) || 0);
    };

    return (
        <CartContext.Provider
            value={{
                cartCount,
                cartLoading,
                refreshCartCount,
                increaseCartCount,
                setCartItemCount,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => {
    const context = useContext(CartContext);

    if (!context) {
        throw new Error(
            "useCart must be used inside CartProvider"
        );
    }
    
    return context;
};