// src/store/resetAction.ts
// ─── Global RESET_APP action ────────────────────────────────────────────────
// Dispatched on logout to clear ALL Redux slices at once.
// Each slice listens for this action in its `extraReducers` to reset to initial state.

import { createAction } from "@reduxjs/toolkit";

export const RESET_APP = createAction("RESET_APP");
