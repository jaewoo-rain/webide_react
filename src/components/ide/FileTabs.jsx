import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closePage, setCurrentPage } from '../../store/openPageSlice';
import { addFile } from '../../store/projectSlice';

export default function FileTabs() {
  let state = useSelector((state) => { return state; })
  // console.log(state.project);
  // console.log(state.openPage.open)
  let files = state.openPage.open // 열어보았던 파일 목록
  // let fileTap = files.map((file) => { return state.project.fileMap[file].name}); // Tap에 띄울것들 이름들
  let currentPageId = state.openPage.current
  const activeFileId = currentPageId; // 현재 파일 -> Sidebar랑 연동해야할듯

  let dispatch = useDispatch()

  return (
    <div className="bg-[#2D2D2D] flex text-sm">
      {files.map((file, idx) => (
        <div
          key={idx}
          onClick={() => {
            // console.log(`${idx}파일 클릭`);
            dispatch(setCurrentPage(file));
          }} // 클릭하면 activeFile 변경되도록 + 페이지 전환
          className={`file-tab px-3 py-2 flex items-center  hover:bg-[#37373D] cursor-pointer ${file === currentPageId ? 'active' : ''}`}
        >
          {/* 파일 앞 이모지 */}
          <div className="w-4 h-4 flex items-center justify-center mr-1">
            <i className="ri-file-code-line text-[#519ABA]"></i>
          </div>
          <span>{state.project.fileMap[file].name}</span>
          <button className="ml-2 w-4 h-4 flex items-center justify-center opacity-50 hover:opacity-100"
            onClick={(event) => {
              event.stopPropagation();
              // console.log("페이지 닫기 버튼 누름");
              dispatch(closePage(file));
            }}> {/* files리스트 삭제 */}
            <i className="ri-close-line"></i>
          </button>
        </div>
      ))}
      <button className="px-3 py-2 flex items-center"
        onClick={() => {
          // console.log("페이지 추가 버튼 누름");
          dispatch(addFile({ fileName: "untitleFile", parentId: "root" }))
        }}> {/** files에 새로운 untitle페이지 만들기? 아니면 없애도되고 */}
        <div className="w-4 h-4 flex items-center justify-center">
          <i className="ri-add-line"></i>
        </div>
      </button>
    </div>
  );
}
