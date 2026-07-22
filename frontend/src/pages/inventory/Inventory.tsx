import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { AlertTriangle, Wrench, Shield, Calendar, Plus, X, Check, Barcode, HelpCircle } from 'lucide-react';
import { InventoryItem } from '../../types';
import { getInventory, createInventoryItem, updateInventoryItem } from '../../lib/api/inventory';

export const Inventory: React.FC = () => {
  const { triggerAnnouncement } = useOutletContext<{ selectedBranchId: string; triggerAnnouncement: (msg: string) => void }>();
  const [items, setItems] = useState<InventoryItem[]>([]);

  useEffect(() => {
    getInventory()
      .then(setItems)
      .catch(err => triggerAnnouncement(`Failed to load inventory: ${err.message}`));
  }, []);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedQRItem, setSelectedQRItem] = useState<InventoryItem | null>(null);
  const [maintenanceItem, setMaintenanceItem] = useState<InventoryItem | null>(null);

  // Maintenance form state
  const [technicianName, setTechnicianName] = useState('');
  const [maintenanceNotes, setMaintenanceNotes] = useState('');

  // New Equipment state
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'CARDIO' as any,
    brand: '',
    modelNo: '',
    serialNo: '',
    purchasePrice: '',
    quantity: 1,
    notes: '',
  });

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.name || !newItem.brand) return;

    try {
      const created = await createInventoryItem({
        name: newItem.name,
        category: newItem.category,
        brand: newItem.brand,
        modelNo: newItem.modelNo,
        serialNo: newItem.serialNo,
        purchaseDate: new Date().toISOString().split('T')[0],
        purchasePrice: Number(newItem.purchasePrice) || 0,
        warrantyExpiry: new Date(Date.now() + 365 * 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 2 years default
        quantity: Number(newItem.quantity),
        status: 'WORKING',
        notes: newItem.notes,
      });

      setItems([...items, created]);
      setIsOpen(false);
      triggerAnnouncement(`Asset ${created.name} registered under ${created.category}.`);
    } catch (err: any) {
      triggerAnnouncement(`Failed to add asset: ${err.message}`);
    }
  };

  const handleScheduleMaintenance = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maintenanceItem) return;

    try {
      const updated = await updateInventoryItem(maintenanceItem.id, {
        status: 'WORKING', // Repaired
        lastServiceDate: new Date().toISOString().split('T')[0],
        nextServiceDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 6 months next
        notes: `Technician: ${technicianName}. Notes: ${maintenanceNotes}`,
      });

      setItems(items.map(i => (i.id === updated.id ? updated : i)));
      setMaintenanceItem(null);
      setTechnicianName('');
      setMaintenanceNotes('');
      triggerAnnouncement(`Maintenance solved. ${updated.name} status updated to WORKING.`);
    } catch (err: any) {
      triggerAnnouncement(`Failed to update maintenance status: ${err.message}`);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner and Alerts */}
      <div className="flex flex-col md:flex-row justify-between items-center p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 gap-4">
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">Gym Asset & Machinery Registry</h3>
          <p className="text-xs text-zinc-500 mt-0.5">Track commercial treadmills, power racks, and log technician repairs.</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg shadow"
        >
          <Plus className="w-4 h-4" /> Register New Asset
        </button>
      </div>

      {/* Main Grid display */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-6" aria-label="Inventory assets">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-6 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex flex-col justify-between hover:border-blue-500 transition shadow-sm"
          >
            <div>
              <div className="flex justify-between items-start mb-3">
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-500">
                  {item.category}
                </span>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                  item.status === 'WORKING'
                    ? 'bg-emerald-50 text-emerald-800 dark:bg-emerald-950/20 dark:text-emerald-400'
                    : 'bg-red-50 text-red-800 dark:bg-red-950/20 dark:text-red-400'
                }`}>
                  {item.status}
                </span>
              </div>

              <h4 className="font-bold text-zinc-900 dark:text-zinc-100 text-sm">{item.name}</h4>
              <p className="text-xs text-zinc-400 mt-0.5">{item.brand} | Model: {item.modelNo || 'N/A'}</p>

              <div className="space-y-1.5 text-xs text-zinc-500 mt-4 border-t border-zinc-100 dark:border-zinc-900/50 pt-3">
                <p><strong>Serial Code:</strong> <span className="font-mono">{item.serialNo}</span></p>
                <p><strong>Warranty Expiry:</strong> <span className="font-mono">{item.warrantyExpiry}</span></p>
                {item.lastServiceDate && <p><strong>Last Serviced:</strong> <span className="font-mono">{item.lastServiceDate}</span></p>}
                {item.notes && <p className="italic text-[11px] text-zinc-400 mt-1">"{item.notes}"</p>}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 mt-4 flex gap-2">
              <button
                onClick={() => setSelectedQRItem(item)}
                className="flex-1 py-1.5 border border-zinc-200 dark:border-zinc-800 rounded bg-zinc-50 dark:bg-zinc-900 text-[10px] font-bold hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300 flex items-center justify-center gap-1 focus:outline-2 focus:outline-blue-500"
              >
                <Barcode className="w-3.5 h-3.5" />
                <span>QR Asset Tag</span>
              </button>

              {item.status !== 'WORKING' ? (
                <button
                  onClick={() => setMaintenanceItem(item)}
                  className="flex-1 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-[10px] font-bold flex items-center justify-center gap-1 focus:outline-2 focus:outline-blue-500"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span>Resolve Service</span>
                </button>
              ) : (
                <button
                  onClick={async () => {
                    try {
                      const updated = await updateInventoryItem(item.id, { status: 'MAINTENANCE' });
                      setItems(items.map(i => (i.id === updated.id ? updated : i)));
                      triggerAnnouncement(`${item.name} status updated to MAINTENANCE.`);
                    } catch (err: any) {
                      triggerAnnouncement(`Failed to flag malfunction: ${err.message}`);
                    }
                  }}
                  className="flex-1 py-1.5 border border-red-200 hover:bg-red-50 dark:hover:bg-red-950/20 text-red-500 rounded text-[10px] font-bold flex items-center justify-center gap-1 focus:outline-2 focus:outline-blue-500"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Flag Malfunction</span>
                </button>
              )}
            </div>

          </div>
        ))}
      </section>

      {/* QR Code Viewer Modal */}
      {selectedQRItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="qr-heading">
          <div className="w-full max-w-xs bg-white text-zinc-900 rounded-xl overflow-hidden border border-zinc-200 shadow-2xl p-6 text-center space-y-4">
            <h4 id="qr-heading" className="font-bold text-sm tracking-tight">{selectedQRItem.name}</h4>
            <span className="text-[10px] font-mono text-zinc-400 block uppercase">Serial: {selectedQRItem.serialNo}</span>
            
            {/* Beautiful simulated high-contrast layout QR barcode asset label */}
            <div className="w-44 h-44 bg-zinc-100 border-4 border-zinc-900 mx-auto rounded flex flex-col justify-between p-3" aria-hidden="true">
              {/* Outer corner elements simulation */}
              <div className="flex justify-between">
                <div className="w-8 h-8 border-t-8 border-l-8 border-zinc-900" />
                <div className="w-8 h-8 border-t-8 border-r-8 border-zinc-900" />
              </div>
              <div className="text-[11px] font-mono font-bold tracking-widest text-zinc-900">
                FITLIFE_ASSET
                <div className="text-[9px] font-semibold text-zinc-500 mt-1">*{selectedQRItem.id.toUpperCase()}*</div>
              </div>
              <div className="flex justify-between">
                <div className="w-8 h-8 border-b-8 border-l-8 border-zinc-900" />
                <div className="w-10 h-3 bg-zinc-900" />
              </div>
            </div>

            <p className="text-[10px] text-zinc-400">Scan tag at machinery stations to instantly trigger desk service logs or view workout manual links.</p>
            <button
              onClick={() => setSelectedQRItem(null)}
              className="w-full py-2 bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold rounded-lg"
            >
              Close Asset Label
            </button>
          </div>
        </div>
      )}

      {/* Technician service check-in drawer */}
      {maintenanceItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="maint-heading">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden text-xs text-zinc-700 dark:text-zinc-300">
            <div className="p-5 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
              <h4 id="maint-heading" className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Schedule Machinery Work Order</h4>
              <button onClick={() => setMaintenanceItem(null)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleScheduleMaintenance} className="p-5 space-y-4">
              <div>
                <label className="block font-semibold mb-1">Service Engineer / Technician Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Anand Shah (Bose Audio Corp)"
                  value={technicianName}
                  onChange={(e) => setTechnicianName(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Service details & Checks Completed *</label>
                <textarea
                  required
                  placeholder="e.g. Friction cables replaced, audio wiring synchronized..."
                  value={maintenanceNotes}
                  onChange={(e) => setMaintenanceNotes(e.target.value)}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex justify-between">
                <button
                  type="button"
                  onClick={() => setMaintenanceItem(null)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                >
                  Submit Technician Check
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Asset register modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="asset-heading">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden text-xs text-zinc-700 dark:text-zinc-300">
            <div className="p-5 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
              <h4 id="asset-heading" className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Register Physical Asset</h4>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddItem} className="p-5 space-y-4">
              <div>
                <label className="block font-semibold mb-1">Asset Model Name *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. LifeFitness T9 Cardio Treadmill"
                  value={newItem.name}
                  onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Asset Category</label>
                  <select
                    value={newItem.category}
                    onChange={(e) => setNewItem({ ...newItem, category: e.target.value as any })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="CARDIO">Cardio machinery</option>
                    <option value="STRENGTH">Strength stations</option>
                    <option value="STUDIO">Studio sound systems</option>
                    <option value="FACILITY">Facility assets</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Brand Provider *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Technogym, Bose"
                    value={newItem.brand}
                    onChange={(e) => setNewItem({ ...newItem, brand: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Purchase Price (INR)</label>
                  <input
                    type="number"
                    value={newItem.purchasePrice}
                    onChange={(e) => setNewItem({ ...newItem, purchasePrice: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
                <div>
                  <label className="block font-semibold mb-1">Serial Number / Asset Tag ID</label>
                  <input
                    type="text"
                    placeholder="e.g. SN-82937489"
                    value={newItem.serialNo}
                    onChange={(e) => setNewItem({ ...newItem, serialNo: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold mb-1">Special instructions</label>
                <textarea
                  value={newItem.notes}
                  onChange={(e) => setNewItem({ ...newItem, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                  placeholder="Warranty contacts, specific repair technician number..."
                />
              </div>

              <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-lg text-zinc-700 dark:text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-bold"
                >
                  Save Asset File
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
