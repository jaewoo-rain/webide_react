import React, { useState, useEffect, useRef } from "react";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import FileTabs from "./components/FileTabs";
import Editor from "./components/Editor";
import TerminalApp from "./components/Terminal";
import GuiOverlay from "./components/GuiOverlay";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";   // ✅ 추가

export default function App() {
  const [isGuiVisible, setGuiVisible] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const [code, setCode] = useState("");
  const [mode, setMode] = useState("cli");
  const [url, setUrl] = useState("");

  const termRef = useRef(null);      // DOM 컨테이너
  const xtermRef = useRef(null);     // xterm 인스턴스
  const fitRef = useRef(null);       // FitAddon 인스턴스
  const socketRef = useRef(null);

  // 드래그 리사이즈
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

  // xterm + WebSocket 초기화
  useEffect(() => {
    const term = new Terminal();
    const fitAddon = new FitAddon();
    term.loadAddon(fitAddon);

    term.open(termRef.current);
    fitAddon.fit();                // 최초 맞춤

    xtermRef.current = term;       // refs 저장
    fitRef.current = fitAddon;

    const onResize = () => fitAddon.fit();
    window.addEventListener("resize", onResize);

    const ws = new WebSocket("ws://localhost:8000/ws");
    socketRef.current = ws;

    ws.onopen = () => {
      term.write("\r\n🟢 연결됨. 명령을 입력하세요.\r\n");
      term.onData((data) => ws.send(data));
    };
    ws.onmessage = (e) => term.write(e.data);
    ws.onclose = () => term.write("\r\n🔴 연결 종료됨\r\n");

    return () => {
      window.removeEventListener("resize", onResize);
      try { ws.close(); } catch {}
      window.removeEventListener("resize", onResize);
      try { ws.close(); } catch {}
      term.dispose();
      xtermRef.current = null;
      fitRef.current = null;
      xtermRef.current = null;
      fitRef.current = null;
    };
  }, []);

  return (
    <div className="flex flex-col h-screen">
      <Header
        onRun={(u) => { setGuiVisible(true); setUrl(u); }}
        code={code}
        setMode={setMode}
        mode={mode}
        setUrl={setUrl}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="w-1 bg-[#333] sidebar-resize" />
        <div className="flex-1 flex flex-col min-h-0">
          <FileTabs />
          {/* Editor 영역 */}
          <Editor setCode={setCode} />
          {/* 리사이저 바 */}
          <div className="h-1 bg-[#333] cursor-row-resize" onMouseDown={startResizing} />
          {/* 터미널 래퍼: 픽셀 높이만 주고, 내부는 100% 채움 */}
          <div style={{ height: `${terminalHeight}px` }} className="overflow-hidden">
            <TerminalApp mode={mode} termRef={termRef} />
          </div>
        </div>
      </div>
      {isGuiVisible && <GuiOverlay url={url} onClose={() => setGuiVisible(false)} />}
    </div>
  );
}
