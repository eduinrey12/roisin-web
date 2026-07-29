export default function AdminDashboard() {
  return (
    <div>
      <h1 className="text-3xl font-bold mb-6">Dashboard General</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Ventas del Mes</h2>
          <p className="text-3xl font-bold">$0.00</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Pedidos Pendientes</h2>
          <p className="text-3xl font-bold">0</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <h2 className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-2">Cupones Activos</h2>
          <p className="text-3xl font-bold">0</p>
        </div>
      </div>
    </div>
  );
}
