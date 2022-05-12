import OutsideClickHandler from "react-outside-click-handler";
import ModalWord from "./ModalWord";
import ModalKanji from "./ModalKanji";

const ModalManager = ({modalList, setModalList}) => {
    const closeLastModal = () => {
        setModalList(modalList.slice(0, -1));
    }

    const getModal = () => {
        if(modalList.length===0) return null;
        let modal = modalList[modalList.length-1];
        switch (modal.type) {
            case 'word':
                return <ModalWord
                    key={modal.word.word}
                    word={modal.word}
                    closeLastModal={closeLastModal}
                />;
            case 'kanji':
                return <ModalKanji
                    key={modal.kanji.kanji}
                    kanji={modal.kanji}
                    closeLastModal={closeLastModal}
                />;
            default:
                return null;
        }
    }


    return getModal();
};

export default ModalManager;