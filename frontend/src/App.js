import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './App.css';

// 🔥 UPDATE: Using your Render Backend URL here
const API_URL = "https://resume-ai-backend-iawa.onrender.com";

function App() {
  const [file, setFile] = useState(null);
  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    { sender: "ai", text: "Hello! I'm your AI Resume Assistant. Upload a PDF to get started" }
  ]);
  const [status, setStatus] = useState({ type: "", msg: "" });
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages, isTyping]);

  const handleFileChange = (e) => {
    if(e.target.files[0]) {
        setFile(e.target.files[0]);
        setStatus({ type: "", msg: "" });
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setStatus({ type: "error", msg: "Please select a PDF first!" });
      return;
    }

    const formData = new FormData();
    formData.append("pdf", file);

    try {
      setStatus({ type: "loading", msg: "Analyzing Resume..." });
      
      // ✅ CHANGED: Using Render URL
      await axios.post(`${API_URL}/upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      
      setStatus({ type: "success", msg: "Resume Analyzed Successfully! ✅" });
    } catch (error) {
      console.error(error);
      setStatus({ type: "error", msg: "Upload Failed. Try again." });
    }
  };

  const handleChat = async () => {
    if (!question.trim()) return;

    const userMsg = question;
    setMessages(prev => [...prev, { sender: "user", text: userMsg }]);
    setQuestion("");
    setIsTyping(true);

    try {
      // ✅ CHANGED: Using Render URL
      const res = await axios.post(`${API_URL}/chat`, { question: userMsg });
      setMessages(prev => [...prev, { sender: "ai", text: res.data.answer }]);
    } catch (error) {
      setMessages(prev => [...prev, { sender: "ai", text: "⚠️ Something went wrong. Is the server running?" }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="app-container">
      {/* Sidebar Section */}
      <div className="sidebar">
        <div>
          <h1 className="brand">Resume.ai</h1>
          
          <div className="upload-section" style={{marginTop: '30px'}}>
            <label className="file-drop-zone">
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={handleFileChange} 
                  style={{display: 'none'}} 
                />
                
                {/* Dynamic Content based on file selection */}
                {file ? (
                  <>
                    <span className="upload-icon">✅</span>
                    <div style={{textAlign: 'center'}}>
                      <p className="upload-text" style={{color: '#4ade80'}}>{file.name}</p>
                      <p style={{fontSize: '0.7rem', color: '#64748b', marginTop: '5px'}}>Ready to Analyze</p>
                    </div>
                  </>
                ) : (
                  <>
                    <span className="upload-icon">☁️</span>
                    <p className="upload-text">Click to Upload PDF</p>
                  </>
                )}
            </label>

            <button onClick={handleUpload} className="upload-btn">
              Analyze Resume
            </button>

            {status.msg && (
              <div className={`status-badge ${status.type}`}>
                {status.msg}
              </div>
            )}
          </div>
        </div>

        <div className="footer">
          Design by Raghava
        </div>
      </div>

      {/* Chat Section */}
      <div className="chat-section">
        <div className="messages-container">
          {messages.map((msg, index) => (
            <div key={index} className={`message ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          {isTyping && (
             <div className="message ai" style={{fontStyle: 'italic', opacity: 0.7}}>
               AI is thinking...
             </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-wrapper">
          <input 
            type="text" 
            className="chat-input"
            placeholder="Ask a question about the candidate..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleChat()}
          />
          <button onClick={handleChat} className="send-btn">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M22 2L11 13" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M22 2L15 22L11 13L2 9L22 2Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;