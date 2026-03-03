import { createContext, useContext, useState, useCallback, useEffect } from "react";
import cartApi from "../api/cart";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const [items, setItems]     = useState([]);
  const [orders, setOrders]   = useState([]);

  // Load server cart (if authenticated) on mount
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const data = await cartApi.getCart();
        if (!mounted) return;
        const serverItems = Array.isArray(data) ? data : data.items || [];
        setItems(serverItems);
      } catch (e) {
        // ignore — user may be unauthenticated or network error; keep local cart
      }
    })();
    return () => (mounted = false);
  }, []);

  const addToCart = useCallback(async (product, qty = 1) => {
    // optimistic update
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, qty: i.qty + qty } : i
        );
      }
      return [...prev, { ...product, qty }];
    });

    try {
      await cartApi.addToCart({ product_id: product.id, qty });
      // re-sync with server for authoritative data
      const server = await cartApi.getCart();
      setItems(Array.isArray(server) ? server : server.items || server);
    } catch (err) {
      console.error("addToCart failed", err);
    }
  }, []);

  const removeFromCart = useCallback(async (id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
    try {
      // backend supports removing by product id
      await cartApi.removeProductFromCart(id);
      const server = await cartApi.getCart();
      setItems(Array.isArray(server) ? server : server.items || server);
    } catch (err) {
      console.error("removeFromCart failed", err);
    }
  }, []);

  const updateQty = useCallback(async (id, qty) => {
    if (qty < 1) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
    try {
      // use addToCart endpoint as upsert (backend should support upsert behaviour)
      await cartApi.addToCart({ product_id: id, qty });
      const server = await cartApi.getCart();
      setItems(Array.isArray(server) ? server : server.items || server);
    } catch (err) {
      console.error("updateQty failed", err);
    }
  }, []);

  const clearCart = useCallback(async () => {
    setItems([]);
    try {
      await cartApi.clearCart();
    } catch (err) {
      console.error("clearCart failed", err);
    }
  }, []);

  const placeOrder = useCallback(async (orderData) => {
    try {
      const res = await cartApi.checkout(orderData);
      // try to read order id from server response
      const orderId = res?.order_id || res?.id || `JEM-${Date.now()}`;
      const newOrder = {
        id: orderId,
        date: new Date().toLocaleDateString("en-PH", { year: "numeric", month: "long", day: "numeric" }),
        items: [...items],
        ...orderData,
        status: "Processing",
      };
      setOrders((prev) => [newOrder, ...prev]);
      // clear local + server cart
      setItems([]);
      try { await cartApi.clearCart(); } catch (e) {}
      return newOrder.id;
    } catch (err) {
      console.error("placeOrder failed", err);
      throw err;
    }
  }, [items]);

  const totalItems = items.reduce((s, i) => s + i.qty, 0);
  const subtotal   = items.reduce((s, i) => s + parseFloat(i.rawPrice || 0) * i.qty, 0);

  return (
    <CartContext.Provider value={{ items, orders, addToCart, removeFromCart, updateQty, clearCart, placeOrder, totalItems, subtotal }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}