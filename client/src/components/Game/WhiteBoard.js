import React, { useState, useEffect, useRef } from 'react';
import bgPath from "../../images/shiba-inu.png";
import bgPathDark from "../../images/shiba-inu-dark.png";
import trashPath from "../../svg/trash.svg";
import trashPathHover from "../../svg/trash_hover.svg";
// import { canUseDom } from 'react-toastify/dist/utils';

const easeOutElastic = (x) => {
    const c4 = (2 * Math.PI) / 3;

    return x === 0
        ? 0
        : x === 1
        ? 1
        : Math.pow(2, -10 * x) * Math.sin((x * 10 - 0.75) * c4) + 1;
}

const easeOutBounce = (x) => {
    const n1 = 7.5625;
    const d1 = 2.75;
    
    if (x < 1 / d1) {
        return n1 * x * x;
    } else if (x < 2 / d1) {
        return n1 * (x -= 1.5 / d1) * x + 0.75;
    } else if (x < 2.5 / d1) {
        return n1 * (x -= 2.25 / d1) * x + 0.9375;
    } else {
        return n1 * (x -= 2.625 / d1) * x + 0.984375;
    }  
}

const easeInOutQuint = (x) => {
    const c1 = 1.70158;
    const c3 = c1 + 1;

    return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
}

const bgImage = new Image();
bgImage.src = bgPath;

const bgImageDark = new Image();
bgImageDark.src = bgPathDark;

const trashImage = new Image();
trashImage.src = trashPath;

const trashImageHover = new Image();
trashImageHover.src = trashPathHover;

const WhiteBoard = ({ kanjiOnBoard, globalDragContent, setGlobalDragContent, onMerge, onAdd, onDelete }) => {
    const DEBUG = false;

    const canvasRef = useRef(null);

    const offsetRef = useRef({x: 0, y: 0});
    const lastMousePosRef = useRef({x:-1, y:-1});
    const draggingRef = useRef(false);
    const animationRef = useRef(null);
    const lastTimeRef = useRef(null);

    const deleteZoneAnimation = useRef({progress: 0, value: 0});

    const deleteZoneOffset = useRef(0.1);

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
        x = (x + offsetRef.current.x);
        y = (y + offsetRef.current.y);

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
    const Update = () => {
        const nightMode = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        const _drawProp = (prop) => {
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
            context.fillText(prop.kanji, (x + offsetRef.current.x) * canvas.width, (y + offsetRef.current.y) * canvas.height);
        }

        const now = new Date();
        const deltaTime = now - lastTimeRef.current;
        lastTimeRef.current = now;

        const canvas = canvasRef.current;

        canvas.width = canvas.offsetWidth;
        canvas.height = canvas.offsetHeight;
  
        /**
         * @type {CanvasRenderingContext2D}
         */
         const context = canvas.getContext('2d');
        
        context.beginPath();
        const step = 100;
        const left = -Math.ceil(canvas.width / step) * step * 100 + offsetRef.current.x * canvas.width;
        const top =  -Math.ceil(canvas.height / step) * step * 100 + offsetRef.current.y * canvas.height;
        const right = 2 * canvas.width;
        const bottom = 2 * canvas.height;
        context.beginPath();
        for (let x = left; x < right; x += step) {
            context.moveTo(x, top);
            context.lineTo(x, bottom);
        }
        for (let y = top; y < bottom; y += step) {
            context.moveTo(left, y);
            context.lineTo(right, y);
        }
        context.strokeStyle = nightMode ? "#1C1C20" : "#F8F8FE";
        context.lineWidth = 2;
        context.stroke();

        context.drawImage(nightMode ? bgImageDark : bgImage, (0.5 + offsetRef.current.x) * canvas.width - bgImage.width / 2.0, (0.5 + offsetRef.current.y) * canvas.height - bgImage.height / 2.0);

        // delete zone
        if (draggingRef.current && !(kanjiOnBoard.every(v => !v.clicked))) {
            if (deleteZoneAnimation.current.progress < 1) {
                deleteZoneAnimation.current.progress += deltaTime * 0.001;
                deleteZoneAnimation.current.value = deleteZoneAnimation.current.progress * 0.6;

                const x = easeInOutQuint(deleteZoneAnimation.current.value);
                deleteZoneOffset.current = 0.07 + (x) * 0.03;
                // console.log("update", deltaTime, deleteZoneAnimation.current.progress, deleteZoneAnimation.current.value);
            }

            const x = easeInOutQuint(deleteZoneAnimation.current.value);
            const redValue = Math.min(Math.max(20, Math.floor(x * 255)), 255).toString(16);
            const greenValue = Math.min(Math.max(20, Math.floor(x * 60)), 60).toString(16);
            const blueValue = Math.min(Math.max(20, Math.floor(x * 90)), 90).toString(16);
            const alphaValue = Math.min(Math.max(20, Math.floor(x * 140)), 140).toString(16);
            context.fillStyle = "#" + redValue + greenValue + blueValue + alphaValue;
            context.fillRect(0, (1 - deleteZoneOffset.current) * canvas.height, canvas.width, deleteZoneOffset.current * canvas.height);

            context.drawImage(trashImageHover, 
                (0.5) * canvas.width - trashImageHover.width / 2,
                (1 - deleteZoneOffset.current * 0.5) * canvas.height - trashImageHover.height / 2,
            );
        } else {
            deleteZoneOffset.current = 0.07;
            context.fillStyle = "#00000050";
            context.fillRect(0, (1 - deleteZoneOffset.current) * canvas.height, canvas.width, deleteZoneOffset.current * canvas.height);

            context.drawImage(trashImage, 
                (0.5) * canvas.width - trashImage.width / 2,
                (1 - deleteZoneOffset.current * 0.5) * canvas.height - trashImage.height / 2,
            );
        }
        
        kanjiOnBoard.forEach(_drawProp);

        if (globalDragContent?.prop.position) {
            _drawProp(globalDragContent.prop);
        }

        animationRef.current = requestAnimationFrame(Update);
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
            draggingRef.current = true;
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
    };

    /**
     * 
     * @param {MouseEvent} event 
     */
    const OnMouseMove = (event) => {
        let changed = false;

        if (lastMousePosRef.current.x === -1 || lastMousePosRef.current.y === -1) 
            lastMousePosRef.current = {x: event.pageX, y: event.pageY}; 

        if (!draggingRef.current) {
            if (hoverTest(event)) {
                changed = true;
            }
        }

        // move dragging object
        kanjiOnBoard.forEach(v => {
            if (v.clicked) {
                v.position.x = event.pageX / event.target.width - offsetRef.current.x;
                v.position.y = event.pageY / event.target.height - offsetRef.current.y;

                changed = true;
            }
        });

        if (globalDragContent) {
            globalDragContent.prop.position = {
                x: event.pageX / event.target.width - offsetRef.current.x,
                y: event.pageY / event.target.height - offsetRef.current.y
            };

            changed = true;
        }

        if (draggingRef.current && !changed) {
            console.log("dragging");
            offsetRef.current.x += (event.pageX - lastMousePosRef.current.x) / event.target.width;
            offsetRef.current.y += (event.pageY - lastMousePosRef.current.y) / event.target.height;
            changed = true;
        }

        lastMousePosRef.current = {x: event.pageX, y: event.pageY}; 
    };

    /**
     * Reset all dragging information (global and for each kanji for more safety)
     * @param {MouseEvent} event 
     */
    const OnMouseUp = (event) => {
        if (draggingRef.current && event.button === 0) {
            draggingRef.current = false;
            lastMousePosRef.current = {x: -1, y: -1}; 

            deleteZoneAnimation.current = {progress: 0, value: 0};

            kanjiOnBoard.forEach(v => {
                if (v.clicked) {
                    if (v.position.y + offsetRef.current.y > 1 - deleteZoneOffset.current) {
                        onDelete(v);
                    }

                    processOverlap(event.target, v);
                }

                v.clicked = false;
            });

            hoverTest(event);
        }

        
        // DROP EXTERN DRAG CONTENT
        if (globalDragContent) {
            setGlobalDragContent(undefined);
            onAdd(globalDragContent.prop);

            processOverlap(event.target, globalDragContent.prop);
        }
    }

    useEffect(() => {
        lastTimeRef.current = new Date();
        animationRef.current = requestAnimationFrame(Update);

        return () => {
            cancelAnimationFrame(animationRef.current);
            animationRef.current = null;
        }
    });

    return (<div className={`WhiteBoard h-full w-full bg-pannel-dark dark:bg-pannel-light-dark`}>
        <canvas
            ref={canvasRef}
            className={`h-full w-full`}
            onContextMenu={(e) => e.preventDefault()}
            onDoubleClick={OnDoubleClick}
            onMouseDown={OnMouseDown}
            onMouseMove={OnMouseMove}
            onMouseUp={OnMouseUp}
            onMouseLeave={(event) => {
                if (draggingRef.current) {
                    OnMouseUp(event);
                }

                if (globalDragContent) {
                    globalDragContent.prop.position = undefined;
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