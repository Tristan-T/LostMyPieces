import React from "react";
import Modal from "./Modal";
import Word from "./Word";

const ModalWord = ({word, closeLastModal}) => {
    return (
        <Modal closeLastModal={closeLastModal} component={<Word word={word}/>}/>
    )
}

export default ModalWord;