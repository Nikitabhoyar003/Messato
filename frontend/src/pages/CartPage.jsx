import { useNavigate } from "react-router-dom";
import { useCart } from "../components/useCart";
import Navbar from "../components/navbar";
import "./CartPage.css";
import { useState, useEffect, useMemo } from "react";

const CartPage = () => {
  const navigate = useNavigate();
  const { cart, updateQty } = useCart();

  const [details, setDetails] = useState([]);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [bill, setBill] = useState(null);

  const token = localStorage.getItem("token");
  const location = JSON.parse(localStorage.getItem("USER_LOCATION") || "{}");

  const meal_time = (cart[0]?.meal_time || "breakfast").toLowerCase();

  /* ================= SAFE FETCH HELPER ================= */

  const safeFetch = async (url, options) => {
    try {
      const res = await fetch(url, options);

      if (!res.ok) {
        const text = await res.text();
        console.error("API ERROR:", text);
        return null;
      }

      return await res.json();
    } catch (err) {
      console.error("FETCH ERROR:", err);
      return null;
    }
  };

  /* ================= FETCH ITEM DETAILS ================= */

  useEffect(() => {
    if (!cart.length) return;

    const fetchDetails = async () => {
      setLoadingDetails(true);

      const data = await safeFetch(
        "http://localhost:5000/api/menu/cart-details",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ids: cart.map((i) => i.id) }),
        }
      );

      if (data) setDetails(data);
      setLoadingDetails(false);
    };

    fetchDetails();
  }, [cart]);

  /* ================= BILL PREVIEW ================= */

  useEffect(() => {
    if (!cart.length || !token) return;

    const getBill = async () => {
      const data = await safeFetch(
        "http://localhost:5000/api/orders/bill-preview",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ cart }),
        }
      );
      
console.log("BILL DATA =", data);

      if (data) setBill(data);
    };

    getBill();
  }, [cart, token]);

  /* ================= MERGE CART + DB ================= */

  const mergedCart = useMemo(() => {
    return cart.map((cartItem) => {
      const dbItem = details.find((d) => d.id === cartItem.id);
      return { ...cartItem, ...(dbItem || {}) };
    });
  }, [cart, details]);

  const grandTotal = bill?.grandTotal || 0;

  /* ================= EMPTY ================= */

  if (!cart.length) {
    return (
      <>
        <Navbar />
        <div className="empty-cart-page">Your cart is empty 🛒</div>
      </>
    );
  }

  /* ================= UI ================= */

  return (
    <>
    <div className="page-with-navbar">
      <Navbar />

      <div className="checkout-container">

        {/* LEFT */}
        <div className="checkout-left">

          {/* ADDRESS */}
          <div className="section-card address-card">
            <div className="address-top">
              <h3>Deliver to</h3>
              <button onClick={() => navigate("/select-location")}>
                Change
              </button>
            </div>
            <p>{location?.address || "No address selected"}</p>
          </div>

          {/* ITEMS */}
          <div className="section-card">
            <h3>Your Items</h3>

            {loadingDetails ? (
              <p>Loading items...</p>
            ) : (
              mergedCart.map((item) => (
                <div key={item.id} className="cart-item-row">

                  <img
                    src={item.image || "/placeholder.png"}
                    alt={item.name}
                  />

                  <div className="item-info">
                    <h4>{item.name}</h4>
                    <p className="vendor">{item.vendor_name}</p>

  <div className="rating1">
  <span className="rating-box">
   {Number(item.rating || 0).toFixed(1)} ★
  </span>
</div>



                    <span className="price">₹{item.price}</span>
                  </div>

                  <div className="qty">
                    <button onClick={() => updateQty(item.id, "dec")}>−</button>
                    <span>{item.quantity}</span>
                    <button onClick={() => updateQty(item.id, "inc")}>+</button>
                  </div>

                </div>
              ))
            )}
          </div>

        </div>

        {/* RIGHT */}
       <div className="checkout-right">

  <div className="section-card bill-card">
    <h3>Bill details</h3>

    {/* ITEMS TOTAL */}
    <div className="bill-row">
      <div className="bill-left">
        <span>Items total</span>
        <span className="saved-badge">Saved ₹{bill?.saved || 0}</span>
      </div>

      <div className="bill-right">
        {bill?.originalTotal && (
          <span className="old-price">₹{bill.originalTotal}</span>
        )}
        <span className="new-price">₹{bill?.itemTotal || 0}</span>
      </div>
    </div>

    {/* DELIVERY */}
    <div className="bill-row">
      <div className="bill-left">
        <span>🚚 Delivery charge</span>
        <span className="info">i</span>
      </div>
      <span>₹{bill?.deliveryCharge ?? 0}</span>
    </div>

    {/* HANDLING */}
    <div className="bill-row">
      <div className="bill-left">
        <span>🛍 Handling charge</span>
        <span className="info">i</span>
      </div>
      <span>₹{bill?.handlingCharge ?? 0}</span>
    </div>

    {/* GST */}
    <div className="bill-row">
      <div className="bill-left">
        <span>GST (5%)</span>
      </div>
      <span>₹{bill?.gst?.toFixed(2) || 0}</span>
    </div>

    <div className="bill-divider"></div>

    {/* GRAND TOTAL */}
    <div className="bill-total">
      <span>Grand total</span>
      <span>₹{grandTotal}</span>
    </div>

  </div>

  <button
    className="continue-btn"
    disabled={!bill}
    onClick={() =>
      navigate("/payment", {
        state: {
          bill,
          mergedCart,
          address: location?.address,
          meal_time
        },
      })
    }
  >
    Proceed to Pay
  </button>

</div>


      </div>
      </div>
    </>
  );
};

export default CartPage;
