import React from "react";
import Modal from "./Modal";
import Word from "./Word";

const ModalWord = ({word, closeLastModal}) => {
    console.log(word)
    return (
        <Modal closeLastModal={closeLastModal} component={<Word word={word}/>}/>
    )
}

export default ModalWord;