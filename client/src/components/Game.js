import React, { useState, useEffect } from 'react';
import OutsideClickHandler from "react-outside-click-handler";

import SidePanel from "./Game/SidePanel";
import WhiteBoard from "./Game/WhiteBoard";
import Loading from "./Loading";
import ModalManager from "./Modal/ModalManager";
import ShopModal from "./Shop/ShopModal";

import { getKanjisUnlocked, getMerge } from "../services/api";

import configData from "../listKanjis.json"

import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';


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

const Game = () => {
    const [initialized, setInitialized] = useState(false);
    const [kanjiList, setKanjiList] = useState([]);
    const [kanjiOnBoard, setKanjiOnBoard] = useState(localStorage.getItem("kanjiOnBoard")?JSON.parse(localStorage.getItem("kanjiOnBoard")):[]);
    const [money, setMoney] = useState(localStorage.getItem("money")?JSON.parse(localStorage.getItem("money")):0);
    const [UIDisabled, setUIDisabled] = useState(false);
    const [showShop, setShowShop] = useState(false);
    const [unlockedWords, setUnlockedWords] = useState(localStorage.getItem("unlockedWords")?JSON.parse(localStorage.getItem("unlockedWords")):[]);
    const [modalList, setModalList] = useState([]);
    const [globalDragContent, setGlobalDragContent] = useState(undefined);

    /**
     * Initialize the loading of the UI by either fetching data from the database or the localStorage
     */
    const initUI = () => {
        let kanjisUnlocked = localStorage.getItem("kanjisUnlocked");
        if (kanjisUnlocked) {
            console.log("Loading from localStorage");
            setKanjiList(JSON.parse(kanjisUnlocked));
            setInitialized(true);
        } else {
            console.log("Loading from API");
            getKanjisUnlocked(configData.defaultKanjis)
                .then(response => response.json())
                .then(data => {
                    const tempList = data.map(k => ({...k, foundCombinations:0}));
                    localStorage.setItem("kanjisUnlocked", JSON.stringify(tempList));
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
     * @param {Kanji} first - represent the Word or Kanji to be merged
     * @param {Kanji} second - represent the Word or Kanji to be merged
     */
    const OnMerge = (first, second) => {
        const newKanjiOnBoard = kanjiOnBoard.filter(v => v !== first && v !== second);
        getMerge([first.kanji, second.kanji])
            .then(response => response.json())
            .then(data => {
                if(data.length===0) {
                    //TODO : Visual indication for unmergeable
                    toast("Incorrect combination");
                    console.log("No merge candidates");
                } else {
                    //TODO : Using actualWord instead of word
					let i = 0;
                    data.forEach(w => {
                        //TODO : Can land out of bounds
                        newKanjiOnBoard.push({kanji : w.word, position:{x:first.position.x+i, y:first.position.y+i}});
                        registerWord(w);
						i += 0.05;
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
        if(index === -1) {
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

    useEffect(saveKanjiOnBoard, [kanjiOnBoard]);
    useEffect(saveUnlockedWords, [unlockedWords]);
    useEffect(saveMoney, [money]);

    /*
    * UI manipulation
     */

    /**
     * Disable clicking on any of the element of the main UI, for when a modal is opened for example
     */
    const toggleUI = () => {
        setUIDisabled(showShop || modalList.length!==0);
    }

    useEffect(toggleUI, [showShop, modalList]);

    // KANJI DRAG STUFF

    let dragContent = undefined;

    /**
     * 
     * @param {MouseEvent} event
     * @param {Kanji} kanji
     */
    const InitKanjiDrag = (event, kanji) => {
        const dragContent = {
            prop: {...kanji}
        };
        
        setGlobalDragContent(dragContent);
    };

    const UpdateKanjiDrag = (event, kanji) => {
        /* if (dragContent) {
            dragContent = {
                kanji: kanji,
                pos: {x: event.clientX, y: event.clientY}
            };
    
            console.log(`UPDATE DRAG: ${dragContent.pos.x} ${dragContent.pos.y}`);
        } */
    }

    const EndKanjiDrag = (event) => {
        setGlobalDragContent(undefined);
        console.log("END DRAG");
    }
 
    /*
    * Waiting when loading from database
     */
    if (!initialized) {
        return <Loading />;
    }

    return (
        <div className={`Game h-screen w-screen flex ${globalDragContent ? "cursor-grabbing" : ""}`} onMouseMove={UpdateKanjiDrag} onMouseUp={EndKanjiDrag}>
            <div className="relative w-9/12 h-full" style={{pointerEvents:UIDisabled?"none":"auto"}}>
                <WhiteBoard globalDragContent={globalDragContent} setGlobalDragContent={setGlobalDragContent} kanjiOnBoard={kanjiOnBoard} onMerge={OnMerge} onAdd={(v) => { setKanjiOnBoard([...kanjiOnBoard, v]) }} onDelete={(v) => { setKanjiOnBoard(kanjiOnBoard.filter(t => t !== v)); }} />
                <div className="ui absolute top-2 right-2 text-2xl dark:text-gray-300" id="money" style={{pointerEvents:UIDisabled?"none":"auto"}}>${money}</div>
            </div>
            <div className="w-3/12 h-full" style={{pointerEvents:UIDisabled?"none":"auto"}}>
                <SidePanel kanjiList={kanjiList} openKanjiModal={openKanjiModal} onMouseDown={InitKanjiDrag} />
            </div>
            <div className="ui absolute ui bottom-4 left-2 text-5xl gray flex flex-row dark:text-gray-300 space-x-2" style={{pointerEvents:UIDisabled?"none":"auto"}}>
                <svg onClick={() => setShowShop(!showShop)} xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 transition ease-in-out hover:scale-110 dark:hover:text-gray-50 hover:text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                <svg onClick={() => setKanjiOnBoard([])} xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 transition ease-in-out hover:scale-110 dark:hover:text-gray-50 hover:text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                <svg onClick={() => toast.error("Not implemented")} xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 transition ease-in-out hover:scale-110 dark:hover:text-gray-50 hover:text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M18.364 5.636l-3.536 3.536m0 5.656l3.536 3.536M9.172 9.172L5.636 5.636m3.536 9.192l-3.536 3.536M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-5 0a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
                <svg onClick={() => toast.error("Not implemented")} xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 transition ease-in-out hover:scale-110 dark:hover:text-gray-50 hover:text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            </div>
            <OutsideClickHandler onOutsideClick={() => setShowShop(false)}>
                <ShopModal showShop={showShop} setShowShop={setShowShop} money={money} setMoney={setMoney} updateSidePanel={updateSidePanel} kanjiList={kanjiList}/>
            </OutsideClickHandler>
            <ModalManager modalList={modalList} setModalList={setModalList}/>
            <ToastContainer
                position="bottom-center"
                autoClose={1000}
                hideProgressBar={true}
                newestOnTop={true}
                closeOnClick
                rtl={false}
            />
        </div>
    );
}

export default Game;