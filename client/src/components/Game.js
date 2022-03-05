import React, { useState, useEffect } from 'react';
import SidePanel from "./Game/SidePanel";
import WhiteBoard from "./Game/WhiteBoard";
import { getKanjisUnlocked, getShopCombination, getMerge } from "../services/api";
import Loading from "./Loading";
import ShopModal from "./Shop/ShopModal";
import configData from "../listKanjis.json"
import ModalWord from "./Modal/ModalWord";
import ModalKanji from "./Modal/ModalKanji";
import modal from "./Modal/Modal";

const Game = () => {
    const [initialized, setInitialized] = useState(false);
    const [kanjiList, setKanjiList] = useState([])
    const [kanjiListShop, setKanjiListShop] = useState([]);
    const [showShop, setShowShop] = useState(false);
    const [money, setMoney] = useState(localStorage.getItem("money")?JSON.parse(localStorage.getItem("money")):0);
    const [canBuy, setCanBuy] = useState(true);
    const [UIDisabled, setUIDisabled] = useState(false);
    const [modalList, setModalList] = useState([])
    const [unlockedWords, setUnlockedWords] = useState(localStorage.getItem("unlockedWords")?JSON.parse(localStorage.getItem("unlockedWords")):[])

    const initUI = () => {
        let kanjisUnlocked = localStorage.getItem("kanjisUnlocked");
        if (kanjisUnlocked) {
            console.log("Loading from localStorage")
            setKanjiList(JSON.parse(kanjisUnlocked));
            updateShop(JSON.parse(kanjisUnlocked).map(k => k.kanji));
            setInitialized(true);
        } else {
            console.log("Loading from API")
            getKanjisUnlocked(configData.defaultKanjis)
                .then(response => response.json())
                .then(data => {
                    const tempList = data.map(k => ({...k, foundCombinations:0}))
                    console.log(tempList)
                    localStorage.setItem("kanjisUnlocked", JSON.stringify(tempList))
                    setKanjiList(tempList);
                    setInitialized(true);
                    updateShop(configData.defaultKanjis);
                });
        }

    }

    const updateSidePanel = (kanjis) => {
        getKanjisUnlocked(kanjis)
            .then(response => response.json())
            .then(data => {
                console.log(data);
                //TODO : Pas opti, double recherche dans une liste
                data = data.map(kanji => ({...kanji, foundCombinations:kanjiList.findIndex(k => k.kanji===kanji.kanji)===-1?0:kanjiList.find(k => k.kanji===kanji.kanji).foundCombinations}))
                console.log(data);
                localStorage.setItem("kanjisUnlocked", JSON.stringify(data))
                setKanjiList(data);
            });
    }

    const updateShop = (kanjis) => {
        setCanBuy(false);
        getShopCombination(kanjis)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                setKanjiListShop(data);
                setCanBuy(true);
            });
    }

    const unlockKanji = (kanji) => {
        let newKanjiList = kanjiList.map(kanji => kanji.kanji);
        newKanjiList.push(kanji);
        updateSidePanel(newKanjiList)
        updateShop(newKanjiList)
    }

    useEffect(initUI, [])

    const [kanjiOnBoard, setKanjiOnBoard] = useState(localStorage.getItem("kanjiOnBoard")?JSON.parse(localStorage.getItem("kanjiOnBoard")):[]);

    const saveKanjiOnBoard = () => {
        localStorage.setItem("kanjiOnBoard", JSON.stringify(kanjiOnBoard));
    }

    useEffect(saveKanjiOnBoard, [kanjiOnBoard])

    /**
     * 
     * @param {{kanji: string, kun: string, on: string, english: string}} kanji 
     */
    const OnCreateNewKanjiOnBoard = (kanji) => {
        setKanjiOnBoard([...kanjiOnBoard, { ...kanji, position: { x: 0.5, y: 0.5 } }]);
    }

    const OnMerge = (first, second) => {
        const newKanjiOnBoard = kanjiOnBoard.filter(v => v !== first && v !== second);
        getMerge([first.kanji, second.kanji])
            .then(response => response.json())
            .then(data => {
                console.log(data);
                if(data.length===0) {
                    console.log("No merge candidates");
                } else {
                    //TODO : Using actualWord instead of word
                    data.forEach(w => {
                        newKanjiOnBoard.push({kanji : w.word, position:first.position});
                        registerWord(w);
                    })
                    setKanjiOnBoard(newKanjiOnBoard);
                    localStorage.setItem("kanjisUnlocked", JSON.stringify(kanjiList))
                }
            })
    }

    const registerWord = (word) => {
        let index = unlockedWords.findIndex(w => w.word===word.word);
        if(index===-1) {
            setUnlockedWords([...unlockedWords, {...word, tried:1}]);
            const arrKanji = [...new Set(word.word.split(''))];
            arrKanji.forEach(k => {
                console.log(k)
                let index = kanjiList.findIndex(kanji => kanji.kanji===k);
                kanjiList[index].foundCombinations++;
            })
            setMoney(money+50);
            openWordModal(word);
        } else {
            unlockedWords[index].tried++;
            setUnlockedWords(unlockedWords);
        }
    }

    const saveUnlockedWords = () => {
        localStorage.setItem("unlockedWords", JSON.stringify(unlockedWords));
    }

    const saveMoney = () => {
        localStorage.setItem("money", JSON.stringify(money));
    }

    const openWordModal = (word) => {
        setModalList(modalList => [...modalList, {type:"word", word:word}])
        console.log(modalList)
    }

    useEffect(saveUnlockedWords, [unlockedWords]);
    useEffect(saveMoney, [money]);

    const toggleUI = () => {
        setUIDisabled(showShop || modalList.length!==0)
    }

    useEffect(toggleUI, [showShop, modalList])

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

    if (!initialized) {
        return <Loading />;
    }

    return (
        <div className="Game h-screen w-screen flex">
            <div className="w-9/12 h-full" style={{pointerEvents:UIDisabled?"none":"auto"}}>
                <WhiteBoard kanjiOnBoard={kanjiOnBoard} onMerge={OnMerge} onAdd={(v) => { setKanjiOnBoard([...kanjiOnBoard, v]) }} onDelete={(v) => { setKanjiOnBoard(kanjiOnBoard.filter(t => t !== v)); }} />
            </div>
            <div className="w-3/12 h-full" style={{pointerEvents:UIDisabled?"none":"auto"}}>
                <SidePanel kanjiList={kanjiList} onNewKanjiOnWhiteBoard={OnCreateNewKanjiOnBoard} />
            </div>
            <div className="ui absolute top-2 left-2 text-2xl" id="money" style={{pointerEvents:UIDisabled?"none":"auto"}}>${money}</div>
            <div className="ui absolute ui bottom-4 left-2 text-5xl gray" style={{pointerEvents:UIDisabled?"none":"auto"}}>
                <button onClick={() => setShowShop(!showShop)}>&#127978;</button>
                <button onClick={() => setKanjiOnBoard([])}>&#129529;</button>
                <button>&#127384;</button>
                <button>&#128202;</button>
            </div>
            <ShopModal showShop={showShop} setShowShop={setShowShop} kanjiListShop={kanjiListShop} unlockKanjis={unlockKanji} canBuy={canBuy} money={money} setMoney={setMoney}/>
            {getModal()}
        </div>
    );
}

export default Game;