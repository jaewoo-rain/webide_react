import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '../store/userSlice';

export default function Main({ onStartCoding, onLoginClick }) {
  const { token, user: userInfo } = useSelector((state) => state.user);
  const isLoggedIn = !!token;
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(clearAuth());
  };

  const getRoleText = (role) => {
    switch (role) {
      case 'ROLE_FREE':
        return '일반회원';
      case 'ROLE_MEMBER':
        return '멤버십회원';
      case 'ROLE_ADMIN':
        return '관리자';
      default:
        return '';
    }
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen bg-gray-800 text-white">
      <div className="absolute top-4 right-4 flex items-center">
        {isLoggedIn ? (
          <>
            {userInfo && <span className="mr-4 text-lg">{getRoleText(userInfo.role)}</span>}
            <button
              onClick={handleLogout}
              className="px-4 py-2 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:shadow-outline"
            >
              로그아웃
            </button>
          </>
        ) : (
          <button
            onClick={onLoginClick}
            className="px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:shadow-outline"
          >
            로그인
          </button>
        )}
      </div>
      <h1 className="text-4xl font-bold mb-4">
        {isLoggedIn && userInfo ? `${userInfo.username}님, 환영합니다!` : '환영합니다!'}
      </h1>
      <p className="text-lg mb-8">Web-IDE에서 코딩을 시작해보세요.</p>
      <button
        onClick={onStartCoding}
        className="px-6 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:shadow-outline"
      >
        코딩 시작하기
      </button>
    </div>
  );
}
