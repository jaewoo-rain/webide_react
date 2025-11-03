import { nanoid } from '@reduxjs/toolkit';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { closePage, newPageOpen } from '../../store/openPageSlice';
import { addFile, addFolder, changeState, deleteFile, renameNode, updateNodePath } from '../../store/projectSlice';

export default function Sidebar() {
  const { tree, fileMap, isLoaded, isShow } = useSelector((state) => state.project);
  const openPage = useSelector((state) => state.openPage);
  const containerId = useSelector((state) => state.container.current?.cid);
  const dispatch = useDispatch();

  const isInputVisible = isShow.state;
  const inputRef = useRef(null);
  const [inputValue, setInputValue] = useState("");
  const [type, setType] = useState("");
  const [showDelete, setShowDelete] = useState(null);
  const [renamingId, setRenamingId] = useState(null);
  const [renameValue, setRenameValue] = useState("");

  useEffect(() => {
    if (isInputVisible && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputVisible]);

  const handleRename = async (nodeId) => {
    const newName = renameValue.trim();
    if (newName === "") {
      setRenamingId(null);
      return;
    }

    const oldPath = fileMap[nodeId]?.path;
    if (!containerId || !oldPath) {
      console.error("Cannot rename: containerId or oldPath is missing.");
      setRenamingId(null);
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/files/${containerId}`,
        {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ old_path: oldPath, new_name: newName }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        dispatch(renameNode({ nodeId, newName }));
        dispatch(updateNodePath({ nodeId, newPath: data.new_path }));
      } else {
        const errorData = await response.json();
        console.error("Failed to rename file on server:", errorData.detail);
      }
    } catch (error) {
      console.error("An error occurred during rename fetch:", error);
    }

    setRenamingId(null);
    setRenameValue("");
  };

  // 외부 클릭 시 input 감추기
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (inputRef.current && !inputRef.current.contains(e.target) && isInputVisible) {
        dispatch(changeState());
        setInputValue("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isInputVisible, dispatch]);

  const handleKeyDown = (type) => (e) => {
    if (e.key === "Enter") {
      const value = inputValue.trim();
      if (value !== "") {
        if (type === "file") {
          const newId = nanoid();
          dispatch(addFile({ fileName: value, parentId: "root", newId }));
          dispatch(newPageOpen(newId));
        } else if (type === "folder") {
          dispatch(addFolder({ folderName: value, parentId: "root" }));
        }
      }
      setInputValue("");
      dispatch(changeState());
    }
  };

  const handleDelete = async (node) => {
    if (!containerId) {
      console.error("Container ID is not available.");
      return;
    }

    const filePath = fileMap[node.id]?.path;
    if (!filePath) {
      console.error("File path not found.");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8000/files/${containerId}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ file_path: filePath }),
      });

      if (response.ok) {
        if (openPage.current === node.id) {
          dispatch(closePage(node.id));
        }
        dispatch(deleteFile(node.id));
        setShowDelete(null);
      } else {
        const errorData = await response.json();
        console.error("Failed to delete file on server:", errorData.detail);
      }
    } catch (error) {
      console.error("An error occurred during fetch:", error);
    }
  };

  let renderNode = function (node) {
    let data = fileMap[node.id];
    let currentFileId = openPage.current;
    if (!data) { return null; }

    const handleMoreClick = (e, nodeId) => {
      e.stopPropagation();
      setShowDelete(showDelete === nodeId ? null : nodeId);
    };

    const isRenaming = renamingId === node.id;

    if (node.type === "folder") {
      return (
        <div key={node.id} className="ml-2">
          <div className="flex items-center justify-between py-1 px-2 hover:bg-[#37373D] rounded cursor-pointer">
            <div className="flex items-center">
              <div className="w-4 h-4 flex items-center justify-center mr-1">
                <i className="ri-folder-open-line text-[#CCCC29]"></i>
              </div>
              {isRenaming ? (
                <input
                  type="text"
                  value={renameValue}
                  onChange={(e) => setRenameValue(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRename(node.id)}
                  onBlur={() => setRenamingId(null)}
                  className="bg-[#3C3C3C] text-white px-1 rounded border border-transparent focus:border-blue-500 outline-none"
                  autoFocus
                  onClick={(e) => e.stopPropagation()}
                />
              ) : (
                <span>{data.name}</span>
              )}
            </div>
            <div className="flex items-center">
              {showDelete === node.id ? (
                <div className="flex items-center space-x-2">
                  <button
                    className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      setRenamingId(node.id);
                      setRenameValue(data.name);
                      setShowDelete(null);
                    }}
                  >
                    수정
                  </button>
                  <button
                    className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-white"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(node);
                    }}
                  >
                    삭제
                  </button>
                </div>
              ) : (
                <button
                  className="text-gray-400 hover:text-white"
                  onClick={(e) => handleMoreClick(e, node.id)}
                >
                  ...
                </button>
              )}
            </div>
          </div>
          <div className="ml-4">
            {node.children?.map((child) => renderNode(child))}
          </div>
        </div>
      );
    } else if (node.type === "file") {
      return (
        <div
          key={node.id}
          onClick={(e) => {
            if (!isRenaming) {
              dispatch(newPageOpen(node.id));
            }
            setShowDelete(null);
          }}
          className={`flex items-center justify-between py-1 px-2 hover:bg-[#37373D] rounded cursor-pointer ${currentFileId === node.id ? "bg-[#37373D]" : ""}`}
        >
          <div className="flex items-center">
            <div className="w-4 h-4 flex items-center justify-center mr-1">
              <i className={`ri-${data.name.endsWith('.md') ? 'markdown-line' : 'file-code-line'} text-[#519ABA]`}></i>
            </div>
            {isRenaming ? (
              <input
                type="text"
                value={renameValue}
                onChange={(e) => setRenameValue(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleRename(node.id)}
                onBlur={() => setRenamingId(null)}
                className="bg-[#3C3C3C] text-white px-1 rounded border border-transparent focus:border-blue-500 outline-none"
                autoFocus
                onClick={(e) => e.stopPropagation()}
              />
            ) : (
              <span>{data.name}</span>
            )}
          </div>
          <div className="flex items-center">
            {showDelete === node.id ? (
              <div className="flex items-center space-x-2">
                <button
                  className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    setRenamingId(node.id);
                    setRenameValue(data.name);
                    setShowDelete(null);
                  }}
                >
                  수정
                </button>
                <button
                  className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 rounded text-white"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(node);
                  }}
                >
                  삭제
                </button>
              </div>
            ) : (
              <button
                className="text-gray-400 hover:text-white"
                onClick={(e) => handleMoreClick(e, node.id)}
              >
                ...
              </button>
            )}
          </div>
        </div>
      );
    }
    return null;
  };

  if (!isLoaded) {
    return (
      <div className="w-64 bg-[#252526] border-r border-[#333] p-4 text-gray-400">
        프로젝트 파일을 불러오는 중...
      </div>
    );
  }

  return (
    <div className="w-64 bg-[#252526] border-r border-[#333] flex flex-col">
      <div className="flex items-center justify-between p-2 border-b border-[#333]">
        <span className="font-semibold">파일 탐색기</span>
        <div className="flex">
          <button className="w-6 h-6 flex items-center justify-center text-[#D4D4D4] hover:bg-[#3C3C3C] rounded-button"
            onClick={() => {
              console.log("파일 추가 버튼 누름");
              setType("file")
              dispatch(changeState());
            }}>
            <i className="ri-file-add-line"></i>
          </button>
          <button className="w-6 h-6 flex items-center justify-center text-[#D4D4D4] hover:bg-[#3C3C3C] rounded-button ml-1"
            onClick={() => {
              console.log("폴더 추가 버튼 누름");
              setType("folder")
              dispatch(changeState());
            }}>
            <i className="ri-folder-add-line"></i>
          </button>
          <button className="w-6 h-6 flex items-center justify-center text-[#D4D4D4] hover:bg-[#3C3C3C] rounded-button ml-1"
            onClick={() => { console.log("새로고침 버튼 누름") }}>
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
            {/* 👇 tree.children을 렌더링하는 부분도 동일합니다. */}
            {tree.children.map((node) => renderNode(node))}

            {/* 👇 isShow.state (isInputVisible)를 사용합니다. */}
            {isInputVisible ? (
                <input
                    ref={inputRef}
                    type="text"
                    className="w-full ..."
                    placeholder="이름 입력 후 Enter"
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown(type)}
                />
            ) : null}

            {
              //tree.map((node) => renderNode(node))
            }
            {/*{*/}
            {/*  isShow*/}
            {/*    ? <input*/}
            {/*      ref={inputRef} // ✅ 포커싱 대상*/}
            {/*      type="text"*/}
            {/*      className="w-full px-2 py-1 mt-2 bg-[#1E1E1E] text-white border border-[#333] rounded"*/}
            {/*      placeholder="이름 입력 후 Enter"*/}
            {/*      value={inputValue}*/}
            {/*      onChange={(e) => setInputValue(e.target.value)}*/}
            {/*      onKeyDown={handleKeyDown(type)}*/}
            {/*    />*/}
            {/*    : null*/}
            {/*}*/}
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