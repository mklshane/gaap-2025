import { useAnimate } from "framer-motion";

import { useEffect, useRef, useState } from "react";
import { ZoomIn } from "../zoomIn";

import Star from "../../../assets/Star.svg?react";
import StarSharp from "../../../assets/StarSharp.svg?react";

import { AnimationEndCallback, getRandomBackground, getRandomBackgroundExcept, getRandomTheme, isColorLight, Theme } from "../utils";


function useAnimation(state: string, theme: Theme, onComplete?: (next: string) => void) {
    const [scope, animate] = useAnimate();

    useEffect(() => {
        if (state === "show-star") {
            animate(
                ".star",
                {
                    width: "40vw",
                    height: "40vw",
                },
                {
                    duration: 1,
                    delay: 0.5,
                    onComplete: () => {
                        onComplete && onComplete("show-box")
                    }
                }
            )

            animate(
                ".star-sharp",
                {
                    width: "40vw",
                    height: "40vw",
                },
                {
                    duration: 1,
                    delay: 1,
                }
            )

            const star = scope.current.querySelector(".star");
            let rotate = 0;
            const interval = setInterval(() => {
                if (scope.current === null) {
                    clearInterval(interval);
                    return;
                }
                rotate -= 0.2;
                star.style.setProperty("rotate", `${rotate}deg`);
            }, 10);
        } else if (state === "show-box") {
            animate(
                ".box",
                {
                    width: window.innerWidth / 4,
                    height: window.innerWidth / 4,
                },
                {
                    duration: 1,
                    onComplete: () => {
                        onComplete && onComplete("move-to-the-right")
                    }
                }
            )
        } else if (state === "move-to-the-right") {
            animate(
                ".album-container",
                {
                    x: "25vw",
                },
                {
                    duration: 0.8,
                    onComplete: () => {
                        onComplete && onComplete("show-info")
                    }
                }
            )

            const background = theme.background;
            const foreground = theme.color;

            // set info-name color
            const infoName = scope.current.querySelector(".info-name");
            infoName.style.setProperty("color", foreground);

            // jpcs-text black or white
            const jpcsText = scope.current.querySelector(".jpcs-text");
            jpcsText.style.setProperty("color", theme.color);

            const starColor = theme.secondary;

            // use set interval to scale "sharp" from 1 to 0.7 and back
            const sharp = scope.current.querySelector(".star-sharp");
            sharp.style.setProperty("color", theme.tertiary);

            let scale = 1;
            let scaleDirection = -0.01;
            const sharpInterval = setInterval(() => {
                if (scope.current === null) {
                    clearInterval(sharpInterval);
                    return;
                }
                scale += scaleDirection;
                if (scale <= 0.7) {
                    scaleDirection = 0.01;
                } else if (scale >= 1) {
                    scaleDirection = -0.01;
                }
                sharp.style.setProperty("scale", scale);
            }, 20);

            // also rotate it
            let rotate = 0;
            const rotateInterval = setInterval(() => {
                if (scope.current === null) {
                    clearInterval(rotateInterval);
                    return;
                }
                rotate += 0.2;
                sharp.style.setProperty("rotate", `${rotate}deg`);
            }, 10);

            animate(
                ".star",
                {
                    color: starColor
                },
                {
                    duration: 0.3,
                }
            )

            animate(
                ".main-content",
                {
                    backgroundColor: background
                },
                {
                    duration: 0.3,
                }
            )
        } else if (state === "show-info") {
            animate(
                ".info-name",
                {
                    opacity: 1
                },
                {
                    duration: 0.8,
                    onComplete: () => {
                        setTimeout(() => {
                            onComplete && onComplete("exit")
                        }, 10000);
                    }
                }
            )
            animate(
                ".jpcs-container",
                {
                    width: "30rem",
                    opacity: 1
                },
                {
                    duration: 1,
                }
            )
        } else if (state === "exit") {
            animate(
                ".main-content",
                {
                    scale: 15,
                    opacity: 0
                },
                {
                    duration: 1,
                    onComplete: () => {
                        onComplete && onComplete("end")
                    }
                }
            )
        }

        return () => {
            if (state === "end") {
                // actual cleanup
            }

        }
    }, [state]);

    return scope;
}


export function User(
    props: {
        onAnimateComplete?: AnimationEndCallback;
        user: {
            name: string;
            photo: string;
        }
    }
) {
    const [state, setState] = useState("initial");

    const [theme] = useState(getRandomTheme());

    const scope = useAnimation(state, theme, (next) => {
        if (next === "end") {
            props.onAnimateComplete && props.onAnimateComplete({
                animation: "User",
                background: theme.background
            });
        } else {
            setState(next);
        }
    });

    return (
        <div ref={scope} className="root-container" style={{
            position: "absolute",
            left: "0",
            top: "0",
            width: "100vw",
            height: "100vh",
        }}>

            <ZoomIn svg={Star} endScale={4300} colors={["#f46ebe", "#121212"]} onAnimateComplete={() => {
                setState("show-star");
            }} />


            <div className="main-content" style={{
                position: "absolute",
                left: "0",
                top: "0",
                width: "100vw",
                height: "100vh",
                display: "flex",
                justifyContent: "center",
                alignContent: "center",
                alignItems: "center",
                boxSizing: "border-box",
            }}>

                <div className="jpcs-container" style={{
                    position: "absolute",
                    left: "0",
                    top: "1.5rem",
                    width: "0rem",
                    height: "10rem",
                    textAlign: "start",
                    overflow: "hidden",
                    marginTop: "3rem",
                    marginLeft: "4rem",
                    opacity: 0,
                }}>
                    <h1 className="jpcs-text" style={{
                        margin: "0",
                        fontSize: "2rem",
                        color: "#f5f5f5",
                        textAlign: "start",
                        opacity: 1,
                    }}>#JPCSGAAP2024</h1>

                </div>

                <div className="info-container"
                    style={{
                        position: "absolute",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "start",
                        alignContent: "start",
                        left: 0,
                        width: '0px',
                        height: '0px',
                        backgroundColor: "red",
                        boxSizing: "border-box",
                        paddingLeft: "12rem",
                        paddingRight: "0rem",
                        flexDirection: "column",
                    }}
                >

                    <h1 className="info-name" style={{
                        opacity: 0,
                        color: "#f2ff48",
                        fontSize: "8rem",
                        textAlign: "start",
                        font: "Spotify sans-serif",
                    }}>
                        {props.user.name}, <br />
                        <p style={{
                            fontSize: "2rem",
                            font: "Spotify sans-serif",
                            fontWeight: "600",
                        }}>you have arrived.</p>
                    </h1>



                </div>

                <div className="album-container"
                    style={{
                        position: "absolute",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        boxSizing: "border-box",
                        alignContent: "center",
                        marginLeft: "3rem",
                        marginRight: "3rem",
                    }}
                >

                    <div className="test" style={{
                        position: "absolute",

                    }}>
                        <StarSharp className="star-sharp" style={{
                            width: "0px",
                            height: "0px",
                            color: theme.tertiary
                        }} />
                    </div>

                    <Star className="star" style={{
                        width: "0px",
                        height: "0px",
                        color: theme.secondary
                    }} />



                    <div className="box" style={{
                        position: "absolute",
                        width: "0px",
                        height: "0px",
                        backgroundColor: "#121212",
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        alignContent: "center",
                        overflow: "hidden",
                    }}>
                        <img src={props.user.photo} />
                    </div>



                </div>
            </div>

        </div>
    )
}