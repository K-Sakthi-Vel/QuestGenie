import React from 'react'


export default function Toast({ children }) {
    return <div className="fixed bottom-6 left-6 bg-black text-white p-3 rounded">{children}</div>
}


/* ------------------------- */
/* File: src/components/primitives/Icon.jsx */
import React from 'react'


export default function Icon({ name, className = '' }) {
    // simple icon mapper (extend as needed)
    const icons = {
        search: <svg className={`w-5 h-5 ${className}`} viewBox="0 0 24 24" fill="none" stroke="currentColor"><path d="M21 21l-4.35-4.35" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /><circle cx="11" cy="11" r="6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>,
    }
    return icons[name] || null
}