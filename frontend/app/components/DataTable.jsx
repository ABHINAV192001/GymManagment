
"use client";

import { FaEdit, FaTrash, FaPlus, FaSpinner, FaSearch } from "react-icons/fa";
import { useState } from "react";

export default function DataTable({
    columns,
    data,
    onEdit,
    onDelete,
    onAdd,
    isLoading = false,
    title = "Table",
    searchable = true
}) {
    const [searchTerm, setSearchTerm] = useState("");

    const filteredData = data.filter(item =>
        Object.values(item).some(val =>
            String(val).toLowerCase().includes(searchTerm.toLowerCase())
        )
    );

    return (
        <div className="glass-panel p-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold text-white">{title}</h2>

                <div className="flex gap-4 w-full md:w-auto">
                    {searchable && (
                        <div className="relative flex-1 md:w-64">
                            <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Search..."
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--primary)] focus:ring-1 focus:ring-[var(--primary)] transition placeholder-gray-500"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    )}

                    {onAdd && (
                        <button
                            onClick={onAdd}
                            className="bg-[var(--primary)] text-black font-bold py-2 px-4 rounded-lg hover:bg-[#b8e600] transition flex items-center gap-2 shadow-lg shadow-lime-400/20"
                        >
                            <FaPlus /> Add New
                        </button>
                    )}
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="border-b border-white/10 text-gray-400 text-sm uppercase">
                            {columns.map((col) => (
                                <th key={col.key} className="py-4 px-4 font-semibold tracking-wide">
                                    {col.label}
                                </th>
                            ))}
                            {(onEdit || onDelete) && <th className="py-4 px-4 font-semibold text-right">Actions</th>}
                        </tr>
                    </thead>
                    <tbody className="text-gray-300">
                        {isLoading ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="py-12 text-center">
                                    <FaSpinner className="animate-spin text-4xl text-[var(--primary)] mx-auto mb-4" />
                                    <p>Loading data...</p>
                                </td>
                            </tr>
                        ) : filteredData.length === 0 ? (
                            <tr>
                                <td colSpan={columns.length + 1} className="py-12 text-center text-gray-500">
                                    No records found.
                                </td>
                            </tr>
                        ) : (
                            filteredData.map((item, index) => (
                                <tr key={item.id || index} className="border-b border-white/5 hover:bg-white/5 transition">
                                    {columns.map((col) => (
                                        <td key={`${item.id}-${col.key}`} className="py-4 px-4">
                                            {col.render ? col.render(item[col.key], item) : item[col.key]}
                                        </td>
                                    ))}
                                    {(onEdit || onDelete) && (
                                        <td className="py-4 px-4 text-right flex justify-end gap-3">
                                            {onEdit && (
                                                <button
                                                    onClick={() => onEdit(item)}
                                                    className="text-blue-400 hover:text-blue-300 p-2 rounded-md hover:bg-blue-400/10 transition"
                                                    title="Edit"
                                                >
                                                    <FaEdit size={18} />
                                                </button>
                                            )}
                                            {onDelete && (
                                                <button
                                                    onClick={() => onDelete(item)}
                                                    className="text-red-400 hover:text-red-300 p-2 rounded-md hover:bg-red-400/10 transition"
                                                    title="Delete"
                                                >
                                                    <FaTrash size={18} />
                                                </button>
                                            )}
                                        </td>
                                    )}
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <style jsx>{`
                .glass-panel {
                    background: var(--glass-bg, rgba(30, 41, 59, 0.4));
                    backdrop-filter: blur(16px);
                    -webkit-backdrop-filter: blur(16px);
                    border: 1px solid var(--glass-border, rgba(255, 255, 255, 0.08));
                    border-radius: 20px;
                    box-shadow: var(--card-shadow, 0 10px 40px -10px rgba(0, 0, 0, 0.3));
                }
            `}</style>
        </div>
    );
}
