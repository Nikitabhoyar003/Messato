import { useLocation, useNavigate } from "react-router-dom";
import { useCart } from "../components/useCart";
import Navbar from "../components/navbar";
import ReviewModal from "../components/ReviewModal";
import "./Payment.css";
import { useEffect, useState } from "react";

const API = "http://localhost:5000";

const PaymentPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const { clearCart } = useCart();
  

  const token = localStorage.getItem("token");
//  useEffect(() => {
//   window.history.pushState(null, "", window.location.href);

//   const handleBack = () => {
//     navigate("/user-dashboard", { replace: true });
//   };

//   window.addEventListener("popstate", handleBack);

//   return () => window.removeEventListener("popstate", handleBack);
// }, [navigate]);


  const [paymentMode, setPaymentMode] = useState(null);
  const [loading, setLoading] = useState(false);
  const [orderId, setOrderId] = useState(null);
  const [showReview, setShowReview] = useState(false);
  const [paymentFailed, setPaymentFailed] = useState(false);

  if (!state) return <p className="center">Invalid access</p>;

  const { bill, mergedCart, address, meal_time } = state;

  const vendorId = mergedCart?.[0]?.vendor_id ?? null;
  const menuId = mergedCart?.[0]?.menu_id ?? mergedCart?.[0]?.id ?? null;
const storedLocation = localStorage.getItem("USER_LOCATION");
const userLocation = storedLocation ? JSON.parse(storedLocation) : null;
console.log("USER LOCATION:", userLocation);

  /* ================= LOAD RAZORPAY ================= */

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true);
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  /* ================= CREATE ORDER ================= */

  const createOrder = async () => {

    if (!userLocation || !userLocation.lat || !userLocation.lng) {
  alert("Location missing. Please refresh page.");
  return null;
}
    if (orderId) return orderId;

    if (!paymentMode) {
      alert("Please select payment method");
      return null;
    }

    setLoading(true);

    try {
      console.log("SENDING LAT LNG:", userLocation);
      const res = await fetch(`${API}/api/orders/place`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
       body: JSON.stringify({
  cart: mergedCart.map((item) => ({
    id: item.id,
    vendor_id: item.vendor_id,
    quantity: item.quantity,
    price: item.price,
  })),
  total_amount: bill.grandTotal,
  meal_time,
  address,
  latitude: userLocation.lat,
  longitude: userLocation.lng,
  payment_method: paymentMode,
}),
      });

      const data = await res.json();

      if (!res.ok) throw new Error(data.message);

      setOrderId(data.order_id);
      return data.order_id;
    } catch (err) {
      alert("Order creation failed"+err);
      return null;
    } finally {
      setLoading(false);
    }
  };

  /* ================= PAYMENT SUCCESS ================= */

  const onPaymentSuccess = (id) => {
     alert("✅ Order placed successfully");
    setOrderId(id);
    setShowReview(true);
    clearCart();
  };

  /* ================= ONLINE PAYMENT ================= */

  const handleOnlinePayment = async () => {
    if (loading) return;

    const id = await createOrder();
    if (!id) return;

    const razorpayLoaded = await loadRazorpay();
    if (!razorpayLoaded) return alert("Razorpay failed to load");

    const res = await fetch(`${API}/api/payment/create-order`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        order_id: id,
        amount: bill.grandTotal,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(`Payment initialization failed: ${data.message || "Invalid Gateway Credentials"}`);
      setLoading(false);
      return;
    }

    const options = {
      key: data.key,
      amount: data.amount,
      currency: "INR",
      name: "Messato",
      order_id: data.razorpayOrderId,

     handler: async (response) => {
  try {
    const verifyRes = await fetch(`${API}/api/payment/verify`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        razorpay_order_id: response.razorpay_order_id,
        razorpay_payment_id: response.razorpay_payment_id,
        razorpay_signature: response.razorpay_signature,
        order_id: id,
      }),
    });

    const verifyData = await verifyRes.json();

    if (!verifyRes.ok) {
      throw new Error(verifyData.message || "Payment verification failed");
    }

    // ✅ SUCCESS ONLY AFTER VERIFY
    onPaymentSuccess(id);

  } catch (err) {
    console.error("VERIFY FAILED:", err);
    alert("Payment succeeded but verification failed ❌");
    setPaymentFailed(true);
  }
},

      modal: {
        ondismiss: () => {
          setPaymentFailed(true);
        },
      },
    };

    new window.Razorpay(options).open();
  };

  /* ================= COD ================= */

  const handleCOD = async () => {
    const id = await createOrder();
    if (!id) return;

    onPaymentSuccess(id);
  };

  /* ================= BACK BUTTON PROTECTION ================= */

   if (!state) return <p className="center">Invalid access</p>;

  /* ================= UI ================= */

  return (
    <>
    <div className="page-with-navbar">
      <Navbar />

      <div className="payment-page">
        <div className="payment-container">

          <div className="product-preview">
            <img src={mergedCart[0].image} className="payment-food-img" />
          </div>

          <div className="payment-card">
            <h2>Checkout</h2>

            <div className="bill-row">
              <span>Total</span>
              <strong>₹{bill.grandTotal}</strong>
            </div>

            <h3>Select Payment Method</h3>

            <div className="payment-options">
              <button
                className={paymentMode === "ONLINE" ? "active" : ""}
                onClick={() => setPaymentMode("ONLINE")}
              >
                Pay Online
              </button>

              <button
                className={paymentMode === "COD" ? "active" : ""}
                onClick={() => setPaymentMode("COD")}
              >
                Cash on Delivery
              </button>
            </div>

            {paymentMode === "ONLINE" && (
              <button className="pay-btn1" onClick={handleOnlinePayment}>
                Pay ₹{bill.grandTotal}
              </button>
            )}

            {paymentMode === "COD" && (
              <button className="pay-btn1" onClick={handleCOD}>
                Place Order
              </button>
            )}

            {paymentFailed && (
              <p className="payment-failed-msg">
                Payment failed. Try again.
              </p>
            )}
          </div>
        </div>
      </div>
      </div>

      {showReview && (
        <ReviewModal
          orderId={orderId}
          vendorId={vendorId}
          menuId={menuId}
          onClose={() => navigate("/my-orders", { replace: true })}
        />
      )}
    </>
  );
};

export default PaymentPage;