import React from "react";

const ShopTile = ({kanji, unlockKanjis}) => {
    return (
        <div
            className="border-black border-thin cursor-pointer select-none hover:bg-gray-200 duration-150 w-5/6"
            onClick={(event) => {
                //(document.getElementById("shop-modal")).style.pointerEvents = "none";
                unlockKanjis(kanji.kanji);

        }}>
            <div className="font-bold text-4xl">{kanji.kanji}</div>
            <div className="italic text-gray-400">{kanji.uses} uses</div>
            <div className="font-semibold text-yellow-400">50</div>
            <div className="font-mono text-orange-600 font-semibold">Buy</div>
        </div>
    )
};

export default ShopTile;