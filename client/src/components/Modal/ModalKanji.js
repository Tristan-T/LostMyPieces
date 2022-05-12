import React from "react";
import Modal from "./Modal";
import Kanji from "./Kanji";

const ModalKanji = ({kanji, closeLastModal}) => {
    return (
        <Modal closeLastModal={closeLastModal} component={<Kanji kanji={kanji}/>}/>)
}

export default ModalKanji;