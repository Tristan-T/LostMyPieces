import React from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group"
import ShopTile from "./ShopTile";
import "./shopStyle.css"

const ShopModal = ({showShop, kanjiListShop, unlockKanjis}) => {
    return <>{showShop ? (
        <TransitionGroup
            component="div"
            id="shop-modal"
            className="overflow-y-scroll absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-black border-thin rounded p-2 bg-gray-200 grid grid-cols-5 gap-3 place-items-center w-4/5 h-3/4"
            >{kanjiListShop.map((v) => (
                    <CSSTransition key={v.kanji} timeout={200} classNames="item">
                        <ShopTile kanji={v} unlockKanjis={unlockKanjis}/>
                    </CSSTransition>
                ))}
        </TransitionGroup>

    ) : null}</>
};

export default ShopModal;