import { createSlice } from '@reduxjs/toolkit'

let runSlice = createSlice({
    name: "user",
    initialState: {name: "kim"},
    reducers:{
        run(state, action){
            let {runFileId, data} = action.payload;
            state.name = newName;
        }
    }
})

export let {run: changeName} = runSlice.actions;
export default runSlice;