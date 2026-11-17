import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

import { useState } from "react";
import Button from "./Button";
import SearchField from "./SearchField";
import Select from "./Select";
import M3Icon from "./M3Icon";
import { IconButton } from "./IconButton";

export default function DataTable({
  data,
  columns,
  compact = false,
  defaultPageSize = 5,
}) {
  const [globalFilter, setGlobalFilter] = useState("");
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: defaultPageSize,
  });

  const table = useReactTable({
    data,
    columns,
    state: {
      globalFilter,
      pagination,
    },
    onPaginationChange: setPagination,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  return (
    <div className="flex-1 flex flex-col min-h-0 gap-4">
      {/* Toolbar M3: SearchBar + Selector de filas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="w-full sm:w-96">
          <SearchField
            placeholder="Buscar en la tabla..."
            value={globalFilter ?? ""}
            onChange={(val) => setGlobalFilter(val)}
            size="sm"
          />
        </div>

        <div className="flex items-center gap-2.5 text-sm text-[var(--md-sys-color-on-surface-variant)]">
          <span className="shrink-0 font-medium">Filas por página:</span>
          <Select
            ariaLabel="Filas por página"
            size="sm"
            includeEmptyOption={false}
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            options={[5, 7, 10, 20, 50].map((size) => ({
              value: size,
              label: `${size} filas`,
            }))}
            className="!mb-0 !w-auto"
            buttonClassName="min-w-[118px]"
          />
        </div>
      </div>

      {/* Vista Móvil en Tarjetas M3 (< sm) */}
      <div className="sm:hidden space-y-3">
        {table.getRowModel().rows.length === 0 ? (
          <div className="border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] rounded-xl p-6 text-center text-sm text-[var(--md-sys-color-on-surface-variant)]">
            <p className="font-medium text-sm text-[var(--md-sys-color-on-surface)]">
              No se encontraron registros coincidentes
            </p>
            <p className="text-xs text-[var(--md-sys-color-on-surface-variant)] mt-1">
              Intente ajustar los términos de búsqueda o filtros aplicados.
            </p>
          </div>
        ) : (
          table.getRowModel().rows.map((row) => {
            const cells = row.getVisibleCells();
            const actionCell = cells.find((c) => {
              const h = c.column.columnDef.header;
              return c.column.id === "actions" || h === "" || h === "Acciones";
            });
            const dataCells = cells.filter((c) => c !== actionCell);

            return (
              <div
                key={row.id}
                className="border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-low)] rounded-xl p-4 m3-elevation-1 space-y-3"
              >
                <div className="grid grid-cols-2 gap-x-3 gap-y-2.5">
                  {dataCells.map((cell) => {
                    const headerText =
                      typeof cell.column.columnDef.header === "string"
                        ? cell.column.columnDef.header
                        : cell.column.id;
                    return (
                      <div key={cell.id} className="min-w-0">
                        <span className="block text-xs uppercase tracking-wider text-[var(--md-sys-color-on-surface-variant)] font-medium truncate">
                          {headerText}
                        </span>
                        <div className="text-xs text-[var(--md-sys-color-on-surface)] mt-0.5 break-words">
                          {flexRender(cell.column.columnDef.cell, cell.getContext())}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {actionCell && (
                  <div className="pt-2.5 border-t border-[var(--md-sys-color-outline-variant)] flex items-center justify-end gap-2">
                    {flexRender(actionCell.column.columnDef.cell, actionCell.getContext())}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Data Table M3 Desktop / Tablet (>= sm): ocupa altura completa disponible sin desperdicio */}
      <div className="hidden sm:flex sm:flex-col flex-1 min-h-0 overflow-hidden border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] rounded-xl">
        <div className="flex-1 overflow-auto">
          <table className="w-full text-left border-collapse">
            <thead className="sticky top-0 z-10 bg-[var(--md-sys-color-surface-container)] text-[var(--md-sys-color-on-surface-variant)] border-b border-[var(--md-sys-color-outline-variant)]">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className={`${
                        compact ? "h-12 px-4" : "h-14 px-4"
                      } text-left text-xs uppercase tracking-wider font-medium text-[var(--md-sys-color-on-surface-variant)] whitespace-nowrap`}
                    >
                      {flexRender(
                        header.column.columnDef.header,
                        header.getContext()
                      )}
                    </th>
                  ))}
                </tr>
              ))}
            </thead>

            <tbody className="divide-y divide-[var(--md-sys-color-outline-variant)]/60">
              {table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="py-16 text-center text-sm text-[var(--md-sys-color-on-surface-variant)]"
                  >
                    <div className="flex flex-col items-center justify-center gap-2">
                      <M3Icon name="search_off" size={32} className="text-[var(--md-sys-color-primary)]" />
                      <p className="font-medium text-sm text-[var(--md-sys-color-on-surface)]">
                        No se encontraron registros coincidentes
                      </p>
                      <p className="text-xs text-[var(--md-sys-color-on-surface-variant)]">
                        Intente ajustar los términos de búsqueda o filtros aplicados.
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="hover:bg-[var(--md-sys-color-surface-container-low)] transition-colors text-[var(--md-sys-color-on-surface)]"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <td
                        key={cell.id}
                        className={`${
                          compact ? "py-2.5 px-4" : "py-3.5 px-4"
                        } text-sm leading-5 text-[var(--md-sys-color-on-surface)]`}
                      >
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext()
                        )}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pie de paginación M3 anclado al fondo */}
      <div className="mt-auto pt-2 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-t border-[var(--md-sys-color-outline-variant)]/60 shrink-0">
        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--md-sys-color-on-surface-variant)]">
          <span>
            Mostrando{" "}
            <strong className="font-medium text-[var(--md-sys-color-on-surface)]">
              {table.getRowModel().rows.length}
            </strong>{" "}
            de{" "}
            <strong className="font-medium text-[var(--md-sys-color-on-surface)]">
              {table.getFilteredRowModel().rows.length}
            </strong>{" "}
            registros
          </span>

          <div className="flex items-center gap-2">
            <span>Ir a página:</span>
            <input
              type="number"
              min={1}
              max={table.getPageCount() || 1}
              defaultValue={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="m3-outlined-field h-10 bg-transparent text-[var(--md-sys-color-on-surface)] text-sm rounded-[4px] px-2.5 w-16 text-center outline-none focus:border-[var(--md-sys-color-primary)]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between sm:justify-end gap-1.5">
          <IconButton
            ariaLabel="Primera página"
            variant="outlined"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
            className="hidden sm:inline-flex"
          >
            <M3Icon name="first_page" size={20} />
          </IconButton>

          <Button
            size="md"
            variant="outlined"
            leadingIcon="chevron_left"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>

          <span className="text-sm px-3 text-[var(--md-sys-color-on-surface-variant)] tabular-nums">
            Pág.{" "}
            <strong className="font-medium text-[var(--md-sys-color-on-surface)]">
              {table.getState().pagination.pageIndex + 1}
            </strong>{" "}
            /{" "}
            <strong className="font-medium text-[var(--md-sys-color-on-surface)]">
              {table.getPageCount() || 1}
            </strong>
          </span>

          <Button
            size="md"
            variant="outlined"
            trailingIcon="chevron_right"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>

          <IconButton
            ariaLabel="Última página"
            variant="outlined"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
            className="hidden sm:inline-flex"
          >
            <M3Icon name="last_page" size={20} />
          </IconButton>
        </div>
      </div>
    </div>
  );
}
