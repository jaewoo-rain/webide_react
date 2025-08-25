import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { changeName } from "../store/userSlice";

// 최상단 로고, select바, 실행 등
export default function Header({ onRun, setMode, mode, sid }) {
  //////////////////////////////////////////////

  // redux 이름 연습
  let state = useSelector((state)=>{ return state});
  let dispatch = useDispatch()

  let currentPageId = state.openPage.current;
  let code = state.project.fileMap[currentPageId].content;
  

  // 서버쪽에서 파일 뭉치 주면 파일들 분리해서 폴더 만들기 해야함
  const runCode = async () => {
    const res = await fetch("http://localhost:8000/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ 
        code: code, 
        tree: state.project.tree , 
        fileMap: state.project.fileMap, 
        run_code: currentPageId,
        session_id: sid,
      }),
    });
    
    const data = await res.json();
    setMode(data.mode);
    if (data.mode === "gui") {
      console.log("gui");
      onRun(data.url);
    } else {
      console.log("cli");
    }
  };
  //////////////////////////////////////////////////



  return (
    <header className="bg-[#252526] h-12 flex items-center px-4 border-b border-[#333]">
      <div className="flex items-center">
        <span className="font-['Pacifico'] text-xl text-white mr-4">
          Web-IDE {state.user.name}님 <button onClick={()=>{dispatch(changeName({newName: "jaewoo"}))}}>이름변경</button>
        </span>
      </div>
      {/* 옵션바... 프로젝트 선택하게 해야하나? */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-48">
          <select
            id="language-select"
            className="bg-[#3C3C3C] text-white w-full py-1.5 px-3 rounded-button border border-[#555] focus:outline-none focus:border-primary pr-8"
          >
            <option value="프로젝트1">프로젝트1</option>
            <option value="프로젝트2">프로젝트2</option>
            <option value="프로젝트3">프로젝트3</option>
            <option value="프로젝트4">프로젝트4</option>
            <option value="프로젝트1">프로젝트5</option>
            <option value="add">+</option>
          </select>
        </div>
      </div>

      {/* 실행, 중지, 옵션 부분 */}
      <div className="flex items-center space-x-2">
        <button
          // 실행 버튼 클릭 시 함수
          onClick={() => {
            console.log("실행버튼 클릭");
            runCode();
          }}
          disabled={!sid}
          className="flex items-center bg-primary hover:bg-opacity-80 text-white px-3 py-1.5 rounded-button whitespace-nowrap"
        >
          <div className="w-5 h-5 flex items-center justify-center mr-1">
            <i className="ri-play-fill"></i>
          </div>
          <span>실행</span>
        </button>
        <button
          onClick={() => {
            console.log("중지버튼 클릭");
          }}
          className="flex items-center bg-[#3C3C3C] hover:bg-opacity-80 text-white px-3 py-1.5 rounded-button whitespace-nowrap"
        >
          <div className="w-5 h-5 flex items-center justify-center mr-1">
            <i className="ri-stop-fill"></i>
          </div>
          <span>중지</span>
        </button>
        <button
          onClick={() => {
            console.log("옵션 버튼 클릭");
          }}
          className="w-8 h-8 flex items-center justify-center bg-[#3C3C3C] hover:bg-opacity-80 text-white rounded-button"
        >
          <i className="ri-settings-3-line"></i>
        </button>
      </div>
    </header>
  );
}
