import React, { useState } from 'react';
import SidePannel from "./Game/SidePannel";
import WhiteBoard from "./Game/WhiteBoard";

/**
 * 
 * @param {{kanji: string, kun: string, on: string, english: string}} kanji 
 */
const OnKanjiClick = (kanji) => {

}

const Game = () => {
    const [kanjiList, _] = useState([
        {kanji: "人", kun: "ひと", on: "ジン", english: "person"},
        {kanji: "一", kun: "ひと-", on: "イチ", english: "one"},
        {kanji: "日", kun: "ひ", on: "ニチ", english: "day"}
    ]);

    const [kanjiOnBoard, setKanjiOnBoard] = useState([
        {kanji: "人", kun: "ひと", on: "ジン", english: "person", position: {x: 0.5, y: 0.5}}
    ]);

    return (
        <div className="Game h-screen w-screen flex">
            <div className="w-9/12 h-full">
                <WhiteBoard kanjiOnBoard={kanjiOnBoard} />
            </div>
            <div className="w-3/12 h-full">
                <SidePannel kanjiList={kanjiList} />
            </div>
        </div>
    );
}

export default Game;