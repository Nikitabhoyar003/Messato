import { useState, useEffect } from "react";
import { CartContext } from "./CartContext";
import GlobalCartPopup from "../pages/Globalcartpopup";

const CartProvider = ({ children }) => {
  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user"))
      : null;

  const cartKey = user ? `cart_${user.id}` : "cart_guest";

  /* ================= CART ================= */
  const [cart, setCart] = useState(() => {
    if (typeof window === "undefined") return [];
    try {
      return JSON.parse(localStorage.getItem(cartKey)) || [];
    } catch {
      return [];
    }
  });

  /* ================= DRAWER STATE ================= */
  const [cartOpen, setCartOpen] = useState(false);

  /* ================= LOCAL STORAGE SYNC ================= */
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem(cartKey, JSON.stringify(cart));
  }, [cart, cartKey]);

  /* ================= ADD TO CART ================= */
  const addToCart = (item) => {
    if (!item || !item.id) return;

    setCart((prev) => {
      const existing = prev.find((c) => c.id === item.id);

      if (existing) {
        return prev.map((c) =>
          c.id === item.id
            ? { ...c, quantity: c.quantity + 1 }
            : c
        );
      }

      return [
        ...prev,
        {
          ...item,
          quantity: 1,
          meal_time: item.meal_time,
        },
      ];
    });

    // ❌ REMOVE AUTO OPEN
    // setCartOpen(true);
  };

  /* ================= UPDATE QTY ================= */
  const updateQty = (id, type) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.id === id
            ? {
                ...item,
                quantity:
                  type === "inc"
                    ? item.quantity + 1
                    : item.quantity - 1,
              }
            : item
        )
        .filter((item) => item.quantity > 0)
    );
  };

  /* ================= CLEAR CART ================= */
  const clearCart = () => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(cartKey);
    }
    setCart([]);
  };

  return (
    <CartContext.Provider
      value={{
        cart,
        addToCart,
        updateQty,
        clearCart,
        cartOpen,
        setCartOpen,
      }}
    >
        <GlobalCartPopup />
      {children}
    </CartContext.Provider>
  );
};

export default CartProvider;
