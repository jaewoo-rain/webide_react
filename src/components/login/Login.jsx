
import React, { useState } from 'react';
import axios from 'axios';
import { useDispatch } from 'react-redux';
import { setToken, setUser } from '../../store/userSlice';
import { jwtDecode } from 'jwt-decode';

export default function Login({ onSuccess, onClose }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isSigningUp, setIsSigningUp] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      const response = await axios.post(
        'http://localhost:8080/login',
        { username, password },
        { withCredentials: true } // refresh 쿠키 받으려면 필요
      );

      const authHeader = response.headers?.['authorization'] || response.headers?.['Authorization'];
      let accessTokenFromHeader = undefined;
      if (authHeader && typeof authHeader === 'string') {
        const parts = authHeader.split(' ');
        accessTokenFromHeader = parts.length === 2 ? parts[1] : authHeader;
      }

      const accessTokenFromBody = response.data?.access || response.data?.accessToken || response.data?.token;
      const accessToken = accessTokenFromHeader || accessTokenFromBody;

      if (!accessToken) {
        console.error('Headers:', response.headers, 'Data:', response.data);
        setError('Access token을 응답에서 찾지 못했습니다. (Authorization 헤더/응답 바디 확인 필요)');
        return;
      }

      dispatch(setToken(accessToken));

      try {
        const decoded = jwtDecode(accessToken);
        dispatch(setUser({ username: decoded.username, role: decoded.role }));
      } catch (decodeErr) {
        console.warn('JWT decode 실패:', decodeErr);
        dispatch(setUser({ username, role: undefined }));
      }

      onSuccess();
    } catch (err) {
      console.error('Login error:', err);
      setError('Login failed. Please check your credentials.');
    }
  };

  const handleSignUp = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    try {
      await axios.post('http://localhost:8080/api/member', { username, password });
      setSuccessMessage('Sign up successful! Please log in.');
      setIsSigningUp(false);
    } catch (err) {
      console.error('Sign up error:', err);
      setError('Sign up failed. Please try again.');
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
        <h2 className="mb-6 text-2xl font-bold text-white">{isSigningUp ? 'Sign Up' : 'Login'}</h2>
        {error && <p className="mb-4 text-red-500">{error}</p>}
        {successMessage && <p className="mb-4 text-green-500">{successMessage}</p>}
        <form onSubmit={isSigningUp ? handleSignUp : handleLogin}>
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
              {isSigningUp ? 'Sign Up' : 'Sign In'}
            </button>
            <button
              type="button"
              onClick={() => {
                setIsSigningUp(!isSigningUp);
                setError('');
                setSuccessMessage('');
              }}
              className="inline-block align-baseline font-bold text-sm text-blue-500 hover:text-blue-800"
            >
              {isSigningUp ? 'Back to Login' : 'Sign Up'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
