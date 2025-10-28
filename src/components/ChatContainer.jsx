import React, { useEffect, useRef, useState, useCallback } from 'react';
import { FiPaperclip, FiSend, FiBookOpen, FiArrowDownCircle } from 'react-icons/fi';
import { FaHistory } from "react-icons/fa";

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "http://localhost:5000";

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
      <button className="w-full bg-red-400 text-white font-bold py-2 px-4 rounded hover:bg-red-500">
        Open Video
      </button>
    </div>
  </div>
);

const ChatMessage = ({ message }) => {
  const isUser = message.sender === 'student';
  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div
        className={`rounded-lg px-4 py-3 max-w-2xl ${isUser ? 'bg-red-400 text-white' : 'bg-gray-100 text-gray-800'}`}
      >
        <div className="prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.text}</ReactMarkdown>
        </div>
        {message.youtubeRecommendation && <YoutubeCard video={message.youtubeRecommendation} />}
      </div>
    </div>
  );
};

const LoadingIndicator = () => (
    <div className="flex items-center justify-start text-gray-500">
      <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-red-500"></div>
      <span className="ml-3">AI is thinking...</span>
    </div>
  );

const ChatContainer = ({ activeChat, messages = [], onMessagesChange, onSend, onToggleDrawer, useMockData }) => {
  const [inputValue, setInputValue] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [sseReady, setSseReady] = useState(false);
  const [showScrollToBottom, setShowScrollToBottom] = useState(false);
  const [inputAreaHeight, setInputAreaHeight] = useState(0); // New state for input area height
  const esRef = useRef(null);
  const sseConnectionPromise = useRef(null);
  const resolveSseConnectionPromise = useRef(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);
  const inputAreaRef = useRef(null); // New ref for the input area

  const setMessages = onMessagesChange;

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth',
      });
    }
  }, []);

  const handleScroll = useCallback(() => {
    if (scrollRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
      const isAtBottom = scrollHeight - scrollTop <= clientHeight + 10; // +10 for a small buffer
      setShowScrollToBottom(!isAtBottom);
    }
  }, []);

  useEffect(() => {
    if (!activeChat?.id) return;

    if (esRef.current) {
      esRef.current.close();
    }
    setSseReady(false);

    sseConnectionPromise.current = new Promise((resolve) => {
      resolveSseConnectionPromise.current = resolve;
    });

    // Pass useMockData as a query parameter for the SSE stream
    const streamEndpoint = `${BACKEND_URL}/api/chat/stream/${activeChat.id}?useMockData=${useMockData}`;
    const es = new EventSource(streamEndpoint);
    esRef.current = es;

    es.onopen = () => {
      setSseReady(true);
      if (resolveSseConnectionPromise.current) {
        resolveSseConnectionPromise.current();
      }
    };

    es.addEventListener('chunk', (event) => {
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
      scrollToBottom(); // Scroll to bottom once streaming is done
    });

    es.onerror = () => {
      setSseReady(false);
      es.close();
    };

    return () => {
      if (esRef.current) {
        esRef.current.close();
        esRef.current = null;
      }
      setSseReady(false);
    };
  }, [activeChat?.id, setMessages, scrollToBottom]);

  const sendMessageToServer = async (text) => {
    if (!activeChat?.id) return;

    const userMsg = { id: `u-${Date.now()}`, sender: 'student', text };
    setMessages((m) => [...m, userMsg]);
    setInputValue('');
    scrollToBottom();

    try {
      if (!sseReady && sseConnectionPromise.current) {
        await sseConnectionPromise.current;
      }

      await fetch(`${process.env.REACT_APP_BACKEND_URL}/api/chat/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ chatId: activeChat.id, message: text, useMockData }), // Include useMockData
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
      textarea.style.height = "auto";
      const newHeight = Math.min(textarea.scrollHeight, 150);
      textarea.style.height = `${newHeight}px`;
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

  useEffect(() => {
    scrollToBottom();
  }, [messages.length, scrollToBottom]);

  useEffect(() => {
    if (streaming) {
      scrollToBottom();
    }
  }, [streaming, scrollToBottom]);

  useEffect(() => {
    const scrollElement = scrollRef.current;
    if (scrollElement) {
      scrollElement.addEventListener('scroll', handleScroll);
      handleScroll(); // Initial check
      return () => scrollElement.removeEventListener('scroll', handleScroll);
    }
  }, [handleScroll]);

  // Effect to measure the height of the input area
  useEffect(() => {
    const updateInputAreaHeight = () => {
      if (inputAreaRef.current) {
        setInputAreaHeight(inputAreaRef.current.offsetHeight);
      }
    };

    updateInputAreaHeight(); // Initial height calculation

    // Add event listener for window resize to recalculate height
    window.addEventListener('resize', updateInputAreaHeight);

    // Also observe mutations in case content changes without resize (e.g., text wrapping)
    const observer = new MutationObserver(updateInputAreaHeight);
    if (inputAreaRef.current) {
      observer.observe(inputAreaRef.current, { childList: true, subtree: true, attributes: true });
    }

    return () => {
      window.removeEventListener('resize', updateInputAreaHeight);
      observer.disconnect();
    };
  }, []);


  return (
    <div className="flex flex-col h-full bg-white relative"> {/* parent is relative */}
      <div className="p-4 border-b border-gray-200 flex justify-end md:hidden">
        <button onClick={onToggleDrawer} className="text-gray-600">
          <FaHistory size={24} />
        </button>
      </div>

      {/* messages scroll area */}
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
        {streaming && <LoadingIndicator />}
      </div>

      {/* Scroll-to-bottom button — positioned absolutely inside the relative parent so it stays at bottom center above the suggested questions */}
      {showScrollToBottom && inputAreaHeight > 0 && ( // Only show if height is measured
        <div
          className="absolute left-1/2 -translate-x-1/2 z-50"
          style={{ bottom: `${inputAreaHeight + 16}px` }} // Dynamically adjust based on inputAreaHeight + padding
        >
          <button
            onClick={scrollToBottom}
            className="bg-red-400 text-white p-2 rounded-full shadow-lg hover:bg-red-500 transition-colors opacity-90 hover:opacity-100"
            title="Scroll to bottom"
          >
            <FiArrowDownCircle size={24} />
          </button>
        </div>
      )}

      {/* input + suggested questions area (kept as you had it) */}
      <div ref={inputAreaRef} className="p-4 border-t border-gray-200"> {/* Added ref here */}
        <div className="flex flex-wrap gap-2 mb-2">
          <button
            onClick={() => sendMessageToServer("Hello")}
            className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700"
            disabled={streaming}
          >
            Hello
          </button>
          <button
            onClick={() => sendMessageToServer("What can you do?")}
            className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700"
            disabled={streaming}
          >
            What can you do?
          </button>
          <button
            onClick={() => sendMessageToServer("Explain the quadratic formula.")}
            className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700"
            disabled={streaming}
          >
            Explain the quadratic formula.
          </button>
          <button
            onClick={() => sendMessageToServer("Explain a basic physics concept.")}
            className="flex items-center px-3 py-1 bg-gray-100 hover:bg-gray-200 rounded-full text-sm text-gray-700"
            disabled={streaming}
          >
            Explain a basic physics concept.
          </button>
        </div>

        <div className="relative flex items-center">
          <textarea
            ref={textareaRef}
            value={inputValue}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your question..."
            className="w-full p-3 pr-20 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-400 resize-none"
            rows={1}
            style={{ maxHeight: '150px', minHeight: '40px', overflowY: 'hidden' }}
            disabled={streaming}
          />
          <div className="absolute right-3 flex items-center space-x-2 h-full">
            <button className="text-gray-500 hover:text-gray-700" title="Attach file" disabled={streaming}>
              <FiPaperclip size={20} />
            </button>
            <button
              onClick={handleSend}
              className="bg-red-400 text-white p-2 rounded-full hover:bg-red-500 disabled:bg-red-300"
              disabled={!inputValue.trim() || streaming}
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
