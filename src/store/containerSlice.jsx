import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios from "axios";

export const loadProjects = createAsyncThunk(
    'container/loadProjects',
    async (_, { getState }) => {
        const { token } = getState().user;
        if (!token) return [];
        const res = await axios.get(`http://localhost:8000/containers/my`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        const projects = res.data || [];

        // Enrich each project with its fullCid
        const enrichedProjects = await Promise.all(projects.map(async (p) => {
            try {
                const shortCid = p.containerId || p.containerName || p.id;
                const urlsRes = await axios.get(`http://localhost:8000/containers/${shortCid}/urls`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                return { ...p, fullCid: urlsRes.data.cid };
            } catch (e) {
                console.error(`Failed to get fullCid for ${p.projectName}`, e);
                return { ...p, fullCid: null }; // Mark as failed
            }
        }));

        return enrichedProjects.filter(p => p.fullCid); // Return only successful ones
    }
);

// ... (rest of the slice is the same)

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
        resetCurrentContainer(state) {
            state.current = null;
            localStorage.removeItem("container.current");
            sessionStorage.removeItem("lastCid");
        }
    },
    extraReducers: (builder) => {
        builder.addCase(loadProjects.fulfilled, (state, action) => {
            state.projects = action.payload;
        });
    },
});

export const { setContainer, updateContainerUrls, clearContainer, setProjects, resetCurrentContainer } = slice.actions;
export default slice.reducer;
