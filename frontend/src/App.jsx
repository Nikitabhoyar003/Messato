import { useState } from "react";
import Navbar from "./component/navbar/navbar";
import Home from "./component/homepage/Home";
import AuthModal from "./component/auth/AuthModal";

function App() {
  const [showAuth, setShowAuth] = useState(false);

  return (
    <>
      <Navbar onLogin={() => setShowAuth(true)} />
      <Home />
      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  );
}

export default App;
