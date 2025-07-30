import { useEffect, useState } from "react";
import "./Admin.css";
/* const hostname = "vhk7fc12-3000.asse.devtunnels.ms/rlgl";
const url = `wss://${hostname}`; */

const hostname = "gaap-server.onrender.com/rlgl"; 
const url = `https://${hostname}`; 

/* const hostname = "localhost:3000/rlgl";
const url = `http://${hostname}`; */


export function Admin() {
    const [websocket, setWebSocket] = useState<WebSocket | null>(null);
    const [adminId] = useAdminId();

    useEffect(() => {
        const setupWebsocket = (ws: WebSocket) => {
            ws.onopen = () => console.log("WebSocket connected as admin");

            ws.onmessage = (event) => {

            };

            ws.onerror = (event) => console.error("WebSocket error:", event);

            ws.onclose = () => {
                console.log("WebSocket closed, reconnecting in 2 seconds...");
                setTimeout(() => reconnectWebSocket(), 2000);
            };
        };

        const reconnectWebSocket = () => {
            const socket = new WebSocket(`${url}?userId=${adminId}&admin=true`);
            setupWebsocket(socket);
            setWebSocket(socket);
        };

        const socket = new WebSocket(`${url}?userId=${adminId}&admin=true`);
        setupWebsocket(socket);
        setWebSocket(socket);

        return () => {
            websocket?.close();
        };
    }, []);

    if (!websocket) {
        return <div>Connecting...</div>;
    }

    return (
      <div className="admin-container">
        <button
          className="red"
          onClick={() => {
            websocket.send(JSON.stringify({ type: "state", state: "red" }));
          }}
        >
          RED LIGHT
        </button>

        <button
          className="green"
          onClick={() => {
            websocket.send(JSON.stringify({ type: "state", state: "green" }));
          }}
        >
          GREEN LIGHT
        </button>

        <button
          className="restart-button"
          onClick={() => {
            websocket.send(JSON.stringify({ type: "restart" }));
          }}
        >
          RESTART
        </button>
      </div>
    );
}


function useAdminId() {
    return useState(() => {
        const storedId = localStorage.getItem("adminId");
        if (storedId) {
            return parseInt(storedId);
        }

        const newSpectatorId = Math.floor(Math.random() * 1_000_000);
        localStorage.setItem("adminId", newSpectatorId.toString());
        return newSpectatorId;
    });
}
