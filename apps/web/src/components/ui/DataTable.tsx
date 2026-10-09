import { useState, useMemo, type ReactNode } from 'react'
import { ChevronUp, ChevronDown, ChevronsUpDown, Search } from 'lucide-react'

export interface Column<T> {
  key: string
  header: string
  render?: (row: T) => ReactNode
  sortable?: boolean
  width?: string | number
}

interface DataTableProps<T extends Record<string, unknown>> {
  columns: Column<T>[]
  data: T[]
  searchable?: boolean
  searchKeys?: string[]
  emptyMessage?: string
  rowKey?: (row: T) => string
  onRowClick?: (row: T) => void
  pageSize?: number
}

export function DataTable<T extends Record<string, unknown>>({
  columns,
  data,
  searchable = false,
  searchKeys = [],
  emptyMessage = 'No data available',
  rowKey,
  onRowClick,
  pageSize = 20,
}: DataTableProps<T>) {
  const [query, setQuery] = useState('')
  const [sortKey, setSortKey] = useState<string | null>(null)
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc')
  const [page, setPage] = useState(0)

  const filtered = useMemo(() => {
    if (!searchable || query.trim() === '') return data
    const q = query.toLowerCase()
    return data.filter((row) =>
      searchKeys.some((k) => {
        const val = row[k]
        return typeof val === 'string' && val.toLowerCase().includes(q)
      }),
    )
  }, [data, query, searchable, searchKeys])

  const sorted = useMemo(() => {
    if (sortKey === null) return filtered
    return [...filtered].sort((a, b) => {
      const av = a[sortKey]
      const bv = b[sortKey]
      const aStr = String(av ?? '')
      const bStr = String(bv ?? '')
      return sortDir === 'asc' ? aStr.localeCompare(bStr) : bStr.localeCompare(aStr)
    })
  }, [filtered, sortKey, sortDir])

  const paginated = sorted.slice(page * pageSize, (page + 1) * pageSize)
  const totalPages = Math.ceil(sorted.length / pageSize)

  function handleSort(key: string) {
    if (sortKey === key) {
      setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'))
    } else {
      setSortKey(key)
      setSortDir('asc')
    }
    setPage(0)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {searchable && (
        <div style={{ position: 'relative', maxWidth: 320 }}>
          <Search
            size={14}
            style={{
              position: 'absolute',
              left: 10,
              top: '50%',
              transform: 'translateY(-50%)',
              color: 'var(--text-muted)',
            }}
          />
          <input
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              setPage(0)
            }}
            placeholder="Search..."
            style={{
              width: '100%',
              padding: '8px 12px 8px 32px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              borderRadius: 'var(--radius-sm)',
              color: 'var(--text-primary)',
              fontSize: 13,
              fontFamily: 'var(--font-sans)',
              outline: 'none',
            }}
          />
        </div>
      )}

      <div style={{ overflowX: 'auto', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            fontSize: 13,
            fontFamily: 'var(--font-sans)',
          }}
        >
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-default)', background: 'var(--bg-surface)' }}>
              {columns.map((col) => (
                <th
                  key={col.key}
                  style={{
                    padding: '10px 14px',
                    textAlign: 'left',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    fontSize: 11,
                    letterSpacing: '0.05em',
                    textTransform: 'uppercase',
                    whiteSpace: 'nowrap',
                    cursor: col.sortable === true ? 'pointer' : 'default',
                    width: col.width,
                    userSelect: 'none',
                  }}
                  onClick={col.sortable === true ? () => { handleSort(col.key) } : undefined}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                    {col.header}
                    {col.sortable === true && (
                      sortKey === col.key ? (
                        sortDir === 'asc' ? <ChevronUp size={12} /> : <ChevronDown size={12} />
                      ) : (
                        <ChevronsUpDown size={12} style={{ opacity: 0.4 }} />
                      )
                    )}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {paginated.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length}
                  style={{
                    padding: '40px 20px',
                    textAlign: 'center',
                    color: 'var(--text-muted)',
                    fontSize: 14,
                  }}
                >
                  {emptyMessage}
                </td>
              </tr>
            ) : (
              paginated.map((row, i) => {
                const key = rowKey !== undefined ? rowKey(row) : String(i)
                return (
                  <tr
                    key={key}
                    onClick={onRowClick !== undefined ? () => { onRowClick(row) } : undefined}
                    style={{
                      borderBottom: '1px solid var(--border-subtle)',
                      cursor: onRowClick !== undefined ? 'pointer' : 'default',
                      transition: 'background var(--transition-fast)',
                    }}
                    onMouseEnter={(e) => {
                      if (onRowClick !== undefined) {
                        ;(e.currentTarget as HTMLTableRowElement).style.background = 'var(--bg-surface)'
                      }
                    }}
                    onMouseLeave={(e) => {
                      ;(e.currentTarget as HTMLTableRowElement).style.background = ''
                    }}
                  >
                    {columns.map((col) => (
                      <td key={col.key} style={{ padding: '11px 14px', color: 'var(--text-primary)' }}>
                        {col.render !== undefined ? col.render(row) : String(row[col.key] ?? '')}
                      </td>
                    ))}
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
            {page * pageSize + 1}–{Math.min((page + 1) * pageSize, sorted.length)} of {sorted.length}
          </span>
          <button
            disabled={page === 0}
            onClick={() => { setPage((p) => p - 1) }}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-xs)',
              cursor: page === 0 ? 'not-allowed' : 'pointer',
              opacity: page === 0 ? 0.4 : 1,
              fontSize: 12,
            }}
          >
            Prev
          </button>
          <button
            disabled={page >= totalPages - 1}
            onClick={() => { setPage((p) => p + 1) }}
            style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border-default)',
              color: 'var(--text-primary)',
              padding: '4px 10px',
              borderRadius: 'var(--radius-xs)',
              cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
              opacity: page >= totalPages - 1 ? 0.4 : 1,
              fontSize: 12,
            }}
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
