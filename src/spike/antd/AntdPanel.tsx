import { useCallback, useState } from 'react';
import {
  App as AntApp,
  Button,
  ConfigProvider,
  Dropdown,
  Input,
  Modal,
  Space,
  Typography,
  theme as antTheme,
} from 'antd';
import { PanelCard } from '../PanelCard';
import { labels, kitMeta } from '../sample-content';

/**
 * Ant Design isolation strategy (details in docs/CSS_ISOLATION_SPIKE.md):
 * - Panel-level `ConfigProvider` with a custom `prefixCls` ("spike-ant")
 *   renames all generated classes, and `cssVar` scopes theme CSS variables.
 * - `theme.darkAlgorithm` drives dark mode via tokens — no document-level
 *   classes are written.
 * - `direction` prop drives RTL at the provider level.
 * - `getPopupContainer` (dropdowns) and `getContainer` (Modal) mount overlays
 *   into the card's portal slot instead of document.body.
 * - Static APIs (message/Modal.xxx) would bypass this context; only the
 *   hook-based APIs are used (antd `App` wrapper).
 */
export function AntdPanel() {
  const [dark, setDark] = useState(false);
  const [rtl, setRtl] = useState(true);
  const [portalEl, setPortalEl] = useState<HTMLDivElement | null>(null);
  const setPortalRef = useCallback((el: HTMLDivElement | null) => {
    setPortalEl(el);
  }, []);

  return (
    <PanelCard
      kitName={kitMeta.antd.name}
      kitSub={kitMeta.antd.sub}
      stateSummary={`حالت: ${dark ? labels.stateDark : labels.stateLight} · جهت: ${rtl ? labels.stateRtl : labels.stateLtr}`}
      controls={
        <>
          <button
            type="button"
            className="spike-toggle"
            onClick={() => setDark((d) => !d)}
          >
            {dark ? labels.lightToggle : labels.darkToggle}
          </button>
          <button
            type="button"
            className="spike-toggle"
            onClick={() => setRtl((r) => !r)}
          >
            {rtl ? labels.ltrToggle : labels.rtlToggle}
          </button>
        </>
      }
      body={
        <div dir={rtl ? 'rtl' : 'ltr'} className="antd-panel-root">
          <ConfigProvider
            prefixCls="spike-ant"
            iconPrefixCls="spike-anticon"
            direction={rtl ? 'rtl' : 'ltr'}
            getPopupContainer={() => portalEl ?? document.body}
            theme={{
              algorithm: dark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
              cssVar: { key: 'spike-ant' },
            }}
          >
            <AntApp>
              <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
                <AntDemoContent portalEl={portalEl} />
              </Space>
            </AntApp>
          </ConfigProvider>
          {/* Portal slot lives INSIDE .antd-panel-root so that portaled
              Modal/Dropdown content inherits the panel's `dir` attribute.
              antd does not set `dir` itself (official RTL support relies on
              the DOM context); with the slot as a sibling of the panel root,
              overlays inherited the shell's direction (browser-verified). */}
          <div ref={setPortalRef} className="spike-portal-slot" />
        </div>
      }
      portalSlot={null}
    />
  );
}

function AntDemoContent({ portalEl }: { portalEl: HTMLDivElement | null }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const { message } = AntApp.useApp();

  return (
    <>
      <Button type="primary">{labels.buttonLabel}</Button>
      <Input placeholder={labels.inputPlaceholder} />
      <Typography.Text type="secondary">{labels.popperNote}</Typography.Text>
      <Button onClick={() => setDialogOpen(true)}>{labels.dialogTrigger}</Button>
      <Button
        onClick={() =>
          message.success({
            content: labels.popoverItems[0],
            key: 'demo',
          })
        }
      >
        {labels.popoverTrigger}
      </Button>

      <Modal
        open={dialogOpen}
        onOk={() => setDialogOpen(false)}
        onCancel={() => setDialogOpen(false)}
        title={labels.dialogTitle}
        getContainer={() => portalEl ?? document.body}
        okText={labels.dialogConfirm}
        cancelText={labels.dialogCancel}
      >
        <Typography.Text>{labels.dialogBody}</Typography.Text>
      </Modal>

      <Dropdown
        menu={{
          items: labels.popoverItems.map((item, i) => ({
            key: `item-${i}`,
            label: item,
          })),
        }}
      >
        <Button variant="outlined">{labels.popoverTrigger}</Button>
      </Dropdown>
    </>
  );
}
