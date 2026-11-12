import { useCallback, useState } from 'react';
import { Direction as RadixDirection } from 'radix-ui';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from '../../kits/shadcn/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../../kits/shadcn/ui/popover';
import { PanelCard } from '../PanelCard';
import { labels, kitMeta } from '../sample-content';
import { Button } from '../../kits/shadcn/ui/button';
import { Input } from '../../kits/shadcn/ui/input';
import '../../kits/shadcn/shadcn-scope.css';

/**
 * shadcn/ui isolation strategy (details in docs/CSS_ISOLATION_SPIKE.md):
 * - Tailwind v4 runs WITHOUT Preflight (theme.css + utilities.css only,
 *   source-scanned to this folder), so no global element reset exists.
 * - All shadcn theme tokens live on `.shadcn-panel` / `.shadcn-scope`
 *   (the portal slot); dark mode keys off `data-mode` — never a global
 *   `.dark` class and never :root.
 * - Radix `DirectionProvider` (panel-level, dir prop) drives RTL, and the
 *   panel roots set the `dir` attribute for text flow.
 * - Radix portals mount into the card's portal slot via the `container`
 *   prop on DialogPortal/PopoverPortal; the slot re-declares tokens through
 *   `.shadcn-scope` because it sits outside `.shadcn-panel`.
 */
export function ShadcnPanel() {
  const [dark, setDark] = useState(false);
  const [rtl, setRtl] = useState(true);
  const [portalEl, setPortalEl] = useState<HTMLDivElement | null>(null);
  const setPortalRef = useCallback((el: HTMLDivElement | null) => {
    setPortalEl(el);
  }, []);
  const mode = dark ? 'dark' : 'light';

  return (
    <PanelCard
      kitName={kitMeta.shadcn.name}
      kitSub={kitMeta.shadcn.sub}
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
        <div
          className="shadcn-panel"
          data-mode={mode}
          dir={rtl ? 'rtl' : 'ltr'}
        >
          <RadixDirection.Provider dir={rtl ? 'rtl' : 'ltr'}>
            <div className="flex flex-col gap-3">
              <Button>{labels.buttonLabel}</Button>
              <div className="grid gap-1.5">
                <label
                  htmlFor="shadcn-sample-input"
                  className="text-sm font-medium leading-none"
                >
                  {labels.inputLabel}
                </label>
                <Input
                  id="shadcn-sample-input"
                  placeholder={labels.inputPlaceholder}
                />
              </div>
              <p className="text-muted-foreground text-xs">
                {labels.popperNote}
              </p>

              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline">{labels.dialogTrigger}</Button>
                </DialogTrigger>
                <DialogContent portalContainer={portalEl}>
                  <DialogHeader>
                    <DialogTitle>{labels.dialogTitle}</DialogTitle>
                    <DialogDescription>{labels.dialogBody}</DialogDescription>
                  </DialogHeader>
                  <DialogFooter>
                    <DialogClose asChild>
                      <Button>{labels.dialogConfirm}</Button>
                    </DialogClose>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost">{labels.popoverTrigger}</Button>
                </PopoverTrigger>
                <PopoverContent container={portalEl} className="w-64">
                  <p className="mb-2 text-sm font-semibold">
                    {labels.popoverTitle}
                  </p>
                  <div className="flex flex-col gap-1">
                    {labels.popoverItems.map((item) => (
                      <button
                        key={item}
                        type="button"
                        className="hover:bg-accent rounded-sm px-2 py-1.5 text-start text-sm"
                      >
                        {item}
                      </button>
                    ))}
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </RadixDirection.Provider>
        </div>
      }
      portalSlot={
        <div
          ref={setPortalRef}
          data-mode={mode}
          dir={rtl ? 'rtl' : 'ltr'}
          className="shadcn-scope spike-portal-slot"
        />
      }
    />
  );
}
