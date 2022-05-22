import "react-responsive-carousel/lib/styles/carousel.min.css"; // requires a loader
import { Carousel } from 'react-responsive-carousel';
import combineGif from "../images/combine.gif";
import deleteGif from "../images/delete.gif";
import shopGif from "../images/shop.gif";
import screenPng from "../images/screen.png";

const Tutorial = ({showTutorial, setShowTutorial}) => {
    if(!showTutorial) return null;
    return (
    <div className="darken-screen rounded-lg absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-black dark:text-white bg-pannel-back dark:bg-pannel-back-dark z-50">
        <div className="w-full">
            <Carousel showThumbs={false}>
                <div>
                    <h1 className="text-3xl py-2"> Discover new words!</h1>
                    <img src={combineGif} alt=""/>
                    <p className="pt-6 pb-12 text-xl px-2"> Drag kanjis from the list on the whiteboard and merge them together to create new words!</p>
                </div>
                <div>
                    <h1 className="text-3xl py-2"> Make some space! </h1>
                    <img src={deleteGif} alt=""/>
                    <p className="pt-6 pb-12 text-xl px-2"> Delete words and kanjis by dragging them on the recycle bin.</p>
                </div>
                <div>
                    <h1 className="text-3xl py-2"> Explore new kanjis! </h1>
                    <img src={shopGif} alt=""/>
                    <p className="pt-6 pb-12 text-xl px-2"> Open the shop and find new kanjis to play with!</p>
                </div>
                <div>
                    <h1 className="text-3xl py-2"> Start playing now! </h1>
                    <img src={screenPng} alt=""/>
                    <p className="pt-6 pb-12 text-xl px-2"> What are you waiting for? A whole world of japanese is waiting for you. 頑張れ！</p>
                </div>
            </Carousel>
            <button className="rounded-b-lg w-full pb-1 pt-1
                        duration-500
                        bg-pannel-blue dark:bg-pannel-blue-dark
                        text-white hover:text-pannel-blue hover:dark:text-pannel-blue-dark hover:bg-white text-center" onClick={ () => setShowTutorial(false) }>Start playing
            </button>
        </div>
    </div>
    )
}

export default Tutorial;