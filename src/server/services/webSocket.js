import AdminLevel from "../model/AdminLevel.js";
import GarageState from "../model/GarageState.js";

export let doorState = GarageState.OPEN;
export const webSocketClients = {};

export const setDoorState = (newState) => {
  doorState = newState;
  notifyDoorState(doorState);
};

export const notifyDoorState = (doorState) => {
  const connectionsToTimeout = [];
  for (const [, singleUserConnections] of Object.entries(webSocketClients))
    if (singleUserConnections.level > AdminLevel.ACCOUNT)
      for (const [, ws] of Object.entries(singleUserConnections.connections))
        if (ws.expireDate >= new Date())
          ws.send(JSON.stringify([{ event: "STATE", message: doorState }]));
        else connectionsToTimeout.push(ws);
  connectionsToTimeout.forEach((ws) => {
    ws.send(JSON.stringify([{ event: GarageState.SESSION_TIMEOUT }]));
    ws.close();
  });
};

export const updatePermissionLevel = (id, level) => {
  const userConnectionsId = Object.keys(webSocketClients).find(
    (connectionId) => connectionId === id
  );
  if (userConnectionsId !== undefined) {
    const userConnections = webSocketClients[userConnectionsId];
    const sendStateWithChangedLevel =
      userConnections.level === AdminLevel.ACCOUNT &&
      level !== AdminLevel.ACCOUNT;
    for (const [, ws] of Object.entries(userConnections.connections)) {
      const payload = [];
      payload.push({ event: "LEVEL", message: level });
      if (sendStateWithChangedLevel)
        payload.push({ event: "STATE", message: doorState });
      ws.send(JSON.stringify(payload));
    }
    userConnections.level = level;
  }
};

export const closeConnection = (id) => {};
