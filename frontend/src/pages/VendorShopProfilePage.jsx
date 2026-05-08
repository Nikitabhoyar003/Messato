import { useNavigate } from "react-router-dom";
import { useState,useEffect } from "react";
import "./VendorShopProfilePage.css";
import API from "../utils/api";

const steps = [
  "Basic Info",
  "Service Area",
  "Food Details",
  "Bank Details",
  "Verification (Optional)"
];

const UploadBox = ({
  label,
  name,
  form,
  onChange,
  uploadStatus,
  useCamera = false   // 👈 NEW PROP
}) => {
  const file = form[name];

  return (
    <div className="upload-wrapper">

      <label className={`upload-box ${uploadStatus[name] ? "uploaded" : ""}`}>

        <span className="upload-text">
          {file ? file.name : label}
        </span>

        <span className="upload-action">
          {file ? "Change" : "Upload"}
        </span>

        <input
          type="file"
          name={name}
          accept="image/*"
          capture={useCamera ? "environment" : undefined} // 👈 CAMERA ONLY WHEN TRUE
          onChange={onChange}
          hidden
        />
      </label>

      {file && (
        <img
          src={URL.createObjectURL(file)}
          alt="preview"
          className="preview-img"
        />
      )}

    </div>
  );
};



const VendorProfilePage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [uploadStatus, setUploadStatus] = useState({});
  const [errors, setErrors] = useState({});
  const [loadingLocation, setLoadingLocation] = useState(false);
  const [isProfileLoaded, setIsProfileLoaded] = useState(false);

  
  const [form, setForm] = useState({
    shopName: "",
    ownerName: "",
    mobile: "",
    alternateMobile: "",
    description: "",
    profileImage: null,

    location: "",
    town: "",
    pincode: "",
    radius: "",
    latitude: "",
    longitude: "",

    pureVeg: false,
    nonVeg: false,
    jainFood: false,
    satvik: false,
    mealType: "",
    dailyCapacity: "",

    accountHolder: "",
    accountNumber: "",
    ifsc: "",
    bankName: "",

    fssaiNumber: "",
    fssaiCert: null,
    gstCert: null
  });
const fetchBankDetails = async (ifscValue) => {
  if (ifscValue.length !== 11) return;

  try {
    const res = await fetch(`https://ifsc.razorpay.com/${ifscValue}`);
    const data = await res.json();

    if (data) {
      setForm(prev => ({
        ...prev,
        bankName: data.BANK || "",
        branch: data.BRANCH || ""
      }));

      setErrors(prev => ({ ...prev, ifsc: "" }));
    }
  } catch {
    setErrors(prev => ({ ...prev, ifsc: "Invalid IFSC code" }));
  }
};


  // 📍 LIVE LOCATION
  const getLiveLocation = () => {
    if (!navigator.geolocation) return alert("Geolocation not supported");

    setLoadingLocation(true);

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords;

          const res = await fetch(
            `https://us1.locationiq.com/v1/reverse?key=pk.03aa8aa197e545e2562c86042b923dd8&lat=${latitude}&lon=${longitude}&format=json`
          );

          const data = await res.json();

          setForm((prev) => ({
            ...prev,
            latitude,
            longitude,
            location: data.display_name || "",
            town:
              data.address?.city ||
              data.address?.town ||
              data.address?.state_district ||
              "",
            pincode: data.address?.postcode || ""
          }));
        } catch {
          alert("Failed to fetch address");
        } finally {
          setLoadingLocation(false);
        }
      },
      () => {
        alert("Location permission denied");
        setLoadingLocation(false);
      }
    );
  };

  // INPUT HANDLER
const onChange = (e) => {
  const { name, type, value, checked, files } = e.target;

  let newValue = type === "checkbox" ? checked : value;

  if (type === "file") {
    newValue = files[0];
    setUploadStatus(prev => ({ ...prev, [name]: "success" }));
  }

  setForm(prev => ({
    ...prev,
    [name]: newValue
  }));

  // ✅ remove error when user fixes field
  setErrors(prev => ({
    ...prev,
    [name]: ""
  }));
};


//   const next = () => setStep((p) => p + 1);
  const back = () => setStep((p) => p - 1);
const validateStep = () => {
  let e = {};

  // STEP 0 — BASIC INFO
  if (step === 0) {

    if (!form.shopName.trim())
      e.shopName = "Mess name is required";

    if (!form.ownerName.trim())
      e.ownerName = "Owner name is required";

    if (!form.mobile)
      e.mobile = "Mobile number required";
    else if (!/^[6-9]\d{9}$/.test(form.mobile))
      e.mobile = "Enter valid 10 digit mobile";

    // ✅ EMAIL REQUIRED + FORMAT
    if (!form.email)
      e.email = "Email is required";
    else if (!/^\S+@\S+\.\S+$/.test(form.email))
      e.email = "Invalid email format";
  }

  // STEP 1 — LOCATION
  if (step === 1) {

    if (!form.location.trim())
      e.location = "Address required";

    if (!form.town)
      e.town = "Select city";

    if (!form.pincode)
      e.pincode = "Pincode required";
    else if (!/^\d{6}$/.test(form.pincode))
      e.pincode = "Invalid pincode";

    if (!form.radius)
      e.radius = "Select delivery radius";
  }

  // STEP 2 — FOOD
  if (step === 2) {

    if (!form.pureVeg && !form.nonVeg && !form.jainFood && !form.satvik)
      e.foodType = "Select at least one food type";

    if (!form.mealType)
      e.mealType = "Select meal type";

    if (!form.dailyCapacity)
      e.dailyCapacity = "Enter capacity";
  }

  // STEP 3 — BANK
  if (step === 3) {

    if (!form.accountHolder.trim())
      e.accountHolder = "Required";

    if (!form.accountNumber)
      e.accountNumber = "Required";

    if (!form.ifsc)
      e.ifsc = "Required";
    else if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(form.ifsc))
      e.ifsc = "Invalid IFSC";
  }
  if (step === 4){
    if (form.aadhaarNumber && !/^\d{12}$/.test(form.aadhaarNumber)) {
  e.aadhaarNumber = "Enter valid 12 digit Aadhaar number";
}

if (form.panNumber && !/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(form.panNumber)) {
  e.panNumber = "Invalid PAN number";
}
  }


  setErrors(e);
  return Object.keys(e).length === 0;
};

const next = () => {
  const isValid = validateStep();

  if (!isValid) return;   // ❌ STOP

  setStep(prev => prev + 1);
};

const submitProfile = async () => {
  try {
    const token = localStorage.getItem("token");

    const formData = new FormData();

    Object.keys(form).forEach((key) => {

      // ✅ handle mealType object separately
      if (key === "mealType") {
        formData.append("mealType", JSON.stringify(form.mealType));
      }

      else if (form[key] !== null && form[key] !== "") {
        formData.append(key, form[key]);
      }
    });

    // ✅ ALWAYS SEND LOCATION FIELDS (important for nearby search)
    formData.set("latitude", form.latitude || "");
    formData.set("longitude", form.longitude || "");
    formData.set("location", form.location || "");

    const res = await API.post("/vendor/profile", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data"
      }
    });

    alert(res.data.message);
    navigate("/vendor-dashboard");

  } catch (err) {
    console.log("FULL ERROR 👉", err.response?.data || err);
  }
};
useEffect(() => {
  const fetchProfile = async () => {
    try {
      const res = await API.get("/vendor/profile");

      if (res.data && !isProfileLoaded) {
        setForm(prev => ({
          ...prev,
          shopName: res.data.shop_name || "",
          ownerName: res.data.owner_name || "",
          email: res.data.email || "",
          mobile: res.data.mobile || "",
          location: res.data.location || "",
          town: res.data.town || "",
          radius: res.data.service_radius || "",
          mealType:
  typeof res.data.meal_type === "string"
    ? JSON.parse(res.data.meal_type)
    : res.data.meal_type || prev.mealType
        }));

        setIsProfileLoaded(true);
      }
    } catch (err) {
      console.log("Profile fetch failed", err);
    }
  };

  fetchProfile();
}, [isProfileLoaded]);



  return (
    <div className="vendor-profile-layout">
        <div className="vendor-profile-right">
    <div className="intro-overlay">
      <h1>Messato Partner</h1>
      <p>
        Grow your tiffin business with Messato 💙  
        Reach nearby customers, manage orders, and earn more —
        all in one platform.
      </p>

      <div className="intro-points">
        <span>✔ Get orders within 1–2 km</span>
        <span>✔ Daily payouts</span>
        <span>✔ Smart vendor dashboard</span>
      </div>
    </div>
  </div>
      <div className="vendor-profile-left">
        <div className="vendor-profile-card">

          <h3>Step {step + 1} of {steps.length} — {steps[step]}</h3>

          {/* STEP 1 */}
          {step === 0 && (
            <>
              <input name="shopName" placeholder="Mess Name*" value={form.shopName} onChange={onChange}/>
              {errors.shopName && <p className="error">{errors.shopName}</p>}
              <input name="ownerName" placeholder="Owner Name*" value={form.ownerName} onChange={onChange}/>
              {errors.ownerName && <p className="error">{errors.ownerName}</p>}
              <input name="email" placeholder="Email Address"  value={form.email} onChange={onChange}/>
              <input name="mobile" placeholder="Mobile*" value={form.mobile} onChange={onChange}/>
                {errors.mobile && <p className="error">{errors.mobile}</p>}
              <textarea name="description" placeholder="About your service" value={form.description} onChange={onChange}/>
              <UploadBox label="Kitchen Logo" name="profileImage" form={form} onChange={onChange} uploadStatus={uploadStatus}/>
              {/* <UploadBox
  label="📸 Take Kitchen / Owner Photo"
  name="profileImage"
  form={form}
  onChange={onChange}
  uploadStatus={uploadStatus}
  useCamera={true}   // 👈 CAMERA ENABLED
/> */}
            </>
          )}

          {/* STEP 2 */}
          {step === 1 && (
            <>
              <button type="button" onClick={getLiveLocation}>
                {loadingLocation ? "Detecting..." : "📍 Detect Live Location"}
              </button>

              <input name="location" placeholder="Full Address*" value={form.location} onChange={onChange}/>
              {errors.location && <p className="error">{errors.location}</p>}
              <input name="pincode" placeholder="Pincode*" value={form.pincode} onChange={onChange}/>
              {errors.pincode && <p className="error">{errors.pincode}</p>}

              <select name="town" value={form.town} onChange={onChange}>
                
                <option value="">City</option>
                <option>Nagpur</option>
                <option>Pune</option>
                <option>Mumbai</option>
              </select>
              {errors.town && <p className="error">{errors.town}</p>}

              <select name="radius" value={form.radius} onChange={onChange}>
                
                <option value="">Delivery Radius</option>
                <option value="1">1 km</option>
                <option value="2">2 km</option>
                <option value="3">3 km</option>
              </select>
              {errors.radius && <p className="error">{errors.radius}</p>}
            </>
          )}

          {/* STEP 3 */}
{step === 2 && (
  <div className="food-step">

    {errors.foodType && <p className="error">{errors.foodType}</p>}

    {/* FOOD TYPE */}
    <div className="option-group">

      <p className="group-title">Food Type</p>

      <div
        className={`select-card ${form.pureVeg ? "active" : ""}`}
        onClick={() =>
          setForm(prev => ({ ...prev, pureVeg: !prev.pureVeg }))
        }
      >
        <div>
          <h4>Veg</h4>
          <p>Pure vegetarian home-style meals</p>
        </div>
        <div className="radio-circle">{form.pureVeg && "✓"}</div>
      </div>

      <div
        className={`select-card ${form.nonVeg ? "active" : ""}`}
        onClick={() =>
          setForm(prev => ({ ...prev, nonVeg: !prev.nonVeg }))
        }
      >
        <div>
          <h4>Non-Veg</h4>
          <p>Includes egg & meat dishes</p>
        </div>
        <div className="radio-circle">{form.nonVeg && "✓"}</div>
      </div>

    </div>

    {/* MEAL TYPE */}
    <div className="option-group">

      <p className="group-title">Select Meal Type*</p>
      {errors.mealType && <p className="error">{errors.mealType}</p>}

      <div className="card-grid">

        {["breakfast", "lunch", "dinner"].map(meal => (
          <div
            key={meal}
            className={`select-card ${form.mealType[meal] ? "active" : ""}`}
            onClick={() =>
              setForm(prev => ({
                ...prev,
                mealType: {
                  ...prev.mealType,
                  [meal]: !prev.mealType[meal]
                }
              }))
            }
          >
            <h4>
              {meal.charAt(0).toUpperCase() + meal.slice(1)}
            </h4>

            <div className="radio-circle">
              {form.mealType[meal] && "✓"}
            </div>
          </div>
        ))}

      </div>
    </div>

    {/* CAPACITY */}
    <input
      className="capacity-input"
      name="dailyCapacity"
      placeholder="Tiffins per day"
      value={form.dailyCapacity}
      onChange={onChange}
    />

    {errors.dailyCapacity && (
      <p className="error">{errors.dailyCapacity}</p>
    )}

  </div>
)}



          {/* STEP 4 */}
          {step === 3 && (
            <>
              <input name="accountHolder" placeholder="Account Holder*" value={form.accountHolder} onChange={onChange}/>
              {errors.accountHolder && <p className="error">{errors.accountHolder}</p>}
              {errors.accountNumber && <p className="error">{errors.accountNumber}</p>}
              <input name="accountNumber" placeholder="Account Number*" value={form.accountNumber} onChange={onChange}/>
           <input
  name="ifsc"
  placeholder="IFSC*"
  value={form.ifsc}
  onChange={(e) => {
    const value = e.target.value.toUpperCase();

    setForm(prev => ({ ...prev, ifsc: value }));

    if (value.length === 11) {
      fetchBankDetails(value);
    }
  }}
/>

{errors.ifsc && <p className="error">{errors.ifsc}</p>}
              <input name="bankName" placeholder="Bank Name" value={form.bankName} readOnly/>
              <input
  name="branch"
  placeholder="Branch"
  value={form.branch}
  readOnly
/>
            </>
          )}

          {/* STEP 5 */}
          {step === 4 && (
            <>
             <div className="kyc-section">
              <p>Optional – upload later</p>
              {/* AADHAAR NUMBER */}
    <input
      name="aadhaarNumber"
      placeholder="Aadhaar Number"
      value={form.aadhaarNumber}
      onChange={onChange}
      maxLength={12}
    />
    {errors.aadhaarNumber && (
      <p className="error">{errors.aadhaarNumber}</p>
    )}
   {form.aadhaarNumber?.length === 12 && (
  <div className="kyc-upload-animate">
    <UploadBox
      label="Upload Aadhaar Card"
      name="aadhaarDoc"
      form={form}
      onChange={onChange}
      uploadStatus={uploadStatus}
    />
    </div>
)}
<input
      name="panNumber"
      placeholder="PAN Number"
      value={form.panNumber}
      maxLength={10}
      onChange={(e) => {
        const value = e.target.value.toUpperCase();
        setForm(prev => ({ ...prev, panNumber: value }));
      }}
    />
    {errors.panNumber && (
      <p className="error">{errors.panNumber}</p>
    )}

    {/* PAN UPLOAD */}
  {form.panNumber?.length === 10 && (
    <div className="kyc-upload-animate">
      <UploadBox
        label="Upload PAN Card"
        name="panDoc"
        form={form}
        onChange={onChange}
        uploadStatus={uploadStatus}
      />
    </div>
  )}
              <input name="fssaiNumber" placeholder="FSSAI Number" value={form.fssaiNumber} onChange={onChange}/>
              {form.fssaiNumber?.length >= 14 && (
    <div className="kyc-upload-animate">
      <UploadBox
        label="Upload FSSAI Certificate"
        name="fssaiCert"
        form={form}
        onChange={onChange}
        uploadStatus={uploadStatus}
      />
    </div>
  )}
              <UploadBox label="GST Certificate" name="gstCert" form={form} onChange={onChange} uploadStatus={uploadStatus}/>
              </div>
            </>
          )}

          <button onClick={step < 4 ? next : submitProfile}>
            {step < 4 ? "Next" : "Submit"}
          </button>

          {step > 0 && <button onClick={back}>Back</button>}

        </div>
      </div>
    </div>
  );
};

export default VendorProfilePage;
