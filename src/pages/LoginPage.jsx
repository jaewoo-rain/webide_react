
import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '../store/userSlice';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

export default function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const springBase = "http://localhost:8080";

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");

    try {
      // 스프링에서 JSON 로그인 받도록 필터 구현되어 있다는 전제
      const res = await axios.post(
        `${springBase}/login`,
        { username, password },
        {
          headers: { "Content-Type": "application/json" },
          withCredentials: true, // refresh 쿠키를 쓴다면 유지
        }
      );

      // 1) 헤더 또는 바디에서 access token 확보
      const authHeader =
        res.headers?.["authorization"] || res.headers?.["Authorization"];
      let accessFromHeader;
      if (authHeader && typeof authHeader === "string") {
        const parts = authHeader.split(" ");
        accessFromHeader = parts.length === 2 ? parts[1] : authHeader;
      }
      const accessFromBody =
        res.data?.access || res.data?.accessToken || res.data?.token;

      const accessToken = accessFromHeader || accessFromBody;
      if (!accessToken) {
        setError(
          "Access token을 응답에서 찾지 못했습니다. (Authorization 헤더/응답 바디 확인)"
        );
        return;
      }

      // 2) Redux에 저장
      dispatch(setToken(accessToken));

      // 3) 유저 정보 디코드(실패해도 로그인은 유지)
      try {
        const decoded = jwtDecode(accessToken);
        dispatch(
          setUser({ username: decoded.username, role: decoded.role })
        );
      } catch {
        dispatch(setUser({ username, role: undefined }));
      }

      // 4) 성공 시 메인으로 이동
      navigate("/");
    } catch (err) {
      console.error("Login error:", err?.response || err);
      setError("Login failed. Please check your credentials.");
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError("");
    setSuccessMessage("");
    try {
      await axios.post(`${springBase}/api/member`, { username, password });
      setSuccessMessage("Sign up successful! Please log in.");
      setIsSigningUp(false);
    } catch (err) {
      console.error("Sign up error:", err?.response || err);
      setError("Sign up failed. Please try again.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <div className="w-full max-w-md p-8 bg-gray-800 rounded-lg shadow-xl">
        <h2 className="mb-6 text-2xl font-bold text-white">
          {isSigningUp ? "Sign Up" : "Login"}
        </h2>

        {error && <p className="mb-4 text-red-500">{error}</p>}
        {successMessage && (
          <p className="mb-4 text-green-500">{successMessage}</p>
        )}

        <form onSubmit={isSigningUp ? handleSignUp : handleLogin}>
          <div className="mb-4">
            <label
              className="block mb-2 text-sm font-bold text-gray-300"
              htmlFor="username"
            >
              Username
            </label>
            <input
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 text-gray-200 bg-gray-700 border rounded focus:outline-none focus:ring"
              autoComplete="username"
              required
            />
          </div>

          <div className="mb-6">
            <label
              className="block mb-2 text-sm font-bold text-gray-300"
              htmlFor="password"
            >
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 text-gray-200 bg-gray-700 border rounded focus:outline-none focus:ring"
              autoComplete={isSigningUp ? "new-password" : "current-password"}
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700"
            >
              {isSigningUp ? "Sign Up" : "Sign In"}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsSigningUp((v) => !v);
                setError("");
                setSuccessMessage("");
              }}
              className="text-sm text-blue-400 hover:text-blue-300"
            >
              {isSigningUp ? "Back to Login" : "Create an account"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}