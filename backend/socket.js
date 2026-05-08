const Order = require("./models/Order");
const OrderTracking = require("./models/OrderTracking");

module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 Socket connected:", socket.id);

    /* =========================
       🔹 JOIN ORDER ROOM
    ========================= */
    socket.on("joinOrderRoom", (data) => {
      const orderId = typeof data === "object" ? data.orderId : data;
      if (!orderId) return;

      socket.join(`order_${orderId}`);
      console.log(`📦 Joined room: order_${orderId}`);
    });

    /* =========================
       🔹 UPDATE LOCATION (NEW EVENT + DB SAVE)
    ========================= */
    socket.on("updateLocation", async (data) => {
      try {
        const { orderId, latitude, longitude } = data;
        if (!orderId || !latitude || !longitude) return;

        // Save to MongoDB
        await OrderTracking.create({
          order_id: orderId,
          latitude,
          longitude
        });

        // Emit standard event
        io.to(`order_${orderId}`).emit("locationUpdated", {
          latitude,
          longitude,
        });

        // ALSO emit dynamic event (for compatibility)
        io.to(`order_${orderId}`).emit(`track_${orderId}`, {
          orderId,
          latitude,
          longitude,
        });

      } catch (error) {
        console.error("❌ Location update error:", error);
      }
    });

    socket.on("disconnect", () => {
      console.log("🔴 Socket disconnected:", socket.id);
    });
  });
};