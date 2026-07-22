import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DollarSign, ArrowUpRight, ArrowDownRight, Percent, Calendar, Plus, X, Check, FileText, Printer, Calculator } from 'lucide-react';
import { Payment, Member, Staff } from '../../types';
import { getPayments, createPayment } from '../../lib/api/accounts';
import { getUsers, getStaff } from '../../lib/api/admin';

export const Accounts: React.FC = () => {
  const { triggerAnnouncement } = useOutletContext<{ selectedBranchId: string; triggerAnnouncement: (msg: string) => void }>();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);

  useEffect(() => {
    Promise.all([getPayments(), getUsers(), getStaff()])
      .then(([pays, mems, stf]) => {
        setPayments(pays);
        setMembers(mems);
        setStaff(stf);
      })
      .catch(err => triggerAnnouncement(`Failed to load accounts data: ${err.message}`));
  }, [triggerAnnouncement]);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedInvoicePay, setSelectedInvoicePay] = useState<Payment | null>(null);

  // Filters state
  const [paymentTypeFilter, setPaymentTypeFilter] = useState('ALL');
  const [paymentModeFilter, setPaymentModeFilter] = useState('ALL');

  // Form State
  const [newTxn, setNewTxn] = useState({
    amount: '',
    paymentType: 'UTILITY' as any,
    paymentMode: 'UPI' as any,
    referenceNo: '',
    notes: '',
    entityId: '', // member or staff
  });

  // Derived financials
  const incomePayments = payments.filter((p) => p.paymentType === 'MEMBERSHIP' || p.paymentType === 'PT_PACKAGE');
  const expensePayments = payments.filter((p) => p.paymentType === 'SALARY' || p.paymentType === 'UTILITY' || p.paymentType === 'EQUIPMENT');

  const totalIncome = incomePayments.reduce((sum, p) => sum + p.amount, 0);
  const totalExpense = expensePayments.reduce((sum, p) => sum + p.amount, 0);
  const netProfit = totalIncome - totalExpense;
  const profitMarginPercent = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  const filteredPayments = payments.filter((p) => {
    const matchesType = paymentTypeFilter === 'ALL' || p.paymentType === paymentTypeFilter;
    const matchesMode = paymentModeFilter === 'ALL' || p.paymentMode === paymentModeFilter;
    return matchesType && matchesMode;
  });

  const handleCreateTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxn.amount) return;

    try {
      const paymentData: Partial<Payment> = {
        paymentType: newTxn.paymentType,
        amount: Number(newTxn.amount),
        currency: 'INR',
        paymentMode: newTxn.paymentMode,
        referenceNo: newTxn.referenceNo || `MOCKTXN${Math.floor(Math.random() * 900000 + 100000)}`,
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'COMPLETED',
        notes: newTxn.notes,
      };

      if (newTxn.paymentType === 'SALARY') {
        paymentData.staffId = newTxn.entityId || undefined;
      } else if (newTxn.paymentType === 'MEMBERSHIP') {
        paymentData.userId = newTxn.entityId || undefined;
      }

      const created = await createPayment(paymentData);
      setPayments([...payments, created]);
      setIsOpen(false);
      triggerAnnouncement(`Transaction of ₹${created.amount} recorded successfully.`);
      
      // reset
      setNewTxn({
        amount: '',
        paymentType: 'UTILITY',
        paymentMode: 'UPI',
        referenceNo: '',
        notes: '',
        entityId: '',
      });
    } catch (err: any) {
      triggerAnnouncement(`Failed to record transaction: ${err.message}`);
    }
  };

  // Tax breakdown calculations
  const calculateTaxValues = (amount: number) => {
    const baseValue = amount / 1.18; // 18% GST inclusive
    const totalGst = amount - baseValue;
    const cgst = totalGst / 2;
    const sgst = totalGst / 2;
    return { baseValue, totalGst, cgst, sgst };
  };

  return (
    <div className="space-y-6">
      {/* Financial Overview Strip */}
      <section className="grid grid-cols-1 md:grid-cols-4 gap-4" aria-label="Financial summaries">
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-500">Gross Income</span>
            <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">₹{totalIncome.toLocaleString()}</h4>
          </div>
          <div className="p-3 rounded-lg bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400">
            <ArrowUpRight className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-500">Total Expenditures</span>
            <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">₹{totalExpense.toLocaleString()}</h4>
          </div>
          <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400">
            <ArrowDownRight className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-500">Net Business Profit</span>
            <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">₹{netProfit.toLocaleString()}</h4>
          </div>
          <div className={`p-3 rounded-lg ${netProfit >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-zinc-500">Operating Profit Margin</span>
            <h4 className="text-xl font-extrabold text-zinc-900 dark:text-zinc-50 mt-1">{profitMarginPercent}%</h4>
          </div>
          <div className="p-3 rounded-lg bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400">
            <Percent className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* Ledger controller and Filters */}
      <div className="flex flex-col sm:flex-row gap-4 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 justify-between items-center">
        <div className="flex flex-1 gap-3 w-full">
          <select
            value={paymentTypeFilter}
            onChange={(e) => setPaymentTypeFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
            aria-label="Filter ledger by ledger item type"
          >
            <option value="ALL">All Ledger Entries</option>
            <option value="MEMBERSHIP">Membership dues</option>
            <option value="SALARY">Payroll Disbursements</option>
            <option value="UTILITY">Utility payments</option>
            <option value="EQUIPMENT">Machinery & Inventory</option>
          </select>

          <select
            value={paymentModeFilter}
            onChange={(e) => setPaymentModeFilter(e.target.value)}
            className="text-xs px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
            aria-label="Filter ledger by remittance channel"
          >
            <option value="ALL">All Payment Modes</option>
            <option value="UPI">UPI (Unified Payments Interface)</option>
            <option value="CASH">Cash Drawer</option>
            <option value="CARD">Debit/Credit Card</option>
            <option value="BANK_TRANSFER">Direct IMPS/NEFT</option>
          </select>
        </div>

        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-lg w-full sm:w-auto justify-center shadow"
          aria-haspopup="dialog"
        >
          <Plus className="w-4 h-4" /> Log Expense / Entry
        </button>
      </div>

      {/* General ledger directory */}
      <section className="overflow-x-auto rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm" aria-label="Branch General Ledger">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 font-semibold">
              <th className="p-4">Transaction Date</th>
              <th className="p-4">Reference ID</th>
              <th className="p-4">Description Category</th>
              <th className="p-4">Channel Mode</th>
              <th className="p-4 text-right">Value Amount</th>
              <th className="p-4 text-center">Tax Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {filteredPayments.map((pay) => {
              const isIncome = pay.paymentType === 'MEMBERSHIP' || pay.paymentType === 'PT_PACKAGE';
              return (
                <tr key={pay.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="p-4 font-mono">{pay.paymentDate}</td>
                  <td className="p-4 font-mono font-semibold text-zinc-600 dark:text-zinc-400">{pay.referenceNo}</td>
                  <td className="p-4">
                    <span className="font-bold text-zinc-900 dark:text-zinc-50">{pay.paymentType}</span>
                    {pay.notes && <span className="block text-[10px] text-zinc-400 mt-0.5">{pay.notes}</span>}
                  </td>
                  <td className="p-4 font-semibold text-zinc-500">{pay.paymentMode}</td>
                  <td className={`p-4 text-right font-extrabold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                    {isIncome ? '+' : '-'} ₹{pay.amount.toLocaleString()}
                  </td>
                  <td className="p-4 text-center">
                    {isIncome ? (
                      <button
                        onClick={() => setSelectedInvoicePay(pay)}
                        className="px-2.5 py-1 text-[10px] font-bold rounded border border-zinc-200 dark:border-zinc-850 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-blue-600 dark:text-blue-400 flex items-center gap-1 mx-auto focus:outline-2 focus:outline-blue-500"
                        aria-label={`View tax receipt of reference ${pay.referenceNo}`}
                      >
                        <FileText className="w-3.5 h-3.5" /> GST Invoice
                      </button>
                    ) : (
                      <span className="text-[10px] text-zinc-400 font-semibold italic">N/A Expense</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>

      {/* Structured GST Invoice Slide-over Viewer */}
      {selectedInvoicePay && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="invoice-heading">
          <div className="w-full max-w-lg bg-white text-zinc-900 rounded-xl shadow-2xl overflow-hidden border border-zinc-200">
            
            {/* Invoice Top Action */}
            <div className="p-4 bg-zinc-100 border-b border-zinc-200 flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-600 flex items-center gap-1">
                <Calculator className="w-4 h-4 text-blue-500" /> GST Tax Receipt Format
              </span>
              <button onClick={() => setSelectedInvoicePay(null)} className="text-zinc-500 hover:text-zinc-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated Printed Tax Invoice */}
            <div className="p-8 space-y-6 font-mono text-[11px] leading-relaxed bg-amber-50/10">
              
              {/* Receipt Header block */}
              <div className="text-center space-y-1 pb-4 border-b border-zinc-300">
                <h4 className="text-sm font-bold tracking-wider uppercase">FITLIFE HEALTH CLUBS PVT LTD</h4>
                <p className="text-[10px] text-zinc-500">Andheri West Branch, Linking Road, Mumbai, MH</p>
                <p className="text-[10px] font-bold">GSTIN: 27AAACF8912C1ZS</p>
                <h5 className="text-[10px] font-bold border border-zinc-400 px-2 py-0.5 inline-block rounded uppercase tracking-widest bg-zinc-100 mt-2">
                  Tax Invoice
                </h5>
              </div>

              {/* metadata columns */}
              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-200">
                <div>
                  <span className="block font-bold text-zinc-500 uppercase text-[9px]">Billed To (Client):</span>
                  <p className="font-bold">{members.find(m => m.id === selectedInvoicePay.userId)?.name || 'Walk-In Guest'}</p>
                  <p className="text-[10px] text-zinc-500">Phone: {members.find(m => m.id === selectedInvoicePay.userId)?.phone || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p><strong>Invoice No:</strong> FT-2026-{selectedInvoicePay.id.slice(-5).toUpperCase()}</p>
                  <p><strong>Date:</strong> {selectedInvoicePay.paymentDate}</p>
                  <p><strong>Channel:</strong> {selectedInvoicePay.paymentMode}</p>
                </div>
              </div>

              {/* Products specs and CGST/SGST ledger */}
              {(() => {
                const taxData = calculateTaxValues(selectedInvoicePay.amount);
                return (
                  <div className="space-y-4">
                    <div className="flex justify-between font-bold border-b pb-1 border-zinc-200 text-[10px]">
                      <span>Description / Service Product</span>
                      <span className="text-right">Amount (INR)</span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between">
                        <span>Gym Subscription Package (HSN 9997)</span>
                        <span>₹{taxData.baseValue.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-zinc-500 text-[10px]">
                        <span>Central GST (CGST @ 9%)</span>
                        <span>₹{taxData.cgst.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between text-zinc-500 text-[10px]">
                        <span>State GST (SGST @ 9%)</span>
                        <span>₹{taxData.sgst.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="border-t border-dashed pt-2 flex justify-between font-bold text-sm border-zinc-300">
                      <span>Total Invoice Value (GST Inclusive)</span>
                      <span>₹{selectedInvoicePay.amount.toFixed(2)}</span>
                    </div>
                  </div>
                );
              })()}

              {/* Receipt Footer */}
              <div className="text-center text-[10px] text-zinc-400 pt-4 border-t border-zinc-200 space-y-1">
                <p>This is a simulated GST tax invoice. No real transactions were committed.</p>
                <p className="font-bold text-zinc-800">Thank you for working out with us!</p>
              </div>

            </div>

            {/* Print trigger action */}
            <div className="p-4 bg-zinc-100 border-t border-zinc-200 flex justify-end">
              <button
                onClick={() => {
                  setSelectedInvoicePay(null);
                  triggerAnnouncement('Tax invoice dispatched to printer queue.');
                }}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-lg font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Barcode Invoice
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Log Expense Dialog */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="expense-modal-title">
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden text-xs text-zinc-700 dark:text-zinc-300">
            <div className="p-5 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
              <h4 id="expense-modal-title" className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">Log Expense Ledger Entry</h4>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTxn} className="p-5 space-y-4">
              <div>
                <label className="block font-semibold mb-1">Expense Amount (INR) *</label>
                <input
                  type="number"
                  required
                  value={newTxn.amount}
                  onChange={(e) => setNewTxn({ ...newTxn, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono"
                  placeholder="₹ e.g. 15000"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold mb-1">Expenditure Type</label>
                  <select
                    value={newTxn.paymentType}
                    onChange={(e) => setNewTxn({ ...newTxn, paymentType: e.target.value as any })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-bold"
                  >
                    <option value="UTILITY">Utility Bill (Power, Water)</option>
                    <option value="EQUIPMENT">Gym Equipment purchase</option>
                    <option value="SALARY">Payroll Disbursement</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold mb-1">Payment Mode</label>
                  <select
                    value={newTxn.paymentMode}
                    onChange={(e) => setNewTxn({ ...newTxn, paymentMode: e.target.value as any })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="UPI">UPI Transfer</option>
                    <option value="BANK_TRANSFER">Bank IMPS / NEFT</option>
                    <option value="CASH">Cash Drawer</option>
                    <option value="CARD">Company Credit Card</option>
                  </select>
                </div>
              </div>

              {newTxn.paymentType === 'SALARY' && (
                <div>
                  <label className="block font-semibold mb-1">Link Employee</label>
                  <select
                    value={newTxn.entityId}
                    onChange={(e) => setNewTxn({ ...newTxn, entityId: e.target.value })}
                    className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                  >
                    <option value="">Choose Employee</option>
                    {staff.map(s => (
                      <option key={s.id} value={s.id}>{s.name} - ({s.role})</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">Receipt Reference No / Chq No</label>
                <input
                  type="text"
                  value={newTxn.referenceNo}
                  onChange={(e) => setNewTxn({ ...newTxn, referenceNo: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100 font-mono"
                  placeholder="e.g. TXN28491823"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Detailed Remarks</label>
                <textarea
                  value={newTxn.notes}
                  onChange={(e) => setNewTxn({ ...newTxn, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-lg text-zinc-900 dark:text-zinc-100"
                  placeholder="Purpose of expenditures"
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
                  className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-bold"
                >
                  Post Transaction
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
