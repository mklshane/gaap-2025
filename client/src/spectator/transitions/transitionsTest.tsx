import { useCallback, useEffect, useState } from "react";
import { HashTag } from "./hashtag";
import { AnimationEndCallback } from "./utils";
import { Year } from "./year";

import "./styles.css";
import { Scopes } from "@spotify/web-api-ts-sdk";
import { GameState } from "../../rlgl/GameState";
import { useSpotify } from "../hooks/useSpotify";
import { User } from "./user";

type User = {
    id: number;
    email: string;
    photo: string;
    course: string;
    trackId: string;
}

const fadeOutAudio = (audio: HTMLAudioElement) => {
    const fadeStep = 0.05;
    const fadeInterval = setInterval(() => {
        if (!audio || audio.volume - fadeStep <= 0) {
            clearInterval(fadeInterval);
            return;
        }
        audio.volume -= fadeStep;
    }, 100);
};

const LOOP_ANIMATIONS = [
    Year,
    HashTag,
]

type AnimationType = (props: {
    onAnimateComplete: AnimationEndCallback;
    user: { name: string, photo: string };
}) => JSX.Element;

const hostname = "vhk7fc12-3000.asse.devtunnels.ms/rlgl";
const url = `wss://${hostname}`;
const duration = 15000;

export function TransitionsTest() {

    // user handling stuff, such as queueing
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [userQueue, setNameQueue] = useState<User[]>([]);

    const addToQueue = useCallback((user: User) => {

        setNameQueue(prevQueue => {
            console.log("Adding to queue");
            return [...prevQueue, user];
        });
    }, [currentUser, userQueue]);

    useEffect(() => {
        if (currentUser === null && userQueue.length > 0) {
            const nextUser = userQueue[0];
            setCurrentUser(nextUser);
            setNameQueue(prevQueue => prevQueue.slice(1));
        }
    }, [currentUser, userQueue]);


    const sdk = useSpotify(
        import.meta.env.VITE_SPOTIFY_CLIENT_ID,
        import.meta.env.VITE_REDIRECT_TARGET,
        Scopes.all
    );

    const [state, setState] = useState(GameState.idle);
    const [websocket, setWebSocket] = useState<WebSocket | null>(null);
    const [spectatorId] = useSpectatorId();
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    // when a new user joins, the handleJoin function is called
    // and as a side effect of that function, a user is added to the list and
    // an audio is set. causing this effect to run
    useEffect(() => {
        if (!audio) return;

        audio.play();
        audio.volume = 0;
        const fadeStep = 0.05;

        const fadeInterval = setInterval(() => {
            if (audio.volume + fadeStep >= 1) {
                clearInterval(fadeInterval);
                return;
            }
            audio.volume += fadeStep;
        }, 100);

        return () => {
            clearInterval(fadeInterval);
            audio.pause();
        };
    }, [audio]);

    // websocket handling
    useEffect(() => {
        // shouldn't be possible, but just in case :D
        if (!sdk) return;

        const setupWebsocket = (ws: WebSocket) => {
            ws.onopen = () => console.log("WebSocket connected as spectator");

            ws.onmessage = (event) => {
                console.log("WebSocket message received:", event.data);
                const data = JSON.parse(event.data);

                if (data.type === "eliminated") {

                } else if (data.type === "join") {
                    handleJoin(data);
                } else if (data.type === "game_state") {
                    const newState = data.state === "red" ? GameState.redLight : data.state === "green" ? GameState.greenLight : GameState.idle;
                    setState(newState);
                } else if (data.type === "sync") {
                    const newState = data.gameState === "red" ? GameState.redLight : data.state === "green" ? GameState.greenLight : GameState.idle;
                    setState(newState);
                }
            };

            ws.onerror = (event) => console.error("WebSocket error:", event);

            ws.onclose = () => {
                console.log("WebSocket closed, reconnecting in 2 seconds...");
                setTimeout(() => reconnectWebSocket(), 2000);
            };
        };

        /**
         * Handle the join event from the websocket,
         * adding the user to the list of users and playing the audio
         * 
         * also sets a timeout to remove the user from the list
         * and additionally fade out the audio
         */
        const handleJoin = (data: any) => {
            if (state !== GameState.idle) {
                return;
            }
            const { id, email, course } = data;


            const userData = {
                id: data.id,
                email: data.email,
                course: data.course,
                trackId: data.track,
                photo: ""
            }
            addToQueue(userData);
        };



        const reconnectWebSocket = () => {
            const socket = new WebSocket(`${url}?userId=${spectatorId}&spectator=true`);
            setupWebsocket(socket);
            setWebSocket(socket);
        };

        const socket = new WebSocket(`${url}?userId=${spectatorId}&spectator=true`);
        setupWebsocket(socket);
        setWebSocket(socket);

        return () => {
            websocket?.close();
        };
    }, [sdk])

    // animations
    const [animations, setAnimations] = useState<AnimationType[]>(LOOP_ANIMATIONS);
    const [animationIndex, setAnimationIndex] = useState(0);
    const [previousBackground, setPreviousBackground] = useState("black");


    const onAnimateComplete: AnimationEndCallback = useCallback((data) => {
        if (data["background"] !== undefined) {
            setPreviousBackground(data["background"]);
        }

        if (data["animation"] === "User") {
            setCurrentUser(null);
            fadeOutAudio(audio!);
            setAnimations(LOOP_ANIMATIONS);
            setAnimationIndex(0);

            // check if there are more users in the queue
            // if there are, we play the user animation again
            if (userQueue.length > 0) {
                setCurrentUser(userQueue[0]);
                setNameQueue(prevQueue => prevQueue.slice(1));
                console.log("Playing next user");
                return;
            }
            return;
        }

        // if theres a user in the queue, we play a user animation
        // by changing the animations array to only contain the User animation
        if (currentUser) {
            console.log("Playing user animation");
            setAnimations([User]);
            setAnimationIndex(0);

            sdk?.tracks
                .get(currentUser.trackId)
                .then((track) => {
                    return {
                        previewUrl: track.preview_url,
                        art: track.album.images[0].url
                    }
                })
                .then((track) => {
                    if (!track.previewUrl) return;

                    const audio = new Audio(track.previewUrl!);
                    setAudio(audio);

                    currentUser.photo = track.art;
                });
            return;
        }


        const nextIndex = (animationIndex + 1) % animations.length;
        setAnimationIndex(nextIndex);
    }, [currentUser, userQueue, audio, animations, animationIndex]);

    useEffect(() => {
        setTimeout(() => {
            // addToQueue({
            //     id: 1,
            //     email: "coffee_delulu@dlsl.edu.ph",
            //     course: "BSCS",
            //     trackId: "2L498de9QTeKvXukcETYu7",
            //     photo: ""
            // })
            // addToQueue({
            //     id: 1,
            //     email: "daniel_luis@dlsl.edu.ph",
            //     course: "BSCS",
            //     trackId: "2plbrEY59IikOBgBGLjaoe",
            //     photo: ""
            // })
        }, 0);
    }, []);

    return (
        <>
            {animations.map((Animation, index) => <div key={index}>
                {index === animationIndex && <Animation onAnimateComplete={onAnimateComplete} user={
                    currentUser ? {
                        name: getNameFromEmail(currentUser.email),
                        photo: currentUser.photo
                    } : { name: "", photo: "" }
                } />}
            </div>
            )}
        </>
    );
}

function getNameFromEmail(email: string) {
    return email.split("@")[0]
        .split("_")
        .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
        .join(" ");
}

/**
 * Makes sure that the spectator has a unique ID
 * 
 * As spectators are treated as users, they still need to have an ID
 */
function useSpectatorId() {
    return useState(() => {
        const storedId = localStorage.getItem("spectatorId");
        if (storedId) {
            return parseInt(storedId);
        }

        const newSpectatorId = Math.floor(Math.random() * 1_000_000);
        localStorage.setItem("spectatorId", newSpectatorId.toString());
        return newSpectatorId;
    });
}   
