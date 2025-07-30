import { useEffect, useState } from "react";
import { RedLightGreenLight } from "../home/App";
import "./profile.css";
import { GuessTheSong } from "../guessTheSong";

/* const SERVER_URL = "https://vhk7fc12-3000.asse.devtunnels.ms"; */
const SERVER_URL = "https://gaap-server.onrender.com";
/* const SERVER_URL = "http://localhost:3000"; */

export type UserProfile = {
    studentId: string;
}

/**
 * Ensures that the user has filled out their profile before proceeding to the app
 */
export function Profile() {

    const [profile, setProfile] = useState<UserProfile | null>(null);

    useEffect(() => {
        // get profile from localStorage
        // if there is an existing profile, set it to state, otherwise 
        // prompt the user to fill out the profile form

        const existingProfile = localStorage.getItem("profile");
        if (existingProfile) {
            setProfile(JSON.parse(existingProfile));
        }
    }, []);

    return (
        <>
            {profile === null ? (
                <ProfileForm onProfileFilled={
                    (profile) => {
                        localStorage.setItem("profile", JSON.stringify(profile));
                        setProfile(profile);
                    }
                } />
            ) : (
                <GetRoom profile={profile} />
            )}
        </>
    );
}

function GetRoom(
    props: {
        profile: UserProfile;
    }
) {
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
            <RedLightGreenLight profile={props.profile} />
        )}
        {room === "GUESS_THE_SONG" && (
            <GuessTheSong profile={props.profile} />
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
}


/**
 * Only Student ID is used here, ill probably remove them later
 */
function ProfileForm(
    props: {
        onProfileFilled: (profile: UserProfile) => void;
    }
) {

    return <StudentIdForm onStudentIdEntered={
        (studentId) => {
            props.onProfileFilled({
                studentId
            });
        }
    } />;
}

function StudentIdForm(
    props: {
        onStudentIdEntered: (studentId: string) => void;
    }
) {
    // valid student id is 2021314281 e.g 10 characters
    const [studentId, setStudentId] = useState("");

    const isValidStudentId = (studentId: string) => {
        console.log(studentId);
        if (studentId.length < 7) {
            return false;
        }

        return true;
    }

    const [error, setError] = useState("");

    return (
        <>
            <div className="section-container">
                <h1>Enter your Student ID</h1>
                <input
                    type="number"
                    inputMode="numeric"
                    pattern="[0-9]{10}"
                    value={studentId}
                    onChange={(e) => {
                        setStudentId(e.target.value);
                        if (!isValidStudentId(e.target.value)) {
                            setError("Invalid Student ID!");
                        } else {
                            setError("");
                        }
                    }}
                />
                <div>
                    {
                        error.length > 0 && (
                            <p className="error">{error}</p>
                        )
                    }
                </div>
                <button onClick={() => {
                    setError("");

                    if (isValidStudentId(studentId)) {
                        props.onStudentIdEntered(studentId);
                    } else {
                        setError("Invalid Student ID!");
                    }
                }}
                    style={{
                        marginTop: "1.5em"
                    }}
                >Submit</button>
            </div>
        </>
    )
}
