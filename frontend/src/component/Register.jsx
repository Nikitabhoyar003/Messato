import "./auth.css";

const Register = () => {
  return (
    <div className="auth">
      <form className="auth-box">
        <h2>Create Account</h2>
        <input type="text" placeholder="Name" />
        <input type="email" placeholder="Email" />
        <input type="password" placeholder="Password" />
        <button>Register</button>
      </form>
    </div>
  );
};

export default Register;
