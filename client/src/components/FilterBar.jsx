const CATEGORY_FILTERS = [
  { value: '', label: 'All' },
  { value: 'transport', label: 'Transport' },
  { value: 'food', label: 'Food' },
  { value: 'electricity', label: 'Electricity' },
]

function FilterBar({ category, fromDate, toDate, onCategoryChange, onFromDateChange, onToDateChange, onClear }) {
  const hasActiveFilters = category || fromDate || toDate

  return (
    <section className="border border-pp-border bg-white p-4 sm:p-5" aria-label="Filter activity history">
      <div className="flex flex-col gap-4 xl:flex-row xl:items-end xl:justify-between">
        <div>
          <p className="text-sm font-bold text-pp-ink">Filter activities</p>
          <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
            {CATEGORY_FILTERS.map((filter) => {
              const isActive = category === filter.value

              return (
                <button
                  key={filter.value || 'all'}
                  type="button"
                  className={`border-b-2 px-3.5 py-2 text-sm font-bold transition focus:outline-none focus:ring-2 focus:ring-pp-accent ${
                    isActive
                      ? 'border-pp-accent text-pp-primary'
                      : 'border-transparent text-pp-ink opacity-70 hover:border-pp-border hover:text-pp-primary hover:opacity-100'
                  }`}
                  onClick={() => onCategoryChange(filter.value)}
                  aria-pressed={isActive}
                >
                  {filter.label}
                </button>
              )
            })}
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block text-sm font-semibold text-pp-ink" htmlFor="historyFromDate">
            From
            <input
              id="historyFromDate"
              className="mt-1.5 block border border-pp-border bg-white px-3 py-2.5 text-sm text-pp-ink outline-none transition focus:border-pp-primary focus:ring-2 focus:ring-pp-accent"
              type="date"
              value={fromDate}
              max={toDate || undefined}
              onChange={(event) => onFromDateChange(event.target.value)}
            />
          </label>
          <label className="block text-sm font-semibold text-pp-ink" htmlFor="historyToDate">
            To
            <input
              id="historyToDate"
              className="mt-1.5 block border border-pp-border bg-white px-3 py-2.5 text-sm text-pp-ink outline-none transition focus:border-pp-primary focus:ring-2 focus:ring-pp-accent"
              type="date"
              value={toDate}
              min={fromDate || undefined}
              onChange={(event) => onToDateChange(event.target.value)}
            />
          </label>
          {hasActiveFilters && (
            <button
              className="border-b-2 border-transparent px-3 py-2.5 text-sm font-bold text-pp-primary transition hover:border-pp-accent focus:outline-none focus:ring-2 focus:ring-pp-accent"
              type="button"
              onClick={onClear}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>
    </section>
  )
}

export default FilterBar
