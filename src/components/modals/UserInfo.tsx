import React, { ReactNode } from 'react'
import { LiaTimesSolid } from 'react-icons/lia'

interface ModalProps {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
}

const UserInfo: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 px-4"
      onClick={onClose}
    >
     <div className="relative">
       <div
        className="bg-white rounded-lg shadow-lg p-6 relative w-full max-w-md sm:max-w-lg md:max-w-xl max-h-screen"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute -top-3 -right-3 text-xl text-gray-600 hover:text-gray-800 rounded-full bg-gray-300 p-1"
          onClick={onClose}
        >
          <LiaTimesSolid size={20} />
        </button>
        {children}
      </div>
     </div>
    </div>
  )
}

export default UserInfo
