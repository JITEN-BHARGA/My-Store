"use client";

interface TableProps<T> {
  headers: string[]; // Column headers
  data: T[]; // Array of data objects
  renderRow: (item: T, index: number) => React.ReactNode; // Custom row renderer
}

export default function Table<T>({ headers, data, renderRow }: TableProps<T>) {
  return (
    <div className="overflow-x-auto bg-white rounded-2xl shadow-sm border">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            {headers.map((header, idx) => (
              <th
                key={idx}
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                {header}
              </th>
            ))}
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-200">
          {data.length === 0 ? (
            <tr>
              <td colSpan={headers.length} className="px-6 py-4 text-center text-gray-500">
                No data found
              </td>
            </tr>
          ) : (
            data.map((item, index) => renderRow(item, index))
          )}
        </tbody>
      </table>
    </div>
  );
}