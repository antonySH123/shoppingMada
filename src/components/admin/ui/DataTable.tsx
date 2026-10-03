import { ReactNode, useMemo, useState } from "react";
import AdminButton from "./Button";
import EmptyState from "./EmptyState";
import AdminSkeleton from "./Skeleton";

export type AdminSortValue = string | number | Date | null | undefined;
export interface AdminDataColumn<T> {
  id: string;
  header: string;
  render: (row: T, index: number) => ReactNode;
  sortValue?: (row: T) => AdminSortValue;
  mobileHidden?: boolean;
  className?: string;
}

export interface DataTableProps<T> {
  columns: Array<AdminDataColumn<T>>;
  rows: T[];
  getRowKey: (row: T) => string;
  pageSize?: number;
  loading?: boolean;
  emptyTitle?: string;
  emptyDescription?: string;
}

const compareValues = (left: AdminSortValue, right: AdminSortValue) => {
  const a = left instanceof Date ? left.getTime() : left;
  const b = right instanceof Date ? right.getTime() : right;
  if (typeof a === "number" && typeof b === "number") return a - b;
  return String(a ?? "").localeCompare(String(b ?? ""), "fr", {
    numeric: true,
    sensitivity: "base",
  });
};

function DataTable<T>({
  columns,
  rows,
  getRowKey,
  pageSize = 10,
  loading = false,
  emptyTitle = "Aucun résultat",
  emptyDescription = "Aucune donnée à afficher pour le moment.",
}: DataTableProps<T>) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [pageIndex, setPageIndex] = useState(0);

  const sortedRows = useMemo(() => {
    if (!sortColumn) return rows;
    const column = columns.find((item) => item.id === sortColumn);
    if (!column?.sortValue) return rows;
    return [...rows].sort((left, right) => {
      const result = compareValues(
        column.sortValue?.(left),
        column.sortValue?.(right),
      );
      return sortDirection === "asc" ? result : -result;
    });
  }, [columns, rows, sortColumn, sortDirection]);

  const pageCount = Math.max(1, Math.ceil(sortedRows.length / pageSize));
  const safePageIndex = Math.min(pageIndex, pageCount - 1);
  const visibleRows = sortedRows.slice(
    safePageIndex * pageSize,
    (safePageIndex + 1) * pageSize,
  );

  const toggleSort = (column: AdminDataColumn<T>) => {
    if (!column.sortValue) return;
    if (sortColumn === column.id)
      setSortDirection((direction) => (direction === "asc" ? "desc" : "asc"));
    else {
      setSortColumn(column.id);
      setSortDirection("asc");
    }
    setPageIndex(0);
  };

  if (loading) {
    return (
      <div
        className="admin-table-scroll grid gap-3 p-4"
        aria-label="Chargement du tableau"
      >
        <AdminSkeleton rows={6} />
      </div>
    );
  }

  if (!rows.length)
    return (
      <div className="admin-table-scroll">
        <EmptyState title={emptyTitle} description={emptyDescription} />
      </div>
    );

  return (
    <div className="grid gap-3">
      <div className="admin-table-scroll hidden sm:block">
        <table className="admin-data-table">
          <thead>
            <tr>
              {columns.map((column) => {
                const sorted = sortColumn === column.id;
                const ariaSort = sorted
                  ? sortDirection === "asc"
                    ? "ascending"
                    : "descending"
                  : "none";
                return (
                  <th
                    key={column.id}
                    aria-sort={column.sortValue ? ariaSort : undefined}
                  >
                    {column.sortValue ? (
                      <button
                        type="button"
                        className="admin-table-sort"
                        onClick={() => toggleSort(column)}
                      >
                        {column.header}
                        <span aria-hidden="true">
                          {sorted
                            ? sortDirection === "asc"
                              ? " ↑"
                              : " ↓"
                            : " ↕"}
                        </span>
                      </button>
                    ) : (
                      column.header
                    )}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {visibleRows.map((row, index) => (
              <tr key={getRowKey(row)}>
                {columns.map((column) => (
                  <td key={column.id} className={column.className}>
                    {column.render(row, safePageIndex * pageSize + index)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="admin-mobile-table-cards sm:hidden">
        {visibleRows.map((row, index) => (
          <article className="admin-mobile-table-card" key={getRowKey(row)}>
            {columns
              .filter((column) => !column.mobileHidden)
              .map((column) => (
                <div className="admin-mobile-table-card__row" key={column.id}>
                  <span className="admin-mobile-table-card__label">
                    {column.header}
                  </span>
                  <span className={column.className}>
                    {column.render(row, safePageIndex * pageSize + index)}
                  </span>
                </div>
              ))}
          </article>
        ))}
      </div>

      {sortedRows.length > pageSize && (
        <nav
          className="admin-table-pagination"
          aria-label="Pagination du tableau"
        >
          <span>
            {safePageIndex * pageSize + 1}–
            {Math.min((safePageIndex + 1) * pageSize, sortedRows.length)} sur{" "}
            {sortedRows.length}
          </span>
          <div>
            <AdminButton
              size="sm"
              variant="outline"
              disabled={safePageIndex === 0}
              onClick={() => setPageIndex((page) => Math.max(0, page - 1))}
              aria-label="Page précédente"
            >
              Précédent
            </AdminButton>
            <AdminButton
              size="sm"
              variant="outline"
              disabled={safePageIndex >= pageCount - 1}
              onClick={() =>
                setPageIndex((page) => Math.min(pageCount - 1, page + 1))
              }
              aria-label="Page suivante"
            >
              Suivant
            </AdminButton>
          </div>
        </nav>
      )}
    </div>
  );
}

export default DataTable;
