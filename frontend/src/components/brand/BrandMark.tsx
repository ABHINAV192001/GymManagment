import React from 'react';
import { BRAND, BRAND_MARK_SIZE_CLASS, type BrandMarkSize } from '../../constants/brand';

export interface BrandMarkProps {
  /** Tile size. Defaults to `md`, matching the desktop sidebar header. */
  size?: BrandMarkSize;
  className?: string;
}

/**
 * The product logo. Rendered as a white tile because the artwork is built on an
 * opaque light background; the tile keeps the black portion of the mark legible
 * on dark surfaces instead of letting it disappear into the canvas.
 *
 * The mark is decorative: every usage sits next to a text label naming the
 * product or the organization, so an empty `alt` avoids duplicate announcements.
 */
export const BrandMark: React.FC<BrandMarkProps> = ({ size = 'md', className = '' }) => (
  <img
    src={BRAND.markSrc}
    alt=""
    aria-hidden="true"
    draggable={false}
    className={`${BRAND_MARK_SIZE_CLASS[size]} shrink-0 select-none bg-white object-contain ${className}`.trim()}
  />
);

export default BrandMark;
