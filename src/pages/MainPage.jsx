import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import Main from "../components/login/Main";

export default function MainPage() {
    const token = useSelector((s) => s.user.token);
    const isLoggedIn = !!token;
    const navigate = useNavigate();

    useEffect(() => {
        if (!isLoggedIn) navigate("/login", { replace: true });
    }, [isLoggedIn, navigate]);

    if (!isLoggedIn) return null;

    return <Main onLoginClick={() => navigate("/login")} />;
}
