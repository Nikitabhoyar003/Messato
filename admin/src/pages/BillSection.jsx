const sendBill = async (orderId) => {
  await API.post(`/bill/generate/${orderId}`);
  await API.post(`/bill/send/${orderId}`);
  alert("Bill sent on WhatsApp");
};

<button onClick={() => sendBill(order.id)}>
  Send Bill on WhatsApp
</button>
