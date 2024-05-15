import {createSlice} from '@reduxjs/toolkit'
const initialState = {
    isDraw : false,
}
const isDrawSlice = createSlice ({

    name: 'isDrawSlice',
    initialState: initialState,
    reducers: {
        setIsDraw:  (state, action) =>{
            state.isDraw = action.payload
            console.log(state.isDraw)
    
    }

}});

export const {setIsDraw} = isDrawSlice.actions
export default isDrawSlice.reducer  // export the actions to be used in other files