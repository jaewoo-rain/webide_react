import React, { useEffect, useRef, useState } from "react";
import { Terminal } from "xterm";
import "xterm/css/xterm.css";

// import styles from "./Terminal.modul.css";

export default function TerminalApp(props) {
  const logs = [
    "$ python app.py",
    '* Serving Flask app "__name__"',
    "* Debug mode: on",
    "* Running on http://0.0.0.0:5000",
    "* Restarting with stat",
    "* Debugger is active!",
    "* Debugger PIN: 123-456-789",
    '127.0.0.1 - - [23/Jun/2025 14:32:15] "GET / HTTP/1.1" 200 -',
    '127.0.0.1 - - [23/Jun/2025 14:32:16] "GET /api/data HTTP/1.1" 200 -',
  ];

  let isClick = 0;

  ///////////////////////////////////////////////////
  // const termRef = useRef(null);
  // const socketRef = useRef(null);

  // useEffect(() => {
  //   const term = new Terminal();
  //   term.open(termRef.current);
  //   socketRef.current = new WebSocket("ws://localhost:8000/ws");

  //   socketRef.current.onopen = () => {
  //     term.write("🟢 연결됨. 명령을 입력하세요.\r\n");
  //     term.onData((data) => {
  //       socketRef.current.send(data);
  //     });
  //   };

  //   socketRef.current.onmessage = (event) => {
  //     term.write(event.data);
  //   };

  //   socketRef.current.onclose = () => {
  //     term.write("\r\n🔴 연결 종료됨\r\n");
  //   };

  //   return () => {
  //     socketRef.current.close();
  //     term.dispose();
  //   };
  // }, []);

  // 이건 필요없을거같음
  // const runCode = async () => {
  //   const res = await fetch("http://localhost:8000/run", {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ code }),
  //   });
  //   const data = await res.json();
  //   setMode(data.mode);
  //   if (data.mode === "gui") {
  //     setGuiUrl(data.url);
  //   }
  // };

  /////////////////////////////////////////////////

  return (
    // <div id="terminal" className="terminal h-48">
    <div id="terminal" className="terminal ">
      <div className="flex bg-[#2D2D2D] text-sm border-b border-[#333] ">
        <div
          className={`px-3 py-1 border-r border-[#333] ${
            isClick === 0 ? "bg-[#1E1E1E]" : ""
          } flex items-center hover:bg-[#37373D] rounded cursor-pointer`}
          onClick={() => {
            console.log("터미널 탭 클릭하기");
          }}
        >
          {/* isClick 0으로 교체 */}
          <span>터미널</span>
        </div>
        <div
          className={`px-3 py-1 border-r border-[#333] ${
            isClick === 1 ? "bg-[#1E1E1E]" : ""
          } flex items-center hover:bg-[#37373D] rounded cursor-pointer`}
          onClick={() => {
            console.log("문제 탭 클릭하기");
          }}
        >
          {/* isClick 1로 교체 */}
          <span>문제</span>
        </div>
        <div
          className={`px-3 py-1 border-r border-[#333] ${
            isClick === 2 ? "bg-[#1E1E1E]" : ""
          } flex items-center hover:bg-[#37373D] rounded cursor-pointer`}
          onClick={() => {
            console.log("출력 탭 클릭하기");
          }}
        >
          {" "}
          {/* isClick 2로 교체 */}
          <span>출력</span>
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center px-2">
          <button
            className="w-6 h-6 flex items-center justify-center text-[#D4D4D4] hover:bg-[#3C3C3C] rounded-button"
            onClick={() => {
              console.log("터미널 닫기");
            }}
          >
            <i className="ri-delete-bin-line"></i>
          </button>
          <button
            className="w-6 h-6 flex items-center justify-center text-[#D4D4D4] hover:bg-[#3C3C3C] rounded-button ml-1"
            onClick={() => {
              console.log("터미널 추가 창");
            }}
          >
            <i className="ri-add-line"></i>
          </button>
        </div>
      </div>
      {/* 터미널 창 내용 */}
      {/* <div className="p-2 font-mono text-sm h-[calc(100%-32px)] overflow-auto">
        {logs.map((line, i) => (
          <div
            key={i}
            className={
              line.startsWith("$")
                ? "text-[#858585]"
                : line.includes("http")
                ? "text-[#4EC9B0]"
                : "text-white"
            }
          >
            {line}
          </div>
        ))}
        <div className="text-white flex items-center">
          <span className="text-green-500 mr-1">$</span>
          <span className="animate-pulse">|</span>
        </div>
      </div> */}
      <h3>💻 CLI 출력</h3>
      <div
        ref={props.termRef}
        style={{
          width: "100%",
          height: 300,
          background: "#000",
          marginTop: 10,
          paddingLeft: 5,
          paddingTop: 5,
          // display: props.mode === "cli" ? "block" : "none",
        }}
      />{" "}
    </div>
  );
}
