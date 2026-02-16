import { createSlice } from "@reduxjs/toolkit";
import { products } from "../../data/mockData";

const productSlice = createSlice({
  name: "products",
  initialState: {
    list: products,
  },
  reducers: {},
});

export default productSlice.reducer;
