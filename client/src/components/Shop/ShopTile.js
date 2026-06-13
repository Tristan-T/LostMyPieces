import React from "react";

const ShopTile = ({kanji, unlockKanji, money, setMoney}) => {
    return (
        <div
            className="flex flex-rows rounded drop-shadow-md cursor-pointer w-11/12 mx-4 select-none bg-panel-dark dark:bg-panel-dark-dark hover:scale-110 hover:border-gray-600 transition items-center"
            onClick={(event) => {
                event.preventDefault();
                if(money>=50) {
                    unlockKanji(kanji.kanji);
                    setMoney(money-50);
                }
        }}>
            <div className="bg-white bg-gray-800 p-8 rounded-lg scale-110">
                <div className="font-medium text-6xl dark:text-gray-200">{kanji.kanji}</div>
            </div>
            <div class="ml-4 grow text-left self-baseline">
                <div className="text-2xl capitalize font-semibold dark:text-gray-300">{kanji.english}</div>
                <div className="italic -mt-1 text-gray-400">{kanji.uses} uses</div>
                <div className="italic text-gray-400">PLACEHOLDER DEFINITION</div>
            </div>
            <div className="flex flex-col bg-panel-blue dark:bg-panel-blue-dark rounded w-1/6 h-1/6 text-center align-middle drop-shadow-lg mr-2">
                <div className="font-semibold text-white">🔓 Unlock now</div>
            </div>
        </div>
    )
};

export default ShopTile;