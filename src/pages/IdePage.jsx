import React, { useState, useEffect, useRef } from "react";
import { useSelector, useDispatch } from "react-redux";
import Header from "../components/ide/Header";
import Sidebar from "../components/ide/Sidebar";
import FileTabs from "../components/ide/FileTabs";
import Editor from "../components/ide/Editor";
import TerminalApp from "../components/ide/Terminal";
import GuiOverlay from "../components/ide/GuiOverlay";
import { Terminal } from "xterm";
import { FitAddon } from "xterm-addon-fit";
import { useNavigate } from "react-router-dom";
import { setContainer, updateContainerUrls } from "../store/containerSlice";

export default function IdePage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();

    const token = useSelector((s) => s.user.token);
    const isLoggedIn = !!token;
    const current = useSelector((s) => s.container.current); // {cid, wsUrl, vncUrl, ...}

    const [sid, setSid] = useState(null);
    const [isGuiVisible, setGuiVisible] = useState(false);
    const [terminalHeight, setTerminalHeight] = useState(400);
    const [isResizing, setIsResizing] = useState(false);
    const [mode, setMode] = useState("cli");
    const [url, setUrl] = useState("");

    const termRef = useRef(null);
    const xtermRef = useRef(null);
    const fitRef = useRef(null);
    const socketRef = useRef(null);

    const startResizing = () => setIsResizing(true);
    const stopResizing = () => setIsResizing(false);
    const handleMouseMove = (e) => {
        if (!isResizing) return;
        const newHeight = window.innerHeight - e.clientY;
        setTerminalHeight(Math.max(newHeight, 100));
    };

    useEffect(() => {
        if (fitRef.current) fitRef.current.fit();
    }, [terminalHeight]);

    useEffect(() => {
        window.addEventListener("mousemove", handleMouseMove);
        window.addEventListener("mouseup", stopResizing);
        return () => {
            window.removeEventListener("mousemove", handleMouseMove);
            window.removeEventListener("mouseup", stopResizing);
        };
    }, [isResizing]);

    // 로그인/접속 정보 체크
    useEffect(() => {
        if (!isLoggedIn) {
            navigate("/login", { replace: true });
            return;
        }
        if (!current) {
            // 새로고침 복구: lastCid 기반으로 ws_url 재발급
            const savedCid = sessionStorage.getItem("lastCid");
            if (!savedCid) {
                navigate("/", { replace: true });
                return;
            }
            (async () => {
                try {
                    const res = await fetch(`http://localhost:8000/containers/${savedCid}/urls`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) throw new Error(await res.text());
                    const data = await res.json(); // { ws_url, vnc_url, cid }
                    dispatch(setContainer({
                        cid: data.cid,
                        wsUrl: data.ws_url,
                        vncUrl: data.vnc_url,
                    }));
                } catch (e) {
                    console.error("복구 실패:", e);
                    navigate("/", { replace: true });
                }
            })();
        }
    }, [isLoggedIn, current, token, navigate, dispatch]);

    // xterm + WebSocket 초기화
    useEffect(() => {
        if (!isLoggedIn || !current?.wsUrl) return;

        const term = new Terminal({
            fontFamily: 'monospace, "MesloLGS NF", "Fira Code", "Consolas"',
            fontSize: 14,
            cursorBlink: true,
            scrollback: 5000,
            convertEol: true,
            disableStdin: false,
            allowProposedApi: true,
        });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);

        term.open(termRef.current);
        fitAddon.fit();
        term.write("\r\n🔧 xterm ready. Connecting...\r\n");
        term.focus();

        xtermRef.current = term;
        fitRef.current = fitAddon;

        const onResize = () => { try { fitAddon.fit(); } catch { } };
        window.addEventListener("resize", onResize);

        const ws = new WebSocket(current.wsUrl); // ws://.../ws?cid=...&sid=...
        socketRef.current = ws;

        ws.onopen = () => {
            term.write("🟢 WebSocket connected.\r\n");
            term.onData((data) => ws.send(data));
        };

        ws.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data);
                if (msg?.sid) {
                    setSid(msg.sid);
                    term.write(`(session: ${msg.sid})\r\n`);
                    return;
                }
            } catch { }
            term.write(e.data);
        };

        ws.onerror = (err) => {
            console.error("[WS] error:", err);
            term.write("\r\n🔴 WebSocket error. Check server logs / wsUrl.\r\n");
        };

        ws.onclose = async (ev) => {
            term.write(`\r\n🔴 WebSocket closed (code=${ev.code}).\r\n`);
            // 연결이 끊기면 최신 ws_url 재발급해서 갱신(선택)
            if (current?.cid) {
                try {
                    const res = await fetch(`http://localhost:8000/containers/${current.cid}/urls`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (res.ok) {
                        const data = await res.json();
                        dispatch(updateContainerUrls({ wsUrl: data.ws_url, vncUrl: data.vnc_url }));
                    }
                } catch { }
            }
        };

        return () => {
            window.removeEventListener("resize", onResize);
            try { ws.close(); } catch { }
            term.dispose();
            xtermRef.current = null;
            fitRef.current = null;
        };
    }, [isLoggedIn, current?.wsUrl, current?.cid, token, dispatch]);

    return (
        <div className="flex flex-col h-screen">
            <Header
                sid={sid}
                setMode={setMode}
                onRun={(u) => { setGuiVisible(true); setUrl(u); }}
            />
            <div className="flex flex-1 overflow-hidden">
                <div className="w-64 shrink-0">
                    <Sidebar />
                </div>

                <div className="w-1 bg-[#333]" />
                <div className="flex-1 flex flex-col min-h-0">
                    <FileTabs />
                    <Editor />
                    <div className="h-1 bg-[#333] cursor-row-resize" onMouseDown={() => setIsResizing(true)} />
                    <div style={{ height: `${terminalHeight}px` }} className="overflow-hidden">
                        <TerminalApp termRef={termRef} />
                    </div>

                    {!current?.wsUrl && (
                        <div className="p-2 text-sm text-yellow-300 bg-yellow-900">
                            WebSocket URL이 없어 연결을 대기 중입니다. 잠시만 기다려 주세요…
                        </div>
                    )}
                </div>
            </div>

            {isGuiVisible && <GuiOverlay url={url} onClose={() => setGuiVisible(false)} />}
            {isResizing && <div className="fixed inset-0 cursor-row-resize" onMouseUp={stopResizing} onMouseLeave={stopResizing} />}
        </div>
    );
}
