import React, { useState } from 'react';
import { Card, Form, Button, Spinner } from 'react-bootstrap';
import { FaRobot, FaTimes, FaCommentDots } from 'react-icons/fa';
import api from '../services/api';

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([{ sender: 'bot', text: 'Hi! I am your AI Inventory Assistant. How can I help?' }]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input;
    setMessages(prev => [...prev, { sender: 'user', text: userMessage }]);
    setInput('');
    setIsTyping(true);

    try {
      const { data } = await api.post('/ai/chat', { message: userMessage });
      setMessages(prev => [...prev, { sender: 'bot', text: data.reply }]);
    } catch {
      setMessages(prev => [...prev, { sender: 'bot', text: 'Sorry, I am having trouble connecting to the AI service.' }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1050 }}>
      {isOpen ? (
        <Card className="shadow-lg border-0" style={{ width: '350px', height: '450px', display: 'flex', flexDirection: 'column', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
          <Card.Header className="text-white d-flex justify-content-between align-items-center border-0 p-3 bg-primary-solid">
            <div className="fw-bold fs-5"><FaRobot className="me-2" /> AI Assistant</div>
            <FaTimes style={{ cursor: 'pointer' }} onClick={() => setIsOpen(false)} />
          </Card.Header>
          
          <Card.Body style={{ overflowY: 'auto', flexGrow: 1, backgroundColor: '#f8f9fa' }}>
            {messages.map((msg, idx) => (
              <div key={idx} className={`d-flex mb-3 ${msg.sender === 'user' ? 'justify-content-end' : 'justify-content-start'}`}>
                <div 
                  className={`p-3 rounded-4 shadow-sm ${msg.sender === 'user' ? 'text-white border-0' : 'border'}`}
                  style={{ 
                    maxWidth: '85%', 
                    fontSize: '0.95rem', 
                    background: msg.sender === 'user' ? 'var(--primary-color)' : 'var(--surface-color)',
                    color: msg.sender !== 'user' ? 'var(--text-main)' : undefined 
                  }}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {isTyping && (
                <div className="d-flex justify-content-start">
                    <div className="border p-2 rounded text-muted" style={{ background: 'var(--surface-color)' }}> <Spinner animation="grow" size="sm" /> typing... </div>
                </div>
            )}
          </Card.Body>

          <Card.Footer className="bg-white">
            <Form onSubmit={sendMessage} className="d-flex">
              <Form.Control 
                type="text" 
                placeholder="Ask something..." 
                value={input} 
                onChange={(e) => setInput(e.target.value)}
                disabled={isTyping}
                size="sm"
                className="me-2"
              />
              <Button type="submit" variant="primary" size="sm" disabled={isTyping}>Send</Button>
            </Form>
          </Card.Footer>
        </Card>
      ) : (
        <Button 
          className="rounded-circle shadow-lg d-flex justify-content-center align-items-center" 
          onClick={() => setIsOpen(true)}
          style={{ width: '60px', height: '60px', background: 'var(--primary-color)', border: 'none', color: '#fff' }}
        >
          <FaCommentDots size={28} />
        </Button>
      )}
    </div>
  );
};

export default ChatBot;
