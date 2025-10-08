// ChatContainer.tsx
import React, { useEffect, useRef, useState } from 'react';
import { FiPaperclip, FiSend, FiThumbsUp, FiBookOpen } from 'react-icons/fi';

const WelcomeMessage = () => (
  <div className="flex flex-col items-center justify-center h-full text-gray-500">
    <FiBookOpen size={64} className="mb-4" />
    <h2 className="text-2xl font-semibold mb-2">Welcome!</h2>
    <p className="text-center">I am your virtual teaching companion. <br /> Ask me anything to get started.</p>
  </div>
);

const YoutubeCard = ({ video }) => (
  <div className="max-w-sm rounded-lg border border-gray-200 overflow-hidden my-4">
    <img className="w-full" src={video.thumbnail} alt={video.title} />
    <div className="p-4">
      <div className="flex items-center mb-2">
        <span className="text-xs font-semibold inline-block py-1 px-2 uppercase rounded-full text-green-600 bg-green-200">
          {video.relevance}
        </span>
      </div>
      <h4 className="font-bold text-lg mb-1">{video.title}</h4>
      <p className="text-gray-600 text-sm mb-2">{video.channelName} &bull; {video.duration}</p>
      <p className="text-gray-700 text-base mb-4">{video.description}</p>
      <button className="w-full bg-blue-600 text-white font-bold py-2 px-4 rounded hover:bg-blue-700">
        Open Video
      </button>
    </div>
  </div>
);

// ChatMessage used for static messages (unchanged)
const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'student';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`rounded-lg px-4 py-3 max-w-md ${isUser ? 'bg-red-400 text-white' : 'bg-gray-200 text-gray-800'}`}
      >
        <p className="whitespace-pre-wrap">{message.text}</p>
        {message.youtubeRecommendation && <YoutubeCard video={message.youtubeRecommendation} />}
      </div>
    </div>
  );
};

const ChatContainer = ({ activeChat, messages = [], onMessagesChange, onSend }) => {
  const [inputValue, setInputValue] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [sseReady, setSseReady] = useState(false);
  const esRef = useRef(null);
  const sseConnectionPromise = useRef(null);
  const resolveSseConnectionPromise = useRef(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

  const setMessages = onMessagesChange;

  // Setup SSE when active chat changes
  useEffect(() => {
    if (!activeChat?.id) return;

    // Close previous connection if it exists
    if (esRef.current) {
      console.log('SSE disconnected');
      esRef.current.close();
    }
    setSseReady(false);

    // Create a new promise for the new connection
    sseConnectionPromise.current = new Promise((resolve) => {
      resolveSseConnectionPromise.current = resolve;
    });

    const es = new EventSource(`http://localhost:5000/api/chat/stream/${activeChat.id}`);
    esRef.current = es;

    es.onopen = () => {
      console.log('SSE connected');
      setSseReady(true);
      if (resolveSseConnectionPromise.current) {
        resolveSseConnectionPromise.current();
      }
    };

    es.addEventListener('chunk', (event) => {
      console.log('Received chunk');
      const chunk = JSON.parse(event.data);
      setMessages((prevMessages) => {
        const existingMsgIndex = prevMessages.findIndex((msg) => msg.id === chunk.assistantMessageId);
        if (existingMsgIndex > -1) {
          const newMessages = [...prevMessages];
          newMessages[existingMsgIndex] = {
            ...newMessages[existingMsgIndex],
            text: newMessages[existingMsgIndex].text + chunk.text,
          };
          return newMessages;
        }
        return [...prevMessages, { id: chunk.assistantMessageId, sender: 'assistant', text: chunk.text }];
      });
      setStreaming(true);
    });

    es.addEventListener('done', () => {
      setStreaming(false);
    });

    es.onerror = () => {
      console.log('SSE disconnected');
      setSseReady(false);
      es.close();
    };

    return () => {
      if (esRef.current) {
        console.log('SSE disconnected');
        esRef.current.close();
        esRef.current = null;
      }
      setSseReady(false);
    };
  }, [activeChat?.id]);

  function scrollToBottom() {
    if (!scrollRef.current) return;
    // small timeout to let DOM update
    requestAnimationFrame(() => {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    });
  }

  const sendMessageToServer = async (text) => {
    if (!activeChat?.id) return;

    // Optimistically add student's message
    const userMsg = { id: `u-${Date.now()}`, sender: 'student', text };
    setMessages((m) => [...m, userMsg]);
    setInputValue('');
    scrollToBottom();

    try {
      // Wait for the SSE connection to be ready
      if (!sseReady && sseConnectionPromise.current) {
        await sseConnectionPromise.current;
      }

      // POST to server to start streaming model response
      await fetch('http://localhost:5000/api/chat/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: activeChat.id, message: text }),
      });

      setStreaming(true);
      if (typeof onSend === 'function') onSend(text);
    } catch (err) {
      console.error('send error', err);
      setMessages((m) => [...m, { id: `err-${Date.now()}`, sender: 'assistant', text: 'Error sending message.' }]);
    }
  };

  const handleInputChange = (e) => {
    const textarea = textareaRef.current;
    setInputValue(e.target.value);

    if (textarea) {
      textarea.style.height = "auto"; // reset
      const newHeight = Math.min(textarea.scrollHeight, 150);
      textarea.style.height = `${newHeight}px`;

      // show scrollbar only if height reaches max
      textarea.style.overflowY = textarea.scrollHeight > 150 ? "auto" : "hidden";
    }
  };


  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessageToServer(inputValue.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // scroll on new messages
  useEffect(() => { scrollToBottom(); }, [messages.length]);

  return (
    <div className="flex flex-col h-full bg-white">

      <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto">
        {messages.length === 0 ? (
          <WelcomeMessage />
        ) : (
          messages.map((msg) => (
            <div key={msg.id}>
              <ChatMessage message={msg} />
            </div>
          ))
        )}

        {streaming && (
          <div className="text-sm text-gray-500 italic">Assistant is typing...</div>
        )}
      </div>

      <div className="p-4 border-t border-gray-200">
        <div className="flex space-x-2 mb-2">
          <button className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700">
            <FiThumbsUp className="mr-2" /> Recommended
          </button>
        </div>

        <div className="relative flex items-center">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your question..."
            className="w-full p-3 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={1}
            style={{ maxHeight: '150px', minHeight: '40px', overflowY: 'hidden' }}
          />

          <div className="absolute right-3 flex items-center space-x-2 h-full">
            <button className="text-gray-500 hover:text-gray-700" title="Attach file">
              <FiPaperclip size={20} />
            </button>
            <button
              onClick={handleSend}
              className="bg-red-400 text-white p-2 rounded-full hover:bg-blue-700 disabled:bg-red-300"
              disabled={!inputValue.trim()}
            >
              <FiSend size={20} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ChatContainer;
