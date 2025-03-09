import React, { useState, useRef, useEffect } from 'react';
import { ArrowLeft, Phone, Video, MoreVertical, Smile, Image, Send, Paperclip } from 'lucide-react';
import axios from 'axios';
import ApiPath from '../ApiPath';
import socket from '../socketConfig';

const Messages = ({ contact, onBack, isMobile, _id }) => {
  const [messageInput, setMessageInput] = useState({
    senderId: _id,
    receiverId: contact._id,
    content: '',
    time: ''
  });
  
  const [isTyping, setIsTyping] = useState(false);
  const [otherUserTyping, setOtherUserTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const [messages, setMessages] = useState([]);
  const typingTimeoutRef = useRef(null);

  // Connect to socket and set up event listeners
  useEffect(() => {
    socket.on("receive-message", (message) => {
      if ((message.senderId === contact._id && message.receiverId === _id) ||
          (message.senderId === _id && message.receiverId === contact._id)) {
        // Check if message already exists in the messages array to avoid duplicates
        setMessages(prevMessages => {
          // Check if this message already exists in our messages
          const messageExists = prevMessages.some(msg => 
            msg._id && msg._id === message._id
          );
          
          if (messageExists) {
            return prevMessages;
          } else {
            return [...prevMessages, message];
          }
        });
      }
    });

    socket.on("typing-started", ({ senderId }) => {
      if (senderId === contact._id) {
        setOtherUserTyping(true);
      }
    });
    
    socket.on("typing-stopped", ({ senderId }) => {
      if (senderId === contact._id) {
        setOtherUserTyping(false);
      }
    });
    
    
    socket.on("user-status-changed", ({ userId, status }) => {
      if (userId === contact._id) {
        console.log(`${contact.name} is now ${status}`);
      }
    });
    
    // Clean up event listeners when component unmounts
    return () => {
      socket.off("receive-message");
      socket.off("typing-started");
      socket.off("typing-stopped");
      socket.off("user-status-changed");
    };
  }, [_id, contact._id, contact.name]);

  // Update message input when contact changes
  useEffect(() => {
    setMessageInput(prevInput => ({
      ...prevInput,
      receiverId: contact._id,
      content: ''
    }));
  }, [contact._id, _id]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, otherUserTyping]);

  const formatTo12Hour = (isoString) => {
    const date = new Date(isoString);
    return date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  };

  const handleSendMessage = async () => {
    if (!messageInput.content.trim()) return;
    
    try {
      // Set the current time before sending
      const currentTime = new Date().toISOString();
      const messageData = {
        ...messageInput,
        time: currentTime
      };
      
      // Generate temporary ID for optimistic update
      const tempId = `temp-${Date.now()}`;
      const optimisticMessage = { ...messageData, _id: tempId, pending: true };
      setMessages(prevMessages => [...prevMessages, optimisticMessage]);
      
      // Send to server
      const res = await axios.post(`${ApiPath()}/sendmessage`, messageData);
      
      // Replace optimistic message with confirmed one
      if (res.data && res.data.newMessage && res.data.newMessage._id) {
        setMessages(prev => prev.map(msg => 
          msg._id === tempId ? { ...res.data.newMessage, pending: false } : msg
        ));
        
        // Emit via socket for real-time delivery to the receiver ONLY
        // The sender already has the message in their state
        socket.emit("send-message", res.data.newMessage);
      } else {
        // If server response doesn't include _id, keep temp id but mark as not pending
        setMessages(prev => prev.map(msg => 
          msg._id === tempId ? { ...msg, pending: false } : msg
        ));
      }
      
      // Reset message input
      setMessageInput({
        senderId: _id,
        receiverId: contact._id, 
        content: '', 
        time: '' 
      });
      
      // Stop typing indication after sending
      socket.emit("stop-typing", {
        senderId: _id,
        receiverId: contact._id
      });
      
    } catch (error) {
      console.error("Error sending message:", error);
      // Mark the message as failed
      setMessages(prev => prev.map(msg => 
        msg._id === tempId ? { ...msg, failed: true, pending: false } : msg
      ));
      // You could add a retry button or functionality here
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Update the handleInputChange function
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setMessageInput({...messageInput, [name]: value});
    
    // Match the event name with what the server expects
    setIsTyping(true);
    socket.emit("typing", {
      senderId: _id,
      receiverId: contact._id
    });
    
    // Clear existing timeout if there is one
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    // Set timeout to stop typing indicator
    typingTimeoutRef.current = setTimeout(() => {
      setIsTyping(false);
      socket.emit("stop-typing", {
        senderId: _id,
        receiverId: contact._id
      });
    }, 2000);
  };

  const getMessages = async () => {
    try {
      const res = await axios.post(`${ApiPath()}/messages`, {
        senderId: _id,
        receiverId: contact._id
      });
      
      if (res.status === 200) {
        const { messages } = res.data;
        setMessages(messages);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  // Load messages when contact changes
  useEffect(() => {
    getMessages();
  }, [contact._id, _id]);
  
  return (
    <div className="flex flex-col h-full bg-gradient-to-br from-purple-50 to-indigo-50">
      {/* Chat header */}
      <div 
        className="p-4 flex items-center justify-between shadow-md"
        style={{
          background: 'linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0.85))', 
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="flex items-center">
          {isMobile && (
            <button 
              className="mr-2 p-2 hover:bg-purple-100 rounded-full transition-all duration-300 transform hover:scale-110"
              onClick={onBack}
            >
              <ArrowLeft size={20} className="text-purple-600" />
            </button>
          )}
          <div className="relative">
            <div className="w-12 h-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white font-medium shadow-md">
              <img className='w-full h-full rounded-full object-cover' src={contact.profileImage} alt="" />
            </div>
            {contact.status === 'online' && (
              <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
            )}
          </div>
          <div className="ml-3">
            <h2 className="font-medium">{contact.name}</h2>
            <p className="text-xs text-green-500">{contact.status === 'online' ? 'Online' : 'Offline'}</p>
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button className="p-2 hover:bg-purple-100 rounded-full transition-all duration-300 text-purple-600">
            <Phone size={20} />
          </button>
          <button className="p-2 hover:bg-purple-100 rounded-full transition-all duration-300 text-purple-600">
            <Video size={20} />
          </button>
          <button className="p-2 hover:bg-purple-100 rounded-full transition-all duration-300 text-purple-600">
            <MoreVertical size={20} />
          </button>
        </div>
      </div>
      
      {/* Messages with hidden scrollbar */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
        <div className="flex justify-center mb-4">
          <div className="bg-white/80 rounded-full px-4 py-2 text-xs text-gray-500 shadow-sm">
            Today
          </div>
        </div>
        
        {/* Regular messages */}
        {messages.map(msg => {
          // Create a unique key guaranteed to be unique
          const msgKey = msg._id || `temp-${Date.now()}-${Math.random()}`;
          
          return (
            <div 
              key={msgKey} 
              className={`flex ${msg.senderId === _id ? 'justify-end' : 'justify-start'} animate-fadeIn`}
            >
              {msg.senderId === contact._id && (
                <div className="w-8 h-8 mr-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs self-end shadow-sm">
                  {contact.profileImage ? <img className='w-full h-full rounded-full object-cover' src={contact.profileImage} alt="" /> : contact.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div 
                className={` max-w-xs md:max-w-md rounded-2xl py-1 px-5  shadow-sm  ${
                  msg.senderId === _id
                    ? 'bg-gradient-to-r from-purple-800 to-indigo-500 text-white' 
                    : 'bg-white'
                } ${msg.failed ? 'opacity-50' : ''} transform transition-all duration-300 hover:shadow-md`}
              >
                <p>{msg.content}</p>
                <div className="flex justify-between items-center mt-1">
                  {msg.failed && (
                    <span className="text-xs text-red-300">Failed to send</span>
                  )}
                  {msg.pending && (
                    <span className="text-xs text-gray-300">Sending...</span>
                  )}
                  <span className={` text-xs ${msg.senderId === _id ? 'text-purple-200' : 'text-gray-500'} ml-auto`}>
                    {formatTo12Hour(msg.time)}
                  </span>
                </div>
              </div>
              {msg.senderId === _id && (
                <div className="w-8 h-8 ml-2 bg-white rounded-full flex items-center justify-center text-xs self-end shadow-sm text-purple-600 font-bold">
                  ME
                </div>
              )}
            </div>
          );
        })}
        
        {/* Typing indicator - Positioned AFTER regular messages but BEFORE the messagesEndRef */}
        {otherUserTyping && (
          <div className="flex justify-start animate-fadeIn">
            <div className="w-8 h-8 mr-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-full flex items-center justify-center text-white text-xs self-end shadow-sm">
              {contact.profileImage ? <img className='w-full h-full rounded-full object-cover' src={contact.profileImage} alt="" /> : contact.name.charAt(0).toUpperCase()}
            </div>
            <div className="bg-white rounded-2xl p-3 shadow-sm">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '200ms' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '400ms' }}></div>
              </div>
            </div>
          </div>
        )}
        
        {/* This reference is used to scroll to the bottom */}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Message input */}
      <div 
        className="p-4 border-t border-purple-100"
        style={{
          background: 'linear-gradient(to right, rgba(255,255,255,0.95), rgba(255,255,255,0.85))', 
          backdropFilter: 'blur(10px)'
        }}
      >
        <div className="flex items-center">
          <div className="flex space-x-2 mr-2">
            <button className="p-2 hover:bg-purple-100 rounded-full transition-all duration-300 text-purple-600">
              <Smile size={20} />
            </button>
            <button className="p-2 hover:bg-purple-100 rounded-full transition-all duration-300 text-purple-600">
              <Paperclip size={20} />
            </button>
            <button className="p-2 hover:bg-purple-100 rounded-full transition-all duration-300 text-purple-600">
              <Image size={20} />
            </button>
          </div>
          <div className="flex-1 bg-white rounded-full shadow-md px-4 py-2 flex items-center">
            <input
              type="text"
              placeholder="Type a message..."
              className="w-full bg-transparent outline-none"
              value={messageInput.content}
              name='content'
              onChange={handleInputChange}
              onKeyPress={handleKeyPress}
            />
          </div>
          <button 
            className="ml-2 p-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-full shadow-md hover:shadow-lg transition-all duration-300 transform hover:scale-110"
            onClick={handleSendMessage}
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default Messages;