import React, { useState, useEffect } from 'react';
import "../css/Home.css";

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
  
  const contacts = [
    { id: 1, name: 'John', status: 'online', lastMessage: 'Doing well! Just working on that project we discussed.' },
    { id: 2, name: 'Sarah', status: 'offline', lastMessage: 'Let\'s catch up tomorrow!' },
    { id: 3, name: 'Mike', status: 'online', lastMessage: 'Did you see the latest update?' },
    { id: 4, name: 'Emily', status: 'away', lastMessage: 'Thanks for your help!' }
  ];

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
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
            </button>
          </div>
          <div className="search-container">
            <svg className="search-icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
            </svg>
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
            <div className="avatar">Y</div>
          </div>
          <div className="profile-info">
            <span className="profile-name">You</span>
            <span className="profile-status">Online</span>
          </div>
          <button className="profile-settings">
            <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path>
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            </svg>
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
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
              </svg>
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
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"></path>
              </svg>
            </button>
            <button className="action-btn">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z"></path>
              </svg>
            </button>
            <button className="action-btn">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z"></path>
              </svg>
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
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.586a4 4 0 00-5.656-5.656l-6.415 6.585a6 6 0 108.486 8.486L20.5 13"></path>
              </svg>
            </button>
            <button type="button" className="emoji-btn">
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
              </svg>
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
              <svg className="icon" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"></path>
              </svg>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Home;