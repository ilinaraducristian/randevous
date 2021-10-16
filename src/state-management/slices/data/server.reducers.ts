import {DataSliceState} from "state-management/slices/data/data.slice";
import {selectSelectedServer} from "state-management/selectors/data.selector";
import {Server} from "dtos/server.dto";
import {User} from "dtos/user.dto";
import {Member} from "dtos/member.dto";
import {Channel} from "dtos/channel.dto";
import {Group} from "dtos/group.dto";
import {HeaderTypes, SecondPanelBodyTypes, SecondPanelHeaderTypes, ThirdPanelTypes} from "types/UISelectionModes";

const serverReducers = {
    deleteServer(state: DataSliceState, action: { payload: any, type: string }) {
        if (state.selectedServer === action.payload.serverId) {
            state.selectedChannel = null;
            state.selectedServer = null;
            state.secondPanelBody = SecondPanelBodyTypes.friends;
            state.secondPanelHeader = SecondPanelHeaderTypes.friends;
            state.header = HeaderTypes.friends;
            state.thirdPanel = ThirdPanelTypes.allFriends;
        }
        const index = state.servers.findIndex(server => server.id === action.payload.serverId);
        if (index === -1) return;
        state.servers.splice(index, 1);
    },
    setInvitation(state: DataSliceState, action: { payload: any, type: string }) {
        const server = state.servers.find(server => server.id === state.selectedServer);
        if (server === undefined) return;
        server.invitation = action.payload;
    },
    addServer(state: DataSliceState, {payload: server}: { payload: Server }) {
        const s1Index = state.servers.findIndex(s1 => s1.id === server.id);
        if (s1Index === -1)
            state.servers.push(server);
        else
            state.servers[s1Index] = server;
    },
    addUser(state: DataSliceState, {payload: user}: { payload: User }) {
        const existingUserIndex = state.users.findIndex(u1 => u1.id === user.id);
        if (existingUserIndex === -1)
            state.users.push(user);
        else
            state.users[existingUserIndex] = user;
    },
    addMember(state: DataSliceState, {payload}: { payload: { member: Member, user: User } }) {
        const members = state.servers.find(server => server.id === payload.member.serverId)?.members;
        const userIndex = state.users.findIndex(user => user.id === payload.user.id);
        if (members === undefined) return;
        const memberIndex = members.findIndex(m1 => m1.id === payload.member.id);
        if (memberIndex === -1)
            members.push(payload.member);
        else
            members[memberIndex] = payload.member;
        if (userIndex === -1)
            state.users.push(payload.user);
        else
            state.users[userIndex] = payload.user;
    },
    addChannel(state: DataSliceState, {payload: channel}: { payload: Channel }) {
        const server = state.servers.find(server => server.id === channel.serverId);
        if (server === undefined) return;
        if (channel.groupId === null) {
            const channelIndex = server.channels.findIndex(c1 => c1.id === channel.id);
            if (channelIndex === -1)
                server.channels.push(channel);
            else
                server.channels[channelIndex] = channel;
        } else {
            const group = server.groups.find(group => group.id === channel.groupId);
            if (group === undefined) return;
            const channelIndex = group.channels.findIndex(c1 => c1.id === channel.id);
            if (channelIndex === -1)
                group.channels.push(channel);
            else
                group.channels[channelIndex] = channel;
        }
    },
    addGroup(state: DataSliceState, {payload: group}: { payload: Group }) {
        const server = state.servers.find(server => server.id === group.serverId);
        if (server === undefined) return;
        const groupIndex = server.groups.findIndex(g1 => g1.id === group.id);
        if (groupIndex === -1)
            server.groups.push(group);
        else
            server.groups[groupIndex] = group;
    },
    setChannelsOrder(state: DataSliceState, {payload}: { payload: { id: number, order: number, groupId: number | null }[] }) {
        const server = selectSelectedServer({data: state});
        if (server === undefined) return;
        payload.forEach(newChannel => {
            if (newChannel.groupId === null) {
                const channel = server.channels.find(channel => channel.id === newChannel.id);
                if (channel === undefined) return;
                channel.order = newChannel.order;
            } else {
                const group = server.groups.find(group => group.id === newChannel.groupId);
                if (group === undefined) return;
                const channel = group.channels.find(channel => channel.id === newChannel.id);
                if (channel === undefined) return;
                channel.order = newChannel.order;
            }
        });
    },
    moveServers(state: DataSliceState, {payload}: { payload: { id: number, order: number }[] }) {
        payload.forEach(server => {
            const found = state.servers.find(sr => sr.id === server.id);
            if (found === undefined) return;
            found.order = server.order;
        });
    },
};

export default serverReducers;