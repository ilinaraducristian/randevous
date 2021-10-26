import {useDrag} from "react-dnd";
import ItemTypes, {ChannelDragObject} from "types/DnDItemTypes";
import {addChannelUsers, joinVoiceChannel as joinVoiceChannelAction} from "state-management/slices/data/data.slice";
import {useAppDispatch, useAppSelector} from "state-management/store";
import config from "config";
import ChannelButtonComponent from "components/channel/ChannelButton/ChannelButton.component";
import {selectJoinedChannel, selectSelectedServer, selectUsers} from "state-management/selectors/data.selector";
import {VoiceChannel} from "dtos/channel.dto";
import AvatarPlaceholder from "assets/avatar-placeholder.png";
import {createProducer} from "providers/mediasoup";
import {joinVoiceChannel} from "providers/socketio";
import styles from "components/channel/VoiceChannel/VoiceChannel.module.css";
import ButtonComponent from "components/ButtonComponent";
import {useCallbackDebounced} from "util/debounce";
import AvatarSVG from "svg/Avatar/Avatar.svg";
import {useKeycloak} from "@react-keycloak/web";
import checkPermission from "../../../util/check-permission";

type ComponentProps = {
    channel: VoiceChannel
}

function VoiceChannelComponent({channel}: ComponentProps) {

    const users = useAppSelector(selectUsers);
    const dispatch = useAppDispatch();
    const joinedChannel = useAppSelector(selectJoinedChannel);
    const {initialized, keycloak} = useKeycloak();
    const selectedServer = useAppSelector(selectSelectedServer);

    const selectChannel = useCallbackDebounced(async () => {
        if (config.offline) return;
        if (joinedChannel !== null) return;
        await createProducer();
        const usersInVoiceChannel = await joinVoiceChannel({
            serverId: channel.serverId,
            channelId: channel.id,
        });
        dispatch(joinVoiceChannelAction({serverId: channel.serverId, groupId: channel.groupId, channelId: channel.id}));
        dispatch(addChannelUsers(usersInVoiceChannel));
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [channel, joinedChannel]);

    const [, drag] = useDrag<ChannelDragObject, any, any>(() => {
        let canDrag = true;

        if (checkPermission(initialized, keycloak, selectedServer, 'moveChannels') === undefined) canDrag = false;

        return {
            type: ItemTypes.CHANNEL,
            canDrag: _ => canDrag,
            item: {id: channel.id, order: channel.order, groupId: channel.groupId},
        }
    }, [channel.order]);

    return (
        <li ref={drag}>
            <ChannelButtonComponent
                onClick={selectChannel}
                channelType={channel.type}
                channelName={channel.name}
            />
            <ul className={`list ${styles.ul}`}>
                {channel.users
                    .map((_user, i) => {
                        const user = users.find(user => user.id === _user.userId);
                        if (user === undefined) return <div/>;
                        return (
                            <li key={`channel_${channel.id}_user_${i}`}>
                                <ButtonComponent className={styles.button}>
                                    <AvatarSVG url={AvatarPlaceholder}
                                               isActive={joinedChannel !== null && _user.isTalking}/>
                                    <span>{`${user.firstName} ${user.lastName}`}</span>
                                </ButtonComponent>
                            </li>
                        );
                    })}
            </ul>
        </li>
    );

}

export default VoiceChannelComponent;