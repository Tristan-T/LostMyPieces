import { useState } from "react";
import {Link} from "react-router-dom";
import Loading from "./Loading";

const MainMenu = () => {
    const [initialized, setInitialized] = useState(false);

    // simulate loading
    setTimeout(() => setInitialized(true), 1000);

    if (!initialized) {
        return <Loading />;
    }

    const path = [
        {name: "Mode normal", path: "/game", active: true},
        {name: "Mode rush", path: "/", active: false},
        {name: "Paramètres", path: "/", active: false},
        {name: "Crédits", path: "/", active: false}
    ]

    return (
        <div className="MainMenu flex h-screen w-screen items-center">
            <div className="ButtonHolder justify-center flex flex-col mr-auto ml-auto space-y-2">
                {
                    path.map((v) => {
                        if (v.active)
                            return (<Link 
                                to={v.path} 
                                className="rounded-md bg-orange-300 hover:bg-orange-400 text-white focus:ring-2 text-neutral-50 p-2"
                            >
                                {v.name}
                            </Link>);

                        return (<Link 
                            to={v.path} 
                            className="rounded-md bg-gray-300 hover:bg-gray-400 text-white focus:ring-2 text-neutral-50 p-2 pointer-events-none"
                        >
                            {v.name}
                        </Link>);
                    })
                }        
            </div>
        </div>
    );
}

export default MainMenu;