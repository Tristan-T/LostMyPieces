import React, {useEffect, useState} from "react";
import { CSSTransition, TransitionGroup } from "react-transition-group"
import ShopTile from "./ShopTile";
import "./shopStyle.css"
import {getShopCombination} from "../../services/api";

const ShopModal = ({showShop, money, setMoney, updateSidePanel, kanjiList}) => {
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

    return <>{showShop ? (
        <TransitionGroup
            component="div"
            id="shop-modal"
            className="rounded-md overflow-y-scroll absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 border-gray-400 border-thin p-2 bg-gray-200 grid grid-cols-5 auto-rows-min gap-2 place-items-center w-4/5 h-3/4"
            style={{pointerEvents: canBuy ? 'auto' : 'none'}}
            >{kanjiListShop.map((v) => v.uses!==0?(
                    <CSSTransition key={v.kanji} timeout={200} classNames="item">
                        <ShopTile kanji={v} unlockKanji={unlockKanji} money={money} setMoney={setMoney}/>
                    </CSSTransition>
                ):null)}
        </TransitionGroup>
    ) : null}</>
};

export default ShopModal;