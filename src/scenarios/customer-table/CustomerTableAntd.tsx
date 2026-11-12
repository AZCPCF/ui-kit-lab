import { useMemo } from 'react';
import {
  App as AntApp,
  Button,
  ConfigProvider,
  Dropdown,
  Input,
  Select,
  Space,
  Table,
  Tag,
  type TableProps,
} from 'antd';
import faIR from 'antd/locale/fa_IR';
import { contacts, cities } from '../../data/fixtures';
import { tableLabels, statusLabels } from '../../data/labels';
import { formatCount, toPersianDigits } from '../../shared/format/numbers';
import { formatJalaliDate } from '../../shared/format/dates';
import { createAntdTheme } from '../../kits/antd/theme';
import type { Contact, CustomerSortKey, CustomerStatus } from '../../data/types';
import {
  comparePersian,
  filterContacts,
  PAGE_SIZES,
  type CustomerTableState,
} from './shared';

/**
 * Ant Design implementation of the Customer Table scenario.
 * - Rendering + sorting + filtering UI + pagination: NATIVE antd Table
 *   capabilities (this is the "native datagrid" baseline of the comparison).
 * - Search + filtering logic: shared pure selectors (filter results are fed
 *   as dataSource; the city/status filters map onto antd's own filter UI
 *   where sensible, the toolbar uses native antd Select components).
 */

const STATUS_ORDER: CustomerStatus[] = ['active', 'inactive', 'pending', 'blocked'];

/* Semantic preset statuses: antd maps these to its design tokens, so the
 * badges follow the active theme algorithm (light/dark) automatically —
 * no hardcoded rgb values. */
const statusTagColor: Record<CustomerStatus, string | undefined> = {
  active: 'success',
  inactive: undefined,
  pending: 'warning',
  blocked: 'error',
};

interface ScenarioProps {
  theme: 'light' | 'dark';
  dir: 'rtl' | 'ltr';
  state: CustomerTableState;
  onStateChange: (patch: Partial<CustomerTableState>) => void;
}

/** Theme objects must be stable — creating them per render re-generates
 * antd's design tokens on every keystroke. */
const ANT_THEME_LIGHT = createAntdTheme(false);
const ANT_THEME_DARK = createAntdTheme(true);

export function CustomerTableAntd({ theme, dir, state, onStateChange }: ScenarioProps) {
  const { query, city, status } = state;
  const filtered = useMemo(
    () => filterContacts(contacts, { query, city, status }),
    [query, city, status],
  );

  const dataSource = state.emptyDataset ? [] : filtered;

  const columns: TableProps<Contact>['columns'] = [
    {
      title: tableLabels.columns.fullName,
      dataIndex: 'fullName',
      key: 'fullName',
      sorter: (a: Contact, b: Contact) => comparePersian(a.fullName, b.fullName),
      sortOrder:
        state.sort?.key === 'fullName' ? (state.sort.desc ? 'descend' : 'ascend') : undefined,
    },
    {
      title: tableLabels.columns.organization,
      dataIndex: 'organizationName',
      key: 'organizationName',
      sorter: (a: Contact, b: Contact) => comparePersian(a.organizationName, b.organizationName),
      sortOrder:
        state.sort?.key === 'organizationName'
          ? state.sort.desc
            ? 'descend'
            : 'ascend'
          : undefined,
    },
    { title: tableLabels.columns.phone, dataIndex: 'phone', key: 'phone',
      render: (v: string) => toPersianDigits(v) },
    { title: tableLabels.columns.email, dataIndex: 'email', key: 'email' },
    {
      title: tableLabels.columns.city,
      dataIndex: 'city',
      key: 'city',
      sorter: (a: Contact, b: Contact) => comparePersian(a.city, b.city),
      sortOrder: state.sort?.key === 'city' ? (state.sort.desc ? 'descend' : 'ascend') : undefined,
      filters: cities.map((c) => ({ text: c, value: c })),
      filterMode: 'menu',
      // Filtering itself is done by the shared selectors; the native filter
      // menu is still exposed to compare antd's built-in UX.
      filteredValue: state.city === 'all' ? null : [state.city],
    },
    {
      title: tableLabels.columns.status,
      dataIndex: 'status',
      key: 'status',
      filters: STATUS_ORDER.map((s) => ({ text: statusLabels[s], value: s })),
      filteredValue: state.status === 'all' ? null : [state.status],
      render: (_: string, record: Contact) => (
        <Tag color={statusTagColor[record.status]}>{statusLabels[record.status]}</Tag>
      ),
    },
    {
      title: tableLabels.columns.createdAt,
      dataIndex: 'createdAt',
      key: 'createdAt',
      sorter: (a: Contact, b: Contact) => a.createdAt.localeCompare(b.createdAt),
      sortOrder:
        state.sort?.key === 'createdAt' ? (state.sort.desc ? 'descend' : 'ascend') : undefined,
      render: (v: string) => formatJalaliDate(v),
    },
    {
      title: tableLabels.columns.actions,
      key: 'actions',
      render: (_: unknown, record: Contact) => <RowActions contactName={record.fullName} />,
    },
  ];

  return (
    <div dir={dir} className="antd-kit-root">
      <ConfigProvider
        prefixCls="kit-ant"
        iconPrefixCls="kit-anticon"
        direction={dir}
        locale={faIR}
        theme={theme === 'dark' ? ANT_THEME_DARK : ANT_THEME_LIGHT}
      >
        <AntApp>
          <Space orientation="vertical" size="middle" style={{ width: '100%' }}>
            <Space wrap>
              <Input
                value={state.query}
                onChange={(e) => onStateChange({ query: e.target.value, page: 1 })}
                placeholder={tableLabels.searchPlaceholder}
                style={{ width: 280 }}
                allowClear
              />
              <Select
                value={state.city}
                onChange={(v) => onStateChange({ city: v, page: 1 })}
                options={[
                  { value: 'all', label: tableLabels.cityFilterAll },
                  ...cities.map((c) => ({ value: c, label: c })),
                ]}
                style={{ width: 160 }}
              />
              <Select
                value={state.status}
                onChange={(v) => onStateChange({ status: v, page: 1 })}
                options={[
                  { value: 'all', label: tableLabels.statusFilterAll },
                  ...STATUS_ORDER.map((s) => ({ value: s, label: statusLabels[s] })),
                ]}
                style={{ width: 160 }}
              />
              <Button onClick={() => onStateChange({ query: '', city: 'all', status: 'all', page: 1 })}>
                {tableLabels.clearFilters}
              </Button>
              <Button
                type={state.simulateLoading ? 'primary' : 'default'}
                onClick={() => onStateChange({ simulateLoading: !state.simulateLoading })}
              >
                {tableLabels.simulateLoading}
              </Button>
              <Button
                type={state.emptyDataset ? 'primary' : 'default'}
                onClick={() => onStateChange({ emptyDataset: !state.emptyDataset, page: 1 })}
              >
                {tableLabels.emptyDatasetToggle}
              </Button>
            </Space>

            <Table<Contact>
              rowKey="id"
              dataSource={dataSource}
              columns={columns}
              loading={state.simulateLoading}
              pagination={{
                current: state.page,
                pageSize: state.pageSize,
                pageSizeOptions: PAGE_SIZES.map((s) => String(s)),
                showSizeChanger: true,
                showTotal: (total, range) =>
                  tableLabels.pageInfo(
                    toPersianDigits(range[0]),
                    toPersianDigits(range[1]),
                    formatCount(total),
                  ),
                onChange: (page, pageSize) => onStateChange({ page, pageSize: pageSize as 10 | 25 | 50 }),
              }}
              onChange={(_pagination, filters, sorter) => {
                // Keep the shared contract in sync with antd's native sort
                // and filter UIs (column sorters + filter menus).
                const s = Array.isArray(sorter) ? sorter[0] : sorter;
                if (s && 'order' in s) {
                  if (s.order === 'ascend' || s.order === 'descend') {
                    const next = { key: s.field as CustomerSortKey, desc: s.order === 'descend' };
                    if (state.sort?.key !== next.key || state.sort?.desc !== next.desc) {
                      onStateChange({ sort: next, page: 1 });
                    }
                  } else if (state.sort) {
                    onStateChange({ sort: null, page: 1 });
                  }
                }
                const cityFilter = (filters.city as string[] | null)?.[0] ?? 'all';
                const statusFilter = (filters.status as string[] | null)?.[0] ?? 'all';
                if (cityFilter !== state.city || statusFilter !== state.status) {
                  onStateChange({ city: cityFilter, status: statusFilter as CustomerTableState['status'], page: 1 });
                }
              }}
              scroll={{ x: 960 }}
              locale={{
                emptyText: state.emptyDataset ? tableLabels.emptyDataset : tableLabels.noResults,
              }}
            />
          </Space>
        </AntApp>
      </ConfigProvider>
    </div>
  );
}

/** Row actions via the native antd Dropdown (no custom portal wiring). */
function RowActions({ contactName }: { contactName: string }) {
  return (
    <Dropdown
      menu={{
        items: [
          { key: 'details', label: tableLabels.actionDetails },
          { key: 'edit', label: tableLabels.actionEdit },
          { type: 'divider' },
          { key: 'delete', label: tableLabels.actionDelete, danger: true },
        ],
        onClick: () => undefined, // actions are out of scope this phase
      }}
      trigger={['click']}
    >
      <Button size="small" aria-label={`${tableLabels.actionsOpen}: ${contactName}`}>
        {tableLabels.actionsOpen}
      </Button>
    </Dropdown>
  );
}
