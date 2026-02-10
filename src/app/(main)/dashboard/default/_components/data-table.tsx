"use client";
import * as React from "react";

import { Database, Plus, Search } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { useDataTableInstance } from "@/hooks/use-data-table-instance";
import { voterApi } from "@/lib/api";

import { DataTable as DataTableNew } from "../../../../../components/data-table/data-table";
import { DataTablePagination } from "../../../../../components/data-table/data-table-pagination";
import { DataTableViewOptions } from "../../../../../components/data-table/data-table-view-options";
import { withDndColumn } from "../../../../../components/data-table/table-utils";
import { AddVoterDialog } from "./add-voter-dialog";
import { voterColumns } from "./columns";

export function DataTable({ data: _initialData }: { data: any[] }) {
  const [data, setData] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState("");
  const [totalPages, setTotalPages] = React.useState(1);

  const columns = withDndColumn(voterColumns);

  // Initialize the table instance with server-side pagination support
  const table = useDataTableInstance({
    data,
    columns,
    getRowId: (row) => row.id.toString(),
    defaultPageSize: 10,
    pageCount: totalPages,
    manualPagination: true,
  });

  // Extract pagination state from the table instance
  const { pageIndex, pageSize } = table.getState().pagination;

  const fetchVoters = React.useCallback(async () => {
    setLoading(true);
    try {
      const response = await voterApi.search({
        search,
        page: pageIndex + 1,
        limit: pageSize,
      });
      if (response.success) {
        setData(response.data);
        setTotalPages(response.pagination.totalPages);
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to fetch voters");
    } finally {
      setLoading(false);
    }
  }, [search, pageIndex, pageSize]);

  // Fetch data when search, pageIndex, or pageSize changes
  React.useEffect(() => {
    fetchVoters();
  }, [fetchVoters]);

  const handleExport = async () => {
    try {
      const blob = await voterApi.exportCsv();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `voters_export_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      toast.success("Export successful!");
    } catch (error: any) {
      toast.error(error.message || "Export failed");
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const response = await voterApi.importCsv(file);
      toast.success(response.message || "Import successful!");
      fetchVoters();
    } catch (error: any) {
      toast.error(error.message || "Import failed");
    }
  };

  return (
    <Tabs defaultValue="outline" className="w-full flex-col justify-start gap-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search voters..."
            className="pl-8"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              table.setPageIndex(0); // Reset to first page via table instance
            }}
          />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <DataTableViewOptions table={table} />
          <AddVoterDialog onSuccess={fetchVoters} />
          <div className="relative">
            <input
              type="file"
              accept=".csv"
              className="absolute inset-0 z-10 cursor-pointer opacity-0"
              onChange={handleImport}
            />
            <Button variant="outline" size="sm">
              <Plus className="mr-2 h-4 w-4" />
              <span>Import</span>
            </Button>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport}>
            <Database className="mr-2 h-4 w-4" />
            <span>Export</span>
          </Button>
        </div>
      </div>
      <TabsContent value="outline" className="relative flex flex-col gap-4 overflow-auto">
        <div className="overflow-hidden rounded-lg border">
          {loading ? (
            <div className="flex h-32 items-center justify-center">Loading voters...</div>
          ) : (
            <DataTableNew dndEnabled table={table} columns={columns} onReorder={setData} />
          )}
        </div>
        <DataTablePagination table={table} />
      </TabsContent>
    </Tabs>
  );
}
