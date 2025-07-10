import { createSlice } from '@reduxjs/toolkit'

let user = createSlice({
    name: "user",
    initialState: {name: "kim"},
    reducers:{
        changeName(state, action){
            let {newName} = action.payload;
            state.name = newName;
        }
    }
})

export let {changeName} = user.actions;
export default user;