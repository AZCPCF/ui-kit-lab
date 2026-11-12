import { useEffect, useState } from 'react';
import type { CustomerSortKey, CustomerStatus } from '../data/types';
import { kitNames, scenarioMeta, shellLabels } from '../data/labels';
import { CustomerTableMantine } from '../scenarios/customer-table/CustomerTableMantine';
import { CustomerTableAntd } from '../scenarios/customer-table/CustomerTableAntd';
import { CustomerTableShadcn } from '../scenarios/customer-table/CustomerTableShadcn';
import {
  INITIAL_TABLE_STATE,
  type CustomerTableState,
} from '../scenarios/customer-table/shared';
import './app-shell.css';

type Kit = keyof typeof kitNames;
type Theme = 'light' | 'dark';
type Direction = 'rtl' | 'ltr';

interface PlaygroundShellProps {
  onOpenSpike: () => void;
}

/**
 * Neutral application shell. Owns kit/theme/direction and the shared table
 * contract; only the selected kit implementation renders in the scenario
 * area. No UI kit is imported here — the chrome stays neutral (isolation).
 * Shared table state survives kit switching (§9 of the phase spec).
 *
 * Global theme: the shell's `theme` state is the SINGLE source of truth.
 * It is (a) mirrored onto <html data-theme="…"> so the neutral chrome and
 * the document background follow it, and (b) passed down as a prop to the
 * selected kit's provider (Mantine forceColorScheme / antd algorithm /
 * shadcn data-mode). Kit implementations keep no theme state of their own.
 * The attribute is removed on unmount so the CSS-isolation spike view keeps
 * its own independent (neutral, light) backdrop.
 */
export function PlaygroundShell({ onOpenSpike }: PlaygroundShellProps) {
  const [selectedKit, setSelectedKit] = useState<Kit>('mantine');
  const [theme, setTheme] = useState<Theme>('light');
  const [direction, setDirection] = useState<Direction>('rtl');
  const [tableState, setTableState] = useState<CustomerTableState>(INITIAL_TABLE_STATE);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    return () => document.documentElement.removeAttribute('data-theme');
  }, [theme]);

  const patchTableState = (patch: Partial<CustomerTableState>) =>
    setTableState((s) => ({ ...s, ...patch }));

  const shared = { theme, dir: direction, state: tableState, onStateChange: patchTableState };

  return (
    <div className="playground-shell" data-theme={theme}>
      <header className="playground-header">
        <div className="playground-title-row">
          <h1>{shellLabels.appTitle}</h1>
          <button type="button" className="spike-link" onClick={onOpenSpike}>
            {shellLabels.spikeLink}
          </button>
        </div>
        <div className="playground-controls">
          <SegmentedControl<Kit>
            groupLabel={shellLabels.kitSelector}
            name="kit"
            value={selectedKit}
            onChange={setSelectedKit}
            options={[
              { value: 'mantine', label: kitNames.mantine },
              { value: 'antd', label: kitNames.antd },
              { value: 'shadcn', label: kitNames.shadcn },
            ]}
          />
          <SegmentedControl<Theme>
            groupLabel={shellLabels.themeSelector}
            name="theme"
            value={theme}
            onChange={setTheme}
            options={[
              { value: 'light', label: 'روشن' },
              { value: 'dark', label: 'تیره' },
            ]}
          />
          <SegmentedControl<Direction>
            groupLabel={shellLabels.directionSelector}
            name="direction"
            value={direction}
            onChange={setDirection}
            options={[
              { value: 'rtl', label: 'راست‌چین' },
              { value: 'ltr', label: 'چپ‌چین' },
            ]}
          />
          <span className="playground-scenario-chip">{scenarioMeta.customerTable}</span>
        </div>
      </header>

      <main className="playground-main">
        <div className="playground-scenario-area">
          {selectedKit === 'mantine' && <CustomerTableMantine {...shared} />}
          {selectedKit === 'antd' && <CustomerTableAntd {...shared} />}
          {selectedKit === 'shadcn' && <CustomerTableShadcn {...shared} />}
        </div>
      </main>
    </div>
  );
}

interface SegmentedControlProps<T extends string> {
  groupLabel: string;
  name: string;
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<{ value: T; label: string }>;
}

/** Accessible native radio group styled as a segmented control. */
function SegmentedControl<T extends string>({
  groupLabel,
  name,
  value,
  onChange,
  options,
}: SegmentedControlProps<T>) {
  return (
    <fieldset className="control-group">
      <legend className="control-group-label">{groupLabel}</legend>
      <div className="segmented">
        {options.map((opt) => (
          <label key={opt.value}>
            <input
              type="radio"
              name={name}
              value={opt.value}
              checked={value === opt.value}
              onChange={() => onChange(opt.value)}
            />
            {opt.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

/* Table sort/filter types are re-exported nowhere; this import keeps the
 * shared contract types referenced from the shell in one place. */
export type { CustomerSortKey, CustomerStatus };
