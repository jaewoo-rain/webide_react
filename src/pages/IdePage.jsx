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
import { useNavigate, useParams } from "react-router-dom";
import { setContainer, updateContainerUrls, loadProjects, resetCurrentContainer } from "../store/containerSlice";
import { initializeProject, resetProject } from '../store/projectSlice';

export default function IdePage() {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const { cid: cidFromUrl } = useParams();

    const token = useSelector((s) => s.user.token);
    const isLoggedIn = !!token;
    const { current, projects } = useSelector((s) => s.container);
    const { isLoaded } = useSelector((state) => state.project);

    const [sid, setSid] = useState(null);
    const [isGuiVisible, setGuiVisible] = useState(false);
    const [terminalHeight, setTerminalHeight] = useState(400);
    const [isResizing, setIsResizing] = useState(false);
    const [mode, setMode] = useState("cli");
    const [url, setUrl] = useState("");

    const termRef = useRef(null);
    const fitRef = useRef(null);

    // Load projects if not already loaded
    useEffect(() => {
        if (isLoggedIn && projects.length === 0) {
            dispatch(loadProjects());
        }
    }, [isLoggedIn, projects.length, dispatch]);

    // Set container based on URL
    useEffect(() => {
        if (!isLoggedIn || !cidFromUrl) return;

        // If current container in state doesn't match the one in the URL, reset and fetch.
        if (current?.cid !== cidFromUrl) {
            // Reset states for the new project
            dispatch(resetCurrentContainer());
            dispatch(resetProject());

            (async () => {
                try {
                    const res = await fetch(`http://localhost:8000/containers/${cidFromUrl}/urls`, {
                        headers: { Authorization: `Bearer ${token}` },
                    });
                    if (!res.ok) throw new Error(await res.text());
                    const data = await res.json();

                    dispatch(setContainer({
                        cid: data.cid,
                        wsUrl: data.ws_url,
                        vncUrl: data.vnc_url,
                    }));
                } catch (e) {
                    console.error("컨테이너 정보 로드 실패:", e);
                    alert("프로젝트를 불러오는 데 실패했습니다. 목록으로 돌아갑니다.");
                    navigate("/");
                }
            })();
        }
    }, [isLoggedIn, cidFromUrl, current, token, navigate, dispatch]);

    // Initialize project files when container is set
    useEffect(() => {
        if (current?.cid && token && !isLoaded) {
            dispatch(initializeProject({ cid: current.cid, token }));
        }
    }, [current?.cid, token, isLoaded, dispatch]);


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


    // xterm + WebSocket 초기화
    useEffect(() => {
        if (!current?.wsUrl) return;

        let term = new Terminal({
            fontFamily: 'monospace, "MesloLGS NF", "Fira Code", "Consolas"',
            fontSize: 14,
            cursorBlink: true,
            scrollback: 5000,
            convertEol: true,
        });
        const fitAddon = new FitAddon();
        term.loadAddon(fitAddon);
        fitRef.current = fitAddon;

        term.open(termRef.current);
        fitAddon.fit();
        term.write("\r\n🔧 xterm ready. Connecting...\r\n");

        const ws = new WebSocket(current.wsUrl);

        ws.onopen = () => {
            if (term) {
                term.write("🟢 WebSocket connected.\r\n");
                term.onData((data) => ws.send(data));
            }
        };

        ws.onmessage = (e) => {
            try {
                const msg = JSON.parse(e.data);
                if (msg?.sid) {
                    setSid(msg.sid);
                    if (term) term.write(`(session: ${msg.sid})\r\n`);
                    return;
                }
            } catch { }
            if (term) term.write(e.data);
        };

        ws.onerror = (err) => {
            console.error("[WS] error:", err);
            if (term) term.write("\r\n🔴 WebSocket error. Check server logs / wsUrl.\r\n");
        };

        const onResize = () => fitAddon.fit();
        window.addEventListener("resize", onResize);

        return () => {
            window.removeEventListener("resize", onResize);
            ws.close();
            if (term) {
                term.dispose();
                term = null;
            }
        };
    }, [current?.wsUrl]);

    // Rest of the component...
    const { tree, fileMap } = useSelector((state) => state.project);
    const activeFileId = useSelector((state) => state.openPage.current);
    
    const handleSave = async () => {
        if (!current?.cid) {
            alert("컨테이너 정보를 찾을 수 없습니다.");
            return;
        }

        const code = fileMap[activeFileId]?.content || "";

        try {
            const res = await fetch("http://localhost:8000/save", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "Authorization": `Bearer ${token}`,
                },
                body: JSON.stringify({
                    code, // 현재 파일 내용 추가
                    tree,
                    fileMap,
                    run_code: activeFileId,
                    container_id: current.cid,
                }),
            });

            if (!res.ok) {
                const errData = await res.json();
                console.error("Save failed:", res.status, errData);
                alert(`저장 실패 (${res.status}): ${errData.detail || '알 수 없는 오류'}`);
                return;
            }

            alert("코드가 성공적으로 저장되었습니다.");

        } catch (e) {
            console.error(e);
            alert("저장 요청 중 오류가 발생했습니다.");
        }
    };

    return (
        <div className="flex flex-col h-screen">
            <Header
                sid={sid}
                setMode={setMode}
                onRun={(u) => { setGuiVisible(true); setUrl(u); }}
                onSave={handleSave}
                currentCid={current?.cid}
            />
            <div className="flex flex-1 overflow-hidden">
                <div className="w-64 shrink-0">
                    <Sidebar />
                </div>

                <div className="w-1 bg-[#333]" />
                <div className="flex-1 flex flex-col min-h-0">
                    {isLoaded && Object.keys(fileMap).length > 1 ? (
                        <>
                            <FileTabs />
                            <Editor />
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center bg-[#1E1E1E] text-gray-500">
                            <p>{isLoaded ? "프로젝트가 비어있습니다." : "프로젝트 로딩 중..."}</p>
                        </div>
                    )}
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
