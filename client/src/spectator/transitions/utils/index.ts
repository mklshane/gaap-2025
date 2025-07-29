import { stagger, useAnimate } from "framer-motion";
import { useEffect, useRef } from "react";

export type AnimationEndCallback = (data: { [key: string]: string }) => void;

export type Theme = {
    background: string;
    color: string;
    secondary: string;
    tertiary: string;
}

export const themes: Theme[] = [
    {
        background: "#ff8b20",
        color: "#121212",
        secondary: "#f2ff48",
        tertiary: "#6b00ba"
    },
    {
        background: "#f46ebe",
        color: "#121212",
        secondary: "#12d760",
        tertiary: "#f2ff48",
    },
    {
        background: "#121212",
        color: "#f2ff48",
        secondary: "#12d760",
        tertiary: "#6b00ba",
    }, {
        background: "#6b00ba",
        color: "#f2ff48",
        secondary: "#f2ff48",
        tertiary: "#ff8b20",
    }
]
export const backgrounds = [
    "#12d760",
    "#f2ff48",
    "#ff8b20",
    "#6b00ba",
    "#f46ebe",
    "#121212",
];

export function getRandomTheme() {
    return themes[Math.floor(Math.random() * themes.length)];
}

export function getRandomBackground() {
    return backgrounds[Math.floor(Math.random() * backgrounds.length)];
}

export function getRandomBackgroundExcept(except: string) {
    let background = getRandomBackground();
    while (background === except) {
        background = getRandomBackground();
    }
    return background;
}

export function isColorLight(color: string) {
    const rgb = parseInt(color.replace("#", ""), 16);
    const r = (rgb >> 16) & 0xff;
    const g = (rgb >> 8) & 0xff;
    const b = (rgb >> 0) & 0xff;
    const luma = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    return luma > 128;
}


export function useStaggerAnimation(isOpen: boolean, onComplete: () => void) {
    const [scope, animate] = useAnimate();

    const count = useRef(0);


    useEffect(() => {
        const childrenCount = scope.current?.children.length;
        count.current = 0;

        animate(
            ".height-change",
            {
                y: "-100vh"
            },
            {
                duration: 3,
                ease: "linear"
            }
        )

        animate(
            ".h1parent",

            isOpen
                ? { transform: "translateX(0vw)" }
                : { transform: "translateX(-100vw)" },
            {
                duration: 0.6,
                ease: "easeInOut",
                delay: stagger(0.1, {
                    startDelay: isOpen ? 0 : 1,
                    ease: "easeInOut"
                }),
                onComplete: () => {
                    count.current++;
                    if (count.current === childrenCount) {
                        onComplete();
                    }
                }
            },
        )

    }, [isOpen]);

    return scope;
}