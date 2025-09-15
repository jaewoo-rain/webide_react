import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { clearAuth } from "../../store/userSlice";
import { setProjects, setContainer } from "../../store/containerSlice";
import CreateProjectModal from "./CreateProjectModal";
import { useNavigate } from "react-router-dom";

export default function Main({ onLoginClick }) {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { token, user: userInfo } = useSelector((s) => s.user);
  const projects = useSelector((s) => s.container.projects);
  const isLoggedIn = !!token;

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const apiBase = "http://localhost:8000";

  // 목록 로드
  const loadProjects = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await axios.get(`${apiBase}/containers/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      dispatch(setProjects(res.data || []));
    } catch (err) {
      console.error("프로젝트 목록 실패:", err?.response || err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProjects();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  // 기존 컨테이너 재접속
  const openExisting = async (p) => {
    try {
      if (!token) return alert("로그인이 필요합니다.");
      const cid = p.containerName || p.id || p.container_id || p.name;
      if (!cid) return alert("컨테이너 ID를 찾을 수 없습니다.");
      const res = await axios.get(`${apiBase}/containers/${cid}/urls`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const { ws_url, vnc_url, cid: fullCid } = res.data;
      dispatch(setContainer({
        cid: fullCid,
        wsUrl: ws_url,
        vncUrl: vnc_url,
        name: p.projectName || p.containerName || p.name,
        image: p.imageName || p.image,
        projectName: p.projectName,
      }));
      navigate("/ide"); // 파라미터 대신 리덕스로
    } catch (e) {
      console.error("재접속 실패:", e?.response || e);
      alert(e?.response?.data?.detail || "재접속 중 오류가 발생했습니다.");
    }
  };

  // 새 컨테이너 생성
  const handleCreateProject = async ({ projectName, image }) => {
    try {
      if (!token) return alert("로그인이 필요합니다.");
      const body = { projectName, image: image?.trim() || "webide-vnc" };
      const res = await axios.post(`${apiBase}/containers`, body, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.status === 201) {
        const { ws_url, vnc_url, id, name, image, projectName } = res.data;
        // 생성 직후 바로 접속 상태 저장
        dispatch(setContainer({
          cid: id,                // 12자리일 수도 있음 → IDE에서 풀ID로 재발급 받음
          wsUrl: ws_url,
          vncUrl: vnc_url,
          name,
          image,
          projectName,
        }));
        setIsModalOpen(false);
        await loadProjects();
        navigate("/ide");
      }
    } catch (error) {
      console.error("프로젝트 생성 실패:", error?.response || error);
      alert(error?.response?.data?.detail || "생성 중 오류가 발생했습니다.");
    }
  };

  const handleLogout = () => dispatch(clearAuth());

  const getRoleText = (role) => ({
    ROLE_FREE: "일반회원",
    ROLE_MEMBER: "멤버십회원",
    ROLE_ADMIN: "관리자",
  }[role] || "");

  return (
    <div className="flex flex-col items-center min-h-screen bg-gray-800 text-white p-4">
      <div className="absolute top-4 right-4 flex items-center">
        {isLoggedIn ? (
          <>
            {userInfo && <span className="mr-4 text-lg">{getRoleText(userInfo.role)}</span>}
            <button onClick={handleLogout} className="px-4 py-2 font-bold text-white bg-red-600 rounded-lg hover:bg-red-700">로그아웃</button>
          </>
        ) : (
          <button onClick={onLoginClick} className="px-4 py-2 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700">로그인</button>
        )}
      </div>

      <div className="w-full max-w-5xl mt-24 text-center">
        <h1 className="text-5xl font-bold mb-12">
          {isLoggedIn && userInfo ? `${userInfo.username}님, 환영합니다!` : "환영합니다!"}
        </h1>

        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-3xl font-bold">내 프로젝트 목록</h2>
          {isLoggedIn && (
            <button onClick={() => setIsModalOpen(true)} className="px-6 py-3 font-bold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
              프로젝트 생성하기
            </button>
          )}
        </div>

        {isLoggedIn && isModalOpen && (
          <CreateProjectModal onClose={() => setIsModalOpen(false)} onSubmit={handleCreateProject} />
        )}

        {loading ? (
          <p className="text-gray-400">불러오는 중...</p>
        ) : (projects || []).length === 0 ? (
          <p className="text-gray-400">프로젝트가 없습니다.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {projects.map((p) => (
              <div
                key={p.containerId || p.containerName || p.name}
                className="bg-gray-700 p-6 rounded-lg shadow-lg hover:bg-gray-600 transition-colors duration-300 cursor-pointer flex flex-col justify-between text-left"
                onClick={() => openExisting(p)}
              >
                <div>
                  <h3 className="text-2xl font-bold mb-2">{p.projectName || p.containerName || p.name}</h3>
                  <span className="inline-block bg-gray-500 text-white text-sm font-semibold px-3 py-1 rounded-full mb-4">
                    {p.language || p.imageName || p.image || "-"}
                  </span>
                </div>
                <div className="text-sm text-gray-400 mt-4">
                  <p>업데이트: {p.updatedAt ? new Date(p.updatedAt).toLocaleString() : "-"}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
