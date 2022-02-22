const SidePannel = ({kanjiList, onNewKanjiOnWhiteBoard}) => {
    return (
        <div className="SidePannel bg-gray-300 h-full w-full border-l-gray-500 border-l-thin">
            <div className="SidePannelMenu border-b-thin border-b-gray-500 flex flex-row justify-between text-center chi">
                <div className="w-full py-1 font-semibold">Sort by :</div>
                <div className="cursor-pointer select-none w-full py-1 border-l-gray-500 border-l-thin hover:bg-gray-200 duration-150">Total use</div>
                <div className="cursor-pointer select-none w-full py-1 border-l-gray-500 border-l-thin hover:bg-gray-200 duration-150">Use left</div>
                <div className="cursor-pointer select-none w-full py-1 border-l-gray-500 border-l-thin hover:bg-gray-200 duration-150">Unlocked</div>
            </div>
            {
                kanjiList.map((v) => {
                    return (
                        <div 
                        key={v.kanji} 
                        className="cursor-pointer py-5 px-2 border-b-thin border-b-gray-500 flex items-center select-none hover:bg-gray-200 duration-150"
                        draggable="true"
                        onDragStart={(event) => {
                            console.log(v);
                            const image = new Image();
                            event.dataTransfer.setData("application/lost-my-pieces", JSON.stringify(v));
                            event.dataTransfer.setDragImage(image, 10, 10);
                        }}
                        >
                            <div className="flex flex-col"> 
                                <div className="text-xs text-gray-700">{v.on}</div>
                                <div className="text-5xl text-black">{v.kanji}</div>
                            </div>

                            <div className="mx-auto capitalize text-2xl">
                                {v.english}
                            </div>
                        </div>
                    )
                })
            }
        </div>
    );
}

export default SidePannel;