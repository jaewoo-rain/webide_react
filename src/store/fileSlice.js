// src/store/fileSlice.js

import { createSlice } from '@reduxjs/toolkit';
import { v4 as uuidv4 } from 'uuid'; // ID 생성을 위해 uuid 설치 (npm install uuid)

const initialState = {
    tree: { id: 'root', type: 'folder', children: [] },
    fileMap: { root: { name: 'root', type: 'folder' } },
    isLoaded: false,
    isInputShow: false,
};

const fileSlice = createSlice({
    name: 'files',
    initialState,
    reducers: {
        setFileStructure: (state, action) => {
            const { tree, fileMap } = action.payload;
            state.tree = tree;
            state.fileMap = fileMap;
            state.isLoaded = true;
        },
        // ✅ 파일 추가 리듀서
        addFile: (state, action) => {
            const { fileName, parentId } = action.payload;
            const newFileId = uuidv4();

            // fileMap에 새 파일 정보 추가
            state.fileMap[newFileId] = {
                name: fileName,
                content: '',
                type: 'file',
            };

            // tree 구조에 새 파일 노드 추가 (여기서는 root에 추가하는 로직만 구현)
            // TODO: 특정 폴더(parentId)에 추가하는 로직으로 고도화 필요
            state.tree.children.push({ id: newFileId, type: 'file' });
        },
        // ✅ 폴더 추가 리듀서
        addFolder: (state, action) => {
            const { folderName, parentId } = action.payload;
            const newFolderId = uuidv4();

            state.fileMap[newFolderId] = {
                name: folderName,
                type: 'folder',
            };
            state.tree.children.push({ id: newFolderId, type: 'folder', children: [] });
        },
        // ✅ 입력창 표시/숨김 리듀서
        toggleInputShow: (state) => {
            state.isInputShow = !state.isInputShow;
        }
    },
});
export const { setFileStructure } = fileSlice.actions;
export default fileSlice.reducer;
