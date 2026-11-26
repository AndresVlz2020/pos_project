import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getFilteredRowModel,
  flexRender,
} from "@tanstack/react-table";

import { useEffect, useState } from "react";
import Button from "./Button";
import SearchField from "./SearchField";
import Select from "./Select";
import Input from "./Input";
import M3Icon from "./M3Icon";
import { IconButton } from "./IconButton";

const VALID_PAGE_SIZES = [5, 7, 10, 20, 50];

function resolveTableStorageKey(storageKey) {
  if (storageKey) return `dpiero_table_page_size:${storageKey}`;
  if (typeof window !== "undefined" && window.location?.pathname) {
    return `dpiero_table_page_size:${window.location.pathname.toLowerCase()}`;
  }
  return "dpiero_table_page_size:default";
}

function readPersistedPageSize(key, fallback) {
  try {
    if (typeof window === "undefined") return fallback;
    const raw = Number(sessionStorage.getItem(key));
    return VALID_PAGE_SIZES.includes(raw) ? raw : fallback;
  } catch {
    return fallback;
  }
}

export default function DataTable({
  data,
  columns,
  compact = false,
  defaultPageSize = 5,
  storageKey = "",
  filters = [],
  onClearFilters,
}) {
  const resolvedKey = resolveTableStorageKey(storageKey);
  const [globalFilter, setGlobalFilter] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [pagination, setPagination] = useState(() => ({
    pageIndex: 0,
    pageSize: readPersistedPageSize(resolvedKey, defaultPageSize),
  }));

  const activeFilterCount = filters.filter((f) => {
    const defVal = f.defaultValue ?? "all";
    return f.value !== undefined && f.value !== null && f.value !== "" && f.value !== defVal;
  }).length;

  useEffect(() => {
    try {
      sessionStorage.setItem(resolvedKey, String(pagination.pageSize));
    } catch {
      // Ignorar errores de almacenamiento
    }
  }, [resolvedKey, pagination.pageSize]);

  const table = useReactTable({
    data,
    columns,
    autoResetPageIndex: false,
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

  const pageCount = table.getPageCount();
  useEffect(() => {
    if (pageCount > 0 && pagination.pageIndex >= pageCount) {
      setPagination((prev) => ({
        ...prev,
        pageIndex: Math.max(0, pageCount - 1),
      }));
    }
  }, [pageCount, pagination.pageIndex]);

  return (
    <div className="w-full flex flex-col gap-4">
      {/* Toolbar M3: SearchBar + Botón de Filtros + Selector de filas */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 shrink-0">
        <div className="flex items-center gap-2 w-full sm:w-auto sm:min-w-[360px]">
          <div className="flex-1 sm:w-80">
            <SearchField
              placeholder="Buscar en la tabla..."
              value={globalFilter ?? ""}
              onChange={(val) => setGlobalFilter(val)}
              size="sm"
            />
          </div>
          {filters.length > 0 && (
            <div className="relative shrink-0">
              <IconButton
                variant={filtersOpen || activeFilterCount > 0 ? "tonal" : "standard"}
                hitSize={40}
                iconSize={20}
                ariaLabel="Mostrar u ocultar filtros"
                title="Filtros de la tabla"
                onClick={() => setFiltersOpen((prev) => !prev)}
              >
                <M3Icon name="filter_list" size={20} />
              </IconButton>
              {activeFilterCount > 0 && (
                <span className="pointer-events-none absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-[var(--md-sys-color-primary)] text-[var(--md-sys-color-on-primary)] text-[10px] font-bold leading-[18px] text-center tabular-nums">
                  {activeFilterCount}
                </span>
              )}
            </div>
          )}
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

      {filtersOpen && filters.length > 0 && (
        <div className="dpiero-modal-in rounded-2xl border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface)] p-3.5 sm:p-4 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 items-end">
            {filters.map((f) =>
              f.type === "date" ? (
                <Input
                  key={f.key}
                  label={f.label}
                  type="date"
                  size="sm"
                  value={f.value ?? ""}
                  onChange={(e) => f.onChange?.(e.target.value)}
                />
              ) : (
                <Select
                  key={f.key}
                  label={f.label}
                  size="sm"
                  includeEmptyOption={false}
                  value={f.value ?? (f.defaultValue ?? "all")}
                  onChange={(e) => f.onChange?.(e.target.value)}
                  options={f.options || []}
                />
              )
            )}
          </div>
          {activeFilterCount > 0 && onClearFilters && (
            <div className="flex justify-end">
              <Button
                type="button"
                variant="text"
                size="sm"
                leadingIcon="close"
                onClick={onClearFilters}
              >
                Limpiar filtros ({activeFilterCount})
              </Button>
            </div>
          )}
        </div>
      )}

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

      {/* Data Table M3 Desktop / Tablet (>= sm): sin scroll vertical interno innecesario */}
      <div className="hidden sm:flex sm:flex-col overflow-hidden border border-[var(--md-sys-color-outline-variant)] bg-[var(--md-sys-color-surface-container-lowest)] rounded-xl">
        <div className="overflow-x-auto">
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
              value={table.getState().pagination.pageIndex + 1}
              onChange={(e) => {
                const totalPages = Math.max(1, table.getPageCount() || 1);
                const parsed = Number(e.target.value);
                const clamped = Number.isFinite(parsed)
                  ? Math.min(totalPages, Math.max(1, parsed))
                  : 1;
                table.setPageIndex(clamped - 1);
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
