import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { GameState } from '../GameState';

interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
    requestPermission?: () => Promise<'granted' | 'denied'>;
}

const requestOrientationPermission = (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS).requestPermission;
const iOS = typeof requestOrientationPermission === 'function';


export function useOrientation(state: GameState, onThreshold: (previous: number, difference: number, debugData: string) => void) {
    const [orientation, setOrientation] = useState({
        alpha: 0,
        beta: 0,
        gamma: 0,
    });

    const callback = useRef(onThreshold);
    useEffect(() => {
        callback.current = onThreshold;
    });


    useEffect(() => {

        const handleOrientation = (event: DeviceOrientationEvent) => {
            const { alpha, beta, gamma } = event!;
            if (alpha === null || beta === null || gamma === null) {
                return;
            }
            if (alpha === 0 && beta === 0 && gamma === 0) {
                return;
            }

            if (state === GameState.countdown || state === GameState.idle || state === GameState.greenLight) {
                setOrientation({ alpha, beta, gamma });
                return;
            }

            const previousOrientation = orientation;
            const threshold = 5;

            let previousNumbers = [
                previousOrientation.alpha,
                previousOrientation.beta,
                previousOrientation.gamma
            ];
            let currentNumbers = [
                alpha,
                beta,
                gamma
            ];

            for (let i = 0; i < 3; i++) {
                let difference = currentNumbers[i] - previousNumbers[i];
                const debugData = `Previous: ${previousNumbers[i]}, Current: ${currentNumbers[i]}, Difference: ${difference}`;
                if (difference > threshold) {
                    callback?.current(previousNumbers[i], difference, debugData);
                }
            }
        };

        if (iOS) {
            requestOrientationPermission!().then((response) => {
                if (response === 'granted') {
                    window.addEventListener("deviceorientation", handleOrientation);
                }
            });
        } else {
            window.addEventListener("deviceorientation", handleOrientation);
        }

        return () => {
            window.removeEventListener("deviceorientation", handleOrientation);
        };
    }, [state, orientation]);

    return orientation;
}

export function requestOrientationPermissioniOS() {
    return requestOrientationPermission!();
}

export function orientationPermissionsRequired() {
    return iOS;
}