import React from "react";
import {useState} from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group"
import ShopTile from "./ShopTile";
import "./shopStyle.css"
import OutsideClickHandler from "react-outside-click-handler";

const ShopModal = ({showShop, setShowShop, kanjiListShop, unlockKanjis, canBuy, money, setMoney}) => {
    return <>{showShop ? (
        <OutsideClickHandler onOutsideClick={() => {
                setShowShop(false);
            }
        }>
            <TransitionGroup
                component="div"
                id="shop-modal"
                className="drop-shadow-2xl rounded-md overflow-y-scroll absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-gray-400 border-thin p-2 bg-gray-200 grid grid-cols-5 auto-rows-min gap-2 place-items-center w-4/5 h-3/4"
                style={{pointerEvents: canBuy ? 'auto' : 'none'}}
                >{kanjiListShop.map((v) => v.uses!==0?(
                        <CSSTransition key={v.kanji} timeout={200} classNames="item">
                            <ShopTile kanji={v} unlockKanjis={unlockKanjis} money={money} setMoney={setMoney}/>
                        </CSSTransition>
                    ):null)}
            </TransitionGroup>
        </OutsideClickHandler>

    ) : null}</>
};

export default ShopModal;