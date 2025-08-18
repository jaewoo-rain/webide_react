
import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '../store/userSlice';
import { jwtDecode } from 'jwt-decode';

export default function Login({ onSuccess, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
  e.preventDefault();
  setError('');

    try {
      const response = await axios.post(
        'http://localhost:8080/login',
        { username, password },
        { withCredentials: true } // refresh 쿠키 받으려면 필요
      );

      // 디버깅용: 실제로 뭐가 들어오는지 확인
      console.log('headers keys:', Object.keys(response.headers || {}));
      console.log('raw authorization:', response.headers?.['authorization']);
      console.log('data:', response.data);

      // 1) Authorization 헤더에서 access token 추출
      const authHeader = response.headers?.['authorization'] || response.headers?.['Authorization'];
      let accessTokenFromHeader = undefined;
      if (authHeader && typeof authHeader === 'string') {
        // "Bearer <token>" 형태 처리
        const parts = authHeader.split(' ');
        accessTokenFromHeader = parts.length === 2 ? parts[1] : authHeader;
      }

      // 2) 바디에 오는 경우 대비 (현재 응답은 body가 비어있지만 방어코드)
      const accessTokenFromBody = response.data?.access || response.data?.accessToken || response.data?.token;

      // 3) 최종 access token 결정
      const accessToken = accessTokenFromHeader || accessTokenFromBody;

      if (!accessToken) {
        console.error('Headers:', response.headers, 'Data:', response.data);
        setError('Access token을 응답에서 찾지 못했습니다. (Authorization 헤더/응답 바디 확인 필요)');
        return;
      }

      // 4) Redux 저장 (여기서 localStorage에 undefined가 들어갔던 원인 해결)
      dispatch(setToken(accessToken));

      // 5) 토큰 디코딩 (실패 대비)
      try {
        const decoded = jwtDecode(accessToken);
        dispatch(setUser({ username: decoded.username, role: decoded.role }));
      } catch (decodeErr) {
        console.warn('JWT decode 실패:', decodeErr);
        // 디코딩 실패해도 로그인은 성공시킬지 정책에 따라 결정
        dispatch(setUser({ username, role: undefined }));
      }

      onSuccess();
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your credentials.');
    }
  };


  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="relative p-8 bg-gray-900 rounded-lg shadow-xl">
        <button 
          onClick={onClose} 
          className="absolute top-2 right-2 text-gray-400 hover:text-white"
        >
          &times;
        </button>
        <h2 className="mb-6 text-2xl font-bold text-white">Login</h2>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        <form onSubmit={handleLogin}>
          <div className="mb-4">
            <label className="block mb-2 text-sm font-bold text-gray-400" htmlFor="username">
              Username
            </label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 leading-tight text-gray-200 bg-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="mb-6">
            <label className="block mb-2 text-sm font-bold text-gray-400" htmlFor="password">
              Password
            </label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 mb-3 leading-tight text-gray-200 bg-gray-700 border rounded shadow appearance-none focus:outline-none focus:shadow-outline"
            />
          </div>
          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-blue-600 rounded hover:bg-blue-700 focus:outline-none focus:shadow-outline"
            >
              Sign In
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
