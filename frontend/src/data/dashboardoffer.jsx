import { useState } from "react";
import axios from "axios";

const ImageUpload = () => {
  const [image, setImage] = useState(null);
  const [url, setUrl] = useState("");

  const uploadImage = async () => {
    const formData = new FormData();
    formData.append("image", image);

    const res = await axios.post(
      "http://localhost:5000/api/upload",
      formData
    );

    setUrl(res.data.imageUrl);
  };

  return (
    <div style={{ padding: 40 }}>
      <h2>Upload Offer Image</h2>

      <input
        type="file"
        onChange={(e) => setImage(e.target.files[0])}
      />

      <button onClick={uploadImage}>Upload</button>

      {url && (
        <>
          <p>Uploaded Image:</p>
          <img src={url} alt="Uploaded" width="300" />
        </>
      )}
    </div>
  );
};

export default ImageUpload;
