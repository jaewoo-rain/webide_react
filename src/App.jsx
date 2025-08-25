import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import FileTabs from "./components/FileTabs";
import Editor from "./components/Editor";
import TerminalApp from "./components/Terminal";
import GuiOverlay from "./components/GuiOverlay";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";

export default function App() {
  const [isGuiVisible, setGuiVisible] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(400); // 초기 높이
  const [isResizing, setIsResizing] = useState(false);
  const [code, setCode] = useState(""); // 코드 작성 부분
  const [mode, setMode] = useState("cli"); // cli, gui모드 변경
  const [url, setUrl] = useState("");

  const termRef = useRef(null);
  const socketRef = useRef(null);
  const xtermRef = useRef(null);     // xterm 인스턴스
  const fitRef = useRef(null);       // FitAddon 인스턴스

  // 드래그 리사이즈
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

  // xterm + 소켓 초기화
  useEffect(() => {
    const term = new Terminal();
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(termRef.current);
    fitAddon.fit();

    xtermRef.current = term;
    fitRef.current = fitAddon;

    const onResize = () => fitAddon.fit();
    window.addEventListener("resize", onResize);

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
      window.removeEventListener("resize", onResize);
      try { ws.close(); } catch {}
      term.dispose();
      xtermRef.current = null;
      fitRef.current = null;
    };
  }, []);

  useEffect(() => {
    fitRef.current?.fit();
  }, [terminalHeight]);

  /////////////////////////////////////

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
