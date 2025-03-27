import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError(""); // Clear previous errors

    try {
      const response = await axios.post("your_api_url/login", {
        email,
        password,
      });

      if (response.data.success) {
        const userType = response.data.data.userType; // Extract userType
        localStorage.setItem("userType", userType); // Save in local storage
        localStorage.setItem("token", "your_jwt_token"); // Save token if needed
        navigateBasedOnUserType(userType); // Redirect to the appropriate dashboard
      } else {
        setError("Invalid credentials. Please try again.");
      }
    } catch (error) {
      setError("Login failed. Please check your credentials.");
      console.error("Login Error:", error);
    }
  };

  const navigateBasedOnUserType = (userType) => {
    if (userType === "buyer") {
      navigate("/buyer-dashboard");
    } else if (userType === "seller") {
      navigate("/seller-dashboard");
    } else {
      console.error("Unknown userType:", userType);
    }
  };

  return (
    <div>
      <h2>Login</h2>
      {error && <p style={{ color: "red" }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
};

export default Login;
