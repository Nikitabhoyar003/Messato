import { useState } from "react";
import API from "../utils/api";
import "./ReviewModal.css";

const ReviewModal = ({ orderId, vendorId, menuId, onClose }) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

//   const submitReview = async () => {
//     if (!rating) return alert("Select rating");

//     await API.post("/user/reviews", {
//       order_id: orderId,
//       vendor_id: vendorId    ,
//       menu_id: menuId,
//       rating,
//       comment,
//     });

//     onClose();
//   };
const [submitting, setSubmitting] = useState(false);

const submitReview = async () => {
  if (!rating) return alert("Select rating");

  try {
    setSubmitting(true);

    await API.post("/user/reviews", {
      order_id: orderId,
      vendor_id: vendorId,
      menu_id: menuId,
      rating,
      comment,
    });

    onClose();
  } finally {
    setSubmitting(false);
  }
};
  return (
    <div className="review-overlay">
      <div className="review-modal">

        <h3>⭐ Rate your meal</h3>

        <div className="stars">
          {[1, 2, 3, 4, 5].map((s) => (
            <span
              key={s}
              className={s <= rating ? "active" : ""}
              onClick={() => setRating(s)}
            >
              {s <= rating ? "★" : "☆"}
            </span>
          ))}
        </div>

        <textarea
          placeholder="Write review (optional)"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
        />

        <div className="review-actions">
          <button onClick={onClose}>Skip</button>
         <button onClick={submitReview} disabled={submitting}>
  {submitting ? "Submitting..." : "Submit"}
</button>
        </div>

      </div>
    </div>
  );
};

export default ReviewModal;