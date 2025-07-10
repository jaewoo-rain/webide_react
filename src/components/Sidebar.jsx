import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { newPageOpen } from '../store/openPageSlice';
import { addFile, addFolder } from '../store/projectSlice';

export default function Sidebar() {

  let project = useSelector((state) => {return state.project});
  let openPage = useSelector((state) => {return state.openPage});
  // console.log(project)

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
          onClick={()=>{console.log("파일 추가 버튼 누름"); dispatch(addFile({fileName:"untitleFile", parentId:"root"}))}}>
            <i className="ri-file-add-line"></i>
          </button>
          <button className="w-6 h-6 flex items-center justify-center text-[#D4D4D4] hover:bg-[#3C3C3C] rounded-button ml-1"
          onClick={()=>{console.log("폴더 추가 버튼 누름"); dispatch(addFolder({folderName:"untitleFolder", parentId:'root'}))}}>
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
