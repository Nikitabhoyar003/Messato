import "./InspirationCarousel.css";
import { useEffect, useRef } from "react";

const inspirationItems = [
  { name: "Regular Veg Tiffin", image: "https://res.cloudinary.com/dioka4inb/image/upload/v1768240944/Indian_vegetarian_lunch_box_or_tiffin_made_up_of_stainless_steel_for_office_or_workplace_includes_dal_fry_gobi_masala_rice_with_chapati_and_salad___Premium_Photo_rx1aqk.jpg" },
  { name: "Home-Style Lunch", image: "https://res.cloudinary.com/dioka4inb/image/upload/v1768241486/download_2_sr1efa.jpg" },
  { name: "Simple Dal–Roti", image: "https://res.cloudinary.com/dioka4inb/image/upload/v1768242193/download_4_z02ljg.jpg" },
  { name: "Light Meal Tiffin", image: "https://res.cloudinary.com/dioka4inb/image/upload/v1768242115/download_3_j3odxv.jpg" },
  { name: "Deluxe Veg Tiffin", image: "https://res.cloudinary.com/dioka4inb/image/upload/v1768241977/Good_Quality_Punjabi_Tiffin_Service_in_Surrey_wgq84d.jpg" },
  { name: "Diet Tiffin", image: "https://res.cloudinary.com/dioka4inb/image/upload/v1768241899/diet_xk8bbn.jpg" },
  { name: "Maharshtrian tiffin", image: "https://res.cloudinary.com/dioka4inb/image/upload/v1768241890/maharashtrian_cfwhjh.jpg" }
];

const InspirationCarousel = () => {
  const rowRef = useRef(null);
  const speed = 0.7;

  useEffect(() => {
    const row = rowRef.current;
    if (!row) return;

    let animationFrame;
    let isPaused = false;

    const scroll = () => {
      if (!isPaused) {
        row.scrollLeft += speed;

        if (row.scrollLeft >= row.scrollWidth / 2) {
          row.scrollLeft = 0;
        }
      }

      animationFrame = requestAnimationFrame(scroll);
    };

    animationFrame = requestAnimationFrame(scroll);

    const pause = () => (isPaused = true);
    const resume = () => (isPaused = false);

    row.addEventListener("mouseenter", pause);
    row.addEventListener("mouseleave", resume);

    return () => {
      cancelAnimationFrame(animationFrame);
      row.removeEventListener("mouseenter", pause);
      row.removeEventListener("mouseleave", resume);
    };
  }, []);

  return (
    <div className="inspiration-section">
      <h2>Inspiration for your first tiffin order</h2>

      <div className="inspiration-row" ref={rowRef}>
        {[...inspirationItems, ...inspirationItems].map((item, i) => (
          <div className="inspiration-item" key={i}>
            <img src={item.image} alt={item.name} />
            <p>{item.name}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default InspirationCarousel;