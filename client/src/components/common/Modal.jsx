// NovaNest/client/src/components/common/Modal.jsx
import React, { useEffect } from 'react';

const Modal = ({ isOpen, onClose, title, children }) => {
  useEffect(() => {
    const handleEscapeKey = (event) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300 ease-in-out px-4 py-6 sm:py-8" // Added padding for small screens
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg shadow-xl w-full max-w-lg transform transition-all duration-300 ease-in-out flex flex-col" // Added flex flex-col
        onClick={(e) => e.stopPropagation()}
        style={{ maxHeight: 'calc(100vh - 4rem)' }} // Alternative max-height using style if Tailwind vh units are tricky with calc
                                                    // Or use Tailwind: max-h-[calc(100vh-4rem)] if using JIT mode and it's supported
                                                    // Or simply max-h-[90vh] or max-h-screen-80
      >
        {/* Modal Header */}
        {title && ( // Render header only if title is provided
            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-800">{title}</h2>
                <button
                    onClick={onClose}
                    className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none"
                    aria-label="Close modal"
                >
                    ×
                </button>
            </div>
        )}

        {/* Modal Body - This is where scrolling will happen */}
        <div className="modal-body p-4 sm:p-6 overflow-y-auto flex-grow"> {/* Added flex-grow and adjusted padding */}
          {children}
        </div>

        {/* Optional Modal Footer (if you want consistent action buttons outside the children) */}
        {/* <div className="flex items-center justify-end p-4 sm:p-6 border-t border-gray-200">
            <button onClick={onClose} className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300">
                Close
            </button>
        </div> */}
      </div>
    </div>
  );
};

export default Modal;