import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// STYLES
import "./Login.scss";
import logo from "../../assets/login/logo.png";

// LIBRARIES

// CONSTANTS & MOCKS

// REDUX

// COMPONENTS
import Particle from "./components/Particle/Particle";
import Button from "./components/Button/Button";
import Input from "./components/Input/Input";

const Login = (props) => {
  // PROPS
  const { path = "" } = props;

  // CONSTANTS USING LIBRARYS

  // CONSTANTS USING HOOKS
  const navigate = useNavigate();
  const [error, setError] = useState("Please complete all fields");
  const [showError, setShowError] = useState(false);
  const [buttonModel, setButtonModel] = useState([]);
  const [inputModel, setInputModel] = useState([]);
  const [loginData, setLoginData] = useState({
    email: "",
    password: "",
  });
  const [registerData, setRegisterData] = useState({
    userName: "",
    email: "",
    password: "",
  });

  // GENERAL CONSTANTS
  const credentials = {
    email: "chat-app@build.com",
    password: "parola123",
  };
  const title = () => {
    switch (path) {
      case "/":
        return "WELCOME";
      case "login":
        return "LOGIN";
      case "register":
        return "REGISTER";
      default:
        break;
    }
  };
  const displayInput = (type) => {
    return inputModel[type]?.data?.map((input, index) => (
      <Input
        key={`input-${index}`}
        name={input.name}
        handleChange={(event) => {
          handleChange(event);
        }}
        value={path === "login" ? loginData[input.name] : registerData[input.name]}
        label={input.label}
        type={input.type}
      />
    ));
  };

  // USE EFFECT FUNCTION
  useEffect(() => {
    const button = [
      {
        text: path === "/" ? "LOGIN" : path === "login" ? "CONNECT" : "CREATE ACCOUNT",
        path: path === "/" ? "/login" : path === "login" ? "/login" : "/login",
        type: "firstButton",
      },
      {
        text: path === "/" ? "REGISTER" : path === "register" ? "LOGIN" : "REGISTER",
        path: path === "/" ? "/register" : path === "register" ? "/login" : "/register",
        type: "secondButton",
      },
    ];
    const input = [
      {
        data: [
          {
            name: "email",
            label: "EMAIL",
            type: "text",
          },
          {
            name: "password",
            label: "PASSWORD",
            type: "password",
          },
        ],
      },
      {
        data: [
          {
            name: "userName",
            label: "NAME",
            type: "text",
          },
          {
            name: "email",
            label: "EMAIL",
            type: "text",
          },
          {
            name: "password",
            label: "PASSWORD",
            type: "password",
          },
        ],
      },
    ];
    setLoginData({
      email: "",
      password: "",
    });
    setRegisterData({
      userName: "",
      email: "",
      password: "",
    });
    setInputModel(input);
    setButtonModel(button);
  }, [navigate]);

  // REQUEST API FUNCTIONS

  // HANDLERS FUNCTIONS
  const handleSubmit = (event) => {
    event.preventDefault();
  };
  const handleClick = (address, type) => {
    if (path === "login" && type === "firstButton") {
      if (credentials.email === loginData.email && credentials.password === loginData.password) {
        navigate("/app");
      } else {
        setError("Invalid E-mail or Password");
        handleError();
      }
    } else if (path === "register" && type === "firstButton") {
      if (registerData.userName === "" && registerData.email === "" && registerData.password === "") {
        setError("Please complete all fields");
      } else if (registerData.userName === "") {
        setError("Invalid Name");
      } else if (!registerData.email.includes("@")) {
        setError("Invalid E-mail");
      } else if (registerData.password === "") {
        setError("Invalid Password");
      }
      handleError();
    } else if (
      (path === "login" && type === "secondButton") ||
      (path === "register" && type === "secondButton") ||
      ((type === "firstButton" || type === "secondButton") && path === "/")
    ) {
      setShowError(false);
      navigate(address);
    }
  };
  const handleChange = (event) => {
    if (path === "login") {
      setLoginData({
        ...loginData,
        [event.target.name]: event.target.value,
      });
    }
    if (path === "register") {
      setRegisterData({
        ...registerData,
        [event.target.name]: event.target.value,
      });
    }
  };
  const handleError = () => {
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
    }, 1700);
  };

  return (
    <>
      <Particle />
      <div className="loginContainer">
        <div className="card">
          <form onSubmit={handleSubmit}>
            <div className="logoContainer">
              <div className="logoWrapper">
                <img src={logo} alt="logo" />
              </div>
            </div>
            <div className="credentialsContainer">
              <div className="titleWrapper">
                <p>{title()}</p>
              </div>
              <div className={path === "/" ? "introAuthenticationWrapper" : "authenticationWrapper"}>
                {path !== "/" && (
                  <div className="inputsWrapper">
                    {displayInput(path === "login" ? 0 : 1)}
                    <div className="forgotPasswordWrapepr">{path === "login" && <span>Forgot your password?</span>}</div>
                    <div className="errorContainer">
                      {showError && (
                        <div className="errorMessageWrapper">
                          <span>{error}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="buttonWrapper">
                  {buttonModel.map((button, index) => (
                    <Button key={`button-${index}`} style="basic" text={button.text} handleClick={() => handleClick(button.path, button.type)} />
                  ))}
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Login;