import {ReactComponent as LoadingLogo} from '../svg/loading.svg';

const Loading = () => {
    return <div className="Loading h-screen w-screen flex items-center bg-orange-200">
        <div className="w-full">
            <div className="flex flex-col">
                <LoadingLogo className="animate-spin h-10 w-10 mr-auto ml-auto text-white stroke-white fill-white" />
                <h1 className="mr-auto ml-auto text-white">Loading</h1>
            </div>
        </div>
    </div>
}

export default Loading;