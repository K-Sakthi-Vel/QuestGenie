import React, { createContext, useState, useContext } from 'react'


const UIContext = createContext()
export const useUI = () => useContext(UIContext)


export function UIProvider({ children }) {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [chatOpen, setChatOpen] = useState(false)
    const value = { sidebarOpen, setSidebarOpen, chatOpen, setChatOpen }
    return <UIContext.Provider value={value}>{children}</UIContext.Provider>
}