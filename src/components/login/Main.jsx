
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { clearAuth } from '../../store/userSlice';

// 임시 프로젝트 데이터
const dummyProjects = [
  { id: 1, name: 'My First Project', language: 'Python', lastModified: '2024-07-30' },
  { id: 2, name: 'Web Server', language: 'JavaScript', lastModified: '2024-07-29' },
  { id: 3, name: 'Data Analysis', language: 'Python', lastModified: '2024-07-28' },
  { id: 4, name: 'React App', language: 'JavaScript', lastModified: '2024-07-27' },
];

function CreateProjectModal({ onClose, onSubmit }) {
  const [projectName, setProjectName] = useState('');
  const [image, setImage] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ projectName, image: image || 'ide-python' });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
      <div className="bg-gray-700 p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-white">새 프로젝트 생성</h2>
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="projectName" className="block text-white text-sm font-bold mb-2">
              프로젝트 이름
            </label>
            <input
              type="text"
              id="projectName"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-3 py-2 text-white bg-gray-800 rounded-lg focus:outline-none focus:shadow-outline"
              required
            />
          </div>
          <div className="mb-6">
            <label htmlFor="image" className="block text-white text-sm font-bold mb-2">
              사용 언어
            </label>
            <input
              type="text"
              id="image"
              value={image}
              onChange={(e) => setImage(e.target.value)}
              className="w-full px-3 py-2 text-white bg-gray-800 rounded-lg focus:outline-none focus:shadow-outline"
              placeholder="예: ide-react (미입력 시 ide-python)"
            />
          </div>
          <div className="flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 mr-2 font-bold text-gray-300 bg-gray-600 rounded-lg hover:bg-gray-500 focus:outline-none focus:shadow-outline"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:shadow-outline"
            >
              생성
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}


export default function Main({ onStartCoding, onLoginClick }) {
  const { token, user: userInfo } = useSelector((state) => state.user);
  const isLoggedIn = !!token;
  const dispatch = useDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLogout = () => {
    dispatch(clearAuth());
  };

  const handleCreateProject = async ({ projectName, image }) => {
    try {
      const response = await fetch('http://localhost:8000/containers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ projectName, image }),
      });

      if (response.ok) {
        alert('프로젝트가 성공적으로 생성되었습니다.');
        setIsModalOpen(false);
        // Optionally, refresh the project list
      } else {
        const errorData = await response.json();
        alert(`프로젝트 생성 실패: ${errorData.message}`);
      }
    } catch (error) {
      console.error('프로젝트 생성 중 오류 발생:', error);
      alert('프로젝트 생성 중 오류가 발생했습니다.');
    }
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
    <div className="flex flex-col items-center min-h-screen bg-gray-800 text-white p-4">
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

      <div className="w-full max-w-5xl mt-24 text-center">
        <h1 className="text-5xl font-bold mb-12">
          {isLoggedIn && userInfo ? `${userInfo.username}님, 환영합니다!` : '환영합니다!'}
        </h1>

        <div className="flex justify-between items-center mb-6 px-2">
            <h2 className="text-3xl font-bold">내 프로젝트 목록</h2>
            <button
                onClick={() => setIsModalOpen(true)}
                className="px-6 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700 focus:outline-none focus:shadow-outline"
            >
                프로젝트 생성하기
            </button>
        </div>

        {isModalOpen && (
          <CreateProjectModal
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleCreateProject}
          />
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {dummyProjects.map((project) => (
            <div key={project.id} 
                 className="bg-gray-700 p-6 rounded-lg shadow-lg hover:bg-gray-600 transition-colors duration-300 cursor-pointer flex flex-col justify-between text-left"
                 onClick={onStartCoding}
            >
              <div>
                <h3 className="text-2xl font-bold mb-2">{project.name}</h3>
                <span className="inline-block bg-gray-500 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4">
                  {project.language}
                </span>
              </div>
              <div className="text-sm text-gray-400 mt-4">
                <p>마지막 수정: {project.lastModified}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
