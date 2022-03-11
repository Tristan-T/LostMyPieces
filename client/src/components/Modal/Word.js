import React, {useEffect} from "react";
import {getWord} from "../../services/api";

const Word = ({word}) => {
    const getFullWord = () => {
        getWord(word.word)
            .then(response => response.json())
            .then(data => {
                console.log(data)
               word = {...word, ...data}
            });
    }

    useEffect(getFullWord, []);

    return (
    <div className="pb-5 pr-5 pl-5">
        <div className="text-3xl font-semibold hover:animate-spin animate-bounce text-red-400"> New word unlocked !</div>
        {word.word}
    </div>)
}

export default Word;