import React from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

export default function Header({ onRun, setMode, sid, onSave }) {
  const navigate = useNavigate();

  // 🔹 프로젝트/컨테이너/파일 상태
  const { tree, fileMap } = useSelector((state) => state.project);
  const currentPageId = useSelector((state) => state.openPage.current);
  const currentContainer = useSelector((state) => state.container.current);

  const cid = currentContainer?.cid;        // 풀 컨테이너 ID
  const vncUrl = currentContainer?.vncUrl;  // GUI 열 때 사용

  // 현재 페이지의 코드 내용은 fileMap과 currentPageId를 조합하여 가져옵니다.
  const code = fileMap[currentPageId]?.content || "";

  const runCode = async () => {
    // ✅ 2. 실행 파일 유효성 검사: API 호출 전에 실행할 파일이 있는지 확인합니다.
    if (!currentPageId) {
      alert("프로젝트가 비어있습니다.");
      return; // API 호출을 막습니다.
    }

    if (!sid) {
      alert("WS 세션이 아직 준비되지 않았습니다.");
      return;
    }
    if (!cid) {
      alert("컨테이너 ID를 찾을 수 없습니다.");
      return;
    }

    try {
      const res = await fetch("http://localhost:8000/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code,
          tree: tree,         // 최적화된 selector에서 가져온 값 사용
          fileMap: fileMap,   // 최적화된 selector에서 가져온 값 사용
          run_code: currentPageId,
          session_id: sid,     // WS에서 받은 sid
          container_id: cid,   // ✅ 반드시 함께 전송
        }),
      });

      if (!res.ok) {
        const errData = await res.json(); // 👈 .text() 대신 .json()으로 받아 상세 에러 확인
        console.error("RUN failed:", res.status, errData);
        alert(`실행 실패 (${res.status})`);
        return;
      }

      const data = await res.json(); // { mode: "gui" | "cli" }
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
            id="language-select"
            className="bg-[#3C3C3C] text-white w-full py-1.5 px-3 rounded-button border border-[#555] focus:outline-none focus:border-primary pr-8"
          >
            <option>프로젝트1</option>
            <option>프로젝트2</option>
            <option>프로젝트3</option>
          </select>
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <button
          onClick={runCode}
          disabled={!sid || !cid}
          className="flex items-center bg-primary hover:bg-opacity-80 text-white px-3 py-1.5 rounded-button whitespace-nowrap disabled:opacity-50"
        >
          <div className="w-5 h-5 flex items-center justify-center mr-1">
            <i className="ri-play-fill" />
          </div>
          <span>실행</span>
        </button>

        <button
          onClick={onSave}
          disabled={!sid || !cid}
          className="flex items-center bg-[#3C3C3C] hover:bg-opacity-80 text-white px-3 py-1.5 rounded-button whitespace-nowrap disabled:opacity-50"
        >
          <div className="w-5 h-5 flex items-center justify-center mr-1">
            <i className="ri-save-line" />
          </div>
          <span>저장</span>
        </button>

        <button
          onClick={() => navigate(-1)}
          className="flex items-center bg-[#3C3C3C] hover:bg-opacity-80 text-white px-3 py-1.5 rounded-button whitespace-nowrap"
        >
          <span>목록으로</span>
        </button>
      </div>
    </header>
  );
}
