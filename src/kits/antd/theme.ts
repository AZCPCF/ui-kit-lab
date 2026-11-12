import { theme as antTheme, type ThemeConfig } from 'antd';
import { FONT_STACK } from '../../shared/theme';

/**
 * antd theme for the playground: Persian font via the official
 * `theme.token.fontFamily` mechanism (CSS-in-JS token, applied to every
 * generated component style, including portaled overlays).
 * Dark mode is `theme.darkAlgorithm` (same as the isolation spike).
 */
export function createAntdTheme(dark: boolean): ThemeConfig {
  return {
    algorithm: dark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: { fontFamily: FONT_STACK },
    cssVar: { key: 'kit-ant' },
  };
}
