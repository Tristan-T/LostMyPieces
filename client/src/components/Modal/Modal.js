import React, {createRef} from "react";
import OutsideClickHandler from "react-outside-click-handler";

const Modal = ({component, closeLastModal}) => {
    return (
        <OutsideClickHandler onOutsideClick={() => {
            closeLastModal();
        }}>
            <div className="rounded-md absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-gray-400 border-thin w-4/5 h-3/4 bg-gray-100">
                <div
                    style={{float:"right", display:"inline-block", padding:"2px 5px"}}
                    onClick={() => {closeLastModal();}}
                >X</div>
                {component}
            </div>
        </OutsideClickHandler>
    )
};

export default Modal;