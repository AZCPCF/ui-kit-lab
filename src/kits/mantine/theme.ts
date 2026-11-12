import { createTheme, type MantineThemeOverride } from '@mantine/core';
import { FONT_STACK } from '../../shared/theme';

/**
 * Mantine theme for the playground: Persian font via the official
 * `theme.fontFamily` mechanism (emitted as --mantine-font-family on the
 * scoped root and consumed by every component, including portaled ones).
 * Isolation props (root element, variables selector, class prefix) are
 * applied in the scenario component exactly like the CSS-isolation spike.
 */
export function createMantineTheme(): MantineThemeOverride {
  return createTheme({
    fontFamily: FONT_STACK,
    headings: { fontFamily: FONT_STACK },
  });
}
