import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";
import FileTabs from "./components/FileTabs";
import Editor from "./components/Editor";
import TerminalApp from "./components/Terminal";
import GuiOverlay from "./components/GuiOverlay";
import Login from "./components/Login";
import Main from "./components/Main";
import { Terminal } from "xterm";
import { setToken, setUser } from "./store/userSlice";

export default function App() {
  const { isLoggedIn } = useSelector((state) => state.user);
  const [ideVisible, setIdeVisible] = useState(false);
  const [loginModalVisible, setLoginModalVisible] = useState(false);
  const [isGuiVisible, setGuiVisible] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isResizing, setIsResizing] = useState(false);
  const [code, setCode] = useState("");
  const [mode, setMode] = useState("cli");
  const [url, setUrl] = useState("");

  const termRef = useRef(null);
  const socketRef = useRef(null);

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

  useEffect(() => {
    if (!isLoggedIn || !ideVisible) return;

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
      if (socketRef.current) {
        socketRef.current.close();
      }
      term.dispose();
    };
  }, [isLoggedIn, ideVisible]);

  const handleLoginSuccess = () => {
    setLoginModalVisible(false);
  };

  if (!ideVisible) {
    return (
      <>
        <Main 
          onStartCoding={() => setIdeVisible(true)} 
          onLoginClick={() => setLoginModalVisible(true)} 
        />
        {loginModalVisible && <Login onSuccess={handleLoginSuccess} onClose={() => setLoginModalVisible(false)} />}
      </>
    );
  }

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
          <Editor setCode={setCode} />
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
