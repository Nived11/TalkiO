import React, { useState, useEffect } from 'react';
import { 
  Menu, 
  Search, 
  Phone, 
  Video, 
  MoreVertical, 
  Paperclip, 
  Smile, 
  Send, 
  Settings 
} from 'lucide-react';
import "../css/Home.css";
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import ApiPath from '../ApiPath';

function Home() {
  const [messages, setMessages] = useState([
    { id: 1, sender: 'John', text: 'Hey, how are you?', time: '10:00 AM' },
    { id: 2, sender: 'You', text: 'I\'m good, thanks! How about you?', time: '10:02 AM' },
    { id: 3, sender: 'John', text: 'Doing well! Just working on that project we discussed.', time: '10:05 AM' }
  ]);
  const [newMessage, setNewMessage] = useState('');
  const [activeContact, setActiveContact] = useState('John');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [user, setUser] = useState({});
  const [count, setCount] = useState(0);
  const navigate = useNavigate();
  
  const contacts = [
    { id: 1, name: 'John', status: 'online', lastMessage: 'Doing well! Just working on that project we discussed.' },
  ];

  const getUser = async () => {
    const token = localStorage.getItem("token");
    if (!token){
      return 
    }
    try {
      const res = await axios.get(`${ApiPath()}/home`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      if (res.status === 200) {
        setUser(res.data);
      }
    } catch (error) {
      if (error.response) {
        toast.error(error.response.data.msg, {
          position: "top-right",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "dark",
        });
        localStorage.removeItem("token");
        setTimeout(() => navigate("/login"), 3000);
      }
    }
  };

  useEffect(() => {
    getUser();
  }, [count]);

  const filteredContacts = contacts.filter(contact => 
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim() === '') return;
    
    const newMsg = {
      id: messages.length + 1,
      sender: 'You',
      text: newMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages([...messages, newMsg]);
    setNewMessage('');
  };

  // Auto-scroll to the bottom of messages when new message is added
  useEffect(() => {
    const messagesContainer = document.querySelector('.messages-container');
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  }, [messages]);

  return (
    <div className="chat-container">
      {/* Sidebar */}
      <div className={`sidebar ${isMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="app-branding">
            <h1 className="app-logo">Talkio</h1>
            <button className="menu-toggle" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu />
            </button>
          </div>
          <div className="search-container">
            <Search className="search-icon" />
            <input 
              type="text" 
              placeholder="Search contacts..." 
              className="search-input"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
        
        <div className="contacts-list">
          {filteredContacts.map(contact => (
            <div 
              key={contact.id} 
              className={`contact-item ${activeContact === contact.name ? 'active' : ''}`}
              onClick={() => setActiveContact(contact.name)}
            >
              <div className="contact-info">
                <div className="avatar-container">
                  <div className="avatar">
                    {contact.name.charAt(0)}
                  </div>
                  <span className={`status-indicator ${contact.status}`}></span>
                </div>
                <div className="contact-details">
                  <div className="contact-header">
                    <span className="contact-name">{contact.name}</span>
                    <span className="message-time">12:30 PM</span>
                  </div>
                  <p className="last-message">{contact.lastMessage}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        <div className="profile-section">
          <div className="profile-avatar">
            <div className="avatar"><img src={user.profileImage} alt="" /></div>
          </div>
          <div className="profile-info">
            <span className="person-name">You</span>
            <span className="profile-status">Online</span>
          </div>
          <button onClick={()=>navigate(`/profile/${user._id}`)} className="profile-settings">
            <Settings />
          </button>
        </div>
      </div>
      
      {/* Chat area */}
      <div className="chat-area">
        {/* Mobile overlay for sidebar */}
        <div className={`mobile-overlay ${isMenuOpen ? 'active' : ''}`} onClick={() => setIsMenuOpen(false)}></div>
        
        {/* Chat header */}
        <div className="chat-header">
          <div className="header-left">
            <button className="mobile-menu-btn" onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu />
            </button>
            <div className="active-contact">
              <div className="avatar">
                {activeContact.charAt(0)}
              </div>
              <div className="contact-status">
                <h2>{activeContact}</h2>
                <p className="online-status">Online</p>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button className="action-btn">
              <Phone />
            </button>
            <button className="action-btn">
              <Video />
            </button>
            <button className="action-btn">
              <MoreVertical />
            </button>
          </div>
        </div>
        
        {/* Messages */}
        <div className="messages-container">
          <div className="date-divider">Today</div>
          {messages.map(message => (
            <div key={message.id} className={`message-wrapper ${message.sender === 'You' ? 'outgoing' : 'incoming'}`}>
              {message.sender !== 'You' && (
                <div className="sender-avatar">
                  <div className="avatar small">{message.sender.charAt(0)}</div>
                </div>
              )}
              <div className={`message ${message.sender === 'You' ? 'sent' : 'received'}`}>
                <p>{message.text}</p>
                <span className="message-time">{message.time}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Message input */}
        <div className="message-input-container">
          <form onSubmit={handleSendMessage} className="message-form">
            <button type="button" className="attachment-btn">
              <Paperclip />
            </button>
            <button type="button" className="emoji-btn">
              <Smile />
            </button>
            <input
              type="text"
              className="message-input"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
            />
            <button 
              type="submit" 
              className="send-btn"
              disabled={newMessage.trim() === ''}
            >
              <Send />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;