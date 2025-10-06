import React from 'react'
import Button from '../primitives/Button'


export default function PDFToolbar() {
    return (
        <div className="flex items-center justify-between gap-3 p-3 bg-white rounded-md shadow-sm">
            <div className="flex items-center gap-2">
                <Button size="sm">Prev</Button>
                <Button size="sm">Next</Button>
                <div className="px-2 text-sm text-gray-600">Page 1 / 10</div>
            </div>
            <div className="flex items-center gap-2">
                <Button variant="ghost">Zoom -</Button>
                <Button variant="ghost">Zoom +</Button>
                <Button color="primary">Generate Quiz</Button>
            </div>
        </div>
    )
}