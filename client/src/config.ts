import Keycloak from "keycloak-js";

const config = {
    offline: true,
    backend: "http://localhost:3100",
    keycloakInstance: Keycloak({
        url: "http://localhost:8180/auth",
        realm: "capp",
        clientId: "auth-code",
    })
};

export default config;
