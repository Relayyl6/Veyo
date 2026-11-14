/**
 * Veyo Unified Design System Tokens
 * Source of truth for all spatial dimensions, typography, color semantics, and layout bounds.
 */

export const SPACING = {
  screen: 16,        // Horizontal screen edge inset (mx-4 or px-4)
  screenCompact: 12, // Compact inset for smaller viewports
  card: 12,          // Standard card internal padding
  cardCompact: 10,   // Compact card internal padding (Options, RideCard, etc.)
  sectionGap: 12,    // Vertical gap between stacked content sections
  itemGap: 8,        // Gap between items in a row or list
  micro: 4,          // Badge & micro element spacing
} as const;

export const RADIUS = {
  xs: 6,
  sm: 8,             // Badges, chips, small tags
  md: 12,            // Buttons, inputs, nested elements
  card: 16,          // Standard card radius
  cardCompact: 14,   // Compact card radius (Options, RideCard)
  modal: 20,         // Bottom sheets, popups
  pill: 9999,        // Pill buttons, avatars, circular tags
} as const;

export const COLORS = {
  primary: {
    50: '#F0F7FF',
    100: '#F5F8FF',
    200: '#EBF4FF',
    300: '#C3D9FF',
    400: '#38A0FF',
    500: '#0286FF',   // Brand Primary
    600: '#0070D6',
    700: '#005BB0',
  },
  brand: {
    indigo: '#3122D2',
    indigoDark: '#1E158A',
    indigoLight: '#EBE9FC',
  },
  slate: {
    dark: '#0B1528',
    medium: '#2B3B52',
    light: '#627D98',
  },
  surface: {
    white: '#FFFFFF',
    background: '#F6F8FA',
    muted: '#F8FAFC',
    border: '#EEEEEE',
    borderLight: '#F1F5F9',
    divider: '#E2E8F0',
  },
  text: {
    primary: '#0B1528',
    secondary: '#858585',
    muted: '#A0AEC0',
    light: '#FFFFFF',
    accent: '#0286FF',
  },
  status: {
    completed: { bg: '#F0FFF4', text: '#0CC25F', border: '#C6F6D5' },
    active: { bg: '#FFF7ED', text: '#F97316', border: '#FFEDD5' },
    searching: { bg: '#FFFBEB', text: '#EAB308', border: '#FEF3C7' },
    canceled: { bg: '#FFF5F5', text: '#F56565', border: '#FED7D7' },
  },
} as const;

export const TYPOGRAPHY = {
  fontFamilies: {
    extraBold: 'JakartaExtraBold',
    bold: 'JakartaBold',
    semiBold: 'JakartaSemiBold',
    medium: 'JakartaMedium',
    regular: 'JakartaRegular',
    light: 'JakartaLight',
  },
  sizes: {
    hero: 24,
    h1: 20,
    h2: 16,
    h3: 14,
    body: 13,
    caption: 11,
    micro: 9,
  },
} as const;

export const LAYOUT = {
  minTouchTarget: 44,       // Standard 44x44pt accessibility touch target
  tabBarHeight: 70,         // Floating navigation bar height
  tabBarBottomMargin: 20,   // Floating navigation bar margin from bottom
  headerHeight: 52,         // Floating header height
  fabBottomOffset: 100,     // Floating Action Button bottom positioning (tabBarHeight + margin + gap)
  fabRightOffset: 18,       // Floating Action Button right positioning
} as const;

export const TIERS = {
  customer: {
    role: 'customer',
    label: 'Customer',
    accentColor: COLORS.primary[500],
    badgeBg: COLORS.primary[100],
    route: '/(root)/(tabs)/home',
  },
  driver: {
    role: 'driver',
    label: 'Driver',
    accentColor: COLORS.brand.indigo,
    badgeBg: COLORS.brand.indigoLight,
    route: '/(root)/driver-dashboard',
  },
  merchant: {
    role: 'merchant',
    label: 'Merchant',
    accentColor: '#D97706',
    badgeBg: '#FEF3C7',
    route: '/(root)/merchant-dashboard',
  },
} as const;
