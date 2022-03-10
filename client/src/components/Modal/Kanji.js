import React from "react";

const Kanji = ({kanji}) => {
    return (
        <div>
            <h1 className="text-5xl">{kanji.kanji}</h1>
            <h1 className="text-3xl">{kanji.meaning}</h1>
            <h2 className="text-xl">Kun-readings : {kanji.kun_readings + "(" + kanji.romaji_kun + ")"}</h2>
            <h2 className="text-xl">On-readings : {kanji.on_readings + "(" + kanji.romaji_on + ")"}</h2>
            <h2 className="text-xl">How to write : </h2>
            <img className="m-auto" src={kanji.strokeGif}/>
            <h3 className="text-xl">Stroke count : {kanji.strokeCount}</h3>
        </div>)
}

export default Kanji;