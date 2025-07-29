import { Scopes } from "@spotify/web-api-ts-sdk";
import { useSpotify } from "../hooks/useSpotify";
import { useEffect, useState } from "react";

const hostname = "vhk7fc12-3000.asse.devtunnels.ms/rlgl";
const url = "wss://" + hostname;


export function GuessTheSongSpectator() {

    const [gameState, setGameState] = useState<"waiting" | "playing" | "over">("waiting");
    const [leaderboard, setLeaderboard] = useState<{ name: string, score: number }[]>([]);

    const [spectatorId] = useSpectatorId();
    const [websocket, setWebSocket] = useState<WebSocket | null>(null);
    const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

    useEffect(() => {
        if (!audio) return;
        audio.volume = 0;
        audio.play();

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


    useEffect(() => {
        // shouldn't be possible, but just in case :D

        const setupWebsocket = (ws: WebSocket) => {
            ws.onopen = () => console.log("WebSocket connected as spectator");

            ws.onmessage = (event) => {
                console.log("WebSocket message received:", event.data);
                const data = JSON.parse(event.data);

                if (data.type === "newRound") {
                    const audio = new Audio(data.track.preview_url);
                    setAudio(audio);
                    return;
                }

                if (data.type === "roundEnd") {
                    setAudio(null);
                    return;
                }

                if (data.type === "gameOver") {
                    setGameState("over");
                    setLeaderboard(data.top3);
                    return;
                }
            };

            ws.onerror = (event) => console.error("WebSocket error:", event);

            ws.onclose = () => {
                console.log("WebSocket closed, reconnecting in 2 seconds...");
                setTimeout(() => reconnectWebSocket(), 2000);
            };
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
    }, []);

    return <>

        {audio && (
            <div>
                <img src={"https://cdn.prod.website-files.com/6488cc2b899091ddde57a95d/64a6b0e0740e455bda54f399_Waveform.gif"} style={{
                    filter: "invert(1)",
                }} />
                <h1>Guess the song!</h1>
            </div>
        )}


        {gameState === "over" && (
            <>
                <h1>Game Over!</h1>
                <Leaderboard leaderboard={leaderboard} />
            </>
        )}
    </>
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


function Leaderboard(props: {
    leaderboard: {
        name: string,
        score: number
    }[]
}) {
    return (
        <div className="leaderboard">
            {props.leaderboard.map((item, index) => (
                <LeaderboardItem
                    key={index}
                    name={item.name}
                    score={item.score}
                />
            ))}
        </div>
    );
}


function LeaderboardItem(props: {
    name: string,
    score: number
}) {
    const api = "https://api.multiavatar.com/" + props.name + ".svg";

    return (
        <div className="leaderboard-item">
            <img src={api} alt="" />
            <h1>{props.name}</h1>
            <h2>{props.score}</h2>
        </div>
    );
}