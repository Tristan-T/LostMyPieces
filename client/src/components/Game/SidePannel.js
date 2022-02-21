const SidePannel = ({kanjiList}) => {
    return (
        <div className="SidePannel bg-gray-300 h-full w-full border-l-gray-500 border-l-thin">
            <div className="SidePannelMenu border-b-thin border-b-gray-500 flex flex-row justify-between text-center py-1">
                <div className="mx-auto">Sort by :</div>
                <div className="mx-auto">Total use</div>
                <div className="mx-auto">Use left</div>
                <div className="mx-auto">Unlocked</div>
            </div>
            {
                kanjiList.map((v) => {
                    return (
                        <div key={v.kanji} className="py-5 px-2 border-b-thin border-b-gray-500 flex items-center">
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