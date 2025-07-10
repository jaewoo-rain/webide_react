import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import FileTabs from "./components/FileTabs";
import Editor from "./components/Editor";
import TerminalApp from "./components/Terminal";
import GuiOverlay from "./components/GuiOverlay";
import { Terminal } from "xterm";

export default function App() {
  const [isGuiVisible, setGuiVisible] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200); // 초기 높이
  const [isResizing, setIsResizing] = useState(false);
  const [code, setCode] = useState(""); // 코드 작성 부분
  const [mode, setMode] = useState("cli"); // cli, gui모드 변경
  const [url, setUrl] = useState("");

  const termRef = useRef(null);
  const socketRef = useRef(null);

  // 스크롤 만들기
  const startResizing = () => setIsResizing(true);
  const stopResizing = () => setIsResizing(false);
  const handleMouseMove = (e) => {
    if (!isResizing) return;
    const newHeight = window.innerHeight - e.clientY;
    setTerminalHeight(Math.max(newHeight, 100));
  };

  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing]);

  // 소켓 연결
  useEffect(() => {
    const term = new Terminal();
    term.open(termRef.current);
    socketRef.current = new WebSocket("ws://localhost:8000/ws");

    socketRef.current.onopen = () => {
      term.write("\r\n🟢 연결됨. 명령을 입력하세요.\r\n");
      term.onData((data) => {
        socketRef.current.send(data);
      });
    };

    socketRef.current.onmessage = (event) => {
      term.write(event.data);
    };

    socketRef.current.onclose = () => {
      term.write("\r\n🔴 연결 종료됨\r\n");
    };

    return () => {
      socketRef.current.close();
      term.dispose();
    };
  }, []);

  ///////////////////////////////////// 근데 왜 이중으로 스크롤이 나옴?

  return (
    <div className="flex flex-col h-screen">
      <Header
        onRun={(url) => {
          setGuiVisible(true);
          setUrl(url);
        }}
        code={code}
        setMode={setMode}
        mode={mode}
        setUrl={setUrl}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="w-1 bg-[#333] sidebar-resize" />
        <div className="flex-1 flex flex-col">
          <FileTabs />
          Editor 위
          <Editor setCode={setCode} />
          Editor 아래
          <div
            className="h-1 bg-[#333] cursor-row-resize"
            onMouseDown={startResizing}
          />
          <div
            style={{ height: `${terminalHeight}px` }}
            className="overflow-hidden"
          >
            <TerminalApp mode={mode} termRef={termRef} />
          </div>
        </div>
      </div>
      {isGuiVisible && (
        <GuiOverlay url={url} onClose={() => setGuiVisible(false)} />
      )}
    </div>
  );
}
