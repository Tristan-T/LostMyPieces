import React, { useState } from 'react';
import SidePannel from "./Game/SidePannel";
import WhiteBoard from "./Game/WhiteBoard";

const Game = () => {
    const [kanjiList] = useState([
        {kanji: "人", kun: "ひと", on: "ジン", english: "person"},
        {kanji: "一", kun: "ひと-", on: "イチ", english: "one"},
        {kanji: "日", kun: "ひ", on: "ニチ", english: "day"}
    ]);

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

    return (
        <div className="Game h-screen w-screen flex">
            <div className="w-9/12 h-full">
                <WhiteBoard kanjiOnBoard={kanjiOnBoard} onMerge={ OnMerge } onAdd={ (v) => {setKanjiOnBoard([...kanjiOnBoard, v])}} onDelete={(v) => {setKanjiOnBoard(kanjiOnBoard.filter(t => t !== v));}}/>
            </div>
            <div className="w-3/12 h-full">
                <SidePannel kanjiList={kanjiList} onNewKanjiOnWhiteBoard={OnCreateNewKanjiOnBoard}/>
            </div>
        </div>
    );
}

export default Game;