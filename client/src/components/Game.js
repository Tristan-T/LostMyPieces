import React, { useState, useEffect } from 'react';
import OutsideClickHandler from "react-outside-click-handler";

import SidePanel from "./Game/SidePanel";
import WhiteBoard from "./Game/WhiteBoard";
import Loading from "./Loading";
import ModalManager from "./Modal/ModalManager";
import ShopModal from "./Shop/ShopModal";
import Tutorial from "./Tutorial";

import { getKanjisUnlocked, getMerge } from "../services/api";

import configData from "../listKanjis.json"

import {toast, ToastContainer} from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';

import {ReactComponent as StatsLogo} from '../svg/menu/stats.svg';
import {ReactComponent as ShopLogo} from '../svg/menu/shop.svg';
import {ReactComponent as HelpLogo} from '../svg/menu/help.svg';
import {ReactComponent as EraseLogo} from '../svg/menu/erase.svg';


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
    const [showTutorial, setShowTutorial] = useState(localStorage.getItem("tutorial")?JSON.parse(localStorage.getItem("tutorial")):true);
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


    /**
     * Save in LocalStorage the tutorial state
     */
    const saveTutorial = () => {
        localStorage.setItem("tutorial", JSON.stringify(showTutorial));
    }

    useEffect(saveKanjiOnBoard, [kanjiOnBoard]);
    useEffect(saveUnlockedWords, [unlockedWords]);
    useEffect(saveMoney, [money]);
    useEffect(saveTutorial, [showTutorial]);

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

    console.log(setKanjiList);
    return (
        <div className={`Game h-screen w-screen flex ${globalDragContent ? "cursor-grabbing" : ""}`} onMouseMove={UpdateKanjiDrag} onMouseUp={EndKanjiDrag}>
            <Tutorial setShowTutorial={setShowTutorial} showTutorial={showTutorial} />
            <div className="relative w-9/12 h-full" style={{pointerEvents:UIDisabled?"none":"auto"}}>
                <WhiteBoard globalDragContent={globalDragContent} setGlobalDragContent={setGlobalDragContent} kanjiOnBoard={kanjiOnBoard} onMerge={OnMerge} onAdd={(v) => { setKanjiOnBoard([...kanjiOnBoard, v]) }} onDelete={(v) => { setKanjiOnBoard(kanjiOnBoard.filter(t => t !== v)); }} />
                <div className="ui absolute top-2 right-2 text-2xl dark:text-gray-300" id="money" style={{pointerEvents:UIDisabled?"none":"auto"}}>${money}</div>
            </div>
            <div className="w-3/12 h-full" style={{pointerEvents:UIDisabled?"none":"auto"}}>
                <SidePanel kanjiList={kanjiList} setKanjiList={setKanjiList} openKanjiModal={openKanjiModal} onMouseDown={InitKanjiDrag} />
            </div>
            <div className="ui absolute ui top-4 left-2 text-5xl gray flex flex-row dark:text-gray-300 space-x-2" style={{pointerEvents:UIDisabled?"none":"auto"}}>
                <div className='rounded-full bg-pannel-dark dark:bg-pannel-dark-dark p-2'>
                    <ShopLogo onClick={() => setShowShop(!showShop)} className="h-8 w-8 transition ease-in-out hover:scale-110 dark:hover:text-gray-50 hover:text-gray-800" />
                </div>

                <div className='rounded-full bg-pannel-dark dark:bg-pannel-dark-dark p-2'>
                    <EraseLogo onClick={() => setKanjiOnBoard([])} className="h-8 w-8 transition ease-in-out hover:scale-110 dark:hover:text-gray-50 hover:text-gray-800" />
                </div>

                <div onClick={() => toast.error("Not implemented")} className='rounded-full bg-pannel-dark dark:bg-pannel-dark-dark p-2'>
                    <HelpLogo className="h-8 w-8 transition ease-in-out hover:scale-110 dark:hover:text-gray-50 hover:text-gray-800" />
                </div>

                <div onClick={() => toast.error("Not implemented")} className='rounded-full bg-pannel-dark dark:bg-pannel-dark-dark p-2'>
                    <StatsLogo className="h-8 w-8 transition ease-in-out hover:scale-110 fill-blue" />
                </div>
                <div onClick={() => setShowTutorial(true)} className='rounded-full bg-pannel-dark dark:bg-pannel-dark-dark p-2'>
                    <HelpLogo className="h-8 w-8 transition ease-in-out hover:scale-110 fill-blue" />
                </div>
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