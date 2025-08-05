import React, { useEffect, useState, useMemo } from 'react';
import {
    EuiBasicTable,
    EuiSuperDatePicker,
    EuiSpacer,
    EuiFlexGroup,
    EuiFlexItem,
    EuiCard,
    EuiFormRow,
    EuiFieldSearch,
    EuiSelect
} from '@elastic/eui';
import moment from 'moment';
import { toCapitalized } from '../utils';

interface LazyHybridTableProps {
    fetchStaticData: (range: { startTime: number; endTime: number }, filters: Record<string, string>) => Promise<any[]>;
    fetchDynamicData: (range: { startTime: number; endTime: number }, pageIndex: number, pageSize: number, filters: Record<string, string>) => Promise<any[]>;
    columns: { field: string; name: string }[];
    title?: string;
}

const toEpochMillis = (value: string): number => {
  if (value.startsWith('now')) {
    const match = value.match(/^now-(\d+)([smhdw])$/);
    if (match) {
      const [, amount, unit] = match;
      return moment().subtract(Number(amount), unit as moment.unitOfTime.DurationConstructor).valueOf();
    }
    return moment().valueOf(); // fallback
  }

  const parsed = moment(value);
  return parsed.isValid() ? parsed.valueOf() : moment().valueOf();
};

export const LazyHybridTable: React.FC<LazyHybridTableProps> = ({
    fetchStaticData,
    fetchDynamicData,
    columns,
    title = 'Hybrid Table'
}) => {
    const [dateRange, setDateRange] = useState<{
        startTime: number;
        endTime: number;
    }>({
        startTime: toEpochMillis('now-1h'),
        endTime: toEpochMillis('now'),
    });

    const dropdownOptions = [
        { key: 'period', options: ["1", "5"] },
        { key: 'statistics', options: ["avg", "min", "max"] }
    ]

    const [staticData, setStaticData] = useState<any[]>([]);
    const [dynamicData, setDynamicData] = useState<any[]>([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState<{ period: string; statistics: string; search: string; }>({ period: '5', statistics: "avg", search: '' });

    const totalItemCount = useMemo(() => staticData.length + dynamicData.length, [staticData, dynamicData]);

    const loadStatic = async (range = dateRange, filters = { period: '5', statistics: 'avg', search: '' }) => {
        setLoading(true);
        const data = await fetchStaticData(range, filters);
        setStaticData(data);
        setPagination({ pageIndex: 0, pageSize: 10 });
        setLoading(false);
    };

    const loadDynamic = async (pageIndex: number, pageSize: number, range = dateRange, filters = { period: '5', statistics: 'avg', search: '' }) => {
        setLoading(true);
        console.log('memoinvoked loaddynamic before', dynamicData)
        const data = await fetchDynamicData(range, pageIndex, pageSize, filters);
        console.log('memoinvoked loaddynamic', dynamicData)
        setDynamicData(JSON.parse(JSON.stringify(data)));
        setLoading(false);
    };

    useEffect(() => {
        loadStatic(dateRange, filters);
    }, [dateRange, filters.period, filters.statistics, filters.search]);

    useEffect(() => {
        loadDynamic(pagination.pageIndex, pagination.pageSize, dateRange, filters);
    }, [pagination.pageIndex, pagination.pageSize, dateRange, filters.period, filters.statistics, filters.search]);

    const paginatedData = useMemo(() => {
        console.log('memoinvoked', staticData, dynamicData, pagination)
        const dynamicMap = new Map(dynamicData.map(item => [item.nodeId, item]));
        const merged = staticData.map(staticItem => ({
            ...staticItem,
            ...dynamicMap.get(staticItem.nodeId),
        }));
        const start = pagination.pageIndex * pagination.pageSize;
        return merged.slice(start, start + pagination.pageSize);
    }, [staticData, dynamicData, pagination]);

    return (
        <>
            <EuiSpacer size="m" />
            <EuiCard layout="horizontal" title={title}>

                <EuiFlexGroup gutterSize="m" alignItems="center" wrap responsive>
                    <EuiFlexItem grow={true}>
                        <EuiFormRow label="Search">
                            <EuiFieldSearch
                                placeholder="Search..."
                                value={filters?.search}
                                onChange={(e) => {
                                    const newText = e.target.value;
                                    setFilters({ ...filters, search: newText })
                                }}
                                fullWidth
                            />
                        </EuiFormRow>
                    </EuiFlexItem>

                    {dropdownOptions.map(({ key, options }) => (
                        <EuiFlexItem key={key} grow={false}>
                            <EuiFormRow label={toCapitalized(key)}>
                                <EuiSelect
                                    options={options?.map((v) => ({ value: v, text: v }))}
                                    value={filters[key as 'period' | 'statistics' | 'search']}
                                    onChange={(e) => {
                                        const updatedFilters = { ...filters, [key]: e.target.value };
                                        setFilters(updatedFilters)
                                    }}
                                />
                            </EuiFormRow>
                        </EuiFlexItem>
                    ))}

                    <EuiFlexItem grow={false}>
                        <EuiFormRow label="Time range">
                            <EuiSuperDatePicker
                                start={moment(dateRange.startTime).toISOString()}
                                end={moment(dateRange.endTime).toISOString()}
                                onTimeChange={({ start, end }) => {
                                    const epochStart = toEpochMillis(start);
                                    const epochEnd = toEpochMillis(end);

                                    setDateRange({
                                        startTime: epochStart,
                                        endTime: epochEnd,
                                    });

                                    setStaticData([]);
                                    setDynamicData([]);
                                }}
                                isAutoRefreshOnly={false}
                            />
                        </EuiFormRow>
                    </EuiFlexItem>
                </EuiFlexGroup>

                <EuiSpacer size="m" />
                <EuiBasicTable
                    items={paginatedData}
                    columns={columns}
                    loading={loading}
                    pagination={{
                        pageIndex: pagination.pageIndex,
                        pageSize: pagination.pageSize,
                        totalItemCount,
                        pageSizeOptions: [10, 25, 50],
                    }}
                    onChange={({ page }: any) => {
                        setPagination({ pageIndex: page.index, pageSize: page.size });
                    }}
                />
            </EuiCard>
        </>
    );
};
