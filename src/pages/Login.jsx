import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Login() {
  const [showPassword, setShowPassword] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const handleLogin = async () => {
    if (!email || !password) {
      alert("⚠️ Please enter email and password.");
      return;
    }

    try {
      const response = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email,
          password,
        }
      );

      if (response.data.success) {
        const { token, user } = response.data;

        // Save login information
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(user));

        alert("✅ Login Successful!");

        // Role-based dashboard
        if (user.role === "driver") {
          navigate("/driver-dashboard");
        } else if (user.role === "standOwner") {
          navigate("/stand-owner-dashboard");
        }
      }
    } catch (error) {
      console.error("FULL LOGIN ERROR:", error);

      if (error.response) {
        alert(
          `❌ ${error.response.status}\n${
            error.response.data.message || "Login failed"
          }`
        );
      } else {
        alert(
          "❌ Backend se response nahi aa raha.\nConsole check karo."
        );
      }
    }
  };

  return (
    <div className="auth-page">

      <div className="auth-card">

        <h1>🔐 Login</h1>

        <p>Welcome back to SmartRide AI</p>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        {/* Password */}
        <div className="password-box">

          <input
            type={showPassword ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button
            type="button"
            className="password-toggle"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>

        </div>

        {/* Login Button */}
        <button
          type="button"
          className="login-btn"
          onClick={handleLogin}
        >
          Login
        </button>

        {/* Register */}
        <p>
          Don't have an account?{" "}
          <Link to="/register">
            Register
          </Link>
        </p>

        {/* Home */}
        <Link to="/">
          ← Back to Home
        </Link>

      </div>

    </div>
  );
}

export default Login;