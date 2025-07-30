import { useEffect, useRef, useState } from "react";
import Game from "../rlgl/Game";
import { GameState } from '../rlgl/GameState';
import { requestOrientationPermissioniOS } from "../rlgl/hooks/useOrientation";
import { UserProfile } from "../profile/profile";

/* const hostname = "vhk7fc12-3000.asse.devtunnels.ms/rlgl";
const url = "wss://" + hostname; */

const hostname = "gaap-server.onrender.com/rlgl";
const url = "https://" + hostname;

/**
 * The Red Light Green Light game, this contains the logic for handling game states
 * but the movement detection and orientation detection is handled in the @see {Game} component
 */
export function RedLightGreenLight(
  props: {
    profile: UserProfile
  }
) {
  const [background, setBackground] = useState("transparent");
  const [state, setState] = useState(GameState.idle);
  const [userCount, setUserCount] = useState(0);
  const userId = props.profile.studentId;
  const [websocket, setWebSocket] = useState<WebSocket | null>(null);

  useEffect(() => {

    function setupWebsocket(websocket: WebSocket) {
      websocket.onopen = () => {

      };

      websocket.onmessage = (event) => {
        const data = JSON.parse(event.data);
        if (data.type === "color") {
          setBackground(data.color);
        }

        if (data.type === "users") {
          setUserCount(data.count);
          return;
        }

        if (data.type === 'sync') {
          if (data.eliminated === true) {
            setState(GameState.eliminated);
            setBackground("orange");
            return;
          }

          if (data.gameState === "red") {
            setBackground("#E91229");
            setTimeout(() => {
              setState(GameState.redLight);
            }, 1000);
          } else if (data.gameState === "green") {
            setState(GameState.greenLight);
          } else {
            setState(GameState.idle);
          }


        }

        if (data.type === "eliminated") {
          setState(GameState.eliminated);
          setBackground("orange");
        }

        else if (data.type === "game_state") {
          const stringState: string = data.state;

          if (stringState === "idle") {
            setState(GameState.idle);
          } else if (stringState === "red") {


            // Allow a little time for the user to react to the red light
            // before detecting movement
            // though we need to set the state to red light immediately to warn them
            setBackground("#E91229");
            setTimeout(() => {
              setState(GameState.redLight);
            }, 1000);


          } else if (stringState === "green") {
            setState(GameState.greenLight);
          }
        }
      };

      websocket.onerror = (event) => {
        console.error("WebSocket error observed:", event);
      };

      websocket.onclose = () => {
        console.log("WebSocket closed");

        setState(GameState.idle);

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
  }, []);

  // side effect to change the background color based on the game state
  useEffect(() => {
    if (state === GameState.idle) {
      setBackground("transparent");
    } else if (state === GameState.redLight) {
      setBackground("#E91229");
    } else if (state === GameState.greenLight) {
      setBackground("green");
    }
  }, [state]);

  useEffect(() => {
    if (background) {
      document.body.style.backgroundColor = background;
    }
  }, [background]);

  return (
    <>


      {
        state === GameState.idle && (
          <div className="card">
            <h1 style={{
              color: "#121212",
              font: "Spotify sans-serif",
              fontWeight: "bold",
              fontSize: "3em"
            }} >Waiting</h1>

          </div>
        )
      }


      {
        (userCount > 0) && (
          <p style={{
            color: "#121212",
            font: "Spotify sans-serif",
          }}>{userCount} user(s) connected</p>
        )
      }



      {
        state === GameState.eliminated && (
          <div className="card">
            <h1 style={{
              color: "#121212",
              font: "Spotify sans-serif",
              fontWeight: "bold",
              fontSize: "3em"
            }}>Eliminated</h1>
          </div>
        ) || websocket && <Game state={state} ws={websocket} />
      }
    </>
  )
}
