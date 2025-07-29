import { useState, useEffect, SetStateAction, Dispatch, useRef } from 'react';
import './Game.css';
import { useMotion as useMotionDetector } from './hooks/useMotion';
import { useOrientation as useOrientationDetector } from './hooks/useOrientation';
import { GameState } from './GameState';


function Game(
    props: {
        state: GameState;
        ws: WebSocket
    }
) {
    // used as a debounce to prevent multiple messages from being sent
    const moved = useRef(false);

    useOrientationDetector(props.state, (prev, diff, debugData) => {
        if (moved.current) {
            return;
        }
        moved.current = true;
        props.ws.send(JSON.stringify({
            type: "moved",
            cause: "orientation",
            difference: diff,
            previous: prev,
            debug: debugData
        }));
    });

    useMotionDetector(props.state, (difference) => {
        if (moved.current) {
            return;
        }
        moved.current = true;
        props.ws.send(JSON.stringify({
            type: "moved",
            cause: "motion",
            difference: difference
        }));
    });


    return (
        <>
            {
                props.state === GameState.redLight && (
                    <div className="card">
                        <h1>RED LIGHT</h1>
                    </div>
                )
            }

            {
                props.state === GameState.greenLight && moved && (
                    <div className="card">
                        <h1>GREEN LIGHT</h1>
                    </div>
                )
            }

            {
                props.state === GameState.greenLight && !moved && (
                    <div className="card">
                        <h1>Passed</h1>
                    </div>
                )
            }
        </>
    )
}

export default Game;
