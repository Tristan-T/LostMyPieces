import React from "react";

const Kanji = ({kanji}) => {
    return (
        <div className="pb-5 pt-3 pr-5 pl-5">
            <div className="mb-3 flex">
                <p className="ml-5 mr-2 text-6xl">{kanji.kanji}</p>
                <div>
                    <p className="text-4xl mr-5 ml-5 mt-2 flex-1 capitalize">{kanji.meaning}</p>
                    <p className="text-sm text-gray-800">Strokes : {kanji.strokeCount}</p>
                </div>
            </div>
            <hr/>
            <div className="flex flex-row text-l text-left ml-3 mr-3 mt-3">
                <span className="font-medium mr-3 mt-4"> Kun : </span>
                <span className="flex flex-row">
                {kanji.kun_readings.map((r, i) =>
                    <div className="mr-3">
                        <p className="text-xs text-gray-400 text-center">{kanji.romaji_kun[i]}</p>
                        <p>{r + (i!==kanji.kun_readings.length-1?",":"")}</p>
                    </div>
                )}
                </span>
            </div>
            <div className="flex flex-row text-l text-left ml-3 mr-3">
                <span className="font-medium mr-5 mt-4"> On : </span>
                <span className="flex flex-row">
                {kanji.on_readings.map((r, i) =>
                    <div className="mr-3">
                        <p className="text-xs text-gray-400 text-center">{kanji.romaji_on[i]}</p>
                        <p>{r + (i!==kanji.on_readings.length-1?",":"")}</p>
                    </div>
                )}
                </span>
            </div>
            <img className="m-auto contrast-200 mt-3" src={kanji.strokeGif}/>
            <div>See on <a className="text-sky-400 after:content-['_↗']" href={"https://jisho.org/search/" + kanji.kanji + "%20%23kanji"} target="_blank">Jisho</a></div>
        </div>)
}

export default Kanji;