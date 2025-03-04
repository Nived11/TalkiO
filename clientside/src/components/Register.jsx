import React, { useState } from "react";
import "../css/Register.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import ApiPath from "../ApiPath";
// Import necessary icons
import { FaUser, FaEnvelope, FaPhone, FaLock, FaEye, FaEyeSlash, FaCamera } from "react-icons/fa";

function Register() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    cpassword: "",
    profileImage: ""
  });
  
  // State for password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // State for image preview
  const [imagePreview, setImagePreview] = useState(null);

  const convertToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await convertToBase64(file);
        setFormData((prev) => ({ ...prev, profileImage: base64 }));
        setImagePreview(base64);
      } catch (error) {
        console.error("Error converting file to base64:", error);
        toast.error("Error processing file");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post(`${ApiPath()}/register`, formData);
      if (res.status === 201) {
        
        toast.success(res.data.msg);
        setTimeout(() => {
          navigate("/");
        }, 2000);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.response.data.msg);
    }
  };

  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setShowConfirmPassword(!showConfirmPassword);
  };

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <div className="register-container">
      {/* Left Side */}
      <div className="left-section">
        <div className="left-content">
          <h1 className="app-name">Talkio</h1>
          <p className="app-description">
          Talkio is a seamless chat app designed for effortless communication. Enjoy real-time messaging, easy media sharing, 
          and a user-friendly interface. Stay connected with friends, family, and colleagues anytime, anywhere. 
          With fast performance and secure interactions, Talkio makes chatting simple and enjoyable. Start connecting today!
          Stay connected anytime, anywhere! 
          </p>
          <div className="left-bottom">
            <p>Already have an account?</p>
            <a href="/" className="signin-btn">Sign In</a>
          </div>
        </div>
      </div>

      {/* Right Side */}
      <div className="right-section">
        <form onSubmit={handleSubmit} className="register-form">
          <h2>Register</h2>
          <div className="profile-upload">
            {imagePreview ? (
              <div className="image-preview-container">
                <img src={imagePreview} alt="Profile Preview" className="profile-preview" />
                <label htmlFor="profile-pic" className="camera-icon-overlay">
                  <FaCamera />
                </label>
              </div>
            ) : (
              <label htmlFor="profile-pic" className="upload-placeholder">
                <div className="upload-circle">
                  <FaCamera className="camera-icon" />
                </div>
                <span>Upload Profile Picture</span>
              </label>
            )}
            <input 
              id="profile-pic" 
              type="file" 
              accept="image/*" 
              className="input-file" 
              onChange={handleFileChange}
            />
          </div>
          
          <div className="form-group">
            <div className="input-with-icon">
              <FaUser className="input-icon" />
              <input 
                type="text" 
                placeholder="Full Name" 
                className="input-field" 
                required 
                value={formData.name} 
                name="name"
                onChange={handleChange} 
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="input-with-icon">
              <FaEnvelope className="input-icon" />
              <input 
                type="email" 
                placeholder="Email" 
                className="input-field" 
                required
                value={formData.email} 
                name="email"
                onChange={handleChange} 
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="input-with-icon">
              <FaPhone className="input-icon" />
              <input 
                type="tel" 
                placeholder="Phone Number" 
                className="input-field" 
                required 
                value={formData.phone} 
                name="phone"
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="form-group">
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input 
                type={showPassword ? "text" : "password"} 
                placeholder="Password" 
                className="input-field" 
                required
                value={formData.password} 
                name="password"
                onChange={handleChange}
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
          
          <div className="form-group">
            <div className="input-with-icon">
              <FaLock className="input-icon" />
              <input 
                type={showConfirmPassword ? "text" : "password"} 
                placeholder="Confirm Password" 
                className="input-field" 
                required 
                value={formData.cpassword} 
                name="cpassword"
                onChange={handleChange}
              />
              <button 
                type="button" 
                className="toggle-password" 
                onClick={toggleConfirmPasswordVisibility}
              >
                {showConfirmPassword ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>
          </div>
          
          <button type="submit" className="signup-btn">Sign Up</button>
          <p className="login-link">
            Already have an account? <a href="/">Login</a>
          </p>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}

export default Register;