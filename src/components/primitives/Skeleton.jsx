import React from 'react'


export default function Skeleton({ className = 'h-4 w-full rounded' }) {
    return <div className={`bg-gray-200 animate-pulse ${className}`} />
}