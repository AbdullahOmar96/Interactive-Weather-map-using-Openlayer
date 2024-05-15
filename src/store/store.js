import {configureStore} from "@reduxjs/toolkit"
import isDrawSlice from "./slice/draw"
export default configureStore ({
reducer : {
    Draw : isDrawSlice
}

})