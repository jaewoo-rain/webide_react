import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { newPageOpen } from '../store/openPageSlice';
import { addFile, addFolder } from '../store/projectSlice';
import { changeState } from '../store/projectSlice';

export default function Sidebar() {

  let project = useSelector((state) => {return state.project});
  let openPage = useSelector((state) => {return state.openPage});
  let isShow = project.isShow.state;
  // console.log(isShow);
  // console.log(project)


  const inputRef = useRef(null); // input 태그 참조

  const [inputValue, setInputValue] = useState("");
  const [type, setType] = useState("");

  // 상태 변화 시 input에 포커스
  useEffect(() => {
    if (isShow && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isShow]);

  // 외부 클릭 시 input 감추기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        inputRef.current &&
        !inputRef.current.contains(e.target) &&
        isShow
      ) {
        dispatch(changeState());
        setInputValue("");
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isShow]);

  const handleKeyDown = (type) => (e) => {
    if (e.key === "Enter") {
      const value = inputValue.trim();
      if (value !== "") {
        if (type === "file") {
          dispatch(addFile({ fileName: value, parentId: "root" }));
        } else if (type === "folder") {
          dispatch(addFolder({ folderName: value, parentId: "root" }));
        }
      }
      setInputValue("");
      dispatch(changeState());
    }
  };


  let tree = project.tree.children;
  let fileMap = project.fileMap;
  let dispatch = useDispatch();

  let renderNode = function(node){
    let data = fileMap[node.id]
    let currentFileId = openPage.current
    if (!data) { return null};

    if (node.type == "folder"){
      return (
        <div key={node.id} className="ml-2">
          <div className="flex items-center py-1 px-2 hover:bg-[#37373D] rounded cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center mr-1">
              <i className="ri-folder-open-line text-[#CCCC29]"></i>
            </div>
            <span>{data.name}</span>
          </div>
          <div className="ml-4">
            {node.children?.map((child) => renderNode(child))}
          </div>
        </div>
      );
    } else if( node.type == "file"){
      return(
        <div
          key={node.id}
          onClick={() => dispatch(newPageOpen(node.id))} // 오픈된 파일
          className={`flex items-center py-1 px-2 hover:bg-[#37373D] rounded cursor-pointer ${
            currentFileId === node.id ? "bg-[#37373D]" : ""
          }`}
        >
          <div className="w-4 h-4 flex items-center justify-center mr-1">
            <i className={`ri-${data.name.endsWith('.md') ? 'markdown-line' : 'file-code-line'} text-[#519ABA]`}></i>
          </div>
          <span>{data.name}</span>
        </div>
      );
    }
    return null;
  }

  let files = ['main.py', 'utils.py', 'app.py', 'README.md','새로운파일'];
  let selectFile = 'app.py'
  return (
    <div className="w-64 bg-[#252526] border-r border-[#333] flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-[#333]">
        <span className="font-semibold">파일 탐색기</span>
        <div className="flex">
          <button className="w-6 h-6 flex items-center justify-center text-[#D4D4D4] hover:bg-[#3C3C3C] rounded-button"
          onClick={()=>{
            console.log("파일 추가 버튼 누름"); 
            setType("file")
            dispatch(changeState()); 
          }}>
            <i className="ri-file-add-line"></i>
          </button>
          <button className="w-6 h-6 flex items-center justify-center text-[#D4D4D4] hover:bg-[#3C3C3C] rounded-button ml-1"
          onClick={()=>{
            console.log("폴더 추가 버튼 누름"); 
            setType("folder")
            dispatch(changeState()); 
          }}>
            <i className="ri-folder-add-line"></i>
          </button>
          <button className="w-6 h-6 flex items-center justify-center text-[#D4D4D4] hover:bg-[#3C3C3C] rounded-button ml-1"
          onClick={()=>{console.log("새로고침 버튼 누름")}}>
            <i className="ri-refresh-line"></i>
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-1">
        <div className="mb-1">
          <div className="flex items-center py-1 px-2 hover:bg-[#37373D] rounded cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center mr-1">
              <i className="ri-folder-open-line text-[#CCCC29]"></i>
            </div>
            <span>프로젝트</span>
          </div>
          <div className="ml-4">
            
            {
            // files.map((file, i) => (
            //   <div
            //     key={i}
            //     onClick={()=>{console.log(`${i}번째 클릭`)}} // 클릭시 selectFile변경하면 될듯
            //     className={`flex items-center py-1 px-2 hover:bg-[#37373D] rounded cursor-pointer ${file === selectFile ? 'bg-[#37373D]' : ''}`
            //   }
            //   >
            //     {/* 파일 앞에 이미지 */}
            //     <div className="w-4 h-4 flex items-center justify-center mr-1">
            //       <i className={`ri-${file.endsWith('.md') ? 'markdown-line' : 'file-code-line'} text-[#519ABA]`}></i> {/* 마크다운인 경우 이미지 바꿈*/}
            //     </div>
            //     <span>{file}</span>
            //   </div>
            // ))
            tree.map((node) => renderNode(node))
            }
          {
          isShow 
            ? <input
                ref={inputRef} // ✅ 포커싱 대상
                type="text"
                className="w-full px-2 py-1 mt-2 bg-[#1E1E1E] text-white border border-[#333] rounded"
                placeholder="이름 입력 후 Enter"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown(type)}
              />
            : null
          }

          </div>
        </div>
        <div>
          {/* 라이브러리 파트 */}
          <div className="flex items-center py-1 px-2 hover:bg-[#37373D] rounded cursor-pointer">
            <div className="w-4 h-4 flex items-center justify-center mr-1">
              <i className="ri-folder-line text-[#CCCC29]"></i>
            </div>
            <span>라이브러리</span>
          </div>
        </div>
      </div>
    </div>
  );
}