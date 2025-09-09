import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '../../store/userSlice';
import axios from "axios";

export default function Main({ onStartCoding, onLoginClick }) {
  const { token, user: userInfo } = useSelector((state) => state.user);
  const isLoggedIn = !!token;
  const dispatch = useDispatch();

  const handleCreateContainer = async () => {
    try {
      // CreateContainerRequest 모델에 맞춰 데이터 구성
      const requestData = {
        image: "ide-python", // 예시 값, 실제로는 사용자 입력 등에서 가져와야 함
        cmd: [], // 예시 값
        env: {}, // 예시 값
        // 필요한 추가 옵션들: ports, volumes 등
      };

      const response = await axios.post('http://localhost:8000/containers', requestData);
      if (response.status === 201) {
        // CreateContainerResponse 모델에 맞춰 응답 데이터 처리
        const { id, name, image, owner, role, limited_by_quota } = response.data;
        alert(`컨테이너 생성 성공!\n이름: ${name}\nID: ${id}\n이미지: ${image}\n소유자: ${owner}\n역할: ${role}\n할당량 제한: ${limited_by_quota}`);
        // TODO: 컨테이너 목록을 다시 불러오는 로직 추가
      }
    } catch (error) {
      console.error("컨테이너 생성 실패:", error);
      if (error.response) {
        alert(`오류: ${error.response.data.detail}`);
      } else {
        alert("컨테이너를 생성하는 중 오류가 발생했습니다.");
      }
    }
  };

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
      <button
        onClick={handleCreateContainer}
        className="px-6 py-3 font-bold text-white bg-green-600 rounded-lg hover:bg-green-700 focus:outline-none focus:shadow-outline mt-4"
      >
        환경 생성하기
      </button>
    </div>
  );
}
