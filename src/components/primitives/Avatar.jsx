import React from 'react'


export default function Avatar({ name = 'U', size = 8 }) {
    return <div className={`w-${size} h-${size} rounded-full bg-gray-200 flex items-center justify-center`}>{name.charAt(0)}</div>
}