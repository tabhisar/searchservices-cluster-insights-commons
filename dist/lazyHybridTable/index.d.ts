import React from 'react';
interface LazyHybridTableProps {
    fetchStaticData: (range: {
        startTime: number;
        endTime: number;
    }, filters: Record<string, string>) => Promise<any[]>;
    fetchDynamicData: (range: {
        startTime: number;
        endTime: number;
    }, pageIndex: number, pageSize: number, filters: Record<string, string>) => Promise<any[]>;
    columns: {
        field: string;
        name: string;
    }[];
    title?: string;
}
export declare const LazyHybridTable: React.FC<LazyHybridTableProps>;
export {};
