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
                <div className="darken-screen rounded-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black dark:text-white bg-pannel-back dark:bg-pannel-back-dark">
                    {component}
                    <button className="rounded-b-lg w-full pb-1 pt-1 
                        duration-500
                        bg-pannel-blue dark:bg-pannel-blue-dark 
                        text-white hover:text-pannel-blue hover:dark:text-pannel-blue-dark hover:bg-white text-center" onClick={ () => closeLastModal() }>Dismiss</button>
                </div>
            </CSSTransition>
        </OutsideClickHandler>
    )
};

export default Modal;