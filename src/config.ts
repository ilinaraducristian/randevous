const config = process.env.REACT_APP_ENVIRONMENT === "production" ? {
      offline: false,
      backend: "https://rendezvous-api-radu.herokuapp.com/",
      socketIoUrl: "https://rendezvous-api-radu.herokuapp.com/",
      auth0: {
        domain: "rendezvous-iam.eu.auth0.com",
        client_id: "l1ZnZCOMXFKzMO0plbn0dl4o6Ijyg0se"
      },
      keycloak: {
        url: "http://rendezvous.myddns.me:30000/auth",
        realm: "capp",
        clientId: "auth-code",
      },
    }
    :
    {
      offline: true,
      backend: "http://localhost:3100",
      socketIoUrl: "http://localhost:3100",
      auth0: {
        domain: "",
        client_id: ""
      },
      keycloak: {
        url: "http://localhost:8180/auth",
        realm: "capp",
        clientId: "auth-code",
      }
    };

export default config;
