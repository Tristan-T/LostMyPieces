import React from "react";
import OutsideClickHandler from "react-outside-click-handler";
import "./Modal.css"
import {CSSTransition} from "react-transition-group";

const Modal = ({component, closeLastModal}) => {
    return (
        <OutsideClickHandler onOutsideClick={() => {
            closeLastModal();
        }}>
            <CSSTransition appear={true} in={true} exit={true} timeout={300} classNames="modal">
                <div className="border-t-blue-400 border-t-6 p-1 darken-screen rounded-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-gray-400 border-thin bg-white dark:bg-black dark:text-white">
                    {component}
                    <button className="rounded-md w-full pb-1 pt-1 border-blue-400 text-blue-400 hover:bg-blue-50 border-thin text-center" onClick={ () => closeLastModal() }>Dismiss</button>
                </div>
            </CSSTransition>
        </OutsideClickHandler>
    )
};

export default Modal;