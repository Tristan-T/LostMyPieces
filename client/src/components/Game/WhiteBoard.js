import React, {useEffect, useRef} from 'react';

const WhiteBoard = ({kanjiOnBoard, onMerge, onAdd, onDelete}) => {
    const canvasRef = useRef(null);
    let dragging = false;

    let tempProp;

    const processOverlap = (canvas, origin) => {
        const testOverlap = (b1, b2) => {
            if (b1.minX === b1.maxX || b1.minY === b1.maxY || b2.minX === b2.maxX || b2.minY === b2.maxY)
                return false;

            if (b1.minX >= b2.maxX || b2.minX >= b1.maxX)
                return false;
            if (b1.minY >= b2.maxY || b2.minY >= b1.maxY)
                return false;

            return true;
        }

        for (let i = 0; i < kanjiOnBoard.length; i++) {
            const target = kanjiOnBoard[i];

            if (target === origin)
                continue;

            const originBounds = getTextBound(canvas, origin);
            const targetBounds = getTextBound(canvas, target);

            if (testOverlap(originBounds, targetBounds)) {
                console.log("Overlap !", origin.kanji, target.kanji);
                onMerge(origin, target);
            }
        }
    }

    /**
     * 
     * @param {MouseEvent} event 
     * @returns boolean that state if a change has been made
     */
    const hoverTest = (event) => {
        let changed = false;

        kanjiOnBoard.slice().reverse().every(v => {
            const bounds = getTextBound(event.target, v);

            // out of bound
            if (event.pageX < bounds.minX || event.pageY < bounds.minY || event.pageX > bounds.maxX || event.pageY > bounds.maxY) {
                if (v.hover)
                    changed = true;

                v.hover = false;
                return true;
            }

            if (!v.hover)
                changed = true;

            v.hover = true;
            return false;
        });

        return changed;
    }

    /**
     * 
     * @param {HTMLCanvasElement} canvas 
     * @param {*} prop 
     * @returns 
     */
    const getTextBound = (canvas, prop) => {
        const {x, y} = prop.position;

        const context = canvas.getContext('2d');

        const text = prop.kanji.replace(/./, "人");

        const textSize = context.measureText(text);
        const height = textSize.actualBoundingBoxAscent + textSize.actualBoundingBoxDescent;

        const bounds = {
            minX : x * canvas.width - textSize.width / 2,
            minY : y * canvas.height - height / 2,
            maxX : x * canvas.width + textSize.width / 2,
            maxY : y * canvas.height + height / 2,
        };

        return bounds;
    }

    /**
     * 
     * @param {HTMLCanvasElement} canvas 
     */
    const drawCanvas = (canvas) => {
        const _drawProp = (prop) => {
            const {x, y} = prop.position;

            context.strokeStyle = prop.hover ? "#FF0000" : "#00FF00";
            context.font = '3em serif';
            context.textBaseline = 'middle';
            context.textAlign = "center";

            const bounds = getTextBound(canvas, prop);

            context.strokeRect(
                bounds.minX,
                bounds.minY,
                bounds.maxX - bounds.minX,
                bounds.maxY - bounds.minY);
            context.fillText(prop.kanji, x * canvas.width, y * canvas.height);
        }
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const context = canvas.getContext('2d');

        kanjiOnBoard.forEach(_drawProp);
        if (tempProp) _drawProp(tempProp);
    };

    const CanvasInit = () => {
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
    const OnDoubleClick = (event) => {
        kanjiOnBoard.slice().reverse().every(v => {
            const bounds = getTextBound(event.target, v);

            // out of bound
            if (event.pageX < bounds.minX || event.pageY < bounds.minY || event.pageX > bounds.maxX || event.pageY > bounds.maxY)
                return true;

            onAdd({...v, position : {x : v.position.x + 0.005, y: v.position.y + 0.005}});

            hoverTest(event);

            drawCanvas(event.target);

            return false;
        });
    }

    /**
     * 
     * @param {MouseEvent} event 
     */
    const OnMouseDown = (event) => {
        event.preventDefault();

        kanjiOnBoard.slice().reverse().every(v => {
            const bounds = getTextBound(event.target, v);

            // out of bound
            if (event.pageX < bounds.minX || event.pageY < bounds.minY || event.pageX > bounds.maxX || event.pageY > bounds.maxY)
                return true;

            
            
            if (event.button === 2) { // right click
                onDelete(v);
            } else if (event.button === 0) { // left click
                v.clicked = true;
                dragging = true; 
            }

            return false;
        });

        drawCanvas(event.target);
    };

    /**
     * 
     * @param {MouseEvent} event 
     */
    const OnMouseMove = (event) => {
        let changed = false;

        if (!dragging) {
            // cause too many draw calls
            // kanjiOnBoard.forEach(v => { if (v.hover) changed = true; v.hover = false });

            if (hoverTest(event)) {
                changed = true;
            }
        }

        kanjiOnBoard.forEach(v => {
            if (v.clicked) {
                v.position.x = event.pageX / event.target.width;
                v.position.y = event.pageY / event.target.height;

                changed = true;
            }
        });

        if (changed)
            drawCanvas(event.target);
    };

    /**
     * Reset all dragging information (global and for each kanji for more safety)
     * @param {MouseEvent} event 
     */
    const OnMouseUp = (event) => {
        if (dragging) {
            dragging = false;

            kanjiOnBoard.forEach(v => {
                if (v.clicked) {
                    processOverlap(event.target, v);
                }

                v.clicked = false;
            });

            hoverTest(event);

            drawCanvas(event.target);
        }
    }

    /**
     * 
     * @param {DragEvent} event 
     */
    const OnDragOver = (event) => {
        event.preventDefault();
        const kanji = JSON.parse(event.dataTransfer.getData("application/lost-my-pieces"));

        const [canvasX, canvasY] = [event.pageX / event.target.width, event.pageY / event.target.height];

        tempProp = {...kanji, position: {x: canvasX, y: canvasY}};

        drawCanvas(event.target);
    };

    /**
     * 
     * @param {DragEvent} event 
     */
    const OnDragExit = (event) => { tempProp = undefined; drawCanvas(event.target); }

    /**
     * 
     * @param {DragEvent} event 
     */
    const OnDrop = (event) => {
        event.preventDefault();
        const kanji = JSON.parse(event.dataTransfer.getData("application/lost-my-pieces"));
        const [canvasX, canvasY] = [event.pageX / event.target.width, event.pageY / event.target.height];

        const newProp = {...kanji, position: {x: canvasX, y: canvasY}};
        onAdd(newProp);

        processOverlap(event.target, newProp);
    };

    useEffect(CanvasInit);

    return (<div className = 'WhiteBoard h-full w-full bg-gray-200'>
            <canvas 
                ref = {canvasRef} 
                className = 'h-full w-full' 
                onContextMenu={(e) => e.preventDefault()}
                onDoubleClick = {OnDoubleClick}
                onMouseDown = {OnMouseDown} 
                onMouseMove = {OnMouseMove} 
                onMouseUp = {OnMouseUp} 
                onMouseLeave = {OnMouseUp}
                onDragOver = {OnDragOver}
                onDragExit = {OnDragExit}
                onDrop = {OnDrop}
            >

            </canvas>
    </div>);
}

export default WhiteBoard;