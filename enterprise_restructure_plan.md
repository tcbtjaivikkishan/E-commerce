# Enterprise Restructure Plan — TCBT Mobile App

## Current Issues
1. **Flat `src/` structure** — screens, types, and data are loosely organized
2. **Empty placeholder files** — `config.ts`, `api.ts`, `navigation.ts`, `product.ts`, `user.ts`, `useAuth.ts`, `orderService.ts`, `otpService.ts`, `productServices.ts` are all empty
3. **Duplicate route files** — `app/login.tsx` + `app/auth/login.tsx`, `app/signup.tsx` + `app/auth/signup.tsx`
4. **Mixed concerns** — types defined in `data.ts` instead of type files, inline components in screens
5. **No barrel exports** — every import uses deep paths
6. **Inconsistent naming** — `productServices.ts` (plural) vs `authService.ts` (singular)
7. **Profile screen** appears both as a route-level component (`app/profile.tsx`) and inside `src/screens/`
8. **Store not wired for all slices** — `orderSlice` and `userSlice` exist but aren't added to the store

## Target Enterprise Structure

```
src/
├── core/                          # App-wide foundation
│   ├── config/                    # Environment & app configuration
│   │   ├── app.config.ts          # API URLs, feature flags
│   │   └── index.ts               # Barrel export
│   ├── theme/                     # Design tokens
│   │   ├── colors.ts
│   │   ├── spacing.ts
│   │   ├── typography.ts
│   │   └── index.ts               # Barrel export
│   └── constants/                 # Static data, enums
│       ├── categories.ts
│       ├── banners.ts
│       └── index.ts
├── features/                      # Feature modules (domain-driven)
│   ├── auth/
│   │   ├── components/            # Auth-specific UI
│   │   ├── hooks/
│   │   │   └── useAuth.ts
│   │   ├── screens/
│   │   │   ├── LoginScreen.tsx
│   │   │   └── SignupScreen.tsx
│   │   ├── services/
│   │   │   └── auth.service.ts
│   │   ├── store/
│   │   │   └── userSlice.ts
│   │   ├── types/
│   │   │   └── auth.types.ts
│   │   └── index.ts
│   ├── cart/
│   │   ├── components/
│   │   ├── hooks/
│   │   │   └── useCart.ts
│   │   ├── screens/
│   │   │   └── CartScreen.tsx
│   │   ├── store/
│   │   │   └── cartSlice.ts
│   │   └── index.ts
│   ├── catalog/                   # Products + Categories
│   │   ├── components/
│   │   │   └── ProductCard.tsx (extracted)
│   │   ├── hooks/
│   │   │   └── useWishlist.ts
│   │   ├── screens/
│   │   │   ├── HomeScreen.tsx
│   │   │   ├── CategoriesScreen.tsx
│   │   │   └── ProductScreen.tsx
│   │   ├── services/
│   │   │   └── product.service.ts
│   │   ├── types/
│   │   │   └── product.types.ts
│   │   └── index.ts
│   ├── checkout/
│   │   ├── screens/
│   │   │   ├── AddressScreen.tsx
│   │   │   ├── PaymentScreen.tsx
│   │   │   └── SuccessScreen.tsx
│   │   ├── hooks/
│   │   │   └── useOrder.ts
│   │   ├── store/
│   │   │   └── orderSlice.ts
│   │   ├── types/
│   │   │   └── order.types.ts
│   │   └── index.ts
│   ├── orders/
│   │   ├── screens/
│   │   │   └── OrdersScreen.tsx
│   │   └── index.ts
│   ├── profile/
│   │   ├── screens/
│   │   │   └── ProfileScreen.tsx
│   │   └── index.ts
│   └── onboarding/
│       ├── screens/
│       │   └── SplashScreen.tsx
│       └── index.ts
├── shared/                        # Shared/reusable across features
│   ├── components/
│   │   ├── Header.tsx
│   │   ├── BannerCarousel.tsx
│   │   ├── Loader.tsx
│   │   └── index.ts
│   ├── hooks/
│   │   └── useRedux.ts
│   ├── services/
│   │   └── api.client.ts
│   ├── types/
│   │   └── common.types.ts
│   └── utils/
│       ├── formatters.ts
│       └── mappers.ts
├── store/                         # Root Redux store
│   ├── rootReducer.ts
│   └── store.ts
└── data/                          # Static JSON data
    └── products.json
```

## Key Changes
1. **Feature-based architecture** — each feature is self-contained
2. **Remove empty files** — delete all placeholder/empty files
3. **Remove duplicate routes** — keep only `app/auth/` routes, delete `app/login.tsx` and `app/signup.tsx`
4. **Wire all slices** to the store (order + user)
5. **Barrel exports** for clean imports
6. **Extract shared components** vs feature-specific ones
7. **Move types** out of `data.ts` into proper type files
8. **Extract utility functions** (formatters, mappers)
