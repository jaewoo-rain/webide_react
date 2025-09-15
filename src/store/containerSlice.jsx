import { createSlice } from "@reduxjs/toolkit";

// 새로고침 복구용: localStorage에 현재 컨테이너 저장
const persisted = (() => {
    try {
        return JSON.parse(localStorage.getItem("container.current") || "null");
    } catch { return null; }
})();

const slice = createSlice({
    name: "container",
    initialState: {
        current: persisted,            // { cid, wsUrl, vncUrl, name, image, projectName }
        projects: [],                  // 목록 (필요 시)
    },
    reducers: {
        setContainer(state, action) {
            state.current = action.payload || null;
            if (state.current) {
                localStorage.setItem("container.current", JSON.stringify(state.current));
                // 복구 키
                if (state.current.cid) {
                    sessionStorage.setItem("lastCid", state.current.cid);
                }
            } else {
                localStorage.removeItem("container.current");
                sessionStorage.removeItem("lastCid");
            }
        },
        updateContainerUrls(state, action) {
            if (!state.current) state.current = {};
            state.current.wsUrl = action.payload.wsUrl;
            state.current.vncUrl = action.payload.vncUrl;
            localStorage.setItem("container.current", JSON.stringify(state.current));
        },
        clearContainer(state) {
            state.current = null;
            localStorage.removeItem("container.current");
            sessionStorage.removeItem("lastCid");
        },
        setProjects(state, action) {
            state.projects = Array.isArray(action.payload) ? action.payload : [];
        },
    },
});

export const { setContainer, updateContainerUrls, clearContainer, setProjects } = slice.actions;
export default slice.reducer;
