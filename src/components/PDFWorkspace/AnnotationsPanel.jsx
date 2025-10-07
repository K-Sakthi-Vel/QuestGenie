import React from "react";

export default function SimpleIframePDF({ pdfUrl }) {
  if (!pdfUrl) {
    return (
      <div className="text-gray-500 text-sm p-4 bg-white rounded-md shadow-sm">
        No PDF selected.
      </div>
    );
  }

  // Keep toolbar, disable left sidebar, fit width
  const viewerUrl = `${pdfUrl}#toolbar=1&navpanes=0&view=FitH`;

  return (
    <div className="h-[70vh] bg-white rounded-md shadow-sm border overflow-hidden">
      <iframe
        title="PDF Preview"
        src={viewerUrl}
        className="w-full h-full"
        style={{
          border: "none",
          backgroundColor: "#ffffff", // Light background
          colorScheme: "light", // Tell browser to render in light mode
        }}
      />
    </div>
  );
}
