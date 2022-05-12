import {Link} from "react-router-dom";

const MainMenu = () => {
    const path = [
        {name: "Mode normal", path: "/game", active: true},
        {name: "Mode rush", path: "/", active: false},
        {name: "Paramètres", path: "/", active: false},
        {name: "Crédits", path: "/", active: false}
    ]

    return (
        <div className="MainMenu flex h-screen w-screen items-center dark:bg-zinc-900">
            <div className="ButtonHolder justify-center flex flex-col mr-auto ml-auto space-y-2">
                {
                    path.map((v) => {
                        if (v.active)
                            return (<Link 
                                to={v.path} 
                                className="rounded-md bg-orange-300 hover:bg-orange-400 dark:bg-orange-800 hover:bg-orange-900 text-white focus:ring-2 text-neutral-50 p-2"
                            >
                                {v.name}
                            </Link>);

                        return (<Link 
                            to={v.path} 
                            className="rounded-md bg-gray-300 hover:bg-gray-400 dark:bg-gray-700 dark:text-gray-600 text-white focus:ring-2 text-neutral-50 p-2 pointer-events-none"
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