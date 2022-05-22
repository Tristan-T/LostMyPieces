import React, { useState } from 'react';

import {ReactComponent as ForkLiftSvg} from '../../svg/forklift.svg';

const KanjiList = ({kanjiList, setKanjiList, openKanjiModal, onMouseDown}) => {
    return <div className="flex flex-col overflow-y-auto scroll-smooth ">
        <div 
            className="
                hidden lg:flex flex-col md:flex-row justify-center text-center mx-2 my-2 base-center
                SidePanelMenu snap-start font-semibold"
        >
            <div className="cursor-pointer select-none w-full py-1 mx-2 my-1 md:rounded-lg 
                bg-pannel-light dark:bg-pannel-light-dark hover:text-white hover:bg-pannel-blue hover:dark:bg-pannel-blue-dark duration-150"
                onClick={() => {
                        const sortedKanjiList = [...kanjiList].sort((a, b) => b.foundCombinations - a.foundCombinations);
                        setKanjiList(sortedKanjiList);
                    }}>Total use</div>
            <div className="cursor-pointer select-none w-full py-1  mx-2 my-1 md:rounded-lg 
                bg-pannel-light dark:bg-pannel-light-dark hover:text-white hover:bg-pannel-blue hover:dark:bg-pannel-blue-dark duration-15"
                onClick={() => {
                    const sortedKanjiList = [...kanjiList].sort((a, b) => (b.nbCombinations - b.foundCombinations) - (a.nbCombinations - a.foundCombinations));
                    setKanjiList(sortedKanjiList);
                }}>Use left</div>
            <div className="cursor-not-allowed select-none w-full py-1  mx-2 my-1 md:rounded-lg 
                bg-pannel-dark dark:bg-pannel-dark-dark text-gray-500 duration-15">Unlocked</div>
        </div>
        {
            kanjiList.map((v) => {
                return (
                    <div
                        key={v.kanji}
                        className="
                            bg-pannel-light dark:bg-pannel-light-dark rounded-lg hover:bg-pannel-dark hover:dark:bg-pannel-dark-dark
                            snap-start cursor-pointer mx-4 my-2
                            flex flex-col sm:flex-row items-center select-none duration-150"
                        onMouseDown={(event) => {onMouseDown(event, v)}}
                        onClick={() => openKanjiModal(v)}
                    >
                        <div className="
                            sm:bg-pannel-dark sm:dark:bg-pannel-dark-dark
                            rounded-l-lg
                            flex flex-col lg:py-4
                        ">
                            <div className="text-xs text-gray-700 dark:text-gray-500">{v.kun_readings[0]}</div>
                            <div className="text-4xl text-black sm:my-2 dark:text-gray-300 px-4">{v.kanji}</div>
                            <div className="text-xs mt-auto 
                                hidden sm:block lg:hidden 
                                font-black 
                                rounded-bl-lg
                                text-white
                                bg-pannel-blue dark:bg-pannel-blue-dark
                                "
                            >{v.foundCombinations} / {v.nbCombinations}</div>
                        </div>

                        <div className="mx-auto capitalize text-2xl py-2 sm:p-0">
                            {v.meaning}
                        </div>
                        <div className="
                            text-xs w-full sm:w-auto block sm:hidden lg:block font-black
                            text-white dark:text-white bg-pannel-blue dark:bg-pannel-blue-dark
                            sm:self-start sm:px-4 py-1 rounded-b-lg sm:rounded-none sm:rounded-tr-lg sm:rounded-bl-lg">{v.foundCombinations}/{v.nbCombinations}</div>
                    </div>
                )
            })
        }
    </div>
}

const QuestList = ({}) => {
    return  <div className='h-full w-full flex justify-center content-center font-bold'>
        <div className='m-auto'>
            <ForkLiftSvg className='mx-auto h-20 w-20 stroke-white'/>
            <p>Don't stay here, it is under construction.</p>
        </div>
    </div>;
}

const SidePanel = ({ kanjiList, setKanjiList, openKanjiModal, onMouseDown }) => {
    const TABS = {
        KANJIS: 0,
        QUESTS: 1
    };

    const [currentTab, setCurrentTab] = useState(TABS.KANJIS);

    return (
        <div className="
          bg-pannel-back dark:bg-pannel-back-dark dark:text-gray-300 h-full w-full">
            <div className="h-full flex flex-col">
                {
                    currentTab == TABS.KANJIS ? 
                        <KanjiList kanjiList={kanjiList} setKanjiList={setKanjiList} openKanjiModal={openKanjiModal} onMouseDown={onMouseDown} /> :
                        <QuestList />
                }

                <div className="flex flex-row justify-center mt-auto text-xl font-bold">
                    <div 
                        className={
                            "text-center grow cursor-pointer select-none w-full py-4 duration-150 " + 
                            (currentTab === TABS.KANJIS ? "bg-pannel-blue dark:bg-pannel-blue-dark text-pannel-dark dark:text-pannel-dark-dark" : "bg-pannel-dark dark:bg-pannel-dark-dark hover:text-pannel-blue hover:dark:text-pannel-blue-dark")
                        }
                        onClick={ () => setCurrentTab(TABS.KANJIS) }
                    >Kanjis</div>
                    <div 
                        className={
                            "text-center grow cursor-pointer select-none w-full py-4 duration-150 " + 
                            (currentTab === TABS.QUESTS ? "bg-pannel-blue text-pannel-dark dark:text-pannel-dark-dark" : "bg-pannel-dark dark:bg-pannel-dark-dark hover:text-pannel-blue ")
                        }
                        onClick={() => setCurrentTab(TABS.QUESTS)}
                    >Quests</div>
                </div>
            </div>

        </div>
    );
}

export default SidePanel;