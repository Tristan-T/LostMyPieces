import React, { useState, useEffect, useRef } from 'react';
import bgLogo from "../../images/shiba-inu.png";
// import { canUseDom } from 'react-toastify/dist/utils';

const WhiteBoard = ({ kanjiOnBoard, globalDragContent, setGlobalDragContent, onMerge, onAdd, onDelete }) => {
    const DEBUG = false;

    const canvasRef = useRef(null);
    const bgImage = new Image();
    bgImage.src = bgLogo;
    bgImage.onload = (() => drawCanvas(canvasRef.current));

    /* let offset = {x: 0, y: 0};
    let lastMousePos = {x: -1, y: -1}; */

    const [offset, setOffset] = useState({x: 0, y: 0});
    const [lastMousePos, setLastMousePos] = useState({x:-1, y:-1});
    const [dragging, setDragging] = useState(false);

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

        const startTime = new Date();
        for (let i = 0; i < kanjiOnBoard.length; i++) {
            const target = kanjiOnBoard[i];

            if (target === origin)
                continue;

            const originBounds = getTextBound(canvas, origin);
            const targetBounds = getTextBound(canvas, target);

            if (testOverlap(originBounds, targetBounds)) {
                // console.log("Overlap !", origin.kanji, target.kanji);
                onMerge(origin, target);
            }
        }
        console.log(`Processed overlap in : ${(new Date() - startTime) / 1000}`);
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
        let { x, y } = prop.position;
        x = (x + offset.x);
        y = (y + offset.y);

        const context = canvas.getContext('2d');

        const text = prop.kanji.replace(/./, "国");

        const textSize = context.measureText(text);
        const height = textSize.actualBoundingBoxAscent + textSize.actualBoundingBoxDescent;

        const bounds = {
            minX: x * canvas.width - textSize.width / 2,
            minY: y * canvas.height - height / 2,
            maxX: x * canvas.width + textSize.width / 2,
            maxY: y * canvas.height + height / 2,
        };

        return bounds;
    }

    /**
     * 
     * @param {HTMLCanvasElement} canvas 
     */
    const drawCanvas = (canvas) => {
        const _drawProp = (prop) => {
            const nightMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
            const { x, y } = prop.position;

            context.strokeStyle = prop.hover ? "#FF0000" : "#00FF00";
            context.font = prop.clicked ? `${3.7}em serif` : `${3}em serif`;

            context.textBaseline = 'middle';
            context.textAlign = "center";

            const bounds = getTextBound(canvas, prop);

            if (DEBUG) {
                context.strokeRect(
                    bounds.minX,
                    bounds.minY,
                    bounds.maxX - bounds.minX,
                    bounds.maxY - bounds.minY);
            }

            context.fillStyle = nightMode ? 
                (prop.hover || prop.clicked ? "#fafcff" : "#b5b5b5") :
                (prop.hover || prop.clicked ? "#1a1a1a" : "#000000");
            context.fillText(prop.kanji, (x + offset.x) * canvas.width, (y + offset.y) * canvas.height);
        }
        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;

        const context = canvas.getContext('2d');

        context.drawImage(bgImage, (0.5 + offset.x) * canvas.width - bgImage.width / 2.0, (0.5 + offset.y) * canvas.height - bgImage.height / 2.0);

        kanjiOnBoard.forEach(_drawProp);

        if (globalDragContent?.prop.position) {
            console.log(globalDragContent);
            _drawProp(globalDragContent.prop);
        }
        // if (tempProp) _drawProp(tempProp);
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

            onAdd({ ...v, position: { x: v.position.x + 0.005, y: v.position.y + 0.005 } });

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

        if (event.button === 0) {
            setDragging(true);
        }

        kanjiOnBoard.slice().reverse().every(v => {
            const bounds = getTextBound(event.target, v);

            // out of bound
            if (event.pageX < bounds.minX || event.pageY < bounds.minY || event.pageX > bounds.maxX || event.pageY > bounds.maxY)
                return true;

            if (event.button === 2) { // right click
                onDelete(v);
            } else if (event.button === 0) { // left click
                v.clicked = true;
                v.hover = false;
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

        if (lastMousePos.x === -1 || lastMousePos.y === -1) setLastMousePos({x: event.pageX, y: event.pageY}); 

        if (!dragging) {
            if (hoverTest(event)) {
                changed = true;
            }
        }

        // move dragging object
        kanjiOnBoard.forEach(v => {
            if (v.clicked) {
                v.position.x = event.pageX / event.target.width - offset.x;
                v.position.y = event.pageY / event.target.height - offset.y;

                changed = true;
            }
        });

        if (globalDragContent) {
            globalDragContent.prop.position = {
                x: event.pageX / event.target.width - offset.x,
                y: event.pageY / event.target.height - offset.y
            };

            changed = true;
        }

        if (dragging && !changed) {
            console.log("dragging");
            const newOffset = {
                x: offset.x + (event.pageX - lastMousePos.x) / event.target.width,
                y: offset.y + (event.pageY - lastMousePos.y) / event.target.height
            };
            setOffset(newOffset);
            changed = true;
        }

        setLastMousePos({x: event.pageX, y: event.pageY});

        if (changed)
            drawCanvas(event.target);
    };

    /**
     * Reset all dragging information (global and for each kanji for more safety)
     * @param {MouseEvent} event 
     */
    const OnMouseUp = (event) => {
        if (dragging && event.button === 0) {
            setDragging(false);
            setLastMousePos({x:-1,y:-1});

            kanjiOnBoard.forEach(v => {
                if (v.clicked) {
                    processOverlap(event.target, v);
                }

                v.clicked = false;
            });

            hoverTest(event);

            drawCanvas(event.target);
        }

        
        // DROP EXTERN DRAG CONTENT
        if (globalDragContent) {
            setGlobalDragContent(undefined);
            onAdd(globalDragContent.prop);

            processOverlap(event.target, globalDragContent.prop);

            drawCanvas(event.target);
        }
    }

    useEffect(CanvasInit);

    return (<div className={`WhiteBoard h-full w-full bg-gray-200 dark:bg-zinc-800`}>
        <canvas
            ref={canvasRef}
            className={`h-full w-full`}
            onContextMenu={(e) => e.preventDefault()}
            onDoubleClick={OnDoubleClick}
            onMouseDown={OnMouseDown}
            onMouseMove={OnMouseMove}
            onMouseUp={OnMouseUp}
            onMouseLeave={(event) => {
                if (dragging) {
                    OnMouseUp(event);
                }

                if (globalDragContent) {
                    globalDragContent.prop.position = undefined;
                    drawCanvas(event.target);
                }
            }}
            onWheel={(event) => {
                event.preventDefault();
            }}
        >

        </canvas>
    </div>);
}

export default WhiteBoard;