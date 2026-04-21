// src/shared/hooks/useRedux.ts
// ─── Typed wrappers around useDispatch / useSelector ────────────────────────
// Always import from here — never from react-redux directly.

import { useDispatch, useSelector } from "react-redux";
import type { AppDispatch, RootState } from "../../store/store";

export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector = <T>(selector: (state: RootState) => T): T =>
  useSelector<RootState, T>(selector);
