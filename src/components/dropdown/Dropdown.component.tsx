import {useCallback} from "react";
import {setInvitation, setOverlay} from "state-management/slices/data/data.slice";
import {useAppDispatch, useAppSelector} from "state-management/store";
import {selectSelectedServer} from "state-management/selectors/data.selector";
import {OverlayTypes} from "types/UISelectionModes";
import {createInvitation, deleteServer} from "providers/ReactSocketIO.provider";
import styles from "./Dropdown.module.css";
import ButtonComponent from "components/ButtonComponent";

function DropdownComponent({setIsDropdownShown}: any) {

    const selectedServer = useAppSelector(selectSelectedServer);
    const dispatch = useAppDispatch();

    const createInvitationCallback = useCallback(async () => {
        if (selectedServer === undefined) return;
        const {invitation} = await createInvitation({serverId: selectedServer.id});
        dispatch(setInvitation(invitation));
        dispatch(setOverlay({type: OverlayTypes.InvitationOverlayComponent, payload: {invitation}}));
        setIsDropdownShown(false);
    }, [selectedServer, dispatch, setIsDropdownShown]);

    const showCreateChannelOverlay = useCallback(() => {
        setIsDropdownShown(false);
        dispatch(setOverlay({type: OverlayTypes.CreateChannelOverlayComponent, payload: {groupId: null}}));
    }, [setIsDropdownShown, dispatch]);

    const showCreateGroupOverlay = useCallback(() => {
        setIsDropdownShown(false);
        dispatch(setOverlay({type: OverlayTypes.CreateGroupOverlayComponent}));
    }, [setIsDropdownShown, dispatch]);

    const deleteServerCallback = useCallback(async () => {
        if (selectedServer === undefined) return;
        await deleteServer({serverId: selectedServer.id});
        setIsDropdownShown(false);
    }, [selectedServer, setIsDropdownShown]);

    const showServerSettings = useCallback(() => {
        dispatch(setOverlay({type: OverlayTypes.ServerSettingsComponent}));
    }, [dispatch]);

    return (
        <div className={styles.dropdownContainer}>
            <ul className="list">
                <li>
                    <ButtonComponent onClick={createInvitationCallback}>
                        Invite people
                    </ButtonComponent>
                </li>
                <li>
                    <ButtonComponent onClick={showCreateChannelOverlay}>
                        Create channel
                    </ButtonComponent>
                </li>
                <li>
                    <ButtonComponent onClick={showCreateGroupOverlay}>
                        Create group
                    </ButtonComponent>
                </li>
                <li>
                    <ButtonComponent onClick={deleteServerCallback}>
                        Delete server
                    </ButtonComponent>
                </li>
                <li>
                    <ButtonComponent onClick={showServerSettings}>
                        Server Settings
                    </ButtonComponent>
                </li>
            </ul>
        </div>
    );

}

export default DropdownComponent;