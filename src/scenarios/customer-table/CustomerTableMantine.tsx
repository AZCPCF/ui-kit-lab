import { useMemo, useState } from 'react';
import {
  Badge,
  Button,
  DirectionProvider,
  Flex,
  Loader,
  Menu,
  MantineProvider,
  Pagination,
  Select,
  Stack,
  Table,
  TextInput,
  Text,
  UnstyledButton,
  type MantineColor,
} from '@mantine/core';
import '@mantine/core/styles.css';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { contacts, cities, statuses } from '../../data/fixtures';
import { tableLabels, statusLabels } from '../../data/labels';
import { formatCount, toPersianDigits } from '../../shared/format/numbers';
import { formatJalaliDate } from '../../shared/format/dates';
import { createMantineTheme } from '../../kits/mantine/theme';
import type { Contact, CustomerSortKey, CustomerStatus } from '../../data/types';
import {
  comparePersian,
  filterContacts,
  PAGE_SIZES,
  type CustomerTableState,
} from './shared';

/**
 * Mantine implementation of the Customer Table scenario.
 *
 * Division of labor (recorded in docs/RESEARCH_MATRIX.md):
 * - Rendering: @mantine/core Table — presentational only; Mantine ships no
 *   native datagrid (verified against official docs).
 * - Sorting + pagination: TanStack Table (headless engine, shared decision).
 * - Search + filtering: shared pure selectors, identical across all kits.
 * Persian collation is provided to TanStack via custom `sortingFn`s.
 */

const ROOT_ID = 'kit-mantine-root';

const statusBadgeColors: Record<CustomerStatus, MantineColor> = {
  active: 'green',
  inactive: 'gray',
  pending: 'yellow',
  blocked: 'red',
};

interface ScenarioProps {
  theme: 'light' | 'dark';
  dir: 'rtl' | 'ltr';
  state: CustomerTableState;
  onStateChange: (patch: Partial<CustomerTableState>) => void;
}

const columns: ColumnDef<Contact>[] = [
  {
    accessorKey: 'fullName',
    header: tableLabels.columns.fullName,
    sortingFn: (a, b, id) => comparePersian(a.getValue(id) as string, b.getValue(id) as string),
  },
  {
    accessorKey: 'organizationName',
    header: tableLabels.columns.organization,
    sortingFn: (a, b, id) => comparePersian(a.getValue(id) as string, b.getValue(id) as string),
  },
  { accessorKey: 'phone', header: tableLabels.columns.phone, enableSorting: false },
  { accessorKey: 'email', header: tableLabels.columns.email, enableSorting: false },
  {
    accessorKey: 'city',
    header: tableLabels.columns.city,
    sortingFn: (a, b, id) => comparePersian(a.getValue(id) as string, b.getValue(id) as string),
  },
  { accessorKey: 'status', header: tableLabels.columns.status, enableSorting: false },
  { accessorKey: 'createdAt', header: tableLabels.columns.createdAt }, // ISO strings sort correctly by default
];

/** Module-level theme: a per-render identity would re-process the theme
 * every render (MantineProvider is theme-identity sensitive) and, combined
 * with controlled TanStack state, froze the page (browser-verified). */
const mantineTheme = createMantineTheme();

export function CustomerTableMantine({ theme, dir, state, onStateChange }: ScenarioProps) {
  const [, setPortalEl] = useState<HTMLDivElement | null>(null);
  const { query, city, status } = state;

  const filtered = useMemo(
    () => filterContacts(contacts, { query, city, status }),
    [query, city, status],
  );

  const sorting: SortingState = state.sort ? [{ id: state.sort.key, desc: state.sort.desc }] : [];
  const pagination = { pageIndex: state.page - 1, pageSize: state.pageSize };

  const table = useReactTable({
    data: state.emptyDataset ? [] : filtered,
    columns,
    state: { sorting, pagination },
    onSortingChange: (updater) => {
      const next = typeof updater === 'function' ? updater(sorting) : updater;
      if (next.length === 0) onStateChange({ sort: null, page: 1 });
      else {
        onStateChange({
          sort: { key: next[0].id as CustomerSortKey, desc: next[0].desc },
          page: 1,
        });
      }
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater;
      const patch: Partial<CustomerTableState> = {
        page: next.pageIndex + 1,
        pageSize: next.pageSize as 10 | 25 | 50,
      };
      // Only propagate actual changes — TanStack re-invokes this handler
      // during state sync, and unconditional setState would loop.
      if (patch.page !== state.page || patch.pageSize !== state.pageSize) {
        onStateChange(patch);
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    /* Pagination is fully controlled by the shell contract (page resets are
     * explicit in every handler). TanStack's default autoResetPageIndex
     * queues resetPageIndex() whenever row models rebuild and can revert a
     * just-applied page — the shadcn implementation froze on exactly this
     * (browser-verified), so it is disabled here too for identical,
     * deterministic behavior. */
    autoResetPageIndex: false,
  });

  const rows = table.getRowModel().rows;
  const total = filtered.length;
  const pageSize = table.getState().pagination.pageSize;
  const from = total === 0 ? 0 : table.getState().pagination.pageIndex * pageSize + 1;
  const to = Math.min(from + rows.length, total);

  return (
    <div
      id={ROOT_ID}
      dir={dir}
      className="kit-mantine-root p-2"
      /* With cssVariablesSelector Mantine no longer targets <body>, so the
         body styles must be applied to the scope root ourselves (see
         docs/CSS_ISOLATION_SPIKE.md §F1 — dark mode renders dark paper with
         light ink inherited from the shell without this). */
      style={{
        backgroundColor: 'var(--mantine-color-body)',
        color: 'var(--mantine-color-text)',
      }}
    >
      <DirectionProvider key={dir} initialDirection={dir}>
        <MantineProvider
          forceColorScheme={theme}
          getRootElement={() => document.getElementById(ROOT_ID) ?? undefined}
          cssVariablesSelector={`#${ROOT_ID}`}
          classNamesPrefix="kit-mantine"
          theme={mantineTheme}
        >
          <Stack gap="sm">
            <Toolbar state={state} onStateChange={onStateChange} />
            <Text size="sm" c="dimmed">
              {tableLabels.pageInfo(toPersianDigits(from), toPersianDigits(to), formatCount(total))}
            </Text>
            {state.simulateLoading ? (
              <Flex justify="center" align="center" mih={160} gap="sm">
                <Loader type="dots" />
                <Text size="sm">{tableLabels.loading}</Text>
              </Flex>
            ) : state.emptyDataset ? (
              <EmptyState label={tableLabels.emptyDataset} />
            ) : total === 0 ? (
              <EmptyState label={tableLabels.noResults} />
            ) : (
              <>
                <Table.ScrollContainer minWidth={860}>
                  <Table highlightOnHover verticalSpacing="sm" horizontalSpacing="md">
                    <Table.Thead>
                      {table.getHeaderGroups().map((hg) => (
                        <Table.Tr key={hg.id}>
                          {hg.headers.map((header) => {
                            const sorted = header.column.getIsSorted();
                            return (
                              <Table.Th key={header.id}>
                                {header.column.getCanSort() ? (
                                  <UnstyledButton
                                    onClick={header.column.getToggleSortingHandler()}
                                    fw={600}
                                  >
                                    {flexRender(header.column.columnDef.header, header.getContext())}
                                    {sorted === 'asc' ? ' ↑' : sorted === 'desc' ? ' ↓' : ''}
                                  </UnstyledButton>
                                ) : (
                                  flexRender(header.column.columnDef.header, header.getContext())
                                )}
                              </Table.Th>
                            );
                          })}
                          <Table.Th>{tableLabels.columns.actions}</Table.Th>
                        </Table.Tr>
                      ))}
                    </Table.Thead>
                    <Table.Tbody>
                      {rows.map((row) => (
                        <Table.Tr key={row.id}>
                          {row.getVisibleCells().map((cell) => (
                            <Table.Td key={cell.id}>
                              {renderCell(cell.column.id, cell.getValue() as string)}
                            </Table.Td>
                          ))}
                          <Table.Td>
                            <RowActions />
                          </Table.Td>
                        </Table.Tr>
                      ))}
                    </Table.Tbody>
                  </Table>
                </Table.ScrollContainer>
                <Flex justify="space-between" align="center" gap="sm" wrap="wrap">
                  <PageSizeSelect state={state} onStateChange={onStateChange} />
                  <Pagination
                    value={table.getState().pagination.pageIndex + 1}
                    onChange={(p) => table.setPageIndex(p - 1)}
                    total={table.getPageCount()}
                    siblings={1}
                  />
                </Flex>
              </>
            )}
          </Stack>
        </MantineProvider>
      </DirectionProvider>
      {/* Reserved portal slot for overlays; kept inside the themed root so
          future portaled Mantine components inherit theme + font. */}
      <div ref={setPortalEl} className="kit-portal-slot" />
    </div>
  );
}

function Toolbar({ state, onStateChange }: Omit<ScenarioProps, 'theme' | 'dir'>) {
  return (
    <Flex gap="xs" wrap="wrap" align="center">
      <TextInput
        w={280}
        value={state.query}
        onChange={(e) => onStateChange({ query: e.currentTarget.value, page: 1 })}
        placeholder={tableLabels.searchPlaceholder}
      />
      <Select
        w={150}
        value={state.city}
        onChange={(v) => onStateChange({ city: v ?? 'all', page: 1 })}
        data={[
          { value: 'all', label: tableLabels.cityFilterAll },
          ...cities.map((c) => ({ value: c, label: c })),
        ]}
      />
      <Select
        w={150}
        value={state.status}
        onChange={(v) =>
          onStateChange({ status: (v ?? 'all') as CustomerTableState['status'], page: 1 })
        }
        data={[
          { value: 'all', label: tableLabels.statusFilterAll },
          ...statuses.map((s) => ({ value: s, label: statusLabels[s] })),
        ]}
      />
      <Button variant="subtle" onClick={() => onStateChange({ query: '', city: 'all', status: 'all', page: 1 })}>
        {tableLabels.clearFilters}
      </Button>
      <Button
        variant={state.simulateLoading ? 'filled' : 'light'}
        onClick={() => onStateChange({ simulateLoading: !state.simulateLoading })}
      >
        {tableLabels.simulateLoading}
      </Button>
      <Button
        variant={state.emptyDataset ? 'filled' : 'light'}
        onClick={() => onStateChange({ emptyDataset: !state.emptyDataset, page: 1 })}
      >
        {tableLabels.emptyDatasetToggle}
      </Button>
    </Flex>
  );
}

function PageSizeSelect({ state, onStateChange }: Omit<ScenarioProps, 'theme' | 'dir'>) {
  return (
    <Flex align="center" gap="xs">
      <Text size="sm">{tableLabels.pageSizeLabel}:</Text>
      <Select
        w={90}
        value={String(state.pageSize)}
        onChange={(v) => onStateChange({ pageSize: Number(v ?? '10') as 10 | 25 | 50, page: 1 })}
        data={PAGE_SIZES.map((s) => ({ value: String(s), label: toPersianDigits(s) }))}
        allowDeselect={false}
      />
    </Flex>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <Flex justify="center" align="center" mih={160}>
      <Text size="sm" c="dimmed">
        {label}
      </Text>
    </Flex>
  );
}

function renderCell(columnId: string, value: string) {
  switch (columnId) {
    case 'phone':
      return toPersianDigits(value);
    case 'createdAt':
      return formatJalaliDate(value);
    case 'status': {
      const s = value as CustomerStatus;
      return (
        <Badge color={statusBadgeColors[s]} variant="light">
          {statusLabels[s]}
        </Badge>
      );
    }
    default:
      return value;
  }
}

/** Row actions as an inline Mantine Menu (no portal — inherits theme + font). */
function RowActions() {
  return (
    <Menu withinPortal={false} position="bottom-start">
      <Menu.Target>
        <Button variant="subtle" size="compact-sm">
          {tableLabels.actionsOpen}
        </Button>
      </Menu.Target>
      <Menu.Dropdown>
        <Menu.Item>{tableLabels.actionDetails}</Menu.Item>
        <Menu.Item>{tableLabels.actionEdit}</Menu.Item>
        <Menu.Item color="red">{tableLabels.actionDelete}</Menu.Item>
      </Menu.Dropdown>
    </Menu>
  );
}
