const mongoose = require("mongoose");
require("dotenv").config();

async function dropIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URL);
    console.log("Connected to MongoDB");

    const collection = mongoose.connection.collection("orders");
    
    // List indices
    const indices = await collection.indexes();
    console.log("Current indices:", indices.map(i => i.name));

    if (indices.find(i => i.name === "order_id_1")) {
      await collection.dropIndex("order_id_1");
      console.log("Successfully dropped order_id_1 index");
    } else {
      console.log("Index order_id_1 not found");
    }

    process.exit(0);
  } catch (err) {
    console.error("Error:", err);
    process.exit(1);
  }
}

dropIndex();
