// Hooks y utilidades principales de TanStack Table
import {
  useReactTable,          // Hook que crea la instancia de la tabla
  getCoreRowModel,        // Modelo base de filas (sin filtros ni paginación)
  flexRender,             // Permite renderizar contenido dinámico de columnas
  getPaginationRowModel,  // Modelo de filas con paginación
  getFilteredRowModel     // Modelo de filas filtradas
} from "@tanstack/react-table"


// Hook de React para manejar estado
import { useState } from "react"


// Botón reutilizable del sistema de componentes
import { Button } from "@/shared"


// Componente reutilizable de tabla
// Recibe:
// - data: datos que se mostrarán
// - columns: configuración de columnas
// - compact: reduce el espaciado vertical de la tabla (py-2 px-4)
export default function DataTable({ data, columns, compact = false }) {


  // ================== ESTADO DE PAGINACIÓN ==================
  // pageIndex → página actual
  // pageSize → cantidad de filas por página
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 5
  })


  // ================== ESTADO DEL FILTRO GLOBAL ==================
  // Se usa para el buscador de la tabla
  const [globalFilter, setGlobalFilter] = useState("")


  // ================== CONFIGURACIÓN DE LA TABLA ==================
  const table = useReactTable({


    // Datos que se mostrarán
    data,


    // Definición de columnas
    columns,


    // Estado controlado de la tabla
    state: {
      globalFilter,
      pagination
    },


    // Función que se ejecuta cuando cambia la paginación
    onPaginationChange: setPagination,


    // Función que se ejecuta cuando cambia el filtro global
    onGlobalFilterChange: setGlobalFilter,


    // Modelo base de filas
    getCoreRowModel: getCoreRowModel(),


    // Modelo con filtrado aplicado
    getFilteredRowModel: getFilteredRowModel(),


    // Modelo con paginación aplicada
    getPaginationRowModel: getPaginationRowModel(),
  })


  return (
    <div className="space-y-4">


      {/* ================== TOOLBAR ================== */}
      {/* Barra superior con buscador y selector de filas */}


      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* ================== BUSCADOR ================== */}
        {/* Filtra todas las columnas de la tabla */}
        <input
          type="text"
          placeholder="Buscar en la tabla..."
          value={globalFilter ?? ""}
          onChange={(e) => setGlobalFilter(e.target.value)}
          className="bg-[var(--color-primary-900)] border border-[var(--color-primary-700)] text-[var(--color-white)] placeholder:text-[var(--color-gray-400)] rounded-xl px-3.5 py-2 text-xs sm:text-sm outline-none focus:border-[var(--color-secondary-400)] w-full sm:w-72"
        />

        {/* ================== SELECTOR DE FILAS ================== */}
        {/* Permite cambiar cuántas filas se muestran por página */}
        <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--color-gray-300)]">
          <span>Filas por página:</span>
          <select
            value={table.getState().pagination.pageSize}
            onChange={(e) => table.setPageSize(Number(e.target.value))}
            className="bg-[var(--color-primary-900)] border border-[var(--color-primary-700)] text-[var(--color-white)] rounded-xl px-3 py-1.5 outline-none cursor-pointer"
          >
            {[5, 7, 10, 20, 50].map(size => (
              <option key={size} value={size} className="bg-[var(--color-primary-950)] text-white">
                {size} filas
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* ================== TABLA ================== */}
      <div className="overflow-x-auto border border-[var(--color-primary-800)] bg-[var(--color-primary-900)] rounded-xl shadow-lg">
        <table className="w-full text-left">
          {/* ================== CABECERA ================== */}
          <thead className="bg-[var(--color-primary-950)] text-[var(--color-gray-300)] border-b border-[var(--color-primary-800)]">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th
                    key={header.id}
                    className={`${
                      compact ? "py-2 px-4" : "p-3.5"
                    } text-left border-b border-[var(--color-primary-800)] text-xs uppercase tracking-wider font-bold text-[var(--color-gray-300)]`}
                  >


                    {/* 
                      flexRender permite renderizar:
                      - texto
                      - JSX
                      - funciones
                      definidos en columnDef.header
                    */}
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}


                  </th>


                ))}
              </tr>


            ))}
          </thead>


          {/* ================== CUERPO DE LA TABLA ================== */}
          <tbody>


            {/* Filas generadas por TanStack */}
            {table.getRowModel().rows.map(row => (
              <tr key={row.id} className="hover:bg-[var(--color-primary-800)]/50 transition-colors border-b border-[var(--color-primary-800)]/60 text-[var(--color-white)]">
                {/* Celdas visibles de cada fila */}
                {row.getVisibleCells().map(cell => (
                  <td
                    key={cell.id}
                    className={`${
                      compact ? "py-2 px-4" : "p-3.5"
                    } border-b border-[var(--color-primary-800)]/60 text-[var(--color-gray-200)] text-sm`}
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ================== FOOTER ================== */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
        {/* Cantidad de registros visibles */}
        <span className="text-xs sm:text-sm text-[var(--color-gray-400)]">
          Mostrando <strong className="text-[var(--color-white)]">{table.getRowModel().rows.length}</strong> de{" "}
          <strong className="text-[var(--color-white)]">{table.getFilteredRowModel().rows.length}</strong> registros
        </span>

        {/* ================== CONTROLES DE PAGINACIÓN ================== */}
        <div className="flex flex-wrap items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            Inicio
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Anterior
          </Button>

          <span className="text-xs sm:text-sm px-2 text-[var(--color-gray-300)]">
            Página <strong className="text-[var(--color-white)]">{table.getState().pagination.pageIndex + 1}</strong> de{" "}
            <strong className="text-[var(--color-white)]">{table.getPageCount() || 1}</strong>
          </span>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Siguiente
          </Button>

          <Button
            size="sm"
            variant="secondary"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            Final
          </Button>
        </div>
      </div>

      {/* ================== IR A PÁGINA ================== */}
      <div className="flex items-center gap-2 text-xs sm:text-sm text-[var(--color-gray-400)]">
        <span>Ir a página:</span>
        <input
          type="number"
          defaultValue={table.getState().pagination.pageIndex + 1}
          onChange={(e) => {
            const page = e.target.value ? Number(e.target.value) - 1 : 0;
            table.setPageIndex(page);
          }}
          className="bg-[var(--color-primary-900)] border border-[var(--color-primary-700)] text-[var(--color-white)] rounded-lg px-2.5 py-1 w-16 text-center outline-none focus:border-[var(--color-secondary-400)]"
        />
      </div>
    </div>
  );
}
