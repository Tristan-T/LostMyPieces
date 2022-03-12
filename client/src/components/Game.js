import React, { useState, useEffect } from 'react';
import OutsideClickHandler from "react-outside-click-handler";

import SidePanel from "./Game/SidePanel";
import WhiteBoard from "./Game/WhiteBoard";
import Loading from "./Loading";
import ModalManager from "./Modal/ModalManager";
import ShopModal from "./Shop/ShopModal";

import { getKanjisUnlocked, getMerge } from "../services/api";

import configData from "../listKanjis.json"

const Game = () => {
    const [initialized, setInitialized] = useState(false);
    const [kanjiList, setKanjiList] = useState([]);
    const [kanjiOnBoard, setKanjiOnBoard] = useState(localStorage.getItem("kanjiOnBoard")?JSON.parse(localStorage.getItem("kanjiOnBoard")):[]);
    const [money, setMoney] = useState(localStorage.getItem("money")?JSON.parse(localStorage.getItem("money")):0);
    const [UIDisabled, setUIDisabled] = useState(false);
    const [showShop, setShowShop] = useState(false);
    const [unlockedWords, setUnlockedWords] = useState(localStorage.getItem("unlockedWords")?JSON.parse(localStorage.getItem("unlockedWords")):[])
    const [modalList, setModalList] = useState([])

    /**
     * A kanji (one single japanese ideogram)
     * @typedef Kanji
     * @property {string} kanji - the kanji represented, length 1.
     * @property {string} meaning - The most common english meaning of the kanji.
     * @property {string[]} on_readings - An array of the on readings of the kanji.
     * @property {string[]} romaji_on - The latin version of the on_readings.
     * @property {string[]} kun_readings - An array of the kun readings of the kanji.
     * @property {string[]} romaji_kun - The latin version of kun_readings.
     * @property {number} strokeCount - Number of stroke to write the kanji.
     * @property {number} nbCombinations - Total number of words the kanji is used in relative to the other unlocked kanjis.
     * @property {number} foundCombinations - Uses found currently by the player.
     * @property {link} strokeGif - The link to a gif of how to wrote the kanji.
     * @property {position} [position] - The x and y position of the kanji on board.
     */

    /**
     * Variant for a word
     * @typedef Variant
     * @property {string} variant - The common kanji writing of the variant
     * @property {string} pronounced - The kana writing of the variant
     */

    /**
     * A word made up of kanjis
     * @typedef Word
     * @property {string} word - The kana less version of the word, for easy merging.
     * @property {string} actualWord - The real way of writing the word, for display.
     * @property {string} trueReading - The word written in kanas for pronunciation.
     * @property {string[]} priorities - The lists in which the word appears often (potentially empty)
     * @property {string[][]} [definitions] - The different definitions for the word
     * @property {Variant[]} [variants] - The different ways to write the word
     */

    /**
     * Initialize the loading of the UI by either fetching data from the database or the localStorage
     */
    const initUI = () => {
        let kanjisUnlocked = localStorage.getItem("kanjisUnlocked");
        if (kanjisUnlocked) {
            console.log("Loading from localStorage")
            setKanjiList(JSON.parse(kanjisUnlocked));
            setInitialized(true);
        } else {
            console.log("Loading from API")
            getKanjisUnlocked(configData.defaultKanjis)
                .then(response => response.json())
                .then(data => {
                    const tempList = data.map(k => ({...k, foundCombinations:0}))
                    localStorage.setItem("kanjisUnlocked", JSON.stringify(tempList))
                    setKanjiList(tempList);
                    setInitialized(true);
                });
        }
    }

    useEffect(initUI, [])

    /**
     * Update the side panel when a new kanji is bought
     * @param {Kanji[]} kanjis - an array of the unlocked kanji as a character
     */
    const updateSidePanel = (kanjis) => {
        getKanjisUnlocked(kanjis)
            .then(response => response.json())
            .then(data => {
                //TODO : Pas opti, double recherche dans une liste
                data = data.map(kanji => ({...kanji, foundCombinations:kanjiList.findIndex(k => k.kanji===kanji.kanji)===-1?0:kanjiList.find(k => k.kanji===kanji.kanji).foundCombinations}))
                localStorage.setItem("kanjisUnlocked", JSON.stringify(data))
                setKanjiList(data);
            });
    }

    /**
     * Check if two kanjis are mergeable and add them on the board
     * @param first - represent the Word or Kanji to be merged
     * @param second - represent the Word or Kanji to be merged
     */
    const OnMerge = (first, second) => {
        const newKanjiOnBoard = kanjiOnBoard.filter(v => v !== first && v !== second);
        getMerge([first.kanji, second.kanji])
            .then(response => response.json())
            .then(data => {
                if(data.length===0) {
                    //TODO : Visual indication for unmergeable
                    console.log("No merge candidates");
                } else {
                    //TODO : Using actualWord instead of word
					let i = 0;
                    data.forEach(w => {
                        //TODO : Can land out of bounds
                        newKanjiOnBoard.push({kanji : w.word, position:{x:first.position.x+i, y:first.position.y+i}});
                        registerWord(w);
						i+=0.05;
                    })
                    setKanjiOnBoard(newKanjiOnBoard);
                    localStorage.setItem("kanjisUnlocked", JSON.stringify(kanjiList))
                }
            })
    }

    /**
     * Check if a word is new and accordingly adjust money, as well as updating the unlockedWords array
     * @param word - the word to be tested
     */
    const registerWord = (word) => {
        let index = unlockedWords.findIndex(w => w.word===word.word);
        if(index===-1) {
            setUnlockedWords([...unlockedWords, {...word, tried:1}]);
            const arrKanji = [...new Set(word.word.split(''))];
            arrKanji.forEach(k => {
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

    /*
    * handling modals
     */

    /**
     * Open a word modal
     * @param word
     */
    const openWordModal = (word) => {
        setModalList(modalList => [...modalList, {type:"word", word:word}])
    }

    /**
     * Open a kanji modal
     * @param kanji
     */
    const openKanjiModal = (kanji) => {
        console.log(kanji)
        setModalList(modalList => [...modalList, {type:"kanji", kanji:kanji}])
    }

    /*
    * auto-save features
     */

    /**
     * Save in LocalStorage the kanjis appearing on the board
     */
    const saveKanjiOnBoard = () => {
        localStorage.setItem("kanjiOnBoard", JSON.stringify(kanjiOnBoard));
    }

    /**
     * Save in LocalStorage the word that the user has unlocked
     */
    const saveUnlockedWords = () => {
        localStorage.setItem("unlockedWords", JSON.stringify(unlockedWords));
    }

    /**
     * Save in LocalStorage the money the player has
     */
    const saveMoney = () => {
        localStorage.setItem("money", JSON.stringify(money));
    }

    useEffect(saveKanjiOnBoard, [kanjiOnBoard])
    useEffect(saveUnlockedWords, [unlockedWords]);
    useEffect(saveMoney, [money]);

    /*
    * UI manipulation
     */

    /**
     * Disable clicking on any of the element of the main UI, for when a modal is opened for example
     */
    const toggleUI = () => {
        setUIDisabled(showShop || modalList.length!==0)
    }

    useEffect(toggleUI, [showShop, modalList])

    /*
    * Waiting when loading from database
     */

    if (!initialized) {
        return <Loading />;
    }

    return (
        <div className="Game h-screen w-screen flex">
            <div className="w-9/12 h-full" style={{pointerEvents:UIDisabled?"none":"auto"}}>
                <WhiteBoard kanjiOnBoard={kanjiOnBoard} onMerge={OnMerge} onAdd={(v) => { setKanjiOnBoard([...kanjiOnBoard, v]) }} onDelete={(v) => { setKanjiOnBoard(kanjiOnBoard.filter(t => t !== v)); }} />
            </div>
            <div className="w-3/12 h-full" style={{pointerEvents:UIDisabled?"none":"auto"}}>
                <SidePanel kanjiList={kanjiList} openKanjiModal={openKanjiModal} />
            </div>
            <div className="ui absolute top-2 left-2 text-2xl" id="money" style={{pointerEvents:UIDisabled?"none":"auto"}}>${money}</div>
            <div className="ui absolute ui bottom-4 left-2 text-5xl gray" style={{pointerEvents:UIDisabled?"none":"auto"}}>
                <button onClick={() => setShowShop(!showShop)}>&#127978;</button>
                <button onClick={() => setKanjiOnBoard([])}>&#129529;</button>
                <button>&#127384;</button>
                <button>&#128202;</button>
            </div>
            <OutsideClickHandler onOutsideClick={() => setShowShop(false)}>
                <ShopModal showShop={showShop} money={money} setMoney={setMoney} updateSidePanel={updateSidePanel} kanjiList={kanjiList}/>
            </OutsideClickHandler>
            <ModalManager modalList={modalList} setModalList={setModalList}/>
        </div>
    );
}

export default Game;