import React from 'react'


export default function Input(props) {
    return <input className="w-full p-2 border rounded" {...props} />
}


/* ------------------------- */
/* File: src/components/primitives/Modal.jsx */
import React from 'react'


export default function Modal({ open, onClose, children, title }) {
    if (!open) return null
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
            <div className="bg-white rounded-lg w-full max-w-2xl p-4">
                <div className="flex items-center justify-between mb-4">
                    <div className="font-semibold">{title}</div>
                    <button onClick={onClose} className="text-gray-500">✕</button>
                </div>
                {children}
            </div>
        </div>
    )
}