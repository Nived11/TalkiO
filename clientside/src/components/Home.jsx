import React, { useState, useEffect, useRef } from 'react';
import { Search, Plus, Settings, LogOut, User, MessageSquare } from 'lucide-react';
import Messages from '../components/Message';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import ApiPath from '../ApiPath';
import socket from '../socketConfig';

const Home = () => {
  const [selectedContact, setSelectedContact] = useState(null);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchBar, setShowSearchBar] = useState(false);
  const dropdownRef = useRef(null);
  const searchInputRef = useRef(null);
  const [user, setUser] = useState({});
  const [contacts, setContacts] = useState([]);
  const [count, setCount] = useState(0);
  const navigate = useNavigate();

  // Socket connection handling - this is the ONLY place we should connect and set up basic listeners
  useEffect(() => {
    socket.on("connect", () => {
      console.log("Socket connected:", socket.id);
      
      // Only emit user-online when socket successfully connects
      if (user && user._id) {
        socket.emit("user-online", user._id);
      }
    });
    
    socket.on("connect_error", (error) => {
      console.error("Socket connection error:", error);
      // Add reconnection logic if needed
      setTimeout(() => {
        socket.connect();
      }, 5000);
    });
    
    return () => {
      socket.off("connect");
      socket.off("connect_error");
    };
  }, [user._id]);

  const fetchUserDetails = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/");
      return;
    }
    try {
      const res = await axios.get(`${ApiPath()}/home`, 
      { headers: { Authorization: `Bearer ${token}` }
      });
      if (res.status === 200) {
        setUser(res.data);
        // Emit user-online when user data is loaded
        if (res.data._id && socket.connected) {
          socket.emit("user-online", res.data._id);
        }
      } 
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.msg, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: true,
          closeOnClick: true,
          pauseOnHover: false,
          theme: "dark",
        });
        localStorage.removeItem("token");
        setTimeout(() => navigate("/"), 3000);
      }
    }
  }
  
  const fetchContacts = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }
      const res = await axios.post(`${ApiPath()}/contacts`, {_id: user._id});
      if(res.status === 200) {
        setContacts(res.data);
      }
    } catch (error) {
      console.error("Error fetching contacts:", error);
      toast.error("Failed to load contacts. Please try again.", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: true,
        closeOnClick: true,
        pauseOnHover: false,
        theme: "dark",
      });
    }
  }
  
  // Socket.io setup for user statuses and messages
  useEffect(() => {
    if (user && user._id) {
      // Listen for changes in user statuses
      socket.on("user-status-changed", ({ userId, status }) => {
        // Update contacts status
        setContacts(prevContacts => prevContacts.map(contact => {
          if (contact._id === userId) {
            return { ...contact, status };
          }
          return contact;
        }));
      });
      
      // Listen for new messages to update contact list with latest message
      socket.on("receive-message", (message) => {
        // Check if message is relevant to current user
        if (message.receiverId === user._id || message.senderId === user._id) {
          // Update contacts with latest message
          setContacts(prevContacts => {
            return prevContacts.map(contact => {
              // If message is from or to this contact
              if (contact._id === message.senderId || contact._id === message.receiverId) {
                return { 
                  ...contact, 
                  lastMessage: message.content,
                  time: new Date(message.time).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit',
                    hour12: true
                  })
                };
              }
              return contact;
            });
          });
          
          // If you're not currently viewing this contact's messages, show notification
          if (selectedContact?._id !== (message.senderId === user._id ? message.receiverId : message.senderId)) {
            // Show notification for new message
            if (message.senderId !== user._id) { // Only notify for messages you received
              const sender = contacts.find(c => c._id === message.senderId);
              if (sender) {
                toast.info(`New message from ${sender.name}`, {
                  position: "top-right",
                  autoClose: 3000,
                  hideProgressBar: true,
                  closeOnClick: true,
                  pauseOnHover: true,
                  theme: "colored",
                });
              }
            }
          }
        }
      });
      
      return () => {
        // Clean up event listeners
        socket.off("user-status-changed");
        socket.off("receive-message");
      };
    }
  }, [user, selectedContact, contacts]);
  
  useEffect(() => {
    fetchUserDetails();
  }, [count]);
  
  useEffect(() => {
    if (user && user._id) {
      fetchContacts();
    }
  }, [user]); 

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Focus search input when search bar is shown
  useEffect(() => {
    if (showSearchBar && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [showSearchBar]);

  const handleLogout = () => {
    // Notify the server that user is going offline
    if (user && user._id) {
      socket.emit("user-offline", user._id);
    }
    
    localStorage.removeItem("token");
    toast.error("Logged out successfully!", {
      position: "top-right",
      autoClose: 3000,
      hideProgressBar: true,
      closeOnClick: true,
      theme: "dark",
    });
    setTimeout(() => navigate("/"), 2000);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Contact List Section */}
      <div 
        className={`w-full md:w-1/3 h-full transition-all duration-300 ease-in-out flex flex-col ${
          isMobile && selectedContact ? 'translate-x-full opacity-0 absolute' : 'translate-x-0 opacity-100'
        }`}
        style={{ background: 'linear-gradient(135deg,rgb(90, 18, 168) 10%,rgb(28, 22, 65) 100%)' }} >
        <div className="p-4 flex flex-col text-white">
          <div className="mb-4">
            <h1 className="text-2xl font-bold text-white">Talkio...</h1>
          </div>
          
          {/* Search Bar */}
          <div className="mb-4 w-full">
            <div className="flex items-center bg-opacity-30 bg-white rounded-full p-2">
              <Search size={18} className="text-black/80 mx-2" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search..."
                className="bg-transparent outline-none text-black placeholder-black/80 w-full"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <button className="p-2 bg-gray-300 rounded-full text-black cursor-pointer">
                <User size={16} />
              </button>
            </div>
          </div>
        </div>
        
        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="h-full pb-24">
            {filteredContacts.map(contact => (
              <div 
                key={contact._id} 
                className={`flex items-center p-4 cursor-pointer transition-all duration-300 border-b border-purple-700 ${
                  selectedContact && selectedContact._id === contact._id ? 'bg-purple-800/30' : ''
                }`}
                onClick={() => setSelectedContact(contact)}
              >
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-purple-800 flex items-center justify-center text-white font-medium">
                   <img className="w-full h-full object-cover rounded-full" src={contact.profileImage} alt="dp" />
                  </div>
                  {contact.status === 'online' && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-400 rounded-full border-2 border-purple-800"></div>
                  )}
                </div>
                <div className="ml-4 flex-1">
                  <div className="flex justify-between items-start">
                    <h2 className="font-medium text-white">{contact.name}</h2>
                    {contact.time && <span className="text-xs text-purple-200">{contact.time}</span>}
                  </div>
                  <p className="text-sm truncate text-purple-200">{contact.lastMessage || "Start a conversation"}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Profile Section */}
        <div className="p-4 w-full">
          <div className="p-4 rounded-xl bg-purple-900/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-10 h-10 bg-purple-800 rounded-full flex items-center justify-center text-white font-medium">
                  <img className="w-full h-full rounded-full object-cover" src={user.profileImage} alt="dp" />
                </div>
                <div className="ml-3">
                  <h3 className="font-medium text-white">{user.name}</h3>
                  <p className="text-xs text-green-400">Online</p>
                </div>
              </div>
              <div className="relative" ref={dropdownRef}>
                <button 
                  className="p-2 hover:bg-purple-800 rounded-full transition-colors duration-300 cursor-pointer"
                  onClick={() => setShowDropdown(!showDropdown)}
                >
                  <Settings size={20} className="text-white" />
                </button>
                
                {/* Dropdown Menu */}
                {showDropdown && (
                  <div className="absolute bottom-full right-0 mb-2 w-40 bg-purple-900 rounded-xl shadow-lg">
                    <ul className="py-2">
                      <li onClick={() => navigate(`/profile/${user._id}`)} className="flex items-center px-4 py-3 hover:bg-purple-800 cursor-pointer transition-colors duration-300 text-white">
                        <User size={16} className="mr-3" />
                        <span>Profile</span>
                      </li>
                      <li onClick={handleLogout} className="flex items-center px-4 py-3 hover:bg-purple-800 cursor-pointer text-red-300 transition-colors duration-300">
                        <LogOut size={16} className="mr-3" />
                        <span>Logout</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Message Section */}
      <div 
        className={`w-full md:w-3/3 transition-all duration-300 ease-in-out ${
          isMobile && !selectedContact ? 'translate-x-full opacity-0 absolute' : 'translate-x-0 opacity-100'
        }`}
      >
        {selectedContact ? (
          <Messages _id={user._id} contact={selectedContact} onBack={() => setSelectedContact(null)} isMobile={isMobile} />
        ) : (
          <div className="hidden md:flex h-full items-center justify-center bg-gray-100">
            <div className="text-center p-8 bg-white rounded-2xl shadow-lg max-w-md mx-auto">
              <div className="mb-6">
                <div className="w-24 h-24 bg-purple-800 rounded-full mx-auto flex items-center justify-center text-white">
                  <MessageSquare size={48} />
                </div>
              </div>
              <p className="text-2xl font-bold text-purple-900">Start Chatting</p>
              <p className="mt-3 text-gray-600">Choose from your existing conversations or start a new one</p>
            </div>
          </div>
        )}
      </div>
      <ToastContainer />
    </div>
  );
};

export default Home;