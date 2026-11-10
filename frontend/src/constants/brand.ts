/**
 * Product brand constants.
 *
 * The mark lives in `public/brand` so it is served verbatim at the same path in
 * development and production builds, and can be referenced from `index.html`
 * (favicon / apple-touch-icon) without importing an asset module.
 */
export const BRAND = {
  name: 'GymOS',
  /** Square brand mark, cropped from the master artwork with a small optical margin. */
  markSrc: '/brand/gymos-logo.png',
  /** Opaque variant: iOS composites transparent home-screen icons onto black. */
  appleTouchIconSrc: '/brand/apple-touch-icon.png',
} as const;

export type BrandMarkSize = 'sm' | 'md' | 'lg';

/** Tile dimensions for each supported brand mark size. */
export const BRAND_MARK_SIZE_CLASS: Record<BrandMarkSize, string> = {
  sm: 'h-7 w-7 rounded-lg',
  md: 'h-8 w-8 rounded-xl',
  lg: 'h-10 w-10 rounded-xl',
};
