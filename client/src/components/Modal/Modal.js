import React from "react";
import OutsideClickHandler from "react-outside-click-handler";
import "./Modal.css"

const Modal = ({component, closeLastModal}) => {
    return (
        <OutsideClickHandler onOutsideClick={() => {
            closeLastModal();
        }}>
            <div className="darken-screen rounded-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-gray-400 border-thin bg-white">
                <button type="button"
                        className="close bg-white rounded-md p-2 inline-flex items-center justify-center text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500"
                        onClick={ () => closeLastModal() }>
                    <span className="sr-only">Close menu</span>
                    <svg className="h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"/>
                    </svg>
                </button>
                {component}
            </div>
        </OutsideClickHandler>
    )
};

export default Modal;