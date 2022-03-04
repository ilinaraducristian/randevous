import { observer } from "mobx-react-lite";
import { useEffect, useState } from "react";
import Api from "./api";
import FifthPanelComponent from "./components/FifthPanel/FifthPanel.component";
import FirstPanelComponent from "./components/FirstPanel/FirstPanel.component";
import ForthPanelComponent from "./components/ForthPanel/ForthPanel.component";
import HeaderComponent from "./components/Header/Header.component";
import OverlayPanelComponent from "./components/OverlayPanel.component";
import SecondPanelComponent from "./components/SecondPanel/SecondPanel.component";
import keycloak from "./keycloak";
import socketio from "./socket.io";
import { FriendshipsState } from "./state/friendships-state";
import RootState from "./state/root-state";
import { ServersState } from "./state/servers-state";
import "./ThirdPanel.css";

type ComponentProps = {
  rootState: RootState;
  serversState: ServersState;
  friendshipsState: FriendshipsState;
};

const App = observer(({ rootState, serversState, friendshipsState }: ComponentProps) => {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const authenticated = await keycloak.init({
        onLoad: "check-sso",
        silentCheckSsoRedirectUri: window.location.origin + "/silent-check-sso.html",
      });

      if (!authenticated) return keycloak.login();
      await keycloak.loadUserInfo();
      socketio.auth = { token: keycloak.token };
      const { friendships, servers, users } = await Api.getData();
      friendshipsState.friendships = friendships;
      serversState.servers = servers;
      rootState.users = users;
      socketio.connect();
      setIsLoading(false);
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return (
    <>
      <FirstPanelComponent rootState={rootState} />
      <SecondPanelComponent rootState={rootState} serversState={serversState} />
      <HeaderComponent rootState={rootState} />
      <div className="third-panel">
        <ForthPanelComponent rootState={rootState} />
        <FifthPanelComponent rootState={rootState} />
      </div>
      <OverlayPanelComponent rootState={rootState} />
    </>
  );
});

export default App;