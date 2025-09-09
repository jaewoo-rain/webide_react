import React, { useState } from "react";
// import { useSelector } from "react-redux";
import Login from "../components/login/Login";
import Main from "../components//login/Main";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
    // const { isLoggedIn } = useSelector((state) => state.user);
    const [loginModalVisible, setLoginModalVisible] = useState(false);

    const navigate = useNavigate();

    const handleLoginSuccess = () => {
        setLoginModalVisible(false);
    };

    return (
        <>
            <Main
                onStartCoding={() => navigate("/ide")}
                onLoginClick={() => setLoginModalVisible(true)}
            />
            {loginModalVisible && <Login onSuccess={handleLoginSuccess} onClose={() => setLoginModalVisible(false)} />}
        </>
    );

}
