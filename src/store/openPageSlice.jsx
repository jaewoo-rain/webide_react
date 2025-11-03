import { createSlice } from '@reduxjs/toolkit'

let openPageSlice = createSlice({
    name: "openPage",
    initialState: {current: null, open: []},
    reducers:{
        setCurrentPage(state, action){
            let pageId = action.payload;
            state.current = pageId;

        },
        newPageOpen(state, action){
            let newPageId = action.payload
            if(!state.open.includes(newPageId)){
                state.open.push(newPageId)
                state.current = newPageId
            }else{
                state.current = newPageId
            }
        },
        closePage(state, action){
            let pageId = action.payload;
            state.open = state.open.filter(page => page !== pageId);
            if(state.current == pageId){
                state.current = state.open.length > 0 ? state.open[0] : null;
            }
        }
    }
})

export let {setCurrentPage, newPageOpen, closePage} = openPageSlice.actions;
export default openPageSlice;