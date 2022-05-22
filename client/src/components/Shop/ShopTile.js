import React from "react";

const ShopTile = ({kanji, unlockKanji, money, setMoney}) => {
    return (
        <div
            className="rounded drop-shadow-md cursor-pointer select-none w-5/6 bg-pannel-dark dark:bg-pannel-dark-dark hover:scale-110 hover:border-gray-600 transition"
            onClick={(event) => {
                event.preventDefault();
                if(money>=50) {
                    unlockKanji(kanji.kanji);
                    setMoney(money-50);
                }
        }}>
            <div className="font-medium text-4xl dark:text-gray-200">{kanji.kanji}</div>
            <div className="text-xl capitalize dark:text-gray-300">{kanji.english}</div>
            <div className="italic text-gray-400">{kanji.uses} uses</div>
            <div className="font-semibold text-white bg-pannel-blue dark:bg-pannel-blue-dark rounded-b">50$</div>
        </div>
    )
};

export default ShopTile;