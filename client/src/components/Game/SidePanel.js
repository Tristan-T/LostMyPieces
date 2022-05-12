const SidePanel = ({ kanjiList, openKanjiModal }) => {
    return (
        <div className="SidePanel scroll-smooth snap-y bg-gray-300 h-full w-full border-l-gray-500 dark:border-l-gray-800 border-l-2 dark:bg-zinc-900 dark:text-gray-300">
            <div className="snap-start SidePanelMenu border-b-thin border-b-gray-500 dark:border-b-gray-800 flex flex-row justify-between text-center chi">
                <div className="w-full py-1 font-semibold">Sort by :</div>
                <div className="cursor-pointer select-none w-full py-1 border-l-gray-500 dark:border-l-gray-800 border-l-thin hover:bg-gray-200 duration-150 dark:hover:bg-gray-800">Total use</div>
                <div className="cursor-pointer select-none w-full py-1 border-l-gray-500 dark:border-l-gray-800 border-l-thin hover:bg-gray-200 duration-150 dark:hover:bg-gray-800">Use left</div>
                <div className="cursor-pointer select-none w-full py-1 border-l-gray-500 dark:border-l-gray-800 border-l-thin hover:bg-gray-200 duration-150 dark:hover:bg-gray-800">Unlocked</div>
            </div>
            {
                kanjiList.map((v) => {
                    return (
                        <div
                            key={v.kanji}
                            className="snap-start cursor-pointer py-1 px-2 border-b-thin border-b-gray-500  dark:border-b-gray-800 flex items-center select-none hover:bg-gray-200 duration-150 dark:hover:bg-gray-800"
                            draggable="true"
                            onClick={() => {openKanjiModal(v)}}
                            onDragStart={(event) => {
                                const image = new Image();
                                event.dataTransfer.setData("application/lost-my-pieces", JSON.stringify(v || {}));
                                event.dataTransfer.setDragImage(image, 10, 10);
                            }}
                        >
                            <div className="flex flex-col">
                                <div className="text-xs text-gray-700 dark:text-gray-500">{v.kun_readings[0]}</div>
                                <div className="text-5xl text-black my-2 dark:text-gray-300">{v.kanji}</div>
                                <div className="text-xs text-gray-600 dark:text-gray-500">{v.foundCombinations}/{v.nbCombinations}</div>
                            </div>

                            <div className="mx-auto capitalize text-2xl">
                                {v.meaning}
                            </div>
                        </div>
                    )
                })
            }
        </div>
    );
}

export default SidePanel;