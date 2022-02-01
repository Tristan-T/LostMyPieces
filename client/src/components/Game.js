import React, { useState } from 'react';
import SidePannel from "./Game/SidePannel";
import WhiteBoard from "./Game/WhiteBoard";

function Game() {
    const [kanjiList, setKanjiList] = useState([
        {kanji: "人", kun: "ひと", on: "ジン", english: "person"},
        {kanji: "一", kun: "ひと-", on: "イチ", english: "one"},
        {kanji: "日", kun: "ひ", on: "ニチ", english: "day"}
    ]);

    return (
        <div className="Game h-screen w-screen flex">
            <div className="w-9/12 h-full">
                <WhiteBoard />
            </div>
            <div className="w-3/12 h-full">
                <SidePannel kanjiList={kanjiList} />
            </div>
        </div>
    );
}

export default Game;