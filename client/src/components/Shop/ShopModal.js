import React, {useEffect, useState} from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group"
import ShopTile from "./ShopTile";
import "./shopStyle.css"
import {getShopCombination} from "../../services/api";
import Scrollbars from "react-custom-scrollbars-2";

const ShopModal = ({showShop, setShowShop, money, setMoney, updateSidePanel, kanjiList}) => {
    const [kanjiListShop, setKanjiListShop] = useState([]);
    const [canBuy, setCanBuy] = useState(true);

    const updateShop = () => {
        setCanBuy(false);
        getShopCombination(kanjiList.map(k => k.kanji))
            .then(response => response.json())
            .then(data => {
                setKanjiListShop(data);
                setCanBuy(true);
            });
    }

    const unlockKanji = (kanji) => {
        let newKanjiList = kanjiList.map(kanji => kanji.kanji);
        newKanjiList.push(kanji);
        updateSidePanel(newKanjiList)
    }

    useEffect(updateShop, [kanjiList])

    return (
        <CSSTransition
            mountOnEnter={true}
            unmountOnExit={true}
            in={showShop}
            classNames="shop"
            style={{overflowY:"hidden"}}
            timeout={1000}
            component="div"
            className="p-2 m-0 rounded-r-md overflow-y-scroll absolute left-0 top-0 bg-pannel-back w-full sm:w-3/5 h-full dark:bg-pannel-back-dark"
        >
            <div>
                <button
                    onClick={() => setShowShop(false)}
                    type="button"
                    className="absolute left-4 top-4 z-50  rounded-md p-2 inline-flex items-center justify-center 
                        text-white hover:text-gray-500 dark:hover:bg-pannel-light-dark hover:bg-pannel-light 
                        bg-pannel-blue dark:bg-pannel-blue-dark dark:hover:text-gray-200 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-indigo-500">
                    <span className="sr-only">Close menu</span>
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </button>
                <Scrollbars autoHide>
                    <div className="text-5xl h-16 text-gray-900 dark:text-gray-100">Shop</div>
                    <TransitionGroup
                        component="div"
                        id="shop-modal"
                        style={{pointerEvents: canBuy ? 'auto' : 'none'}}
                        className="grid grid-cols-5 auto-rows-min gap-y-4 place-items-center pb-3"
                        >
                        {kanjiListShop.map((v) => v.uses!==0?(
                                <CSSTransition key={v.kanji} timeout={200}>
                                    <ShopTile kanji={v} unlockKanji={unlockKanji} money={money} setMoney={setMoney}/>
                                </CSSTransition>
                            ):null)}
                    </TransitionGroup>
                </Scrollbars>
            </div>
        </CSSTransition>
    )
};

export default ShopModal;