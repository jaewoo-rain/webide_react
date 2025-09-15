import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Login from "../components/login/Login";
import Main from "../components/login/Main";
import { useNavigate } from "react-router-dom";

export default function MainPage() {
    const { token } = useSelector((state) => state.user);
    const isLoggedIn = !!token;
    const [loginModalVisible, setLoginModalVisible] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) {
            setLoginModalVisible(true);
        } else {
            setLoginModalVisible(false);
        }
    }, [isLoggedIn]);

    const handleLoginSuccess = () => {
        // 이 함수는 이제 직접적으로 모달을 닫지 않아도 됩니다.
        // useEffect가 isLoggedIn 상태 변경에 따라 처리합니다.
    };

    return (
        <>
            {isLoggedIn ? (
                <Main
                    onStartCoding={() => navigate("/ide")}
                    onLoginClick={() => setLoginModalVisible(true)} // 이 부분은 필요 없을 수 있지만, 만약을 위해 남겨둡니다.
                />
            ) : (
                loginModalVisible && <Login onSuccess={handleLoginSuccess} onClose={() => setLoginModalVisible(false)} />
            )}
        </>
    );
}