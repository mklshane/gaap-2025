import { useEffect, useState } from "react";
import { UserProfile } from "../profile/profile";

import "./style.css";
import { ThreeDotSimpleLoader } from "../components/threeDots";

const hostname = "vhk7fc12-3000.asse.devtunnels.ms/rlgl";
const url = "wss://" + hostname;


export function GuessTheSong(
    props: {
        profile: UserProfile
    }
) {
    const userId = props.profile.studentId;

    const [gameState, setGameState] = useState<"waiting" | "playing" | "over">("waiting");
    const [leaderboard, setLeaderboard] = useState<{ name: string, score: number }[]>([]);

    const [song, setSong] = useState("");
    const [submissionState, setSubmissionState] = useState<"submitted" | "loading" | "idle">("idle");



    // web socket stuff
    const [websocket, setWebSocket] = useState<WebSocket | null>(null);


    useEffect(() => {

        function setupWebsocket(websocket: WebSocket) {
            websocket.onopen = () => {
                console.log("WebSocket connected as player");
            };

            websocket.onmessage = (event) => {
                console.log("WebSocket message received:", event.data);
                const data = JSON.parse(event.data);


                if (data.type === "sync") {
                    const submitted = data.submitted;
                    setGameState("playing");
                    if (submitted) {
                        setSubmissionState("submitted");
                    } else {
                        setSubmissionState("idle");
                    }
                    return;
                }

                if (data.type === "guess_acknowledged") {
                    setSubmissionState("submitted");
                    return;
                }

                if (data.type === "start") {
                    setGameState("playing");
                    return;
                }

                if (data.type === "roundEnd") {
                    setGameState("waiting");
                    setSubmissionState("idle");
                    setSong("");
                    return;
                }

                if (data.type === "newRound") {
                    setGameState("playing");
                    setSubmissionState("idle");
                    setSong("");
                    return;
                }

                if (data.type === "gameOver") {
                    const top3 = data.top3;
                    setLeaderboard(top3);
                    return;
                }
            };

            websocket.onerror = (event) => {
                console.error("WebSocket error observed:", event);
            };

            websocket.onclose = () => {
                console.log("WebSocket closed");

                // reconnect
                console.log("Reconnecting in 2 seconds...");
                setTimeout(() => {
                    console.log("Reconnecting...");
                    const socket = new WebSocket(url + "?userId=" + userId);
                    setupWebsocket(socket);
                    setWebSocket(socket);
                }, 2000);
            };
        }

        const socket = new WebSocket(url + "?userId=" + userId);

        setupWebsocket(socket);

        setWebSocket(socket);

        return () => {
            websocket?.close();
        };
    }, [])





    const submit = (song: string) => {
        setSubmissionState("loading");

        websocket?.send(JSON.stringify({
            type: "guess",
            guess: song
        }));
    }


    return (



        <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            maxWidth: "420px",
        }}>
            {gameState === "waiting" && (
                <>
                    <ThreeDotSimpleLoader />
                    <h1>Waiting for the game to start</h1>
                </>
            )}


            {gameState === "playing" && (
                <>
                    <h1>What song is currently playing?</h1>

                    {/* Text Area */}
                    <textarea
                        id="guess-the-song-text-area"
                        value={song}
                        onChange={(e) => setSong(e.target.value)}
                    ></textarea>

                    {/* Submit Button */}
                    <button
                        id="guess-the-song-submit-button"
                        className={getClassNameForSubmissionState(submissionState)}
                        onClick={() => {
                            if (submissionState !== "idle") {
                                return;
                            }

                            if (song.length === 0) {
                                return;
                            }

                            submit(song)
                        }}
                    >

                        {
                            submissionState === "loading" ? "Loading..." :
                                submissionState === "submitted" ? "Submitted!" :
                                    "Submit"
                        }
                    </button>
                </>
            )}

        </div>
    );
}

function getClassNameForSubmissionState(state: string) {
    switch (state) {
        case "loading":
            return "loading";
        case "submitted":
            return "submitted";
        default:
            return "";
    }
}

