import React, { createContext, useState, useContext, useEffect } from 'react'


const ProgressContext = createContext()
export const useProgress = () => useContext(ProgressContext)


export function ProgressProvider({ children }) {
    const [stats, setStats] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem('progress')) || {}
        } catch (e) {
            return {}
        }
    })


    useEffect(() => {
        localStorage.setItem('progress', JSON.stringify(stats))
    }, [stats])


    const updateStats = (patch) => setStats((s) => ({ ...s, ...patch }))


    return (
        <ProgressContext.Provider value={{ stats, updateStats }}>
            {children}
        </ProgressContext.Provider>
    )
}