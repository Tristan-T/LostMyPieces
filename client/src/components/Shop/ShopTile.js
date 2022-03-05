import React from "react";

const ShopTile = ({kanji, unlockKanjis}) => {
    return (
        <div
            className="rounded-md cursor-pointer select-none bg-gray-100 w-5/6"
            onClick={(event) => {
                unlockKanjis(kanji.kanji);

        }}>
            <div className="font-bold text-4xl">{kanji.kanji}</div>
            <div className="text-xl">{kanji.english.charAt(0).toUpperCase() + kanji.english.slice(1)}</div>
            <div className="italic text-gray-400">{kanji.uses} uses</div>
            <div className="font-semibold text-xl text-yellow-400">50</div>
        </div>
    )
};

export default ShopTile;