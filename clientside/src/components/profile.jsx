import React, { useState, useEffect } from 'react';
import { UserCircle2, Edit3, Save, Camera, Mail, Phone, User } from 'lucide-react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import { useNavigate, useParams } from 'react-router-dom';
import ApiPath from '../ApiPath';
import "../css/profile.css"

const ProfilePage = () => {
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const navigate = useNavigate();
  const { id } = useParams();

  

  const [userData, setUserData] = useState({
    name: '',
    email: '',
    phone: '',
    profileImage: '',
  });

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

  useEffect(() => {
    const fetchUserDetails = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please login again");
          navigate('/login');
          return;
        }
      
        const res = await axios.get(`${ApiPath()}/profile/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.status === 200) {
          setUserData(res.data);
          setProfileImage(res.data.profileImage);
        }
      } catch (error) {
        console.error("Profile fetch error:", error);
        toast.error(error.res?.data?.msg || "Failed to fetch profile");
        navigate('/login');
      }
    };

    fetchUserDetails();
  }, [id, navigate]);


  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const base64 = await convertToBase64(file);
        setProfileImage(base64);
        setUserData(prev => ({
          ...prev,
          profileImage: base64
        }));
      } catch (error) {
        console.error(error);
        toast.error("Error processing file");
      }
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setUserData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const updateUserProfile = async (e) => {
    e.preventDefault();
    
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Please login again");
        navigate('/login');
        return;
      }
      const updateData = { name: userData.name,phone: userData.phone,profileImage: profileImage};
      const res = await axios.put(`${ApiPath()}/update/${id}`, updateData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (res.status === 200) {
        toast.success(res.data.msg, {
            autoClose: 2000,
            hideProgressBar: true,
            
          });
          setTimeout(() => {
            fetchUserDetails();
          }, 2000);
        setIsEditing(false);
        const updatedProfile = await axios.get(`${ApiPath()}/profile/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (updatedProfile.status === 200) {
          setUserData(updatedProfile.data);
          setProfileImage(updatedProfile.data.profileImage);
        }
      }
    } catch (error) {
      console.error(error);
      if (error.res) {
        console.error( error.res.data);
        toast.error(error.res.data.msg);
      } else {
        toast.error("Network error. Please try again.");
      }
    }
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setUserData(prevState => ({...prevState,name: userData.name, phone: userData.phone}));
    setProfileImage(userData.profileImage);
  };

  return (
    <div className="profile-container">
      <div className="profile-wrapper">
        <form onSubmit={updateUserProfile}>
          <div className="profile-header">
            <div className="profile-image-container">
              {profileImage ? (
                <img src={profileImage} alt="Profile" className="profile-image" />
              ) : (
                <UserCircle2  className="default-profile-icon"  size={120}  strokeWidth={1} />
              )}
              {isEditing && (
                <label className="image-upload-overlay">
                  <Camera size={24} />
                  <input  type="file"  accept="image/*"  className="hidden-file-input"
                    onChange={handleImageUpload} />
                </label>
              )}
            </div>
            <h1 className="profile-name">{userData.name}</h1>
          </div>

          <div className="profile-details">
            <div className="detail-section">
              <div className="detail-icon">
                <User strokeWidth={2} />
              </div>
              <div className="detail-content">
                <label>Full Name</label>
                {isEditing ? (
                  <input   type="text" name="name" value={userData.name} onChange={handleInputChange}className="profile-input" required/>
                ) : (
                  <p>{userData.name}</p>
                )}
              </div>
            </div>

            
            <div className="detail-section">
              <div className="detail-icon">
                <Mail strokeWidth={2} />
              </div>
              <div className="detail-content">
                <label>Email Address</label>
                <p>{userData.email}</p>
              </div>
            </div>

            
            <div className="detail-section">
              <div className="detail-icon">
                <Phone strokeWidth={2} />
              </div>
              <div className="detail-content">
                <label>Phone Number</label>
                {isEditing ? (
                  <input  type="tel"name="phone" value={userData.phone} onChange={handleInputChange} className="profile-input"required/>
                ) : (
                  <p>{userData.phone}</p>
                )}
              </div>
            </div>
          </div>

          <div className="profile-actions">
            {!isEditing ? (
              <button  type="button" className="edit-button"  onClick={() => setIsEditing(true)}>
                <Edit3 size={18} />
                <span>Edit Profile</span>
              </button>
            ) : (
              <div className="editing-buttons">
                <button  className="save-button" type="submit" >
                  <Save size={18} /><span>Save Changes</span>
                </button>
                <button  type="button" className="cancel-button" onClick={handleCancelEdit} > Cancel</button>
              </div>
            )}
          </div>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
};

export default ProfilePage;