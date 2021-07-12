import {useKeycloak} from "@react-keycloak/web";
import {useCallback} from "react";
import config from "../config";
import {Message, ProcessedServersData, ServersData} from "../types";
import {responseToSortedMap} from "../util/functions";
import useSocketIo from "./socketio.hook";
import SortedMap from "../util/SortedMap";

function useBackend() {

  const {keycloak} = useKeycloak();
  const {socket} = useSocketIo();

  const getUserServersData = useCallback(async (): Promise<ProcessedServersData> => {
    if (keycloak.token === undefined) return Promise.reject({error: "Keycloak token is undefined"});
    let response: any = await fetch(`${config.backend}/servers`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
        "Content-Type": "application/json"
      }
    });
    response = await response.json();
    response = responseToSortedMap(response);
    return response;
  }, [keycloak.token]);

  const createServer = useCallback((name: string) => {
    return new Promise((resolve, reject) => {
      socket.emit("create_server", {name}, (serversData: ServersData) => {
        resolve(responseToSortedMap(serversData));
      });
    });
  }, [socket]);

  const getMessages = useCallback(async (serverId: number, channelId: number, offset: number) => {
    if (keycloak.token === undefined) return Promise.reject({error: "Keycloak token is undefined"});
    let response: any = await fetch(`${config.backend}/channels/${channelId}/messages?serverId=${serverId}&offset=${offset}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
        "Content-Type": "application/json"
      }
    });
    response = await response.json();
    response = response.map((message: [number, Message]) => {
      message[1].timestamp = new Date(message[1].timestamp);
      return message;
    });
    response = new SortedMap<Message>(response);
    return response;
  }, [keycloak.token]);

  const joinServer = useCallback(async (invitation: string) => {
    return new Promise((resolve, reject) => {
      socket.emit("join_server", {invitation}, (serversData: ServersData) => {
        resolve(responseToSortedMap(serversData));
      });
    });
  }, [socket]);

  const createInvitation = useCallback(async (serverId: number) => {
    if (keycloak.token === undefined) return Promise.reject({error: "Keycloak token is undefined"});
    let response: any = await fetch(`${config.backend}/invitations`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${keycloak.token}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({serverId})
    });
    response = await response.json();
    return response.invitation;
  }, [keycloak.token]);

  const createChannel = useCallback(async (serverId: number, groupId: number | null, channelName: string) => {
    return new Promise((resolve, reject) => {
      socket.emit("create_channel", {serverId, groupId, channelName}, (channelId: number) => {
        resolve(channelId);
      });
    });
  }, [socket]);

  const createGroup = useCallback(async (serverId: number, groupName: string) => {
    return new Promise((resolve, reject) => {
      socket.emit("create_group", {serverId, groupName}, (groupId: number) => {
        resolve(groupId);
      });
    });
  }, [socket]);

  return {
    getUserServersData,
    createServer,
    createInvitation,
    joinServer,
    getMessages,
    createChannel,
    createGroup
  };

}

export default useBackend;