# Veyo Design System Specification (`design.md`)

This document defines the foundational design principles, design tokens, typography, component standards, and spatial layout rules for the **Veyo** cross-platform mobility, food delivery, and on-demand logistics application. It is the authoritative reference for all visual and interaction design decisions.

---

## 1. Brand Identity & Design Principles

Veyo delivers an intelligent, unified augmentation of **ride-hailing**, **food ordering**, and **same-day logistics**. Every interface is built around four primary pillars:

1. **Immediate Situational Awareness** — The user should comprehend their live location, nearby drivers, route progress, restaurant delivery ETA, or order status within 500ms of opening any screen.
2. **Native Ergonomics & Responsiveness** — Every interactive element must respect system safe areas, notch dimensions, and the floating navigation tab bar. Touch targets must be at least **44 × 44 pt**.
3. **High-Contrast Clarity** — Clean white/neutral surfaces paired with vivid electric blue (`#0286FF`) and indigo (`#3122D2`) create an uncluttered, authoritative aesthetic.
4. **Resilient Feedback & Dual-Engine State** — Critical operations (booking rides, scheduling airport transfers, food ordering, menu editing, role switching) always confirm intent and give immediate visual receipt of state transitions.

---

## 2. Color Palette & Tokens

### 2.1 Primary Brand Accents

| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `primary.500` | `#0286FF` | Primary action buttons, active tab pills, selected markers, active highlights |
| `brand.indigo` | `#3122D2` | High-emphasis branding, icon tints, driver partner accents |
| `slate.dark` | `#0B1528` | Deep header text, callout tooltip backgrounds, dark mode surfaces |
| `primary.100` | `#F5F8FF` | Tinted background containers, web fallback cards |
| `primary.200` | `#EBF4FF` | Soft pill backgrounds, selected state surfaces, map borders |
| `primary.300` | `#C3D9FF` | Outlined card borders, scheduled trip card borders |

### 2.2 Surface & Neutral Tones

| Token | Hex Value | Usage |
| :--- | :--- | :--- |
| `surface.white` | `#FFFFFF` | Elevated cards, bottom sheets, input fields, modals |
| `general.500` | `#F6F8FA` | Screen background base for all root tab views |
| `general.300` | `#EEEEEE` | Dividers, subtle borders, segmented control tracks |
| `neutral.200` | `#858585` | Subtitle text, placeholder labels, secondary icons |
| `neutral.900` | `#333333` | Primary body copy, address text |

### 2.3 Semantic Status Tokens

| State | Badge BG | Text / Icon Color | Border | Usage |
| :--- | :--- | :--- | :--- | :--- |
| `completed` / `paid` | `#F0FFF4` | `#0CC25F` / `#2F855A` | `#C6F6D5` | Successful trip, delivered food order, paid invoice |
| `canceled` / `failed` | `#FFF5F5` | `#F56565` / `#C53030` | `#FED7D7` | Canceled ride, canceled order, failed transaction |
| `searching` / `pending` | `#FFFBEB` | `#EAB308` / `#CA8A04` | `#FEF3C7` | Finding driver, restaurant confirming order |
| `in_transit` / `active` | `#FFF7ED` | `#F97316` / `#C2410C` | `#FFEDD5` | En-route ride, food out for delivery |

---

## 3. Typography System

The application standardizes on **Plus Jakarta Sans** across all platforms.

### 3.1 Font Tokens

| Font Token | Weight | Tailwind Class | Typical Usage |
| :--- | :--- | :--- | :--- |
| `JakartaExtraBold` | 800 | `font-JakartaExtraBold` | Hero banners, numeric total fares ($) |
| `JakartaBold` | 700 | `font-JakartaBold` | Screen titles, card headings, CTA labels, tab pills |
| `JakartaSemiBold` | 600 | `font-JakartaSemiBold` | Section subheadings, list headers, user names |
| `JakartaMedium` | 500 | `font-JakartaMedium` | Body text, addresses, metric labels, form inputs |
| `JakartaLight` | 300 | `font-JakartaLight` | Micro captions, disclaimer footers, timestamps |

### 3.2 Scale Matrix

| Role | Size | Weight |
| :--- | :--- | :--- |
| Display | 22–26 pt | `font-JakartaBold` |
| Title (H1) | 18–20 pt | `font-JakartaBold` |
| Section Heading (H2) | 15–16 pt | `font-JakartaBold` |
| Card Title / Subheading | 13–14 pt | `font-JakartaBold` or `font-JakartaSemiBold` |
| Body Regular | 12–13 pt | `font-JakartaMedium` |
| Pills / Badges | 10–11 pt | `font-JakartaBold` |
| Micro / Sub-labels | 9–10 pt | `font-JakartaMedium` |

---

## 4. Layout Grid & Spatial Hierarchy

### 4.1 Screen Padding Standards

- **Horizontal Screen Inset** — `16px` (`mx-4` or `paddingHorizontal: 16`).
- **Card Inset** — `12px` to `16px` internal padding.
- **Card Spacing (Gap)** — `12px` vertical gap between stacked cards.

### 4.2 Safe Area & Tab Bar Clearance

The app uses an animated floating tab bar with `height: 70` and `marginBottom: 20`. All tab screens must provide proper clearance:

```tsx
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const insets = useSafeAreaInsets();

// ScrollView content container style MUST follow this formula:
contentContainerStyle={{
  paddingTop: insets.top + 65,         // Accounts for absolute header
  paddingBottom: insets.bottom + 90,   // Crucial: clears the 70px floating tab bar + margins
}}
```

### 4.3 Elevation & Corner Radii

| Element | Radius | Border | Shadow |
| :--- | :--- | :--- | :--- |
| Standard Cards | `18` (`rounded-2xl`) | 1px `#EEEEEE` | `elevation: 2` (Android) / `shadowOpacity: 0.06` (iOS) |
| Embedded Map Cards | `20` | 1px `#E6F3FF`, `overflow: hidden` | — |
| Pills & Buttons | `10–14` | — | — |
| Floating Micro-Pills | `20` | — | — |
| Floating Navigation Bar | `50` | — | `height: 70`, margin horizontal `20`, bottom `20` |

---

## 5. Component Patterns

### 5.1 Embedded Map Card (`components/Map.native.tsx`)

The embedded map is a high-density, context-aware preview widget:

- **Default Height** — `210px` to `240px`.
- **Top Badge Bar**
  - Left: Pulsing status pill (`● 4 Drivers Nearby` or `● Live GPS`).
  - Right: "Full Map" / Maximize button linking to `/(utils)/map`.
- **Bottom Controls**
  - Right: Floating Recenter FAB with crosshair icon that smoothly animates camera to user coordinates.
  - Bottom Strip: Semi-transparent frosted bar showing current live address or location status.
- **Fallbacks** — When GPS is acquiring or unavailable, falls back gracefully to default regional center without blank screens or crashes.

### 5.2 Segmented Control

Used for dual-mode views such as `[ Past Trips (4) | Scheduled (2) ]`:

- **Track** — `#EEEEEE`, padding `4px`, `borderRadius: 14`.
- **Active Pill** — `#0286FF` background, pure white text, elevation 2.
- **Inactive Pill** — Transparent background, `#666666` text.

### 5.3 Trip History Card

Every historical trip card features:

1. **Header Row** — Ride ID (`RD-20240812-001`), formatted timestamp, and semantic status badge.
2. **Route Timeline**
   - Origin: Green indicator dot (`#0CC25F`) + pickup address.
   - Connecting vertical hairline divider (`#CED1DD`).
   - Destination: Red indicator dot (`#F56565`) + destination address.
3. **Trip Metrics Quad** — Total fare (highlighted in `#0286FF`), distance (`km`), duration (`mins`), and payment status (`Paid`).
4. **Driver Profile Strip** — Driver avatar, full name, rating pill (★ 4.9), vehicle model.
5. **Action Footer**
   - **Rebook** — Primary soft tint (`#EBF4FF`), icon + "Rebook Ride" (sets store destination and opens booking flow).
   - **Trip Support** — Neutral border, icon + "Trip Support" (opens support sheet).

### 5.4 Scheduled Trip Card

Focused on future planning:

- Scheduled departure pill with clock icon: `Tomorrow • 05:30 AM`.
- Vehicle tier: `Veyo Comfort Sedan`.
- Estimated upfront fare.
- Direct quick actions: "Cancel Reservation" (with confirmation alert) and "View Route".

### 5.5 Support Bottom Sheet

Slides up smoothly with top drag handle (`width: 40`, `height: 4`, `#D9D9D9`):

- "I left an item in the car" — alerts driver & logs support ticket.
- "Fare or billing query" — opens dispute review.
- "Download Tax Invoice" — triggers itemized receipt.

### 5.6 Multi-Role Onboarding Cards (`app/(auth)/sign-up.tsx`)

The sign-up screen supports tripartite role registration:

- **Role Selection Cards**: Three elevated selector cards for `Passenger` (`customer`), `Driver Partner` (`driver`), and `Merchant` (`vendor_admin`).
  - Container: `#F8F8F8` background, 1.5px border `#EEEEEE`, `borderRadius: 14`.
  - Active State: Soft blue tint `#EBF4FF`, 1.5px border `#0286FF`.
  - Icon: Centered circle avatar ($34 \times 34\text{ pt}$) with filled `#0286FF` on active.
- **Dynamic Profile Fields**:
  - **Driver Partner**: Vehicle category pills (`Standard`, `Comfort`, `SUV`, `Luxury`), Vehicle Make & Model, License Plate number (auto-capitalized), Driver's License number.
  - **Merchant / Vendor Partner**: Cuisine category pills (`Fast Food`, `Italian`, `Bakery`, `Cafe`, `Japanese`, `American`), Business / Restaurant Name, Store Address, Contact Phone.

### 5.7 Food & Restaurant Catalog Patterns

- **Vendor Discovery Card**: Cover image thumbnail with rating badge (★ 4.8), preparation time (`20 min`), delivery fee (`$2.99`), and cuisine category chip.
- **Menu Item Card**: Food photo, item title, item description, dietary indicators (`Vegetarian` green leaf, `Gluten-Free` wheat-off), base price, and circular `+` button for instant cart addition.
- **Floating Cart Pill**: Sticky bottom bar showing item count badge, restaurant name, and running subtotal with animated slide-up to checkout.

---

## 6. Motion & Feedback Guidelines

- **Map Camera Movements** — Use `animateToRegion` with duration `600ms` for smooth recentering.
- **Button Touches** — Use `activeOpacity={0.8}` or `activeOpacity={0.7}` on touchables for responsive tactile feedback.
- **Modals** — Use `animationType="slide"` with transparent backdrop `rgba(0, 0, 0, 0.5)`.

---

## 7. Platform Splitting Rules (Design-Impacting)

These rules affect how visual components are authored and must be respected when designing any map or native-view surface:

1. **Never directly import `react-native-maps` into files in `app/`**.
2. **Always use Platform Extensions**:
   - `components/[ComponentName].native.tsx` — full native map logic.
   - `components/[ComponentName].tsx` — web-safe stub or preview card.
   - Import cleanly: `import Map from '@/components/Map';`
3. **Existing Native-Split Modules**:
   - `components/Map.native.tsx` & `components/Map.tsx` — embedded map preview widget.
   - `components/MapScreen.native.tsx` & `components/MapScreen.tsx` — full-screen navigation map, re-exported by `app/(utils)/map.tsx`.

---

## 8. Styling Authoring Rules

1. **DO NOT import `styled` from `nativewind`** — NativeWind v4 does not export `styled`; doing so triggers `TS2305`. Use Tailwind utility classes in `className="..."` or `StyleSheet.create`.
2. **No `"output": "server"` in `app.json`** — it triggers eager bundling of all routes and crashes native-only packages during EAS builds. Leave `"output"` omitted or `"static"`.

---

## 9. Tab Architecture & Responsibilities

Five core tabs are defined in `app/(root)/(tabs)/_layout.tsx`:

| Tab Route | Screen Title | Responsibility | Key Components |
| :--- | :--- | :--- | :--- |
| `home.tsx` | Home | Live greeting, carousel promotions, service options, recent trip deck, insights | `AdCarousel`, `ServiceGrid`, `RideCardDeck`, `VeyoInsightsScreen` |
| `explore.tsx` | Explore | Food & vendor discovery feed, cuisine category cards, recommendations | `CategoryCard`, `CarouselCard`, `nearbyData` |
| `trips.tsx` | Trips | Complete ride planner & history hub: past journeys with receipts & support, scheduled future rides, radar map card | `Map`, `SavedPlacesRow`, `TripCard`, `ScheduleModal`, `SupportModal` |
| `wallet.tsx` | Wallet | Payment methods, balance cards, top-ups, transaction history | `PaymentCards`, `TransactionList` |
| `profile.tsx` | Profile | User details, emergency contacts, app settings, logout | `ProfileSettings`, `EmergencyContacts` |

---

## 10. Design QA Checklist

Before any UI change is considered complete, verify:

- [ ] All touch targets are at least `44 × 44 pt`.
- [ ] Tab screens use `paddingTop: insets.top + 65` and `paddingBottom: insets.bottom + 90`.
- [ ] Cards use `borderRadius: 18`, 1px `#EEEEEE` border, and correct elevation/shadow.
- [ ] Status badges use the correct semantic token set from §2.3.
- [ ] Typography uses the correct Plus Jakarta Sans weight and scale row from §3.
- [ ] Map surfaces render via the platform-split component, never a direct `react-native-maps` import in `app/`.
- [ ] MapView props are valid (e.g., `showsPointsOfInterest={false}`, **not** `showsPointsOfInterests`).
- [ ] Modals use `animationType="slide"` with `rgba(0,0,0,0.5)` backdrop.
- [ ] `activeOpacity` is set on all touchables (`0.7`–`0.8`).
- [ ] No `import { styled } from 'nativewind'`.
- [ ] No `"output": "server"` in `app.json`.
- [ ] Android eager bundle export passes locally.
