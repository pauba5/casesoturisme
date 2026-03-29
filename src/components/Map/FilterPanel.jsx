import styles from './FilterPanel.module.css'

function FilterGroup({ title, values, selected, onToggle, onSelectAll, onDeselectAll }) {
  const allSelected = values.every(v => selected.includes(v))

  return (
    <div className={styles.group}>
      <div className={styles.groupHeader}>
        <h3 className={styles.groupTitle}>{title}</h3>
        <div className={styles.groupActions}>
          <button onClick={() => onSelectAll(values)} className={styles.actionBtn} disabled={allSelected}>
            Tots
          </button>
          <button onClick={() => onDeselectAll()} className={styles.actionBtn} disabled={selected.length === 0}>
            Cap
          </button>
        </div>
      </div>
      <div className={styles.options}>
        {values.map(value => (
          <label key={value} className={styles.option}>
            <span className={styles.optionLabel}>{value}</span>
            <span className={styles.toggle}>
              <input
                type="checkbox"
                checked={selected.includes(value)}
                onChange={() => onToggle(value)}
              />
              <span className={styles.slider} />
            </span>
          </label>
        ))}
      </div>
    </div>
  )
}

export default function FilterPanel({ districts, types, statuses, selected, onToggle, onSelectAll, onDeselectAll }) {
  return (
    <div className={styles.panel}>
      <FilterGroup
        title="Tipologia"
        values={types}
        selected={selected.types}
        onToggle={v => onToggle('types', v)}
        onSelectAll={v => onSelectAll('types', v)}
        onDeselectAll={() => onDeselectAll('types')}
      />
      <FilterGroup
        title="Legalitat"
        values={statuses}
        selected={selected.statuses}
        onToggle={v => onToggle('statuses', v)}
        onSelectAll={v => onSelectAll('statuses', v)}
        onDeselectAll={() => onDeselectAll('statuses')}
      />
      <FilterGroup
        title="Districte"
        values={districts}
        selected={selected.districts}
        onToggle={v => onToggle('districts', v)}
        onSelectAll={v => onSelectAll('districts', v)}
        onDeselectAll={() => onDeselectAll('districts')}
      />
    </div>
  )
}
