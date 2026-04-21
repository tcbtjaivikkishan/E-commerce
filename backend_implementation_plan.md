# Backend Integration Plan

## Overview
Integrate the TCBT Jaivik Kisan mobile app with the backend API at `https://squatting-wound-diaphragm.ngrok-free.dev`

## Current State
- App uses **mock data** from `products.json` and hardcoded OTP (`123456`)
- Cart is **Redux-only** (local state, no server sync)
- Wishlist is **local React state** only
- Orders are **mock** (UUID-based, no backend)
- Auth uses **mock OTP** verification

## Changes Required

### 1. Core Infrastructure
- [x] Update `app.config.ts` — set `API_BASE_URL`, OTP length = 6
- [x] Rewrite `api.client.ts` — add JWT auth header injection, token refresh, ngrok bypass header
- [x] Create `src/shared/services/token.service.ts` — SecureStore-based token management
- [x] Create `src/shared/services/session.service.ts` — session_id + refresh_token + device_id management

### 2. Auth Module (`/auth`)
- [x] Rewrite `auth.service.ts` — real `send-otp`, `verify-otp`, `refresh`, `logout` calls
- [x] Update `auth.types.ts` — match backend response shapes  
- [x] Rewrite `userSlice.ts` — store user object, tokens, session, userId
- [x] Update `LoginScreen.tsx` — use real API, handle errors/rate limits, 6-digit OTP
- [x] Update `SignupScreen.tsx` — redirect to login (backend has no separate signup, it's OTP-based)

### 3. Products Module (`/products`)
- [x] Create `src/features/catalog/services/product.api.ts` — real API calls
- [x] Update `HomeScreen.tsx` — fetch from API instead of JSON file
- [x] Update `ProductScreen.tsx` — fetch single product by ID from API
- [x] Update `CategoriesScreen.tsx` — fetch categories from `/categories` API

### 4. Cart Module (`/cart`)
- [x] Rewrite `cartSlice.ts` — use async thunks for API cart operations
- [x] Support guest cart (guest_session_id) and authenticated cart (JWT)
- [x] Cart merge on login (pass `guest_session_id` to verify-otp)

### 5. Wishlist Module (`/wishlist`)
- [x] Create `src/features/catalog/services/wishlist.api.ts`
- [x] Create wishlist Redux slice with async thunks
- [x] Update `WishlistScreen.tsx` — fetch from API

### 6. Orders Module (`/orders`)
- [x] Create `src/features/orders/services/order.api.ts`
- [x] Create proper order slice with async thunks
- [x] Update `OrdersScreen.tsx` — list real orders with pagination
- [x] Update checkout flow — create real orders via API

### 7. User Profile (`/users`)
- [x] Create `src/features/profile/services/user.api.ts`
- [x] Update `ProfileScreen.tsx` — show real user data, allow profile updates
- [x] Support address management via API

### 8. Shipping (`/shipping`)
- [x] Create shipping service for rate calculation
- [x] Integrate into checkout flow
