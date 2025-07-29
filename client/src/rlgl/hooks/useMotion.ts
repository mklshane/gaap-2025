import { useEffect, useRef, useState } from "react";
import { GameState } from '../GameState';

interface DeviceMotionEventiOS extends DeviceMotionEvent {
    requestPermission?: () => Promise<'granted' | 'denied'>;
}

const requestMotionPermission = (DeviceMotionEvent as unknown as DeviceMotionEventiOS).requestPermission;
const iOSMotion = typeof requestMotionPermission === 'function';


export function useMotion(state: GameState, onThreshold: (difference: number) => void) {
    const [motion, setMotion] = useState({
        x: 0,
        y: 0,
        z: 0,
    });

    let callback = useRef(onThreshold);

    useEffect(() => {
        callback.current = onThreshold;
    });

    useEffect(() => {
        const handleMotion = (event: DeviceMotionEvent) => {
            const { x, y, z } = (event as DeviceMotionEvent).acceleration!;
            if (x === null || y === null || z === null) {
                return;
            }

            if (state === GameState.countdown || state === GameState.idle || state === GameState.greenLight) {
                setMotion({ x, y, z });
                return;
            }
            const threshold = 3;

            const toCheck = [
                Math.abs(x),
                Math.abs(y),
                Math.abs(z),
            ];

            const difference = Math.max(...toCheck);
            if (difference > threshold) {
                callback.current(difference);
            }
        }

        if (iOSMotion) {
            requestMotionPermission!().then((response) => {
                if (response === 'granted') {
                    window.addEventListener("devicemotion", handleMotion);
                }
            });
        } else {
            window.addEventListener("devicemotion", handleMotion);
        }

        return () => {
            window.removeEventListener("devicemotion", handleMotion);
        };
    }, [motion, state]);
}