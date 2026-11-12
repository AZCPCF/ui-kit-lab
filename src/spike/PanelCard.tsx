import type { ReactNode } from 'react';

interface PanelCardProps {
  kitName: string;
  kitSub: string;
  /** State summary rendered by the panel, e.g. "تیره · راست‌به‌چپ". */
  stateSummary: string;
  /** Panel-owned mode/direction toggle buttons (neutral shell styling). */
  controls: ReactNode;
  /** Panel content; the panel controls `dir` on this element itself. */
  body: ReactNode;
  /** Kit-owned portal container, rendered inside the card. */
  portalSlot: ReactNode;
}

/**
 * Neutral card wrapper shared by all three panels.
 * It must not carry any kit styles — kits style only what is inside `body`.
 */
export function PanelCard({
  kitName,
  kitSub,
  stateSummary,
  controls,
  body,
  portalSlot,
}: PanelCardProps) {
  return (
    <section className="spike-panel-card" data-spike-kit={kitName}>
      <header className="spike-panel-head">
        <div>
          <h2 className="spike-panel-name">{kitName}</h2>
          <p className="spike-panel-sub">{kitSub}</p>
        </div>
        <div className="spike-panel-controls">{controls}</div>
      </header>
      <p className="spike-panel-state">{stateSummary}</p>
      <div className="spike-panel-body">{body}</div>
      {portalSlot}
    </section>
  );
}
