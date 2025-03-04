import { useState } from "react";
import { FaEnvelope, FaLock, FaEye, FaEyeSlash } from "react-icons/fa";
import "../css/Login.css";
import axios from "axios";
import { toast ,ToastContainer} from "react-toastify";
import ApiPath from "../ApiPath";
import { useNavigate } from "react-router-dom";

function Login() {
  const [showPassword, setShowPassword] = useState(false);
  const [data,setData]=useState({email:"",password:""});
  const navigate=useNavigate();
  
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin=async(e)=>{
    e.preventDefault()
    try {
        const res = await axios.post(`${ApiPath()}/login`, data);
        if (res.status === 200) {
          const { token, msg } = res.data;
          if (token) {
            console.log("Token received:", token);
            localStorage.setItem("token", token);
            toast.success(msg, {
              position: "top-right",
              autoClose: 3000,  
              hideProgressBar: false,
              closeOnClick: true,
              pauseOnHover: true,
              draggable: true,
              progress: undefined,
              theme: "dark",
            });
            setData({ email: "", password: "" });
            setTimeout(() => navigate(`/home`), 2000);
          }
        } else {
          alert("Login failed. Please try again.");
        }
      } catch (error) {
        console.log(error);
        if (error.response) {
          toast.error(error.response.data.msg, {
            position: "top-right",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: false,
            draggable: true,
            progress: undefined,
            theme: "dark",
          });
        } else {
          alert("Something went wrong. Try again later.");
        }
      }
  }

  return (
    <>
      <div className="screen">
        <div className="container">
          <div className="login-header">
            <h2>Welcome Back</h2>
            <p>Please login to continue</p>
          </div>
          <form onSubmit={handleLogin} className="login-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <div className="input-with-icon">
                <FaEnvelope className="input-icon" />
                <input
                  type="email"
                  id="email"
                  className="input-field"
                  placeholder="Enter your email"
                  required
                  name="email" value={data.email} onChange={(e) => setData((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
                />
              </div>
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <div className="input-with-icon">
                <FaLock className="input-icon" />
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  className="input-field"
                  placeholder="Enter your password"
                  required
                  name="password" value={data.password} onChange={(e) => setData((prev) => ({ ...prev, [e.target.name]: e.target.value }))}
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? <FaEyeSlash /> : <FaEye />}
                </button>
              </div>
            </div>
            <div className="form-options">
              <a href="#" className="forgot-password">Forgot Password?</a>
            </div>
            <button type="submit" className="login-button">Login</button>
          </form>
          <div className="login-footer">
            <p>Don't have an account? <a href="../Register">Sign Up</a></p>
          </div>
        </div>
        <ToastContainer />
      </div>
    </>
  );
}

export default Login;