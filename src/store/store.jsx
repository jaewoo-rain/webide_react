import {configureStore} from '@reduxjs/toolkit'
import user from "./userSlice.jsx"
import project from "./projectSlice.jsx"
import openPageSlice from "./openPageSlice.jsx"
import containerReducer from "./containerSlice.jsx";
import fileReducer from './fileSlice'; // 👈 추가

export default configureStore({
  reducer: {
    user: user.reducer,
    project: project.reducer,
    openPage: openPageSlice.reducer,
    container: containerReducer,
    files: fileReducer, // 👈 추가
  }
}) 