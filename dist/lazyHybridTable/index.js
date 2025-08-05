import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
import { useEffect, useState, useMemo } from 'react';
import { EuiBasicTable, EuiSuperDatePicker, EuiSpacer, EuiFlexGroup, EuiFlexItem, EuiCard, EuiFormRow, EuiFieldSearch, EuiSelect } from '@elastic/eui';
import moment from 'moment';
import { toCapitalized } from '../utils';
const toEpochMillis = (value) => {
    if (value.startsWith('now')) {
        const match = value.match(/^now-(\d+)([smhdw])$/);
        if (match) {
            const [, amount, unit] = match;
            return moment().subtract(Number(amount), unit).valueOf();
        }
        return moment().valueOf(); // fallback
    }
    const parsed = moment(value);
    return parsed.isValid() ? parsed.valueOf() : moment().valueOf();
};
export const LazyHybridTable = ({ fetchStaticData, fetchDynamicData, columns, title = 'Hybrid Table' }) => {
    const [dateRange, setDateRange] = useState({
        startTime: toEpochMillis('now-1h'),
        endTime: toEpochMillis('now'),
    });
    const dropdownOptions = [
        { key: 'period', options: ["1", "5"] },
        { key: 'statistics', options: ["avg", "min", "max"] }
    ];
    const [staticData, setStaticData] = useState([]);
    const [dynamicData, setDynamicData] = useState([]);
    const [pagination, setPagination] = useState({ pageIndex: 0, pageSize: 10 });
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({ period: '5', statistics: "avg", search: '' });
    const totalItemCount = useMemo(() => staticData.length + dynamicData.length, [staticData, dynamicData]);
    const loadStatic = async (range = dateRange, filters = { period: '5', statistics: 'avg', search: '' }) => {
        setLoading(true);
        const data = await fetchStaticData(range, filters);
        setStaticData(data);
        setPagination({ pageIndex: 0, pageSize: 10 });
        setLoading(false);
    };
    const loadDynamic = async (pageIndex, pageSize, range = dateRange, filters = { period: '5', statistics: 'avg', search: '' }) => {
        setLoading(true);
        console.log('memoinvoked loaddynamic before', dynamicData);
        const data = await fetchDynamicData(range, pageIndex, pageSize, filters);
        console.log('memoinvoked loaddynamic', dynamicData);
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
        console.log('memoinvoked', staticData, dynamicData, pagination);
        const dynamicMap = new Map(dynamicData.map(item => [item.nodeId, item]));
        const merged = staticData.map(staticItem => ({
            ...staticItem,
            ...dynamicMap.get(staticItem.nodeId),
        }));
        const start = pagination.pageIndex * pagination.pageSize;
        return merged.slice(start, start + pagination.pageSize);
    }, [staticData, dynamicData, pagination]);
    return (_jsxs(_Fragment, { children: [_jsx(EuiSpacer, { size: "m" }), _jsxs(EuiCard, { layout: "horizontal", title: title, children: [_jsxs(EuiFlexGroup, { gutterSize: "m", alignItems: "center", wrap: true, responsive: true, children: [_jsx(EuiFlexItem, { grow: true, children: _jsx(EuiFormRow, { label: "Search", children: _jsx(EuiFieldSearch, { placeholder: "Search...", value: filters === null || filters === void 0 ? void 0 : filters.search, onChange: (e) => {
                                            const newText = e.target.value;
                                            setFilters({ ...filters, search: newText });
                                        }, fullWidth: true }) }) }), dropdownOptions.map(({ key, options }) => (_jsx(EuiFlexItem, { grow: false, children: _jsx(EuiFormRow, { label: toCapitalized(key), children: _jsx(EuiSelect, { options: options === null || options === void 0 ? void 0 : options.map((v) => ({ value: v, text: v })), value: filters[key], onChange: (e) => {
                                            const updatedFilters = { ...filters, [key]: e.target.value };
                                            setFilters(updatedFilters);
                                        } }) }) }, key))), _jsx(EuiFlexItem, { grow: false, children: _jsx(EuiFormRow, { label: "Time range", children: _jsx(EuiSuperDatePicker, { start: moment(dateRange.startTime).toISOString(), end: moment(dateRange.endTime).toISOString(), onTimeChange: ({ start, end }) => {
                                            const epochStart = toEpochMillis(start);
                                            const epochEnd = toEpochMillis(end);
                                            setDateRange({
                                                startTime: epochStart,
                                                endTime: epochEnd,
                                            });
                                            setStaticData([]);
                                            setDynamicData([]);
                                        }, isAutoRefreshOnly: false }) }) })] }), _jsx(EuiSpacer, { size: "m" }), _jsx(EuiBasicTable, { items: paginatedData, columns: columns, loading: loading, pagination: {
                            pageIndex: pagination.pageIndex,
                            pageSize: pagination.pageSize,
                            totalItemCount,
                            pageSizeOptions: [10, 25, 50],
                        }, onChange: ({ page }) => {
                            setPagination({ pageIndex: page.index, pageSize: page.size });
                        } })] })] }));
};
