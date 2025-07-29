import { useEffect, useState } from "react";
import "./spectator.css";
import JPCS from "../assets/jpcs_logo.png";
import leftYear from "../assets/left-year.png";
import rightYear from "../assets/right-year.png";
import topYear from "../assets/top-year.png";
import TextTransition, { presets } from "react-text-transition";
import { useSpotify } from "./hooks/useSpotify";
import { Scopes } from "@spotify/web-api-ts-sdk";
import { GameState } from "../rlgl/GameState";
import { TransitionsTest } from "./transitions/transitionsTest";
import { GuessTheSongSpectator } from "./guessTheSong";

const SERVER_URL = "https://vhk7fc12-3000.asse.devtunnels.ms";


// constants
const BASE_PICTURE_URL = "https://mydcampus.dlsl.edu.ph/photo_id/";
const hostname = "vhk7fc12-3000.asse.devtunnels.ms/rlgl";
const url = `wss://${hostname}`;



/**
 * The Spectator screen, primararily for displaying in the SENTRUM
 * 
 */
export function Spectator() {

    const [room, setRoom] = useState<"waiting" | "RED_LIGHT_GREEN_LIGHT" | "GUESS_THE_SONG" | "ERROR">("waiting");

    useEffect(() => {

        // cors
        fetch(SERVER_URL + "/api/currentRoom").then(res => res.json())
            .then(data => {
                setRoom(data.room);
            }).catch(err => {
                setRoom("ERROR");

                console.error(err);
            });
    }, []);

    return <>
        {room === "waiting" && (
            <div className="section-container">
                <h1>Fetching room</h1>
            </div>
        )}
        {room === "RED_LIGHT_GREEN_LIGHT" && (
            <TransitionsTest />
        )}
        {room === "GUESS_THE_SONG" && (
            <GuessTheSongSpectator />
        )}

        {room === "ERROR" && (
            <>
                <div className="section-container">
                    <h1>There was an error </h1>
                    <p>Try reloading the page again.</p>
                </div>
            </>
        )}
    </>

    return <>
        <TransitionsTest />
    </>
}

function State(
    props: {
        state: GameState;
    }
) {

    useEffect(() => {
        if (props.state === GameState.redLight) {
            document.body.style.backgroundColor = "#E91229";
        }

        if (props.state === GameState.greenLight) {
            document.body.style.backgroundColor = "#CFF469";
        }
    }, [props.state]);

    const text = props.state === GameState.redLight ? "RED LIGHT" : "GREEN LIGHT";

    return <>
        <h1>{text}</h1>
    </>
}


function WelcomeMessage({ user }: { user: { id: number; email: string; course: string } | null }) {
    let title = user ? getNameFromEmail(user.email) : "General Assembly";

    return (
        <>
            <img src={JPCS} alt="" />
            <h1 className="spech1">
                <TextTransition springConfig={presets.stiff}>{title}</TextTransition>
            </h1>
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