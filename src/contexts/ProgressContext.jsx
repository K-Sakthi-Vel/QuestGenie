import React, { createContext, useState, useContext, useEffect } from 'react'


const ProgressContext = createContext()
export const useProgress = () => useContext(ProgressContext)


export function ProgressProvider({ children }) {
    const [stats, setStats] = useState(() => {
        try {
            const saved = JSON.parse(localStorage.getItem('progress'));
            return saved || { studyTime: 0 }; // Ensure studyTime is initialized
        } catch (e) {
            return { studyTime: 0 };
        }
    });

    useEffect(() => {
        localStorage.setItem('progress', JSON.stringify(stats));
    }, [stats]);

    const updateStats = (patch) => setStats((s) => ({ ...s, ...patch }));

    // Function to increment study time in seconds
    const incrementStudyTime = (seconds) => {
        setStats((s) => ({
            ...s,
            studyTime: (s.studyTime || 0) + seconds,
        }));
    };

    return (
        <ProgressContext.Provider value={{ stats, updateStats, incrementStudyTime }}>
            {children}
        </ProgressContext.Provider>
    );
}
