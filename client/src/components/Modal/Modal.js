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
                <div className="darken-screen rounded-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black dark:text-white bg-panel-back dark:bg-panel-back-dark">
                    {component}
                    <button className="rounded-b-lg w-full pb-1 pt-1 
                        duration-500
                        bg-panel-blue dark:bg-panel-blue-dark 
                        text-white hover:text-panel-blue hover:dark:text-panel-blue-dark hover:bg-white text-center" onClick={ () => closeLastModal() }>Dismiss</button>
                </div>
            </CSSTransition>
        </OutsideClickHandler>
    )
};

export default Modal;