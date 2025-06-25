import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import FileTabs from './components/FileTabs';
import Editor from './components/Editor';
import Terminal from './components/Terminal';
import GuiOverlay from './components/GuiOverlay';

export default function App() {
  const [isGuiVisible, setGuiVisible] = useState(false);
  const [terminalHeight, setTerminalHeight] = useState(200);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = () => setIsResizing(true);
  const stopResizing = () => setIsResizing(false);
  const handleMouseMove = (e) => {
    if (!isResizing) return;
    const newHeight = window.innerHeight - e.clientY;
    setTerminalHeight(Math.max(newHeight, 100));
  };

  useEffect(() => {
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', stopResizing);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing]);

  return (
    <div className="flex flex-col h-screen">
      <Header onRun={() => setGuiVisible(true)} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <div className="w-1 bg-[#333] sidebar-resize" />
        <div className="flex-1 flex flex-col overflow-hidden">
          <FileTabs />
          <div className="flex-1 overflow-hidden">
            <Editor />
          </div>
          <div
            className="h-1 bg-[#333] cursor-row-resize"
            onMouseDown={startResizing}
          />
          <div style={{ height: `${terminalHeight}px` }} className="overflow-hidden">
            <Terminal />
          </div>
        </div>
      </div>
      {isGuiVisible && <GuiOverlay onClose={() => setGuiVisible(false)} />}
    </div>
  );
}
