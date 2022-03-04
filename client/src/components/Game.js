import React, { useState, useEffect } from 'react';
import SidePanel from "./Game/SidePanel";
import WhiteBoard from "./Game/WhiteBoard";
import { getKanjisUnlocked, getShopCombination } from "../services/api";
import Loading from "./Loading";
import ShopModal from "./Shop/ShopModal";
import configData from "../listKanjis.json"

const Game = () => {
    const [initialized, setInitialized] = useState(false);
    const [kanjiList, setKanjiList] = useState([])
    const [kanjiListShop, setKanjiListShop] = useState([]);
    const [showShop, setShowShop] = useState(false);
    const [money, setMoney] = useState(0);

    const loadShop = () => {
        if (kanjiList.length !== 0) {
            let kanjisUnlocked = kanjiList.map(k => k.kanji);
            getShopCombination(kanjisUnlocked)
                .then(response => response.json())
                .then(data => {
                    setKanjiListShop(data);
                });
        }
    }

    const updateShop = (kanjis) => {
        getShopCombination(kanjis)
            .then(response => response.json())
            .then(data => {
                setKanjiListShop(data);
            });
    }

    const loadSidePanel = () => {
        let kanjisUnlocked = localStorage.getItem("kanjisUnlocked");
        if (kanjisUnlocked) {
            console.log("Loading from localStorage")
            setKanjiList(JSON.parse(kanjisUnlocked));
            setInitialized(true);
        } else {
            getKanjisUnlocked(configData.defaultKanjis)
                .then(response => response.json())
                .then(data => {
                    console.log("Loading from API")
                    localStorage.setItem("kanjisUnlocked", JSON.stringify(data))
                    setKanjiList(data);
                    setInitialized(true);
                });
        }
    }

    useEffect(loadSidePanel, [])
    useEffect(loadShop, [])

    const unlockKanji = (kanji) => {
        //TODO : Prevent data loss from clicking on another button before setKanjiList is called
        let newKanjiList = kanjiList.map(kanji => kanji.kanji);
        newKanjiList.push(kanji);
        kanjiList.push({ kanji: kanji })
        //Triggering the kanjiListShop update
        updateShop(newKanjiList)
        getKanjisUnlocked(newKanjiList)
            .then(response => response.json())
            .then(data => {
                localStorage.setItem("kanjisUnlocked", JSON.stringify(data))
                setKanjiList(data);
            });
    }


    const [kanjiOnBoard, setKanjiOnBoard] = useState([
        { kanji: "人", kun: "ひと", on: "ジン", english: "person", position: { x: 0.5, y: 0.5 } }
    ]);

    /**
     * 
     * @param {{kanji: string, kun: string, on: string, english: string}} kanji 
     */
    const OnCreateNewKanjiOnBoard = (kanji) => {
        setKanjiOnBoard([...kanjiOnBoard, { ...kanji, position: { x: 0.5, y: 0.5 } }]);
    }

    const OnMerge = (first, second) => {
        const newKanjiOnBoard = kanjiOnBoard.filter(v => v !== first && v !== second);

        newKanjiOnBoard.push({ kanji: first.kanji + second.kanji, position: first.position });

        setKanjiOnBoard(newKanjiOnBoard);
    }

    if (!initialized) {
        return <Loading />;
    }

    return (
        <div className="Game h-screen w-screen flex">
            <div className="w-9/12 h-full">
                <WhiteBoard kanjiOnBoard={kanjiOnBoard} onMerge={OnMerge} onAdd={(v) => { setKanjiOnBoard([...kanjiOnBoard, v]) }} onDelete={(v) => { setKanjiOnBoard(kanjiOnBoard.filter(t => t !== v)); }} />
            </div>
            <div className="w-3/12 h-full">
                <SidePanel kanjiList={kanjiList} onNewKanjiOnWhiteBoard={OnCreateNewKanjiOnBoard} />
            </div>
            <div className="ui absolute top-2 left-2 text-2xl" id="money">${money}</div>
            <div className="ui absolute ui bottom-4 left-2 text-5xl gray">
                <button onClick={() => setShowShop(!showShop)}>&#127978;</button>
                <button onClick={() => setKanjiOnBoard([])}>&#129529;</button>
                <button>&#127384;</button>
                <button>&#128202;</button>
            </div>
            <ShopModal showShop={showShop} setShowShop={setShowShop} kanjiListShop={kanjiListShop} unlockKanjis={unlockKanji} />
        </div>
    );
}

export default Game;