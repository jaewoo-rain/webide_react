import React from 'react';

// 여기에 noVNC 띄워야할듯
export default function GuiOverlay({ onClose }) {
  return (
    <div className="fixed inset-0 overlay flex items-center justify-center z-50">
      <div className="gui-window w-[800px] h-[600px] rounded flex flex-col">
        <div className="gui-window-header flex items-center justify-between p-2">
          <span>GUI 애플리케이션</span>
          <button
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-[#D4D4D4] hover:bg-[#505050] rounded-button"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
        <div className="flex-1 bg-white p-4 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-800">
            <div className="text-center">
              <div className="text-2xl font-bold mb-4">Flask 애플리케이션</div>
              <div className="bg-white p-6 rounded-lg shadow-md">
                <h1 className="text-xl mb-4">안녕하세요, WebIDE에서 실행 중입니다!</h1>
                <div className="mb-4">
                  <input
                    type="text"
                    className="w-full p-2 border border-gray-300 rounded"
                    placeholder="메시지 입력..."
                  />
                </div>
                <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                  전송
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}