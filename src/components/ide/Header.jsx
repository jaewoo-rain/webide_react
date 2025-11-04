import React from "react";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { resetCurrentContainer } from "../../store/containerSlice";
import { resetProject } from "../../store/projectSlice";

export default function Header({ onRun, setMode, sid, onSave, currentCid }) {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { projects } = useSelector((state) => state.container);
  const { tree, fileMap } = useSelector((state) => state.project);
  const currentPageId = useSelector((state) => state.openPage.current);
  const vncUrl = useSelector((state) => state.container.current?.vncUrl);
  const code = fileMap[currentPageId]?.content || "";

  const handleProjectChange = (e) => {
    const newFullCid = e.target.value;
    if (newFullCid !== currentCid) {
      dispatch(resetCurrentContainer());
      dispatch(resetProject());
      navigate(`/ide/${newFullCid}`);
    }
  };

  const runCode = async () => {
    if (!currentPageId) {
      alert("실행할 파일이 없습니다. 사이드바에서 파일을 선택해주세요.");
      return;
    }
    if (!sid) {
      alert("WS 세션이 아직 준비되지 않았습니다.");
      return;
    }
    if (!currentCid) {
      alert("컨테이너 ID를 찾을 수 없습니다.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          tree: tree,
          fileMap: fileMap,
          run_code: currentPageId,
          session_id: sid,
          container_id: currentCid,
        }),
      });

      if (!res.ok) {
        const errData = await res.json();
        console.error("RUN failed:", res.status, errData);
        alert(`실행 실패 (${res.status})`);
        return;
      }

      const data = await res.json();
      setMode(data.mode);

      if (data.mode === "gui") {
        if (!vncUrl) {
          alert("GUI URL이 없습니다. 컨테이너를 다시 열어 주세요.");
          return;
        }
        onRun(vncUrl);
      }
    } catch (e) {
      console.error(e);
      alert("실행 요청 중 오류가 발생했습니다.");
    }
  };

  return (
    <header className="bg-[#252526] h-12 flex items-center px-4 border-b border-[#333]">
      <div className="flex items-center">
        <span className="font-['Pacifico'] text-xl text-white mr-4">Web-IDE</span>
      </div>

      <div className="flex-1 flex justify-center">
        <div className="relative w-48">
          <select
            id="project-select"
            value={currentCid || ''}
            onChange={handleProjectChange}
            className="bg-[#3C3C3C] text-white w-full py-1.5 px-3 rounded-button border border-[#555] focus:outline-none focus:border-primary pr-8"
            disabled={projects.length === 0}
          >
            {projects.map((p) => (
              <option key={p.fullCid} value={p.fullCid}>
                {p.projectName || p.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={runCode}
          disabled={!sid || !currentCid}
          className="flex items-center bg-primary hover:bg-opacity-80 text-white px-3 py-1.5 rounded-button whitespace-nowrap disabled:opacity-50"
        >
          <div className="w-5 h-5 flex items-center justify-center mr-1">
            <i className="ri-play-fill" />
          </div>
          <span>실행</span>
        </button>

        <button
          onClick={onSave}
          disabled={!sid || !currentCid}
          className="flex items-center bg-[#3C3C3C] hover:bg-opacity-80 text-white px-3 py-1.5 rounded-button whitespace-nowrap disabled:opacity-50"
        >
          <div className="w-5 h-5 flex items-center justify-center mr-1">
            <i className="ri-save-line" />
          </div>
          <span>저장</span>
        </button>

        <button
          onClick={() => {
            dispatch(resetCurrentContainer());
            dispatch(resetProject());
            navigate('/');
          }}
          className="flex items-center bg-[#3C3C3C] hover:bg-opacity-80 text-white px-3 py-1.5 rounded-button whitespace-nowrap"
        >
          <span>목록으로</span>
        </button>
      </div>
    </header>
  );
}
