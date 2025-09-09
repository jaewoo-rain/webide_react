import React from "react";
import "xterm/css/xterm.css";

export default function TerminalApp(props) {
  const isClick = 0;

  return (
    // 부모가 픽셀 높이를 주니 여기선 그걸 100%로 채움
    <div id="terminal" className="h-full w-full bg-black flex flex-col">
      {/* 상단 탭바 */}
      <div className="flex bg-[#2D2D2D] text-sm border-b border-[#333] shrink-0">
        <div className={`px-3 py-1 border-r border-[#333] ${isClick === 0 ? "bg-[#1E1E1E]" : ""} hover:bg-[#37373D] cursor-pointer`}>
          <span>터미널</span>
        </div>
        <div className={`px-3 py-1 border-r border-[#333] ${isClick === 1 ? "bg-[#1E1E1E]" : ""} hover:bg-[#37373D] cursor-pointer`}>
          <span>문제</span>
        </div>
        <div className={`px-3 py-1 border-r border-[#333] ${isClick === 2 ? "bg-[#1E1E1E]" : ""} hover:bg-[#37373D] cursor-pointer`}>
          <span>출력</span>
        </div>
        <div className="flex-1" />
        <div className="flex items-center px-2 gap-1">
          <button className="w-6 h-6 hover:bg-[#3C3C3C] rounded">🗑️</button>
          <button className="w-6 h-6 hover:bg-[#3C3C3C] rounded">＋</button>
        </div>
      </div>

      {/* 터미널 영역: 헤더 제외 전체 차지 */}
      <div
        ref={props.termRef}
        className="flex-1 min-h-0 w-full overflow-auto"
        style={{
          background: "#000",
          paddingLeft: 15,
          paddingTop: 0,
        }}
      />
    </div>
  );
}
