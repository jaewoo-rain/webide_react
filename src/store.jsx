import { configureStore, createSlice } from '@reduxjs/toolkit'
import user from "./store/userSlice"
import project from "./store/projectSlice"
import openPageSlice from "./store/openPageSlice"

export default configureStore({
  reducer: { 
    user: user.reducer,
    project: project.reducer,
    openPage: openPageSlice.reducer,
  }
}) 