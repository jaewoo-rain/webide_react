import React from "react";

// 여기에 noVNC 띄워야할듯
export default function GuiOverlay({ onClose, url }) {
  // url 받아서 iframe에 넣기 하는중
  return (
    <div className="fixed inset-0 overlay flex items-center justify-center z-50">
      <div className="gui-window w-[800px] h-[600px] rounded flex flex-col">
        <div className="gui-window-header flex items-center justify-between p-2">
          <span>GUI 애플리케이션</span>
          <button // 닫기 버튼
            onClick={onClose}
            className="w-6 h-6 flex items-center justify-center text-[#D4D4D4] hover:bg-[#505050] rounded-button"
          >
            <i className="ri-close-line"></i>
          </button>
        </div>
        <h1 className="text-xl mb-4">
          GUI 실행중!
          <iframe
            style={{
              width: "1024px",
              height: "700px",
            }}
            src={url}
          ></iframe>
        </h1>
        {/* <div className="flex-1 bg-white p-4 overflow-hidden">
          <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-800">
            <div className="text-center">
              <div className="bg-white p-6 rounded-lg shadow-md">

              </div>
            </div>
          </div>
        </div> */}
      </div>
    </div>
  );
}
