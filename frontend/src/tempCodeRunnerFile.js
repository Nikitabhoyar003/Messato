import { useEffect } from "react";
import API from "/frontend/src/Services/api.jsx";

function App() {
  useEffect(() => {
    API.get("/test")
      .then(res => console.log(res.data))
      .catch(err => console.error(err));
  }, []);

  return <h2>Messato Frontend Running</h2>;
}

export default App;
