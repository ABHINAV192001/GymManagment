
"use client";

import { useState, useEffect } from "react";
import DataTable from "@/app/components/DataTable";
import Modal from "@/app/components/Modal";
import { getInventory, createInventoryItem, updateInventoryItem, deleteInventoryItem } from "@/lib/api/branch";

export default function InventoryPage() {
    const [inventory, setInventory] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [currentItem, setCurrentItem] = useState(null);
    const [formData, setFormData] = useState({
        name: "",
        description: "",
        category: "Equipment", // Added default
        quantity: 0,
        condition: "NEW", // GOOD, NEW, DAMAGED
        purchaseDate: ""
    });

    const fetchInventory = async () => {
        setLoading(true);
        try {
            const data = await getInventory();
            setInventory(Array.isArray(data) ? data : []);
        } catch (error) {
            console.error("Failed to fetch inventory:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchInventory();
    }, []);

    const handleAdd = () => {
        setCurrentItem(null);
        setFormData({
            name: "",
            description: "",
            category: "Equipment", // Default
            quantity: 0,
            condition: "NEW",
            purchaseDate: ""
        });
        setIsModalOpen(true);
    };

    const handleEdit = (item) => {
        setCurrentItem(item);
        setFormData({
            name: item.name || "",
            description: item.description || "",
            category: item.category || "Equipment", // Handle existing
            quantity: item.quantity || 0,
            condition: item.condition || "NEW",
            purchaseDate: item.purchaseDate || ""
        });
        setIsModalOpen(true);
    };

    const handleDelete = async (item) => {
        if (!window.confirm(`Delete ${item.name}?`)) return;
        try {
            await deleteInventoryItem(item.id);
            fetchInventory();
        } catch (error) {
            console.error("Delete failed:", error);
            alert("Failed to delete item.");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (currentItem) {
                await updateInventoryItem(currentItem.id, formData);
            } else {
                await createInventoryItem(formData);
            }
            setIsModalOpen(false);
            fetchInventory();
        } catch (error) {
            console.error("Submit failed:", error);
            alert(`Operation failed: ${error.message}`);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const columns = [
        { key: "id", label: "ID" },
        {
            key: "name",
            label: "Item Name",
            render: (val, row) => (
                <div>
                    <div className="font-bold text-white">{val}</div>
                    <div className="text-xs text-gray-500">{row.description}</div>
                </div>
            )
        },
        { key: "category", label: "Category" }, // Added
        { key: "quantity", label: "Quantity" },
        {
            key: "condition",
            label: "Condition",
            render: (val) => (
                <span className={`px-2 py-1 rounded text-xs font-bold ${val === 'NEW' ? 'bg-green-500/20 text-green-400' :
                    val === 'GOOD' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-red-500/20 text-red-400'
                    }`}>
                    {val}
                </span>
            )
        },
        {
            key: "purchaseDate",
            label: "Date",
            render: (val) => val ? new Date(val).toLocaleDateString() : "-"
        }
    ];

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-bold bg-gradient-to-r from-[var(--primary)] to-cyan-400 bg-clip-text text-transparent">
                    Inventory Management
                </h1>
                <p className="text-gray-400">Track equipment, condition, and assets.</p>
            </div>

            <DataTable
                title="Inventory Items"
                columns={columns}
                data={inventory}
                isLoading={loading}
                onEdit={handleEdit}
                onDelete={handleDelete}
                onAdd={handleAdd}
            />

            <Modal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                title={currentItem ? "Edit Item" : "Add Inventory Item"}
            >
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="form-group">
                        <label className="block text-sm text-gray-400 mb-1">Item Name</label>
                        <input
                            required name="name" value={formData.name} onChange={handleChange}
                            className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition placeholder-gray-500"
                        />
                    </div>

                    <div className="form-group">
                        <label className="block text-sm text-gray-400 mb-1">Description</label>
                        <textarea
                            name="description" value={formData.description} onChange={handleChange}
                            className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 h-24 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition placeholder-gray-500 resize-none"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="block text-sm text-gray-400 mb-1">Category</label>
                            <select
                                name="category" value={formData.category} onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition"
                            >
                                <option>Equipment</option>
                                <option>Dumbbells / Weights</option>
                                <option>Cardio</option>
                                <option>Accessories</option>
                                <option>Maintenance</option>
                                <option>Other</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="block text-sm text-gray-400 mb-1">Quantity</label>
                            <input
                                type="number" required name="quantity" value={formData.quantity} onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition placeholder-gray-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="form-group">
                            <label className="block text-sm text-gray-400 mb-1">Condition</label>
                            <select
                                name="condition" value={formData.condition} onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition"
                            >
                                <option>NEW</option>
                                <option>GOOD</option>
                                <option>DAMAGED</option>
                                <option>REPAIR</option>
                            </select>
                        </div>
                        <div className="form-group">
                            <label className="block text-sm text-gray-400 mb-1">Purchase Date</label>
                            <input
                                type="date" name="purchaseDate" value={formData.purchaseDate} onChange={handleChange}
                                className="w-full bg-slate-800/50 border border-white/10 rounded-lg p-3 text-gray-200 focus:ring-2 focus:ring-[var(--primary)] focus:border-transparent outline-none transition [color-scheme:dark]"
                            />
                        </div>
                    </div>

                    <div className="pt-4 flex justify-end gap-3 border-t border-white/5 mt-6">
                        <button
                            type="button" onClick={() => setIsModalOpen(false)}
                            className="px-4 py-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-lg bg-[var(--primary)] text-black font-bold hover:bg-[#b8e600] transition shadow-lg hover:shadow-[var(--primary)]/20 transform hover:-translate-y-0.5"
                        >
                            {currentItem ? "Update Item" : "Add Item"}
                        </button>
                    </div>
                </form>
            </Modal>
        </div>
    );
}
