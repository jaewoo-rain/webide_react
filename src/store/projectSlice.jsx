import { createSlice, nanoid } from "@reduxjs/toolkit";

let project = createSlice({
    name: "project",
    initialState: {
        tree: {
            id: "root",
            type: "folder",
            children: [
                { id: "1", type: "file" }, 
                {id: "3", type: "folder"
                    , children:[
                            {id:"2", type:"file"}
                        ]
                },
            ]
        },
        fileMap: {
            root: { name: "root", type: "folder" },
            "1": { name: "main.py", content: "", type: "file" },
            "2": {name: "utils.py", content: "", type: "file" },
            "3": {name: "src", type: "folder"}
        }
    },
    reducers:{
        addFile(state, action){
            // file 추가
            let {fileName, parentId} = action.payload;
            const newId = nanoid();
            state.fileMap[newId] = { name: fileName, content: "", type: "file" };
            
            // tree 추가
            let parentNode = findNode(state.tree, parentId)
            if(parentNode && parentNode.type == "folder"){
                parentNode.children.push({id: newId, type:"file"})
            }
        },
        addFolder(state, action){
            let {folderName, parentId} = action.payload;
            const newId = nanoid();
            state.fileMap[newId] = {name:folderName, type:"folder"}

            let parentNode = findNode(state.tree, parentId)
            if(parentNode && parentNode.type == "folder"){
                parentNode.children.push({ id: newId, type: "folder", children: [] });
            }
        },
        setCode(state, action){
            let {fileId, newContent} = action.payload;
            if (state.fileMap[fileId] && state.fileMap[fileId].type === "file") {
                state.fileMap[fileId].content = newContent;
            }

        }
        // 파일 & 폴더 삭제
        // 파일 & 폴더 이름 바꾸기
        // 코드 수정

    }
})

// DFS 깊이 우선 탐색
function findNode(current, targetId){
    if(current.id == targetId) {
        return current;
    }
    if(!current.children) return null;

    for(let child of current.children){
        let result = findNode(child, targetId);
        if(result){
            return result;
        }
    }
    return null;
}

export let {addFile, addFolder, setCode} = project.actions
export default project

/**
 * tree 구조1
 * {
  "src": {
    "main.py": "print('hello')",
    "components": {
      "header.js": "console.log('header')"
    }
  },
  "README.md": "# 프로젝트 설명"
}
 */

/** 
 * tree 구조2 구조/내용 분리하기
{
  mode: 'cli',
  tree: {
    id: 'root',
    type:"folder"
    children: [
      { id: 'file1', type:"file" },
      { id: 'folder1' type:"folder", children: [{ id: 'file2', type:"file"}] }
    ]
  },
  fileMap: {
    file1: { name: 'README.md', type: 'file', content: '# Hello' },
    file2: { name: 'App.js', type: 'file', content: 'console.log()' },
    folder1: { name: 'src', type: 'folder' },
  }
}

 */