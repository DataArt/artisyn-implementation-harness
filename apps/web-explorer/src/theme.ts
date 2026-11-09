/**
 * Design tokens for the ported Inside The Loop charts (InsideLoopMap,
 * OnboardingChannels, XrayAnatomy, SkillLifecycle) — adapted from the
 * source project's light-mode palette to this site's dark theme (see
 * styles.css's :root custom properties). Shape matches the source
 * module so the ported chart code needs no logic changes, only this
 * file's values differ.
 */

export const ui = {
  headerBg: '#0F151D',
  headerBorder: '#27313D',
  sidebarBg: '#131B26',
  sidebarHover: '#1A2433',
  sidebarActive: '#0F151D',
  border: '#27313D',
  borderSoft: '#1E2835',
  accent: '#7C6CF0',
  surface: '#131B26',
  surfaceMuted: '#0F151D',
  textPrimary: '#F3F6F9',
  textSecondary: '#A1AFBD',
  textMuted: '#8C9DAD',
  textFaint: '#718399',
} as const;

/** Categorical series slots — kept close to the source palette; these read fine on dark. */
export const series = ['#5B9BE0', '#EB6834', '#2DD4BF', '#C2409A'] as const;

/** Status palette — fixed, never reused as a series colour. */
export const status = {
  good: '#2DD4BF',
  warning: '#EBBE6E',
  serious: '#EC835A',
  critical: '#E25A5A',
  neutral: '#8C9DAD',
} as const;

/** Sequential blue ramp, light → dark (for ordinal / funnel steps). */
export const blueRamp = ['#86B6EF', '#5598E7', '#3987E5', '#2A78D6', '#256ABF', '#1C5CAB'] as const;

export const chart = {
  grid: '#1E2835',
  axis: '#27313D',
  label: '#8C9DAD',
} as const;
