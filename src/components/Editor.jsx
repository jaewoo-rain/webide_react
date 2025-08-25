import React, { useEffect, useRef } from "react";
import CodeMirror from "codemirror";

import "codemirror/lib/codemirror.css";
import "codemirror/theme/darcula.css";
import "codemirror/addon/fold/foldgutter.css";
import "codemirror/mode/python/python.js";
import "codemirror/addon/fold/foldcode";
import "codemirror/addon/fold/brace-fold";
import "codemirror/addon/fold/foldgutter";
import "codemirror/addon/selection/active-line";

import { useDispatch, useSelector } from "react-redux";
import { setCode } from "../store/projectSlice";

export default function Editor() {
  const textareaRef = useRef(null);
  const editorRef = useRef(null);           // CodeMirror 인스턴스
  const docsRef = useRef(new Map());        // fileId -> CodeMirror.Doc
  const changeHandlerRef = useRef(null);    // 현재 등록된 change 핸들러

  const state = useSelector((s) => s);
  const files = state.project.fileMap;
  const currentPageId = state.openPage.current;
  const dispatch = useDispatch();


  // 1) 에디터는 단 한 번만 생성
  useEffect(() => {
    if (editorRef.current) return;
    // CodeMirror.fromTextArea(...)를 실행하면 CodeMirror가 textarea를 코드 편집기로 바꿔주고, 그 결과물(객체)을 editorRef.current에 넣어줌
    const cm = CodeMirror.fromTextArea(textareaRef.current, {
      mode: "python", // Python 문법 적용
      theme: "darcula", // 다크 테마
      lineNumbers: true, // 왼쪽 라인 넘버 표시
      styleActiveLine: true, // 현재 라인 강조
      foldGutter: true, // 코드 접기 UI 활성화
      gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      inputStyle: "contenteditable",     // ✅ 한글 IME 안정화
      lineWrapping: true,                 // (선택) 긴 줄 줄바꿈
    });
    cm.setSize("100%", "100%");
    editorRef.current = cm;

    // CSS에서도 .CodeMirror { height: 100%; } 보장해 주세요.
  }, []);

  // 2) 탭 전환 시: 해당 파일의 Doc으로 교체
  useEffect(() => {
    if (!editorRef.current || !currentPageId) return;

    // 파일별 Doc 준비 (없으면 생성)
    let doc = docsRef.current.get(currentPageId);
    if (!doc) {
      const initial = files[currentPageId]?.content ?? "";
      doc = new CodeMirror.Doc(initial, "python");
      docsRef.current.set(currentPageId, doc);
    }

    // 기존 change 핸들러 제거
    if (changeHandlerRef.current) {
      editorRef.current.off("change", changeHandlerRef.current);
      changeHandlerRef.current = null;
    }

    // 문서 교체
    editorRef.current.swapDoc(doc);

    // 새 change 핸들러 등록 (현재 탭의 fileId를 캡처)
    const onChange = () => {
      const value = editorRef.current.getDoc().getValue();
      dispatch(setCode({ fileId: currentPageId, newContent: value }));
    };
    editorRef.current.on("change", onChange);
    changeHandlerRef.current = onChange;

    // cleanup은 다음 탭 전환 때 off로 처리됨
  }, [currentPageId, files, dispatch]);


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
