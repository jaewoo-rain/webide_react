
import React, { useEffect, useRef, useState } from "react";
import "codemirror/lib/codemirror.css";
import "codemirror/theme/darcula.css";
import "codemirror/addon/fold/foldgutter.css";

import "codemirror/mode/clike/clike";
import "codemirror/addon/fold/foldcode";
import "codemirror/addon/fold/brace-fold";
import "codemirror/addon/fold/foldgutter";
import "codemirror/addon/selection/active-line";
import "codemirror/mode/python/python.js";

import CodeMirror from "codemirror";
import { useDispatch, useSelector } from "react-redux";
import { setCode } from "../store/projectSlice";

export default function Editor(props) {
  // useRef()는 리렌더링 사이에도 값을 유지하는 데 유용한 React Hook
  const textareaRef = useRef(null);
  const editorRef = useRef(null); // CodeMirror 에디터 객체(인스턴스)를 담기 위한 변수

  let state = useSelector((state)=> {return state})
  let files = state.project.fileMap
  // console.log(files)
  let currentPageId=state.openPage.current // 현재 페이지 id
  
  let code = files[currentPageId].content
  let dispatch = useDispatch();
  // console.log(state.project.fileMap[state.openPage.current])
  // console.log(currentPageId)

  // useEffect(() => {
  //   if (editorRef.current && files[currentPageId]) {
  //     editorRef.current.setValue(files[currentPageId].content);
  //   }
  // }, [currentPageId]);


  useEffect(() => {
    //  textarea가 존재하고, editor가 아직 초기화되지 않았다면
    // if (textareaRef.current && !editorRef.current) {
    if (textareaRef.current) {
      // CodeMirror.fromTextArea(...)를 실행하면 CodeMirror가 textarea를 코드 편집기로 바꿔주고, 그 결과물(객체)을 editorRef.current에 넣어줌
      editorRef.current = CodeMirror.fromTextArea(textareaRef.current, {
        mode: "python", // Python 문법 적용
        theme: "darcula", // 다크 테마
        lineNumbers: true, // 왼쪽 라인 넘버 표시
        styleActiveLine: true, // 현재 라인 강조
        foldGutter: true, // 코드 접기 UI 활성화
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      });

      editorRef.current.setSize("100%", "100%"); // 에디터 크기
      editorRef.current.setValue(code)


      // 사용자가 입력할 때마다 상태에 감지
      editorRef.current.on("change", () => {
        const value = editorRef.current.getValue(); // 에디터의 내용을 가져옴
        // props.setCode(value);
        dispatch(setCode({fileId: currentPageId, newContent: value})); // 코드 저장
        // console.log(value);
      });
    }
  }, [currentPageId]); //  []: 오직 최초 마운트시에만 실행되도록 합니다.

  return (
    <>
    <div className="flex-1 overflow-auto code-editor h-full w-full">
      <div style={{ height: "100%", width: "100%" }}>

        <textarea
          ref={textareaRef} // 처음에는 <textarea>만 있음 CodeMirror가 실행되면, 이 <textarea>는 사라지고 그 자리에 CodeMirror가 만든 고급 코드 편집기 UI가 대신 보여져.
          style={{ display: "none"}}
        />
      </div>
    </div>
    </>
  );
}
