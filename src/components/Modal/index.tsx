"use client";
import { useEffect, useState } from "react";

type ModalProps = {
  onClose: () => void;
  children: React.ReactNode;
}

const Modal = ({children, onClose}: ModalProps) => {

  const [showModal, setShowModal] = useState(true)
  const modalClass = showModal ? "flex" : "hidden";

  const handleCloseModal = () => {
    setShowModal(false)
    onClose()
  }

  useEffect(() => {
    if (showModal) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }

    // Cleanup when component unmounts
    return () => {
      document.body.style.overflow = "";
    };
  }, [showModal]);

  return (
    <div className={`fixed inset-0 bg-gray-400/70 w-full h-full justify-center items-center z-90 ${modalClass}`}>
      <div className="bg-white p-4 min-w-[300px] min-h-[200px] rounded-xl shadow relative max-h-screen z-30">
        {children}
        <button className="rounded-full bg-gray-900 p-1 text-white font-medium absolute top-0 right-0 border-2 border-white cursor-pointer" onClick={handleCloseModal}>
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="size-4">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <a className="w-full h-full absolute inset-0 z-20" onClick={handleCloseModal}></a>
    </div>
  )
}

export default Modal;