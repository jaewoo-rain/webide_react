// import React from 'react';


//   return (
//     <div className="flex-1 overflow-auto code-editor">
//         <textarea style={{width: '100%', height: '100%', backgroundColor: 'black'}}></textarea>


//     </div>
//   );
// }


import React, { useEffect, useRef, useState } from 'react';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/darcula.css';
import 'codemirror/addon/fold/foldgutter.css';

import 'codemirror/mode/clike/clike';
import 'codemirror/addon/fold/foldcode';
import 'codemirror/addon/fold/brace-fold';
import 'codemirror/addon/fold/foldgutter';
import 'codemirror/addon/selection/active-line';
import 'codemirror/mode/python/python.js'

import CodeMirror from 'codemirror';

export default function Editor() {
  const textareaRef = useRef(null);
  const editorRef = useRef(null);
  const [code, setCode] = useState('');

  useEffect(() => {
    if (textareaRef.current && !editorRef.current) {
      editorRef.current = CodeMirror.fromTextArea(textareaRef.current, {
        mode: 'python',
        theme: 'darcula',
        lineNumbers: true,
        styleActiveLine: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
      });

      // 사용자가 입력할 때마다 상태에 저장
      editorRef.current.on('change', () => {
        const value = editorRef.current.getValue();
        setCode(value);
      });
      
    }
  }, []);

  return (
    <div className="flex-1 overflow-auto code-editor h-full w-full ">
      <textarea
        ref={textareaRef}
        style={{ width: '100%', height: '100%', backgroundColor: 'black' }}
      />
      dd
    </div>
  );
}
