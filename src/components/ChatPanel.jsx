import React, { useState, useEffect } from 'react';
import ChatContainer from './ChatContainer';
import RightDrawer from './RightDrawer';

export default function ChatPanel() {
    const [chats, setChats] = useState([]);
    const [activeChatId, setActiveChatId] = useState(null);
    const [messages, setMessages] = useState([]);

    useEffect(() => {
        if (activeChatId) {
            const storedMessages = localStorage.getItem(`chat_${activeChatId}`);
            if (storedMessages) {
                setMessages(JSON.parse(storedMessages));
            } else {
                setMessages([]);
            }
        }
    }, [activeChatId]);

    useEffect(() => {
        if (activeChatId && messages.length > 0) {
            localStorage.setItem(`chat_${activeChatId}`, JSON.stringify(messages));
        }
    }, [messages, activeChatId]);

    useEffect(() => {
        const storedChats = localStorage.getItem('chats');
        if (storedChats) {
            const parsedChats = JSON.parse(storedChats);
            setChats(parsedChats);
            if (parsedChats.length > 0) {
                setActiveChatId(parsedChats[0].id);
            }
        } else {
            // Create a default chat if none exist
            const defaultChat = { id: `chat-${Date.now()}`, title: 'New Chat' };
            setChats([defaultChat]);
            setActiveChatId(defaultChat.id);
        }
    }, []);

    useEffect(() => {
        if (chats.length > 0) {
            localStorage.setItem('chats', JSON.stringify(chats));
        }
    }, [chats]);

    const handleSelectChat = (id) => {
        setActiveChatId(id);
    };

    const handleNewChat = () => {
        const newChat = {
            id: `chat-${Date.now()}`,
            title: 'New Chat',
        };
        setChats(prevChats => [newChat, ...prevChats]);
        setActiveChatId(newChat.id);
        setMessages([]); // Explicitly clear messages for the new chat
    };

    useEffect(() => {
        const activeChat = chats.find(chat => chat.id === activeChatId);
        if (activeChat && activeChat.title === 'New Chat' && messages.length > 0) {
            const firstUserMessage = messages.find(msg => msg.sender === 'student');
            if (firstUserMessage && firstUserMessage.text) {
                const updatedChats = chats.map(chat =>
                    chat.id === activeChatId ? { ...chat, title: firstUserMessage.text.substring(0, 20) + (firstUserMessage.text.length > 20 ? '...' : '') } : chat
                );
                setChats(updatedChats);
            }
        }
    }, [messages, chats, activeChatId]);

    const activeChat = chats.find(chat => chat.id === activeChatId);

    return (
        <div className="flex-1 flex h-[calc(100vh-65px)] bg-white overflow-hidden">
            <div className="flex-1 flex flex-col">
                <ChatContainer 
                    activeChat={activeChat}
                    messages={messages}
                    onMessagesChange={setMessages}
                />
            </div>
            <RightDrawer 
                chats={chats}
                onSelectChat={handleSelectChat}
                onNewChat={handleNewChat}
            />
        </div>
    );
}
