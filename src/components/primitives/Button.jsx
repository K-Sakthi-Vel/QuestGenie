import React from 'react'


export default function Button({ children, className = '', variant = 'solid', size = 'md', ...props }) {
    const base = 'inline-flex items-center justify-center rounded-md font-medium focus:outline-none'
    const sizes = {
        sm: 'px-2 py-1 text-sm',
        md: 'px-3 py-2 text-sm',
        lg: 'px-4 py-2 text-base',
    }
    const variants = {
        solid: 'bg-indigo-600 text-white hover:bg-indigo-700',
        ghost: 'bg-transparent text-gray-700 hover:bg-gray-100',
    }
    return (
        <button className={`${base} ${sizes[size]} ${variants[variant]} ${className}`} {...props}>
            {children}
        </button>
    )
}