# Veyo Unified Design System & Multi-Tier Architecture Specification (`DESIGN.md`)

This document defines the authoritative design system, spatial scale, component specifications, tripartite user hierarchy (Customer, Driver, Merchant), and Neon PostgreSQL multi-tier partitioning for the **Veyo** platform.

All code and styling decisions across the mobile application and backend APIs must strictly adhere to the standards outlined in this document.

---

## 1. Brand Identity & Design Principles

Veyo integrates **mobility (ride-hailing)**, **on-demand food delivery**, and **same-day logistics** into a single cohesive platform. Every screen adheres to four core pillars:

1. **Immediate Situational Awareness** — Users grasp their live location, nearby drivers, route progress, or order status within 500ms of opening any view.
2. **Native Ergonomics & Safe-Area Bounds** — All interactive surfaces clear the floating tab bar, dynamic island/notch headers, and keyboard overlays. Touch targets are strictly $\ge 44 \times 44\text{ pt}$.
3. **High-Contrast Clarity** — Neutral slate surfaces (`#F6F8FA`, `#FFFFFF`) paired with electric blue (`#0286FF`), deep brand indigo (`#3122D2`), and semantic status accents create an authoritative visual structure.
4. **Resilient Feedback & Dual-Engine State** — Critical operations (booking rides, scheduling airport transfers, food ordering, menu editing, role switching) provide immediate visual feedback and robust offline fallbacks.

---

## 2. Design Tokens (`constants/designTokens.ts`)

All components import tokens from `@/constants/designTokens` rather than hardcoding arbitrary pixel values:

```typescript
import { SPACING, RADIUS, COLORS, TYPOGRAPHY, LAYOUT, TIERS } from '@/constants/designTokens';
```

### 2.1 Spatial Scale Matrix

| Token | Value | Tailwind Class | Primary Usage |
| :--- | :--- | :--- | :--- |
| `SPACING.screen` | `16px` | `px-4` / `mx-4` | Screen horizontal gutter / outer boundary inset |
| `SPACING.screenCompact` | `12px` | `px-3` | Compact viewports |
| `SPACING.card` | `12px` | `p-3` | Standard card internal padding |
| `SPACING.cardCompact` | `10px` | `p-2.5` | Dense cards (`Options`, `RideCard`, `WeatherCard`) |
| `SPACING.sectionGap` | `12px` | `gap-3` / `my-3` | Vertical separation between stacked sections |
| `SPACING.itemGap` | `8px` | `gap-2` | Separation between items inside a row/grid |
| `SPACING.micro` | `4px` | `gap-1` / `p-1` | Badges, chips, stepper dots |

### 2.2 Corner Radii

| Token | Value | Tailwind Class | Target Elements |
| :--- | :--- | :--- | :--- |
| `RADIUS.xs` | `6px` | `rounded-sm` | Stepper dots, micro tags |
| `RADIUS.sm` | `8px` | `rounded-lg` | Semantic status badges, category chips |
| `RADIUS.md` | `12px` | `rounded-xl` | Buttons, input fields, thumbnails |
| `RADIUS.cardCompact` | `14px` | `rounded-2xl` | Options cards, weather cards, prediction items |
| `RADIUS.card` | `16px` | `rounded-2xl` | Standard elevated cards (`RideCard`, `PackageTracker`) |
| `RADIUS.modal` | `20px` | `rounded-3xl` | Bottom sheets, action modals |
| `RADIUS.pill` | `9999px` | `rounded-full` | Action pills, avatars, floating action button (FAB) |

### 2.3 Color Tokens & Semantic Badges

| Palette Token | Hex Value | Semantic Usage |
| :--- | :--- | :--- |
| `COLORS.primary[500]` | `#0286FF` | Brand Primary: CTAs, active highlights, customer accent |
| `COLORS.primary[100]` | `#F5F8FF` | Tinted background containers |
| `COLORS.brand.indigo` | `#3122D2` | Brand Indigo: Driver partner accent, high-emphasis icons |
| `COLORS.slate.dark` | `#0B1528` | Primary text headings, dark surfaces |
| `COLORS.surface.white` | `#FFFFFF` | Elevated cards, input boxes, modal sheets |
| `COLORS.surface.background` | `#F6F8FA` | Base screen background |
| `COLORS.surface.border` | `#EEEEEE` | Standard component border hairline |

#### Semantic Status Tokens:
- **Completed / Paid**: Background `#ECFDF5`, Text `#059669`, Border `#A7F3D0`
- **Active / In Transit**: Background `#FFF7ED`, Text `#F97316`, Border `#FFEDD5`
- **Searching / Pending**: Background `#FFFBEB`, Text `#D97706`, Border `#FEF3C7`
- **Canceled / Failed**: Background `#FEF2F2`, Text `#DC2626`, Border `#FECACA`

---

## 3. Typography System

Standardized on **Plus Jakarta Sans** across iOS, Android, and Web:

| Font Family | Weight | Token Scale | Size (pt) | Typical Application |
| :--- | :--- | :--- | :--- | :--- |
| `JakartaExtraBold` | 800 | `TYPOGRAPHY.sizes.hero` | 24 | Total balance values ($), splash headlines |
| `JakartaBold` | 700 | `TYPOGRAPHY.sizes.h1` | 20 | Screen titles, primary CTA button text |
| `JakartaBold` | 700 | `TYPOGRAPHY.sizes.h2` | 16 | Section headings ("Veyo Intelligence", "Active Logistics") |
| `JakartaBold` | 700 | `TYPOGRAPHY.sizes.h3` | 14 | Card headers, dish titles, fare amounts |
| `JakartaMedium` | 500 | `TYPOGRAPHY.sizes.body` | 12–13 | Body copy, addresses, form inputs |
| `JakartaSemiBold` | 600 | `TYPOGRAPHY.sizes.caption` | 10–11 | Subtitles, driver names, badge labels |
| `JakartaMedium` | 500 | `TYPOGRAPHY.sizes.micro` | 9–10 | Timestamps, micro sub-labels, distance tags |

---

## 4. Screen Layout & Safe-Area Bounds

### 4.1 ScrollView Safe-Area Clearance Formula

Because Veyo features both an **absolute floating header** at the top and an **animated floating navigation bar** (height `70px`, bottom margin `20px`) at the bottom, all tab screens must strictly use this clearance formula:

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { SPACING } from '@/constants/designTokens';

const insets = useSafeAreaInsets();

<ScrollView
  showsVerticalScrollIndicator={false}
  contentContainerStyle={{
    paddingTop: insets.top + 70,       // Clears absolute floating header (no overlap)
    paddingBottom: insets.bottom + 90, // Clears 70px floating tab bar + margin
    paddingHorizontal: SPACING.screen, // Strict 16px screen gutter
    gap: SPACING.sectionGap,           // Strict 12px section vertical separation
  }}
>
  {/* Content */}
</ScrollView>
```

### 4.2 Floating Action Button (FAB) Positioning

The primary `+` FAB must sit comfortably above the floating tab bar without clipping or colliding with inline elements:
- `position: 'absolute'`
- `bottom: 96` (clears tab bar height 70 + margin 20 + 6px buffer)
- `right: 18`
- `width: 54`, `height: 54`, `borderRadius: 27`
- `backgroundColor: '#0286FF'`, elevation: 5

---

## 5. Tripartite User Hierarchy (3 Tiers)

The app serves three interconnected user tiers configured via `RoleSwitcherPill.tsx` and partitioned in the Neon PostgreSQL database:

```
┌──────────────────────────────────────────────────────────────┐
│                    GLOBAL ROLE SWITCHER                      │
│     [ 👤 Customer ]    [ 🚗 Driver ]    [ 🏪 Merchant ]       │
└──────────────────────────────────────┬───────────────────────┘
                                       │
        ┌──────────────────────────────┼──────────────────────────────┐
        ▼                              ▼                              ▼
  1. CUSTOMER TIER               2. DRIVER TIER                3. MERCHANT TIER
  - Mobility Booking             - Online Shift Radar          - Storefront Dashboard
  - Food & Grocery Catalog       - Live Dispatch Queue         - Order Fulfillment Queue
  - Package Sender (Logistics)   - Earnings & Instant Payout   - Full Menu CRUD Management
  - AI Personalized Insights     - Safety Ratings & Trips      - Revenue & Settlement Payout
```

### 5.1 Customer Tier (`role: 'customer'`)
- **Accent**: `#0286FF` (Electric Blue)
- **Primary Flows**:
  - `WhereToInput` & `QuickActionGrid` for swift mobility and package delivery.
  - `AdCarousel` & `ServiceGrid` for promotions and service switching.
  - `RideCardDeck` for browsing recent completed trips with driver details and ratings.
  - `PackageTrackerCard` for live logistics tracking.
  - `AIPredictionList` & `WeatherCard` for intelligent contextual ordering.

### 5.2 Driver Partner Tier (`role: 'driver'`)
- **Accent**: `#3122D2` (Brand Indigo)
- **Primary Flows**:
  - `DriverProfileHub.tsx`: Driver credential card (Sarah Lee, verified badge), registered Tesla Model 3 (TES1234), payout bank details.
  - Shift HUD: Online/Offline dispatch toggle, active 1.4x surge indicator, shift earnings summary ($184.50, 8 trips).
  - Incoming request dispatch card with countdown timer (14s) and accept/decline actions.
  - Driver earnings ledger and instant payout transfers.

### 5.3 Merchant / Restaurant Tier (`role: 'vendor_admin'`)
- **Accent**: `#D97706` (Amber / Golden Orange)
- **Primary Flows**:
  - `VendorDashboardHub.tsx`: Pizza Paradise / Brooklyn Bites storefront header, operating hours (`10:00 AM - 10:00 PM`), open/close toggle.
  - Kitchen Order Queue: Segmented tabs (`All`, `New`, `In Kitchen`, `Ready for Courier`) with lifecycle status updates.
  - Full Menu CRUD: Add dish modal (price, prep time, dietary tags), edit pricing, inventory in-stock toggle, dish deletion.
  - Merchant settlements and platform fee ledger.

---

## 6. Neon PostgreSQL Multi-Tier Partition Architecture

The backend database runs on **Neon PostgreSQL Serverless** (`ep-mute-darkness-apx5nu52-pooler.c-7.us-east-1.aws.neon.tech/neondb`) with role-partitioned schemas, performance indexes, and dedicated views.

### 6.1 Database Client (`lib/db.ts`)

A centralized, singleton Neon DB client provides type-safe access to partitioned views:

```typescript
import { getDb, dbTiers } from '@/lib/db';

// Query Customer Partition
const customerProfile = await dbTiers.customer.getProfile(userId);
const customerRides = await dbTiers.customer.getRides(userId);

// Query Driver Partition
const driverProfile = await dbTiers.driver.getProfile(driverId);
const driverEarnings = await dbTiers.driver.getEarnings(driverId);

// Query Merchant Partition
const merchantProfile = await dbTiers.merchant.getProfile(vendorId);
const merchantOrders = await dbTiers.merchant.getOrders(vendorId);
const menuItems = await dbTiers.merchant.getMenuItems(vendorId);
```

### 6.2 Partitioned Database Views

1. **`vw_customer_tier`**: Aggregates customer profile, wallet balance, lifetime ride count, food order count, and gross spend.
2. **`vw_driver_tier`**: Aggregates driver profile, vehicle details, license plate, ratings, acceptance/cancellation rates, gross earnings, and pending payout balance.
3. **`vw_merchant_tier`**: Aggregates vendor profile, owner details, active menu items count, lifetime orders, kitchen queue count, and net merchant settlement balance.
4. **`vw_customer_rides`**: Multi-table join between `rides`, `driver_profiles`, and `users` providing enriched ride records with coordinates, timestamps, and ratings.
5. **`vw_merchant_orders`**: Multi-table join between `orders`, `vendors`, and customer records detailing lifecycle order progress, items, and delivery addresses.

### 6.3 Relational Tables (13 Seeded Tables)

| Table | Primary Key | Key Foreign Keys | Key Constraints |
| :--- | :--- | :--- | :--- |
| `users` | `id (UUID)` | — | `role IN ('customer', 'driver', 'vendor_admin')`, unique `clerk_id` |
| `driver_profiles` | `id (UUID)` | `user_id -> users(id)` | Vehicle details, license plate, rating |
| `vendors` | `id (UUID)` | `owner_id -> users(id)` | Category, coordinates, opening/closing hours |
| `menu_items` | `id (UUID)` | `vendor_id -> vendors(id)` | Dietary flags, price, preparation time |
| `rides` | `id (UUID)` | `user_id -> users(id)`, `driver_id -> driver_profiles(id)` | `canceled_by` is nullable UUID (never `'N/A'`) |
| `orders` | `id (UUID)` | `user_id -> users(id)`, `vendor_id -> vendors(id)` | Order status, delivery coordinates |
| `order_items` | `id (UUID)` | `order_id -> orders(id)`, `menu_item_id -> menu_items(id)` | Quantity, unit price, total price |
| `wallet_transactions` | `id (UUID)` | `user_id -> users(id)` | `amount > 0` check constraint, transaction type |
| `driver_earnings` | `id (UUID)` | `driver_id -> driver_profiles(id)` | Base, tips, bonus, total earnings |
| `payments` | `id (UUID)` | `user_id -> users(id)` | Status, gateway intent ID |
| `reviews` | `id (UUID)` | `user_id -> users(id)` | Rating 1–5, feedback text |
| `ride_locations` | `id (UUID)` | `ride_id -> rides(id)` | GPS polyline points |
| `user_activities` | `id (UUID)` | `user_id -> users(id)` | Activity type, timestamp |

---

## 7. Component Retrofit Standards

### 7.1 `components/Options.tsx`
- **Height**: Fixed 80px per row (`height: 80`, total height 168px including 8px gap).
- **Radius**: `RADIUS.cardCompact` (14px).
- **Padding**: `SPACING.cardCompact` (10px).
- **Asset Reliability**: Zero fragile remote URLs (`freepngimg.com`). Bundled local assets (`images.signUpCar`, `images.drinks`) and vector icons (`Ionicons`, `FontAwesome5`, `Feather`) with soft pastel background tints (`#FEF3C7`, `#DCFCE7`, `#E0F2FE`, `#F3E8FF`).
- **Continuous Visibility**: Cards never fade to 0 opacity during morphing; text and icons maintain minimum 80% opacity.

### 7.2 `components/Insights.tsx`
- **No Rogue Floating Buttons**: Removed the absolute positioned traffic light pill (`bottom-16 right-5 z-50`) that previously collided with the primary `+` FAB.
- **`TrafficDigestCard`**: Inlined as an expandable notification banner inside the flow with smooth `LayoutAnimation`.
- **`AIPredictionList`**: Compact card height of 114px (`width: 206`), `RADIUS.cardCompact` (14px), high-contrast gradient overlay, and cart shortcut.
- **`WeatherCard`**: Height 44px, soft blue tint (`#F0F7FF`), weather icon circle, forward chevron.

### 7.3 `components/RideCard.tsx` & `components/RideCardDeck.tsx`
- **Route Stepper**: Removed the bare unstyled `<Ionicons name="arrow-up" />` arrow. Implemented a clean vertical route indicator (green origin dot $\to$ dashed vertical line $\to$ dark destination dot).
- **Map Thumbnail**: Standardized 78x78px with 12px radius, clean error/empty fallbacks.
- **Driver Strip**: Circular avatar (28px), driver name, star rating with gold star icon (`#FBBF24`), semantic status pill (`Completed`, `Canceled`, `Active`), and payment pill (`Paid`, `Pending`).
- **Deck Navigation**: Replaced the awkward protruding bottom button with a clean integrated footer strip (`[ < Prev ]  • • •  [ Next > ]`).

### 7.4 `components/AdCarousel.tsx`
- **Height**: Standardized 110px.
- **Radius**: `RADIUS.card` (16px).
- **Gradient**: Deep rich gradients (`['#1E1B4B', '#0F172A']`, `['#0B1528', '#1E3A8A']`).
- **Typography**: 16pt `JakartaBold` headline, 10.5pt `JakartaMedium` subtitle, 11pt CTA button.
- **Pagination**: Centered dot indicator with 14px active pill.

### 7.5 `components/CustomButton.tsx`
- **Dimensions**: Default `w-fit` and `self-center` with minimum touch target $\ge 44\text{ pt}$ (`py-2.5 px-6 min-w-[160px]`).
- **Radius**: `RADIUS.pill` (rounded-full).
- **Typography**: 13–14pt `JakartaBold`.

### 7.6 `components/OAuth.tsx`
- **Layout**: Centered row (`justifyContent: 'center', gap: 12`).
- **Button Size**: `minWidth: 95`, `paddingVertical: 6.5`, `paddingHorizontal: 14`, `borderRadius: 20`.
- **Icons**: 16x16px Google and Apple brand marks.

### 7.7 `components/RoleSwitcherPill.tsx`
- **Layout**: Centered segmented track (`height: 36`, `borderRadius: 20`, `padding: 3`).
- **Active Pill**: `#0286FF` background with subtle shadow, white text and icon.

---

## 8. Platform Splitting Rules

1. **Never directly import `react-native-maps` into files in `app/`**.
2. **Platform File Extensions**:
   - `components/[Name].native.tsx` — Full native MapView logic.
   - `components/[Name].tsx` — Web-safe fallback / preview widget.
3. **No `styled` from `nativewind`**: NativeWind v4 does not support `styled()`. Use Tailwind utility classes or `StyleSheet.create`.
4. **No `"output": "server"` in `app.json`**: Retain static export to preserve Expo Router and EAS update compatibility.

---

## 9. Design QA & Verification Checklist

- [x] All touch targets are at least $44 \times 44\text{ pt}$.
- [x] All 5 tab screens use `paddingTop: insets.top + 70` and `paddingBottom: insets.bottom + 90`.
- [x] Floating header does not overlap the top card on any screen.
- [x] Primary `+` FAB sits cleanly at `bottom: 96, right: 18` without colliding with inline widgets.
- [x] No rogue absolute positioned buttons hover over the screen (`Insights.tsx`).
- [x] Options cards render bundled reliable assets and never turn completely blank (`Options.tsx`).
- [x] Ride cards feature a clean route stepper with no stray bare arrow icons (`RideCard.tsx`).
- [x] Neon DB multi-tier views (`vw_customer_tier`, `vw_driver_tier`, `vw_merchant_tier`, `vw_customer_rides`, `vw_merchant_orders`) are live and verified.
- [x] TypeScript typechecking passes with zero errors (`tsc --noEmit`).
- [x] Local Metro Android bundle export completes successfully.
