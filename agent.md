# Veyo AI Agent Developer Guidelines (`agent.md`)

This document serves as the mandatory operational manual and architectural guide for AI coding assistants working on the **Veyo** codebase. Follow these instructions strictly to ensure stability, prevent build failures, and maintain codebase consistency.

---

## 1. Tech Stack & Environment

- **Framework**: React Native `0.81.5` with Expo SDK `54`
- **Routing**: Expo Router v4 (filesystem-based routing in `app/`)
- **Styling**: NativeWind v4 with Tailwind CSS & React Native `StyleSheet`
- **Typography**: Plus Jakarta Sans (`font-Jakarta`, `font-JakartaBold`, etc.)
- **State Management**: Zustand stores in `store/store.ts`
- **Authentication**: Clerk Expo (`@clerk/expo`)
- **Mapping**: `react-native-maps` (native iOS Apple Maps / Android Google Maps)
- **Target OS / Build System**: Android & iOS via Expo Application Services (EAS)

---

## 2. Critical Platform Splitting Rules (NEVER BREAK)

### ⚠️ Native Modules & Web Bundler Isolation
`react-native-maps` and native view managers rely on native code (`codegenNativeCommands`, Obj-C / Java). When Expo CLI exports for web or performs eager bundle evaluation, importing native modules in cross-platform files causes a build crash:
```
TypeError: (0, _reactNative.codegenNativeCommands) is not a function
```

### Mandatory Rules:
1. **Never directly import `react-native-maps` into files in `app/`**.
2. **Always use Platform Extensions (`.native.tsx` and `.tsx`)**:
   - Heavy screens or components with native maps must live in `components/`:
     - `components/[ComponentName].native.tsx` (Contains full native map logic)
     - `components/[ComponentName].tsx` (Web-safe stub or preview card)
   - Then re-export cleanly in `app/` route file or import directly:
     ```tsx
     // Safe: Automatically resolves .native on device and .tsx on web/server
     import Map from '@/components/Map';
     ```
3. **Existing Native-Split Modules**:
   - `components/Map.native.tsx` & `components/Map.tsx`: Embedded map preview widget used across tabs.
   - `components/MapScreen.native.tsx` & `components/MapScreen.tsx`: Complete 1,400-line full-screen navigation map re-exported by `app/(utils)/map.tsx`.

---

## 3. EAS Build & `app.json` Configuration Rules

1. **NEVER add `"output": "server"` to `web` in `app.json`**:
   - `"output": "server"` instructs Expo Router to generate server endpoints for web, which triggers eager bundling of all routes and crashes native-only packages during Android/iOS EAS builds.
   - For native mobile builds, leave `"output"` omitted or `"static"`.
2. **Git Hygiene Before Running `eas build`**:
   - EAS CLI archives files tracked in Git. Any uncommitted changes are omitted or produce untracked file discrepancies.
   - **Always**:
     ```bash
     git add .
     git commit -m "Your descriptive message"
     git push origin main
     ```
3. **Local Eager Bundle Verification**:
   - Before committing major changes or triggering a build, ALWAYS run the Android embed export locally:
     ```bash
     node node_modules/expo/bin/cli export:embed --eager --platform android --dev false
     ```
   - If this command exits with code 0, EAS Android build bundling will succeed.

---

## 4. NativeWind v4 & Styling Guidelines

1. **DO NOT import `styled` from `nativewind`**:
   - NativeWind v4 does not export `styled`. Doing so triggers `TS2305: Module 'nativewind' has no exported member 'styled'`.
   - Use standard Tailwind utility classes in `className="..."` or `StyleSheet.create`.
2. **SafeArea & Floating Tab Bar Inset Standard**:
   - The app uses an animated floating tab bar with `height: 70`, `marginBottom: 20`.
   - Any screen inside `app/(root)/(tabs)/` must use `useSafeAreaInsets` to provide proper clearance:
     ```tsx
     import { useSafeAreaInsets } from 'react-native-safe-area-context';

     const insets = useSafeAreaInsets();

     <ScrollView
       contentContainerStyle={{
         paddingTop: insets.top + 65,         // Clears absolute header
         paddingBottom: insets.bottom + 90,   // Crucial: clears floating tab bar
       }}
     >
     ```

---

## 5. Tab Architecture & Responsibilities

The application has 5 core tabs defined in `app/(root)/(tabs)/_layout.tsx`:

| Tab Route | Screen Title | Responsibility | Key Components |
| :--- | :--- | :--- | :--- |
| `home.tsx` | Home | Live greeting, carousel promotions, service options, recent trip deck, insights | `AdCarousel`, `ServiceGrid`, `RideCardDeck`, `VeyoInsightsScreen` |
| `explore.tsx` | Explore | Service discovery, food/logistics category cards, recommendations | `CategoryCard`, `CarouselCard`, `nearbyData` |
| `trips.tsx` | Trips | Complete ride planner & history hub: past journeys with receipts & support, scheduled future rides, radar map card | `Map`, `SavedPlacesRow`, `TripCard`, `ScheduleModal`, `SupportModal` |
| `wallet.tsx` | Wallet | Payment methods, balance cards, top-ups, transaction history | `PaymentCards`, `TransactionList` |
| `profile.tsx` | Profile | User details, emergency contacts, app settings, logout | `ProfileSettings`, `EmergencyContacts` |

---

## 6. State Management Conventions

### Location Store (`useLocationStore` in `@/store/store`)
- Holds `userLatitude`, `userLongitude`, `userAddress`.
- Holds `destinationLatitude`, `destinationLongitude`, `destinationAddress`.
- Usage for rebooking:
  ```tsx
  const { setDestinationLocation } = useLocationStore();
  setDestinationLocation({
    latitude: ride.destination_latitude,
    longitude: ride.destination_longitude,
    address: ride.destination_address,
  });
  router.push('/(utils)/book-ride');
  ```

### Driver Store (`useDriverStore` in `@/store/store`)
- Holds `drivers: AppMarker[]` and `selectedDriver: number | null`.
- Used to highlight selected driver vehicles on maps.

### Data Resolvers (`lib/dataResolvers.ts`)
- Use `getEnrichedRide(rideId)` to automatically resolve customer and driver details (full name, rating, vehicle make/model, avatar) from `constants/data.ts`.

---

## 7. Quality & Verification Checklist for AI Agents

Before submitting changes or completing a task, verify the following:
- [ ] No direct imports of `react-native-maps` in cross-platform/web bundles.
- [ ] No `import { styled } from 'nativewind'`.
- [ ] No `"output": "server"` in `app.json`.
- [ ] All `MapView` props are valid (e.g., `showsPointsOfInterest={false}`, NOT `showsPointsOfInterests`).
- [ ] ScrollViews inside tabs have `paddingBottom: insets.bottom + 90`.
- [ ] Android bundle export test passes:
  ```bash
  node node_modules/expo/bin/cli export:embed --eager --platform android --dev false
  ```
- [ ] Preserved all existing business logic, comments, and working utilities.
- [ ] Git working tree is clean and committed with informative commit messages.
