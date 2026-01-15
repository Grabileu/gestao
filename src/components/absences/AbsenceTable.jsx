export default function AbsenceTable({ data }) {
  return (
    <table className="w-full border-collapse border border-gray-300">
      <thead>
        <tr className="bg-gray-100">
          <th className="border border-gray-300 p-2 text-left">Funcionário</th>
          <th className="border border-gray-300 p-2 text-left">Data</th>
          <th className="border border-gray-300 p-2 text-left">Tipo</th>
        </tr>
      </thead>
      <tbody>
        {data && data.map((item) => (
          <tr key={item.id} className="hover:bg-gray-50">
            <td className="border border-gray-300 p-2">{item.employee}</td>
            <td className="border border-gray-300 p-2">{item.date}</td>
            <td className="border border-gray-300 p-2">{item.type}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
