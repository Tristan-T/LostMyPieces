import React, {useEffect, useRef} from 'react';

const WhiteBoard = ({kanjiOnBoard}) => {
    const canvasRef = useRef(null);
    let dragging = false;

    const drawCanvas = (canvas) => {
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        /**
         * @type {CanvasRenderingContext2D}
         */
        const context = canvas.getContext('2d');

        kanjiOnBoard.forEach(v => {
            const {x, y} = v.position;

            const bounds = {
                minX : x - 0.05,
                minY : y - 0.05,
                maxX : x + 0.05,
                maxY : y + 0.05,
            };

            context.strokeStyle = v.hover ? "#FF0000" : "#00FF00";
            context.strokeRect(bounds.minX * canvas.width, bounds.minY * canvas.height, 0.1 * canvas.width, 0.1 * canvas.height);

            context.font = '3em serif';
            context.textBaseline = 'middle';
            context.textAlign = "center";
            context.fillText(v.kanji, x * canvas.width, y * canvas.height);
        })
    };

    const CanvasRendering = () => {
        /**
         * @type {HTMLCanvasElement}
         */
        const canvas = canvasRef.current;
        drawCanvas(canvas);

        window.addEventListener('resize', () => drawCanvas(canvas));
    };

    /**
     * 
     * @param {MouseEvent} event 
     */
    const OnMouseDown = (event) => {
        const [relativeX, relativeY] = [ event.pageX / event.target.width, event.pageY / event.target.height ];

        kanjiOnBoard.forEach(v => {
            const bounds = {
                minX : v.position.x - 0.05,
                minY : v.position.y - 0.05,
                maxX : v.position.x + 0.05,
                maxY : v.position.y + 0.05,
            };

            // out of bound
            if (relativeX < bounds.minX || relativeY < bounds.minY || relativeX > bounds.maxX || relativeY > bounds.maxY)
                return;

            console.log("Clicked !");
            v.clicked = true;
            dragging = true;
        });
    };

    const OnMouseMove = (event) => {
        const [relativeX, relativeY] = [ event.pageX / event.target.width, event.pageY / event.target.height ];

        if (!dragging) {
            console.log("Mouse move");
            kanjiOnBoard.forEach(v => {
                const bounds = {
                    minX : v.position.x - 0.05,
                    minY : v.position.y - 0.05,
                    maxX : v.position.x + 0.05,
                    maxY : v.position.y + 0.05,
                };

                // out of bound
                if (relativeX < bounds.minX || relativeY < bounds.minY || relativeX > bounds.maxX || relativeY > bounds.maxY) {
                    v.hover = false;
                    return;
                }

                console.log("Over kanji");
                v.hover = true;

            });
            
            drawCanvas(event.target);
            return;
        }

        kanjiOnBoard.forEach(v => {
            if (v.clicked) {
                v.position.x = relativeX;
                v.position.y = relativeY;

                drawCanvas(event.target);
            }
        });
    };

    /**
     * Reset all dragging information (global and for each kanji for more safety)
     * @param {MouseEvent} event 
     */
    const OnMouseUp = (event) => {
        dragging = false;

        kanjiOnBoard.forEach(v => {
            v.clicked = false;
        });
    }

    useEffect(() => CanvasRendering(canvasRef, kanjiOnBoard));

    return (<div className = 'WhiteBoard h-full w-full bg-gray-200'>
            <canvas ref = {canvasRef} className = 'h-full w-full' onMouseDown = {OnMouseDown} onMouseMove = {OnMouseMove} onMouseUp = {OnMouseUp}>

            </canvas>
    </div>);
}

export default WhiteBoard;