# Veyo AI Agent Developer Guidelines (`agent.md`)

This document serves as the mandatory operational manual and architectural guide for AI coding assistants working on the **Veyo** codebase. Follow these instructions strictly to ensure stability, prevent build failures, and maintain codebase consistency.

---

## 1. Tech Stack & Environment

| Layer | Technology |
| :--- | :--- |
| Framework | React Native `0.81.5` with Expo SDK `54` |
| Routing | Expo Router v4 (filesystem-based routing in `app/`) |
| Styling | NativeWind v4 with Tailwind CSS & React Native `StyleSheet` |
| Typography | Plus Jakarta Sans (`font-Jakarta`, `font-JakartaBold`, etc.) |
| State Management | Zustand stores in `store/store.ts` |
| Database | Neon Serverless PostgreSQL (`@neondatabase/serverless`) via `DATABASE_URL` |
| Authentication | Clerk Expo (`@clerk/expo`) |
| Mapping | `react-native-maps` (native iOS Apple Maps / Android Google Maps) |
| Target OS / Build System | Android & iOS via Expo Application Services (EAS) |

---

## 2. Critical Platform Splitting Rules (NEVER BREAK)

### 2.1 Native Modules & Web Bundler Isolation

`react-native-maps` and native view managers rely on native code (`codegenNativeCommands`, Obj-C / Java). When Expo CLI exports for web or performs eager bundle evaluation, importing native modules in cross-platform files causes a build crash:

```
TypeError: (0, _reactNative.codegenNativeCommands) is not a function
```

### 2.2 Mandatory Rules

1. **Never directly import `react-native-maps` into files in `app/`.**
2. **Always use Platform Extensions (`.native.tsx` and `.tsx`)**:
   - Heavy screens or components with native maps must live in `components/`:
     - `components/[ComponentName].native.tsx` — contains full native map logic.
     - `components/[ComponentName].tsx` — web-safe stub or preview card.
   - Then re-export cleanly in the `app/` route file or import directly:
     ```tsx
     // Safe: Automatically resolves .native on device and .tsx on web/server
     import Map from '@/components/Map';
     ```
3. **Existing Native-Split Modules**:
   - `components/Map.native.tsx` & `components/Map.tsx` — embedded map preview widget used across tabs.
   - `components/MapScreen.native.tsx` & `components/MapScreen.tsx` — complete 1,400-line full-screen navigation map, re-exported by `app/(utils)/map.tsx`.

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
   - If this command exits with code `0`, EAS Android build bundling will succeed.

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
| `explore.tsx` | Explore | Food & vendor discovery feed, cuisine category cards, recommendations | `CategoryCard`, `CarouselCard`, `nearbyData` |
| `trips.tsx` | Trips | Complete ride planner & history hub: past journeys with receipts & support, scheduled future rides, radar map card | `Map`, `SavedPlacesRow`, `TripCard`, `ScheduleModal`, `SupportModal` |
| `wallet.tsx` | Wallet | Payment methods, balance cards, top-ups, transaction history | `PaymentCards`, `TransactionList` |
| `profile.tsx` | Profile | User details, emergency contacts, app settings, logout | `ProfileSettings`, `EmergencyContacts` |

---

## 6. Multi-Role & Domain CRUD Pipeline

The application features a unified backend and client-side architecture supporting three primary user personas:
1. **Passenger / Customer** (`role: 'customer'`): Explores mobility services, books rides, orders food.
2. **Driver Partner** (`role: 'driver'`): Driver profile (`driver_profiles`), vehicle metadata, GPS radar, ride requests.
3. **Merchant / Vendor Partner** (`role: 'vendor_admin'`): Vendor entity (`vendors`), menu items (`menu_items`), incoming food orders.

### 6.1 Backend API Endpoints (`app/(api)`) — Full CRUD Matrix

| Route | Methods | Purpose & Capabilities |
| :--- | :--- | :--- |
| `/(api)/user` | `POST`, `GET` | **Create / Read**: Upsert user account with role, query user by `clerkId` or `userId` with linked driver/vendor profiles. |
| `/(api)/driver` | `POST`, `GET`, `PATCH`, `DELETE` | **Full CRUD**: Register driver, fetch online drivers for radar map, update live GPS & vehicle details, deactivate profile (`is_deleted = true`). |
| `/(api)/vendor` | `POST`, `GET`, `PATCH`, `DELETE` | **Full CRUD**: Register vendor, list/search by category or name, update hours & delivery fee, archive vendor. |
| `/(api)/menu` | `GET`, `POST`, `PATCH`, `DELETE` | **Full CRUD**: Fetch menu items by vendor/category, create food item, update price/availability, delete food item permanently. |
| `/(api)/ride` | `POST`, `GET`, `PATCH`, `DELETE` | **Full CRUD**: Dispatch ride requests, query ride history, update ride status (`accepted`, `arrived`, `in_transit`, `completed`), cancel ride with reason. |
| `/(api)/order` | `POST`, `GET`, `PATCH`, `DELETE` | **Full CRUD**: Place multi-item food orders with `order_items`, fetch customer/vendor orders, update lifecycle status, cancel order. |
| `/(api)/seed` | `POST` | Seeds Neon DB with base mock users, drivers, vendors, menu items, and rides. |

### 6.2 Domain Services Layer (`services/`)
Any future screen or subagent should use these typed domain services (which feature automatic offline / mock fallbacks to `constants/data.ts`):

- **`services/authService.ts`**:
  - `registerUserAccount(params)`
  - `registerDriverProfile(params)`
  - `registerVendorProfile(params)`
  - `fetchFullUserProfile(clerkId)`
- **`services/driverService.ts`**:
  - `getOnlineDrivers()`
  - `getDriverProfile({ driverId, userId })`
  - `updateDriverLocation(params)`
  - `updateDriverProfile(params)`
  - `deleteDriverProfile(driverId)`
- **`services/vendorService.ts`**:
  - `getVendorsList({ category, query })`
  - `getVendorWithMenu(vendorId)`
  - `getMenuItemsForVendor(vendorId, category)`
  - `createNewMenuItem(params)`
  - `updateMenuItem(itemId, updates)`
  - `deleteMenuItem(itemId)`
  - `updateVendorProfile(vendorId, updates)`
  - `deleteVendorProfile(vendorId)`
- **`services/rideService.ts`**:
  - `requestRide(params)`
  - `fetchUserRides({ userId, clerkId })`
  - `updateRideStatus(rideId, status, extra)`
  - `cancelRide(rideId, reason)`
  - `deleteRide(rideId)`
- **`services/orderService.ts`**:
  - `placeFoodOrder(params)`
  - `fetchUserOrders({ userId, clerkId })`
  - `updateOrderStatus(orderId, status, driverId)`
  - `cancelOrder(orderId, reason)`
  - `deleteOrder(orderId)`

---

## 7. State Management Conventions

### 7.1 Location Store (`useLocationStore` in `@/store/store`)

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

### 7.2 Driver Store (`useDriverStore` in `@/store/store`)

- Holds `drivers: AppMarker[]` and `selectedDriver: number | null`.
- Used to highlight selected driver vehicles on maps.

### 7.3 User & Session Store (`useUserStore` in `@/store/store`)

- Holds authenticated `user: User | null`, `role: 'customer' | 'driver' | 'vendor_admin'`.
- Holds `driverProfile: DriverProfile | null` for drivers.
- Holds `vendorProfile: Vendor | null` for merchants.
- `setUserSession(user, driverProfile?, vendorProfile?)`

### 7.4 Food Cart Store (`useCartStore` in `@/store/store`)

- Holds `vendorId`, `vendorName`, `items: CartItem[]`.
- `addItem(item, vendor, instructions?)`, `removeItem(itemId)`, `updateQuantity(itemId, quantity)`.
- `getSubtotal()`, `getItemCount()`, `clearCart()`.

### 7.5 Vendor & Catalogue Store (`useVendorStore` in `@/store/store`)

- Holds `vendors: Vendor[]`, `activeVendor`, `selectedCategory`, `searchQuery`.
- Menu item live mutations: `addMenuItemToActiveVendor(item)`, `updateMenuItemInActiveVendor(item)`, `deleteMenuItemFromActiveVendor(itemId)`.

### 7.6 Ride Store (`useRideStore` in `@/store/store`)

- Holds `activeRide: Ride | null`, `recentRides: Ride[]`, `updateRideStatus(status)`.

---

## 8. Quality & Verification Checklist for AI Agents

Before submitting changes or completing a task, verify the following:

- [ ] No direct imports of `react-native-maps` in cross-platform/web bundles.
- [ ] No `import { styled } from 'nativewind'`.
- [ ] No `"output": "server"` in `app.json`.
- [ ] All `MapView` props are valid (e.g., `showsPointsOfInterest={false}`, **NOT** `showsPointsOfInterests`).
- [ ] ScrollViews inside tabs have `paddingBottom: insets.bottom + 90`.
- [ ] Android bundle export test passes:
  ```bash
  node node_modules/expo/bin/cli export:embed --eager --platform android --dev false
  ```
- [ ] Preserved all existing business logic, comments, and working utilities.
- [ ] Git working tree is clean and committed with informative commit messages.

---

## 9. Cross-Reference: Design ↔ Engineering

| Design Concern | Governing Rule (design.md) | Enforcement (agent.md) |
| :--- | :--- | :--- |
| Map surfaces | §5.1 Embedded Map Card | §2 Platform Splitting |
| Floating tab bar clearance | §4.2 Safe Area & Tab Bar Clearance | §4.2 Inset Standard |
| Typography & color tokens | §2, §3 | §4 NativeWind v4 (use `className`, no `styled`) |
| Multi-role onboarding | §5.6 Role Onboarding Cards | §6 Multi-Role & Domain CRUD Pipeline |
| Food & menu item patterns | §5.7 Food & Restaurant Patterns | §6.2, §7.4 Food Cart & Vendor Store |
| Build stability | §7 Platform Splitting (design) | §3 EAS Build & `app.json` |
| Reusable Component Catalog | §10 Reusable Components | §10 Modular Component Architecture |
| QA gate | §11 Design QA Checklist | §8 Quality & Verification Checklist |

---

## 10. Modular Component Architecture

Every UI surface prioritizes reusable, modular component design to allow cross-screen composability:

1. **Mobility & Navigation**:
   - `TrafficAlertBanner`: warning banner with "Reroute" action.
   - `WhereToInput`: dual-point origin/destination entry box.
   - `DestinationShortcuts`: fast circular shortcuts for Home, School, Work, Add.
   - `QuickActionGrid`: swift mobility & package dispatch cards.
   - `RideOptionCard`: vehicle tier rows (Economy, Comfort, Veyo EV, Bike) and carousel cards (Veyo Black).
   - `PackageTrackerCard`: en-route shipment tracking card.
2. **Food Catalog & Ordering**:
   - `FoodDiscoveryCard`: 2-column food discovery cards with rating and prep time.
   - `VendorStorefrontModal`: complete store profile, metrics strip, featured menu, view cart bar.
   - `FoodDetailModal`: customizable dish dialog with protein radios, topping checkboxes, instructions, quantity stepper.
   - `CartSummaryModal`: cart list, promo code, delivery address, order summary, multi-method checkout.
   - `OrderSuccessModal`: completion checkmark dialog with Order ID.
   - `OrderTrackingModal`: live delivery route map, 3:25 PM arrival ETA, 4-step progress stepper, courier card with Call & Chat.
3. **Wallet & Financial Suite**:
   - `WalletBalanceCard`: ₦ balance card with Top Up, Send, and history preview.
   - `StudentBudgetCard`: budget protection mode with monthly limit and progress indicator.
   - `SpendingChart`: weekly spending bar chart with day selection.
   - `SendMoneyModal`: contact avatars, bank selector, verified recipient, amount chips.
   - `TopUpModal`: virtual bank transfer details with copy buttons.
   - `AnalyticsModal`: 7–30 day analytics with earnings vs commission bar charts.
   - `TransactionHistoryModal`: categorized transactions grouped by date.
4. **Interactive Support & Rider Settings**:
   - `AITailoredPreferences`: preference toggles (Fast pickup, Budget-first, Comfort-first).
   - `QuietModeModal`: rules for silent rides with "Got it" confirmation.
   - `RideChatModal`: real-time driver chat with arrival countdown, timestamps, bubble styling, text input.

Both checklists must pass before any change is merged. Where a rule appears in both documents, the stricter form applies.
