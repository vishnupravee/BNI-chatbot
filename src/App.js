// import React, { useState, useEffect, useRef, useCallback } from 'react';
// import ReactMarkdown from 'react-markdown';
// import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
// import './App.css';

// // --- SVG Icons ---
// const UserIcon = () => ( <svg width="30" height="30" viewBox="0 0 24 24" fill="#d9d9e9" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> );
// const BotIcon = ({ logoSrc }) => ( <img src={logoSrc} alt="bot icon" style={{ width: '30px', height: '30px', borderRadius: '4px' }} /> );
// const MicrophoneIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2a7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg> );

// // 1. --- NEW SVG ICON FOR STOP BUTTON ---
// const StopIcon = () => (
//   <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
//     <path d="M6 6h12v12H6V6z"/>
//   </svg>
// );


// function App() {
//   const [messages, setMessages] = useState([]);
//   const [input, setInput] = useState('');
//   // 2. --- NEW STATE TO TRACK IF BOT IS SPEAKING ---
//   const [isBotSpeaking, setIsBotSpeaking] = useState(false);
//   const chatWindowRef = useRef(null);

//   const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

//   // This needs to be wrapped in useCallback to satisfy the linter warning in the next useEffect
//   const handleSend = useCallback(async (messageToSend, isVoiceInput = false) => {
//     if (messageToSend.trim() === '') return;

//     setInput('');
//     resetTranscript();

//     const userMessage = { text: messageToSend, sender: 'user' };
//     setMessages(prevMessages => [...prevMessages, userMessage]);
    
//     try {
//       const response = await fetch('http://localhost:5001/api/chat', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ message: messageToSend }),
//       });

//       const data = await response.json();
//       const botMessage = { text: data.reply, sender: 'bot' };
//       setMessages(prevMessages => [...prevMessages, botMessage]);

//       if (isVoiceInput) {
//         window.speechSynthesis.cancel();
//         const utterance = new SpeechSynthesisUtterance(data.reply);
        
//         // 3. --- MANAGE SPEAKING STATE WITH EVENTS ---
//         utterance.onstart = () => setIsBotSpeaking(true);
//         // This onend event handles both natural finishes and manual cancellations
//         utterance.onend = () => setIsBotSpeaking(false);
        
//         window.speechSynthesis.speak(utterance);
//       }

//     } catch (error) {
//       console.error('Error fetching bot reply:', error);
//       setIsBotSpeaking(false); // Ensure state is reset on error
//       const errorMessage = { text: 'Sorry, I am having trouble connecting.', sender: 'bot' };
//       setMessages(prevMessages => [...prevMessages, errorMessage]);
//     }
//   }, [resetTranscript]);

//   useEffect(() => {
//     if (!listening && transcript) {
//       handleSend(transcript, true);
//     }
//   }, [listening, transcript, handleSend]);

//   useEffect(() => { window.speechSynthesis.getVoices(); }, []);
//   useEffect(() => { setInput(transcript); }, [transcript]);
//   useEffect(() => {
//     if (chatWindowRef.current) { chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight; }
//   }, [messages]);

//   const handleNewChat = () => {
//     window.speechSynthesis.cancel(); // Stop any speech on new chat
//     setIsBotSpeaking(false);
//     setMessages([]);
//     resetTranscript();
//     setInput('');
//   };
  
//   // 4. --- NEW FUNCTION TO HANDLE VOICE STOP ---
//   const handleStopVoice = () => {
//     window.speechSynthesis.cancel();
//     setIsBotSpeaking(false);
//   };

//   const handleTextSubmit = () => {
//     if (input.trim() === '') return;
//     handleSend(input, false);
//   };

//   const handleVoiceRecording = () => {
//     if (listening) {
//       SpeechRecognition.stopListening();
//     } else {
//       resetTranscript();
//       SpeechRecognition.startListening({ continuous: false });
//     }
//   };

//   if (!browserSupportsSpeechRecognition) {
//     return <span>Sorry, your browser does not support speech recognition.</span>;
//   }

//   return (
//     <div className="App">
//       <div className="sidebar">
//         <div className="new-chat-button" onClick={handleNewChat}>
//           + New Chat
//         </div>
//       </div>
//       <div className="main-content">
//         <div className="chat-window" ref={chatWindowRef}>
//           {messages.length === 0 ? (
//             <div className="welcome-screen">
//               <img src="BNI.png" className="welcome-logo" alt="logo" />
//               <h2>How can I help you today?</h2>
//             </div>
//           ) : (
//             messages.map((msg, index) => (
//               <div key={index} className={`message-wrapper ${msg.sender}`}>
//                 <div className="message">
//                   <div className="message-icon">
//                     {msg.sender === 'user' ? <UserIcon /> : <BotIcon logoSrc="BNI.png" />}
//                   </div>
//                   <div className="message-content">
//                     <ReactMarkdown>{msg.text}</ReactMarkdown>
//                   </div>
//                 </div>
//               </div>
//             ))
//           )}
//         </div>
//         <div className="chat-input-container">
//           <div className="chat-input">
//             <textarea
//               value={input}
//               onChange={(e) => setInput(e.target.value)}
//               placeholder={listening ? "Listening..." : "Ask BNI-ChatBot..."}
//               onKeyPress={(e) => {
//                 if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextSubmit(); }
//               }}
//             />
//             {/* 5. --- CONDITIONAL RENDERING OF BUTTONS --- */}
//             {isBotSpeaking ? (
//               <button onClick={handleStopVoice} className="stop-button">
//                 <StopIcon />
//               </button>
//             ) : (
//               <button onClick={handleVoiceRecording} className={`mic-button ${listening ? 'listening' : ''}`}>
//                 <MicrophoneIcon />
//               </button>
//             )}
//             <button onClick={handleTextSubmit} className="send-button" disabled={!input.trim()}>
//               ↑
//             </button>
//           </div>
//           <p className="footer-text">BNI-ChatBot can make mistakes. Consider checking important information.</p>
//         </div>
//       </div>
//     </div>
//   );
// }

// export default App;


import React, { useState, useEffect, useRef, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import SpeechRecognition, { useSpeechRecognition } from 'react-speech-recognition';
import './App.css';

// --- SVG Icons ---
const UserIcon = () => ( <svg width="30" height="30" viewBox="0 0 24 24" fill="#d9d9e9" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg> );
const BotIcon = ({ logoSrc }) => ( <img src={logoSrc} alt="bot icon" style={{ width: '30px', height: '30px', borderRadius: '4px' }} /> );
const MicrophoneIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path><path d="M19 10v2aa7 7 0 0 1-14 0v-2"></path><line x1="12" y1="19" x2="12" y2="22"></line></svg> );
const StopIcon = () => ( <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path d="M6 6h12v12H6V6z"/></svg> );

function App() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isBotSpeaking, setIsBotSpeaking] = useState(false);
  const chatWindowRef = useRef(null);

  const { transcript, listening, resetTranscript, browserSupportsSpeechRecognition } = useSpeechRecognition();

  const handleSend = useCallback(async (messageToSend, isVoiceInput = false) => {
    if (messageToSend.trim() === '') return;

    setInput('');
    resetTranscript();

    const userMessage = { text: messageToSend, sender: 'user' };
    setMessages(prevMessages => [...prevMessages, userMessage]);
    
    try {
      const response = await fetch('http://localhost:5001/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: messageToSend }),
      });

      const data = await response.json();
      const botMessage = { text: data.reply, sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, botMessage]);

      if (isVoiceInput) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(data.reply);
        utterance.onstart = () => setIsBotSpeaking(true);
        utterance.onend = () => setIsBotSpeaking(false);
        window.speechSynthesis.speak(utterance);
      }
    } catch (error) {
      console.error('Error fetching bot reply:', error);
      setIsBotSpeaking(false);
      const errorMessage = { text: 'Sorry, I am having trouble connecting.', sender: 'bot' };
      setMessages(prevMessages => [...prevMessages, errorMessage]);
    }
  }, [resetTranscript]);

  useEffect(() => {
    if (!listening && transcript) {
      handleSend(transcript, true);
    }
  }, [listening, transcript, handleSend]);

  useEffect(() => { window.speechSynthesis.getVoices(); }, []);
  useEffect(() => { setInput(transcript); }, [transcript]);
  useEffect(() => {
    if (chatWindowRef.current) { chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight; }
  }, [messages]);

  const handleNewChat = () => {
    window.speechSynthesis.cancel();
    setIsBotSpeaking(false);
    setMessages([]);
    resetTranscript();
    setInput('');
  };
  
  const handleStopVoice = () => {
    window.speechSynthesis.cancel();
    setIsBotSpeaking(false);
  };

  const handleTextSubmit = () => {
    if (input.trim() === '') return;
    handleSend(input, false);
  };

  const handleVoiceRecording = () => {
    if (listening) {
      SpeechRecognition.stopListening();
    } else {
      resetTranscript();
      SpeechRecognition.startListening({ continuous: false, language: 'en-US' });
    }
  };

  if (!browserSupportsSpeechRecognition) {
    return <span>Sorry, your browser does not support speech recognition.</span>;
  }

  return (
    <div className="App">
      <div className="sidebar">
        <div className="new-chat-button" onClick={handleNewChat}>
          + New Chat
        </div>
      </div>
      <div className="main-content">
        <div className="chat-window" ref={chatWindowRef}>
          {messages.length === 0 ? (
            <div className="welcome-screen">
              <img src="BNI.png" className="welcome-logo" alt="logo" />
              <h2>How can I help you today?</h2>
            </div>
          ) : (
            messages.map((msg, index) => (
              <div key={index} className={`message-wrapper ${msg.sender}`}>
                <div className="message">
                  <div className="message-icon">
                    {msg.sender === 'user' ? <UserIcon /> : <BotIcon logoSrc="BNI.png" />}
                  </div>
                  <div className="message-content">
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="chat-input-container">
          <div className="chat-input">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={listening ? "Listening..." : "Ask BNI-ChatBot..."}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleTextSubmit(); }
              }}
            />
            {isBotSpeaking ? (
              <button onClick={handleStopVoice} className="stop-button">
                <StopIcon />
              </button>
            ) : (
              <button onClick={handleVoiceRecording} className={`mic-button ${listening ? 'listening' : ''}`}>
                <MicrophoneIcon />
              </button>
            )}
            <button onClick={handleTextSubmit} className="send-button" disabled={!input.trim()}>
              ↑
            </button>
          </div>
          <p className="footer-text">BNI-ChatBot can make mistakes. Consider checking important information.</p>
        </div>
      </div>
    </div>
  );
}

export default App;