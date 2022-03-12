import React, {useEffect, useState} from "react";
import {getWord} from "../../services/api";
import Loading from "../Loading";

const Word = ({word}) => {
    const [wordFull, setWord] = useState(word);
    const [wordLoaded, setWordLoaded] = useState(false);

    const getFullWord = () => {
        word["definitions"] = [];
        getWord(word.word)
            .then(response => response.json())
            .then(data => {
                console.log(data)
                setWord({...word, ...data});
                setWordLoaded(true);
            });
    }

    useEffect(getFullWord, []);

    if(!wordLoaded) {
        return null;
    }

    return (
    <div className="pb-5 pr-5 pl-5 divide-y-2 divide-blue-100">
        <div className="mb-7">
            {/*<div className="text-3xl font-semibold animate-pulse text-blue-400 mb-3"> New word unlocked !</div>*/}
            <div className="mt-3 text-2xl text-gray-300">{wordFull.trueReading}</div>
            <div className="text-6xl">{wordFull.actualWord}</div>
        </div>
        <div className="py-3 text-left">
            <div className="text-lg text-left font-semibold text-gray-500">Definitions : </div>
            <ol className="pl-4 list-decimal list-outside">
                {wordFull.definitions.map(d => (
                    <li key={d.join('')} className="">
                        {d.join(", ").charAt(0).toUpperCase() + d.join(", ").slice(1)}
                    </li>
                ))}
            </ol>
        </div>
        <div className="pt-3">
            <div className="text-lg text-left font-semibold text-gray-500">Other forms : </div>
            <ul className="list-disc list-inside">
                {wordFull.variants.map(v => (
                    <li className="text-left" key={v}>{v.variant + " 【" + v.pronounced + "】"}</li>
                ))}
            </ul>
            <div className="mt-3">See on <a className="text-sky-400 after:content-['_↗']" href={"https://jisho.org/word/" + wordFull.actualWord} target="_blank">Jisho</a></div>
        </div>
    </div>)
}

export default Word;