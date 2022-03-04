import React from "react";

const ShopModal = ({showShop, kanjiListShop, unlockKanjis}) => {
    let result = [];
    for(const k in kanjiListShop) result.push({kanji: k, uses:kanjiListShop[k]})
    console.log(result)
    return <>{showShop ? (
        <div
            id="shop-modal" className="overflow-y-scroll absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-black border-thin rounded p-2 bg-gray-200 grid grid-cols-5 gap-3 place-items-center w-4/5 h-3/4">
            {
                result.map((v) => {
                    return (
                        <div
                            key={v.kanji}
                            className="border-black border-thin cursor-pointer select-none hover:bg-gray-200 duration-150 w-5/6"
                            onClick={(event) => {
                                (document.getElementById("shop-modal")).style.pointerEvents = "none";
                                unlockKanjis(v.kanji);
                            }
                        }>
                            <div className="font-bold text-4xl">{v.kanji}</div>
                            <div className="font-mono text-2xl">{v.english}</div>
                            <div className="italic text-gray-400">{v.uses} uses</div>
                            <div className="font-semibold text-yellow-400">50</div>
                            <div className="font-mono text-orange-600 font-semibold">Buy</div>
                        </div>
                    )
                })
            }
        </div>

    ) : null}</>
};

export default ShopModal;