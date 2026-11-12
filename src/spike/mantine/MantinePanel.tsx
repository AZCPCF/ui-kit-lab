import { useCallback, useState } from 'react';
import {
  Button,
  DirectionProvider,
  MantineProvider,
  Modal,
  Popover,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import '@mantine/core/styles.css';
import { PanelCard } from '../PanelCard';
import { labels, kitMeta } from '../sample-content';

/**
 * Mantine isolation strategy (details in docs/CSS_ISOLATION_SPIKE.md):
 * - `getRootElement` points the `data-mantine-color-scheme` attribute at THIS
 *   panel root instead of <html>, scoping dark-mode selectors to the panel.
 * - `cssVariablesSelector` scopes all `--mantine-*` variables to the panel
 *   root instead of `:root`.
 * - `classNamesPrefix` renames the global `mantine-*` static classes.
 * - `forceColorScheme` keeps the scheme fully React-controlled (no
 *   localStorage, no document-level state).
 * - Modal/Popover stay inside the provider React tree (context survives
 *   portals) but mount their DOM into the card's portal slot via
 *   `portalProps={{ target }}`.
 */
export function MantinePanel() {
  const [scheme, setScheme] = useState<'light' | 'dark'>('light');
  const [dir, setDir] = useState<'ltr' | 'rtl'>('rtl');
  const [portalEl, setPortalEl] = useState<HTMLDivElement | null>(null);
  const setPortalRef = useCallback((el: HTMLDivElement | null) => {
    setPortalEl(el);
  }, []);

  const rootId = 'mantine-panel-root';
  const getRoot = () => document.getElementById(rootId) ?? undefined;

  return (
    <PanelCard
      kitName={kitMeta.mantine.name}
      kitSub={kitMeta.mantine.sub}
      stateSummary={`حالت: ${scheme === 'dark' ? labels.stateDark : labels.stateLight} · جهت: ${dir === 'rtl' ? labels.stateRtl : labels.stateLtr}`}
      controls={
        <>
          <button
            type="button"
            className="spike-toggle"
            onClick={() => setScheme((s) => (s === 'dark' ? 'light' : 'dark'))}
          >
            {scheme === 'dark' ? labels.lightToggle : labels.darkToggle}
          </button>
          <button
            type="button"
            className="spike-toggle"
            onClick={() => setDir((d) => (d === 'rtl' ? 'ltr' : 'rtl'))}
          >
            {dir === 'rtl' ? labels.ltrToggle : labels.rtlToggle}
          </button>
        </>
      }
      body={
        <div
          id={rootId}
          dir={dir}
          className="mantine-panel-root"
          /* With cssVariablesSelector, Mantine no longer targets <body>, so
             the body styles (themed background + text color) must be applied
             to the scope element ourselves. Without this, dark mode renders
             dark paper with light-mode ink inherited from the shell
             (browser-verified failure). Same pattern the shadcn scope uses. */
          style={{
            backgroundColor: 'var(--mantine-color-body)',
            color: 'var(--mantine-color-text)',
          }}
        >
          {/* DirectionProvider is keyed on dir: Mantine reads the initial
              direction once per mount, so switching direction remounts it. */}
          <DirectionProvider key={dir} initialDirection={dir}>
            <MantineProvider
              forceColorScheme={scheme}
              getRootElement={getRoot}
              cssVariablesSelector={`#${rootId}`}
              classNamesPrefix="spike-mantine"
            >
              <Stack gap="sm">
                <Button variant="filled">{labels.buttonLabel}</Button>
                <TextInput
                  label={labels.inputLabel}
                  placeholder={labels.inputPlaceholder}
                />
                <Text size="sm" c="dimmed">
                  {labels.popperNote}
                </Text>
                <MantineOverlays target={portalEl} />
              </Stack>
            </MantineProvider>
          </DirectionProvider>
          {/* Portal slot lives INSIDE #mantine-panel-root so that portaled
              Modal/Popover content inherits the scoped --mantine-* variables
              and the data-mantine-color-scheme attribute (root cause fix:
              the slot used to be a sibling of the panel root, which left
              modal content without variables or color-scheme styles). */}
          <div ref={setPortalRef} className="spike-portal-slot" />
        </div>
      }
      portalSlot={null}
    />
  );
}

function MantineOverlays({ target }: { target: HTMLDivElement | null }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);

  return (
    <>
      <Button variant="light" onClick={() => setDialogOpen(true)}>
        {labels.dialogTrigger}
      </Button>

      <Modal
        opened={dialogOpen}
        onClose={() => setDialogOpen(false)}
        title={labels.dialogTitle}
        portalProps={{ target: target ?? undefined }}
      >
        <Text size="sm">{labels.dialogBody}</Text>
        <Button mt="sm" onClick={() => setDialogOpen(false)}>
          {labels.dialogConfirm}
        </Button>
      </Modal>

      <Popover opened={popoverOpen} withinPortal portalProps={{ target: target ?? undefined }}>
        <Popover.Target>
          <Button
            variant="subtle"
            onClick={() => setPopoverOpen((o) => !o)}
          >
            {labels.popoverTrigger}
          </Button>
        </Popover.Target>
        <Popover.Dropdown>
          <Stack gap={4}>
            <Text size="sm" fw={600}>
              {labels.popoverTitle}
            </Text>
            {labels.popoverItems.map((item) => (
              <Text key={item} size="sm">
                {item}
              </Text>
            ))}
          </Stack>
        </Popover.Dropdown>
      </Popover>
    </>
  );
}
