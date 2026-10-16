import styles from './Table.module.css';

type TableProps = {
  head: [string, string];
  rows: [string, string][];
};

// design/pages/work-supply-leader-*.md → expectations / table: строки с разделителем, 2 колонки.
export function Table({ head, rows }: TableProps) {
  return (
    <table className={styles.table}>
      <thead>
        <tr>
          {head.map((cell) => (
            <th key={cell} scope="col">
              {cell}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map(([a, b]) => (
          <tr key={a}>
            <td>{a}</td>
            <td>{b}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
