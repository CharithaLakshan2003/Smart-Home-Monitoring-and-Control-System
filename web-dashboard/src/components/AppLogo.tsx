interface Props {
  size?: number;
  color?: string;
}

/**
 * The app's logo, matching the Android splash and login screens.
 *
 * Same mark the app draws with `Icons.Filled.Home` (Material's filled "home"
 * glyph, 24x24 viewBox), tinted with the theme primary — `--series-1` holds
 * exactly the app's PrimaryDark (#00bcd4) / PrimaryLight (#00838f).
 */
export function AppLogo({ size = 40, color = 'var(--series-1)' }: Props) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={color}
      role="img"
      aria-label="Smart Home logo"
      style={{ flexShrink: 0, display: 'block' }}
    >
      <path d="M10 20v-6h4v6h5v-8h3L12 3 2 12h3v8z" />
    </svg>
  );
}
