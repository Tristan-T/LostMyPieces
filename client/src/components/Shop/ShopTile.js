import React from "react";

const ShopTile = ({kanji, unlockKanji, money, setMoney}) => {
    return (
        <div
            className="drop-shadow-md cursor-pointer select-none bg-gray-100 w-5/6 dark:bg-zinc-700"
            onClick={(event) => {
                event.preventDefault();
                if(money>=50) {
                    unlockKanji(kanji.kanji);
                    setMoney(money-50);
                }
        }}>
            <div className="font-bold text-4xl dark:text-gray-200">{kanji.kanji}</div>
            <div className="text-xl capitalize dark:text-gray-300">{kanji.english}</div>
            <div className="italic text-gray-400">{kanji.uses} uses</div>
            <div className="font-semibold text-xl text-yellow-400">50</div>
        </div>
    )
};

export default ShopTile;