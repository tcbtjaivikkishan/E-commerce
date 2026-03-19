// src/hooks/redux.ts
// Typed wrappers around useDispatch / useSelector — always import from here.
import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../store/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector<RootState, T>(selector);