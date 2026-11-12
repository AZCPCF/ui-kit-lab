import { useMemo, useState } from 'react';
import { Direction as RadixDirection } from 'radix-ui';
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  flexRender,
  type ColumnDef,
  type SortingState,
} from '@tanstack/react-table';
import { ArrowDown, ArrowUp, ChevronsUpDown, LoaderCircle } from 'lucide-react';
import { contacts, cities, statuses } from '../../data/fixtures';
import { tableLabels, statusLabels } from '../../data/labels';
import { formatCount, toPersianDigits } from '../../shared/format/numbers';
import { formatJalaliDate } from '../../shared/format/dates';
import type { Contact, CustomerSortKey, CustomerStatus } from '../../data/types';
import {
  Button } from '../../kits/shadcn/ui/button';
import { Input } from '../../kits/shadcn/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '../../kits/shadcn/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../../kits/shadcn/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../kits/shadcn/ui/table';
import {
  comparePersian,
  filterContacts,
  PAGE_SIZES,
  type CustomerTableState,
} from './shared';

/**
 * shadcn/ui implementation of the Customer Table scenario.
 * - Rendering: hand-written shadcn Table primitives (standard shadcn recipe).
 * - Sorting + pagination: TanStack Table — this IS the official shadcn
 *   Data Table approach (TanStack is its documented dependency).
 * - Search + filtering: shared pure selectors.
 * Overlays mount into the panel's portal slot (isolation spike pattern).
 */

/* Status colors use semantic tokens defined in shadcn-scope.css
 * (--success/--warning/--danger per theme; see "Scoped theme variables").
 * They resolve through the scoped token system, so dark mode follows the
 * panel's data-mode automatically. */
const statusColorClass: Record<CustomerStatus, string> = {
  active: 'text-success',
  inactive: 'text-muted-foreground',
  pending: 'text-warning',
  blocked: 'text-danger',
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
  { accessorKey: 'createdAt', header: tableLabels.columns.createdAt },
];

export function CustomerTableShadcn({ theme, dir, state, onStateChange }: ScenarioProps) {
  const [portalEl, setPortalEl] = useState<HTMLDivElement | null>(null);
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
      if (next.length === 0) {
        if (state.sort) onStateChange({ sort: null, page: 1 });
      } else {
        const nextSort = { key: next[0].id as CustomerSortKey, desc: next[0].desc };
        if (state.sort?.key !== nextSort.key || state.sort?.desc !== nextSort.desc) {
          onStateChange({ sort: nextSort, page: 1 });
        }
      }
    },
    onPaginationChange: (updater) => {
      const next = typeof updater === 'function' ? updater(pagination) : updater;
      const page = next.pageIndex + 1;
      const pageSize = next.pageSize as 10 | 25 | 50;
      // Guard against TanStack's render-phase state sync: only propagate
      // actual changes, or the shell setState loops forever.
      if (page !== state.page || pageSize !== state.pageSize) {
        onStateChange({ page, pageSize });
      }
    },
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    /* Pagination is fully controlled by the shell contract, which already
     * resets the page explicitly on search/filter/sort/pageSize changes.
     * TanStack's autoResetPageIndex (default on for client-side pagination)
     * queues resetPageIndex() whenever row models rebuild and here fired
     * right AFTER a page change was applied — reverting pageIndex 1→0 and
     * making next/previous appear dead (browser-verified root cause).
     * See docs/CUSTOMER_TABLE.md §"shadcn pagination". */
    autoResetPageIndex: false,
  });

  const rows = table.getRowModel().rows;
  const total = filtered.length;
  const pageSize = table.getState().pagination.pageSize;
  const from = total === 0 ? 0 : table.getState().pagination.pageIndex * pageSize + 1;
  const to = Math.min(from + rows.length, total);

  const data = state.simulateLoading
    ? null
    : state.emptyDataset
      ? 'empty'
      : total === 0
        ? 'noresults'
        : rows;

  return (
    <div dir={dir} className="shadcn-panel p-2" data-mode={theme}>
      <RadixDirection.Provider dir={dir}>
        <div className="flex flex-col gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <Input
              value={state.query}
              onChange={(e) => onStateChange({ query: e.target.value, page: 1 })}
              placeholder={tableLabels.searchPlaceholder}
              className="max-w-xs"
            />
            <Select value={state.city} onValueChange={(v) => onStateChange({ city: v, page: 1 })}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder={tableLabels.cityFilterAll} />
              </SelectTrigger>
              <SelectContent container={portalEl}>
                <SelectItem value="all">{tableLabels.cityFilterAll}</SelectItem>
                {cities.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={state.status}
              onValueChange={(v) => onStateChange({ status: v as CustomerTableState['status'], page: 1 })}
            >
              <SelectTrigger className="w-40">
                <SelectValue placeholder={tableLabels.statusFilterAll} />
              </SelectTrigger>
              <SelectContent container={portalEl}>
                <SelectItem value="all">{tableLabels.statusFilterAll}</SelectItem>
                {statuses.map((s) => (
                  <SelectItem key={s} value={s}>{statusLabels[s]}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              variant="ghost"
              onClick={() => onStateChange({ query: '', city: 'all', status: 'all', page: 1 })}
            >
              {tableLabels.clearFilters}
            </Button>
            <Button
              variant={state.simulateLoading ? 'default' : 'outline'}
              onClick={() => onStateChange({ simulateLoading: !state.simulateLoading })}
            >
              {tableLabels.simulateLoading}
            </Button>
            <Button
              variant={state.emptyDataset ? 'default' : 'outline'}
              onClick={() => onStateChange({ emptyDataset: !state.emptyDataset, page: 1 })}
            >
              {tableLabels.emptyDatasetToggle}
            </Button>
          </div>

          <p className="text-muted-foreground text-sm">
            {tableLabels.pageInfo(toPersianDigits(from), toPersianDigits(to), formatCount(total))}
          </p>

          {data === null ? (
            <div className="flex min-h-40 items-center justify-center gap-2">
              <LoaderCircle className="size-5 animate-spin" />
              <span className="text-sm">{tableLabels.loading}</span>
            </div>
          ) : data === 'empty' ? (
            <div className="flex min-h-40 items-center justify-center">
              <span className="text-muted-foreground text-sm">{tableLabels.emptyDataset}</span>
            </div>
          ) : data === 'noresults' ? (
            <div className="flex min-h-40 items-center justify-center">
              <span className="text-muted-foreground text-sm">{tableLabels.noResults}</span>
            </div>
          ) : (
            <>
              <div className="rounded-md">
                <Table>
                  <TableHeader>
                    {table.getHeaderGroups().map((hg) => (
                      <TableRow key={hg.id}>
                        {hg.headers.map((header) => (
                          <TableHead key={header.id}>
                            {header.column.getCanSort() ? (
                              <button
                                type="button"
                                onClick={header.column.getToggleSortingHandler()}
                                className="flex items-center gap-1 font-medium"
                              >
                                {flexRender(header.column.columnDef.header, header.getContext())}
                                {header.column.getIsSorted() === 'asc' ? (
                                  <ArrowUp className="size-3.5" />
                                ) : header.column.getIsSorted() === 'desc' ? (
                                  <ArrowDown className="size-3.5" />
                                ) : (
                                  <ChevronsUpDown className="size-3.5 opacity-40" />
                                )}
                              </button>
                            ) : (
                              flexRender(header.column.columnDef.header, header.getContext())
                            )}
                          </TableHead>
                        ))}
                        <TableHead>{tableLabels.columns.actions}</TableHead>
                      </TableRow>
                    ))}
                  </TableHeader>
                  <TableBody>
                    {rows.map((row) => (
                      <TableRow key={row.id}>
                        {row.getVisibleCells().map((cell) => (
                          <TableCell key={cell.id}>
                            {renderCell(cell.column.id, cell.getValue() as string)}
                          </TableCell>
                        ))}
                        <TableCell>
                          <RowActions portalEl={portalEl} />
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground text-sm">{tableLabels.pageSizeLabel}:</span>
                  <Select
                    value={String(state.pageSize)}
                    onValueChange={(v) => onStateChange({ pageSize: Number(v) as 10 | 25 | 50, page: 1 })}
                  >
                    <SelectTrigger className="w-20" size="sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent container={portalEl}>
                      {PAGE_SIZES.map((s) => (
                        <SelectItem key={s} value={String(s)}>{toPersianDigits(s)}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={table.getState().pagination.pageIndex === 0}
                    onClick={() => table.previousPage()}
                  >
                    {tableLabels.prevPage}
                  </Button>
                  <span className="text-sm">
                    {tableLabels.pageInfo(
                      toPersianDigits(from),
                      toPersianDigits(to),
                      formatCount(total),
                    )}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={table.getState().pagination.pageIndex >= table.getPageCount() - 1}
                    onClick={() => table.nextPage()}
                  >
                    {tableLabels.nextPage}
                  </Button>
                </div>
              </div>
            </>
          )}
        </div>
      </RadixDirection.Provider>
      {/* Portal slot inside the scope: Radix overlays mount here and inherit
          tokens, dark mode, direction and the Persian font. */}
      <div ref={setPortalEl} className="shadcn-scope kit-portal-slot" data-mode={theme} />
    </div>
  );
}

function renderCell(columnId: string, value: string) {
  switch (columnId) {
    case 'phone':
      return <span dir="ltr">{toPersianDigits(value)}</span>;
    case 'email':
      return <span dir="ltr">{value}</span>;
    case 'createdAt':
      return formatJalaliDate(value);
    case 'status': {
      const s = value as CustomerStatus;
      return <span className={`font-semibold ${statusColorClass[s]}`}>{statusLabels[s]}</span>;
    }
    default:
      return value;
  }
}

/** Row actions via the existing shadcn Popover (menu pattern, in-scope portal). */
function RowActions({ portalEl }: { portalEl: HTMLDivElement | null }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="sm">
          {tableLabels.actionsOpen}
        </Button>
      </PopoverTrigger>
      <PopoverContent container={portalEl} className="w-40 p-1">
        <button type="button" className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-start text-sm">
          {tableLabels.actionDetails}
        </button>
        <button type="button" className="hover:bg-accent w-full rounded-sm px-2 py-1.5 text-start text-sm">
          {tableLabels.actionEdit}
        </button>
        <button type="button" className="hover:bg-destructive/10 text-destructive w-full rounded-sm px-2 py-1.5 text-start text-sm">
          {tableLabels.actionDelete}
        </button>
      </PopoverContent>
    </Popover>
  );
}
