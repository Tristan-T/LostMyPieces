import React, { useState, useEffect } from 'react';
import SidePanel from "./Game/SidePanel";
import WhiteBoard from "./Game/WhiteBoard";
import {getKanjisUnlocked} from "../services/api";
import Loading from "./Loading";

const Game = () => {
    const [initialized, setInitialized] = useState(false);

    const [kanjiList, setKanjiList] = useState({})

    useEffect(() => {
        getKanjisUnlocked(["一", "人", "日"])
            .then(response => response.json())
            .then(data => {
                setKanjiList(data);
                setInitialized(true);
            })
    }, []);

    const [kanjiOnBoard, setKanjiOnBoard] = useState([
        {kanji: "人", kun: "ひと", on: "ジン", english: "person", position: {x: 0.5, y: 0.5}}
    ]);

    /**
     * 
     * @param {{kanji: string, kun: string, on: string, english: string}} kanji 
     */
    const OnCreateNewKanjiOnBoard = (kanji) => {
        setKanjiOnBoard([...kanjiOnBoard, {...kanji, position: {x: 0.5, y: 0.5}}]);
    }

    const OnMerge = (first, second) => {
        const newKanjiOnBoard = kanjiOnBoard.filter(v => v !== first && v !== second);

        newKanjiOnBoard.push({kanji: first.kanji + second.kanji, position: first.position});

        setKanjiOnBoard(newKanjiOnBoard);
    }

    if (!initialized) {
        return <Loading />;
    }

    return (
        <div className="Game h-screen w-screen flex">
            <div className="w-9/12 h-full">
                <WhiteBoard kanjiOnBoard={kanjiOnBoard} onMerge={ OnMerge } onAdd={ (v) => {setKanjiOnBoard([...kanjiOnBoard, v])}} onDelete={(v) => {setKanjiOnBoard(kanjiOnBoard.filter(t => t !== v));}}/>
            </div>
            <div className="w-3/12 h-full">
                <SidePanel kanjiList={kanjiList} onNewKanjiOnWhiteBoard={OnCreateNewKanjiOnBoard}/>
            </div>
        </div>
    );
}

export default Game;