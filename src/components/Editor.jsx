// import React from 'react';

//   return (
//     <div className="flex-1 overflow-auto code-editor">
//         <textarea style={{width: '100%', height: '100%', backgroundColor: 'black'}}></textarea>

//     </div>
//   );
// }

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

export default function Editor(props) {
  // useRef()는 리렌더링 사이에도 값을 유지하는 데 유용한 React Hook
  const textareaRef = useRef(null);
  const editorRef = useRef(null); // CodeMirror 에디터 객체(인스턴스)를 담기 위한 변수
  const [code, setCode] = useState("");

  useEffect(() => {
    //  textarea가 존재하고, editor가 아직 초기화되지 않았다면
    if (textareaRef.current && !editorRef.current) {
      // CodeMirror.fromTextArea(...)를 실행하면 CodeMirror가 textarea를 코드 편집기로 바꿔주고, 그 결과물(객체)을 editorRef.current에 넣어줌
      editorRef.current = CodeMirror.fromTextArea(textareaRef.current, {
        mode: "python", // Python 문법 적용
        theme: "darcula", // 다크 테마
        lineNumbers: true, // 왼쪽 라인 넘버 표시
        styleActiveLine: true, // 현재 라인 강조
        foldGutter: true, // 코드 접기 UI 활성화
        gutters: ["CodeMirror-linenumbers", "CodeMirror-foldgutter"],
      });

      // 사용자가 입력할 때마다 상태에 감지
      editorRef.current.on("change", () => {
        const value = editorRef.current.getValue(); // 에디터의 내용을 가져옴
        props.setCode(value);
        // console.log(value);
      });
    }
  }, []); //  []: 오직 최초 마운트시에만 실행되도록 합니다.

  return (
    <div className="flex-1 overflow-auto code-editor h-full w-full ">
      {/* Editor 속 위 */}
      <textarea
        ref={textareaRef} // 처음에는 <textarea>만 있음 CodeMirror가 실행되면, 이 <textarea>는 사라지고 그 자리에 CodeMirror가 만든 고급 코드 편집기 UI가 대신 보여져.
        style={{ width: "100%", height: "100%", backgroundColor: "black" }}
      />
      Editor 속 아래
    </div>
  );
}
