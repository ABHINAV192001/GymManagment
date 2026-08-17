import React, { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { DollarSign, ArrowUpRight, ArrowDownRight, Percent, Calendar, Plus, X, Check, FileText, Printer, Calculator, Download, Filter, Layers, Receipt, Search, User, UserCheck, ShieldCheck, Clock, CreditCard, Sparkles } from 'lucide-react';
import { Payment, Member, Staff } from '../../types';
import { getPayments, createPayment } from '../../lib/api/accounts';
import { getUsers, getStaff } from '../../lib/api/admin';
import { usePermissions } from '../../lib/usePermissions';
import { downloadLedgerPdf } from '../../lib/ledgerPdf';
import { SearchableSelect } from '../../components/shared/SearchableSelect';

export const Accounts: React.FC = () => {
  const { triggerAnnouncement } = useOutletContext<{ selectedBranchId: string; triggerAnnouncement: (msg: string) => void }>();
  const { canCreate } = usePermissions();
  
  const [payments, setPayments] = useState<Payment[]>([]);
  const [members, setMembers] = useState<Member[]>([]);
  const [staff, setStaff] = useState<Staff[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([getPayments(), getUsers({ size: 1000 }), getStaff()])
      .then(([pays, memsRes, stf]) => {
        setPayments(Array.isArray(pays) ? pays : []);
        setMembers(Array.isArray(memsRes?.members) ? memsRes.members : []);
        setStaff(Array.isArray(stf) ? stf : []);
      })
      .catch(err => triggerAnnouncement(`Failed to load accounts data: ${err.message}`))
      .finally(() => setIsLoading(false));
  }, [triggerAnnouncement]);

  const [isOpen, setIsOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'EXPENSE' | 'INCOME' | 'INVOICE'>('EXPENSE');
  const [selectedInvoicePay, setSelectedInvoicePay] = useState<Payment | null>(null);

  // Member Audit Drawer state
  const [selectedMemberAudit, setSelectedMemberAudit] = useState<Member | null>(null);

  // Filters state
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryTab, setCategoryTab] = useState<'ALL' | 'INCOME' | 'SALARY' | 'UTILITY' | 'EQUIPMENT'>('ALL');
  const [paymentModeFilter, setPaymentModeFilter] = useState('ALL');

  // Form State
  const [newTxn, setNewTxn] = useState({
    amount: '',
    paymentType: 'UTILITY' as 'MEMBERSHIP' | 'PT_PACKAGE' | 'SALARY' | 'UTILITY' | 'EQUIPMENT',
    paymentMode: 'UPI' as 'UPI' | 'CASH' | 'CARD' | 'BANK_TRANSFER',
    referenceNo: '',
    notes: '',
    entityId: '', // member or staff ID
    categoryCode: '5002', // Default utility
  });

  // Chart of Accounts (COA) Code Resolution
  const getCOACodeInfo = (paymentType: string, notes: string = '') => {
    const noteLower = notes.toLowerCase();
    if (paymentType === 'MEMBERSHIP') return { code: '4001', label: 'Membership Subscription Income', category: 'REVENUE' };
    if (paymentType === 'PT_PACKAGE') return { code: '4002', label: 'Personal Training Package', category: 'REVENUE' };
    if (paymentType === 'SALARY') return { code: '5001', label: 'Staff Payroll & Payslips', category: 'EXPENSE' };
    if (paymentType === 'UTILITY') {
      if (noteLower.includes('water')) return { code: '5003', label: 'Water & Sanitation Bill', category: 'EXPENSE' };
      if (noteLower.includes('rent')) return { code: '5004', label: 'Facility Lease & Rent', category: 'EXPENSE' };
      if (noteLower.includes('gst') || noteLower.includes('tax')) return { code: '5006', label: 'GST Tax Remittance', category: 'EXPENSE' };
      return { code: '5002', label: 'Electricity & Power Utility', category: 'EXPENSE' };
    }
    if (paymentType === 'EQUIPMENT') return { code: '5005', label: 'Equipment & Asset Maintenance', category: 'EXPENSE' };
    return { code: '5007', label: 'General Operating Expense', category: 'EXPENSE' };
  };

  // Derived financials
  const incomePayments = payments.filter((p) => p.paymentType === 'MEMBERSHIP' || p.paymentType === 'PT_PACKAGE');
  const expensePayments = payments.filter((p) => p.paymentType === 'SALARY' || p.paymentType === 'UTILITY' || p.paymentType === 'EQUIPMENT');

  const totalIncome = incomePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const totalExpense = expensePayments.reduce((sum, p) => sum + (p.amount || 0), 0);
  const netProfit = totalIncome - totalExpense;
  const profitMarginPercent = totalIncome > 0 ? ((netProfit / totalIncome) * 100).toFixed(1) : '0';

  const filteredPayments = payments.filter((p) => {
    const matchesCategory = categoryTab === 'ALL' || 
                            (categoryTab === 'INCOME' && (p.paymentType === 'MEMBERSHIP' || p.paymentType === 'PT_PACKAGE')) ||
                            (categoryTab === 'SALARY' && p.paymentType === 'SALARY') ||
                            (categoryTab === 'UTILITY' && p.paymentType === 'UTILITY') ||
                            (categoryTab === 'EQUIPMENT' && p.paymentType === 'EQUIPMENT');
    const matchesMode = paymentModeFilter === 'ALL' || p.paymentMode === paymentModeFilter;
    
    // Member / Search filter matching
    const memberObj = members.find(m => m.id === p.userId);
    const staffObj = staff.find(s => s.id === p.staffId);
    const searchLower = searchQuery.toLowerCase().trim();
    const matchesSearch = !searchLower ||
      (p.referenceNo || '').toLowerCase().includes(searchLower) ||
      (p.notes || '').toLowerCase().includes(searchLower) ||
      (memberObj && (
        memberObj.name.toLowerCase().includes(searchLower) ||
        memberObj.phone.includes(searchLower) ||
        (memberObj.userCode && memberObj.userCode.toLowerCase().includes(searchLower))
      )) ||
      (staffObj && (
        staffObj.name.toLowerCase().includes(searchLower) ||
        staffObj.phone.includes(searchLower)
      ));

    return matchesCategory && matchesMode && matchesSearch;
  });

  const handleCreateTxn = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTxn.amount) return;

    try {
      const isInc = modalMode === 'INCOME';
      const defaultType = isInc ? 'MEMBERSHIP' : newTxn.paymentType;
      
      const paymentData: Partial<Payment> = {
        paymentType: defaultType,
        amount: Number(newTxn.amount),
        currency: 'INR',
        paymentMode: newTxn.paymentMode,
        referenceNo: newTxn.referenceNo || `TXN${Math.floor(Math.random() * 900000 + 100000)}`,
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'COMPLETED',
        notes: newTxn.notes || (isInc ? 'Member plan subscription fee' : 'General Operating Expense'),
      };

      if (defaultType === 'SALARY') {
        paymentData.staffId = newTxn.entityId || undefined;
      } else if (defaultType === 'MEMBERSHIP' || defaultType === 'PT_PACKAGE') {
        paymentData.userId = newTxn.entityId || undefined;
      }

      const created = await createPayment(paymentData);
      setPayments([created, ...payments]);
      setIsOpen(false);
      triggerAnnouncement(`Ledger record of ₹${created.amount.toLocaleString()} posted successfully.`);
      
      // reset
      setNewTxn({
        amount: '',
        paymentType: 'UTILITY',
        paymentMode: 'UPI',
        referenceNo: '',
        notes: '',
        entityId: '',
        categoryCode: '5002',
      });
    } catch (err: any) {
      triggerAnnouncement(`Failed to post transaction: ${err.message}`);
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
      {/* Financial Overview Strip (0 Hardcoded Values) */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-4" aria-label="Financial summaries">
        <div className="p-3.5 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wider truncate block">Gross Income</span>
            <h4 className="text-base sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-0.5 font-mono truncate">₹{totalIncome.toLocaleString()}</h4>
          </div>
          <div className="p-2 sm:p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 shrink-0">
            <ArrowUpRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wider truncate block">Expenditures</span>
            <h4 className="text-base sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-0.5 font-mono truncate">₹{totalExpense.toLocaleString()}</h4>
          </div>
          <div className="p-2 sm:p-3 rounded-xl bg-red-50 dark:bg-red-950/30 text-red-600 dark:text-red-400 shrink-0">
            <ArrowDownRight className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wider truncate block">Net Profit</span>
            <h4 className={`text-base sm:text-2xl font-black mt-0.5 font-mono truncate ${netProfit >= 0 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600'}`}>
              ₹{netProfit.toLocaleString()}
            </h4>
          </div>
          <div className={`p-2 sm:p-3 rounded-xl shrink-0 ${netProfit >= 0 ? 'bg-emerald-50 text-emerald-600 dark:bg-emerald-950/30' : 'bg-red-50 text-red-600'}`}>
            <DollarSign className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>

        <div className="p-3.5 sm:p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm flex items-center justify-between">
          <div className="min-w-0">
            <span className="text-[10px] sm:text-xs font-semibold text-zinc-500 uppercase tracking-wider truncate block">Profit Margin</span>
            <h4 className="text-base sm:text-2xl font-black text-zinc-900 dark:text-zinc-50 mt-0.5 font-mono truncate">{profitMarginPercent}%</h4>
          </div>
          <div className="p-2 sm:p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 text-indigo-600 dark:text-indigo-400 shrink-0">
            <Percent className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
        </div>
      </section>

      {/* Controller & Submenu Navigation Tabs */}
      <div className="flex flex-col xl:flex-row gap-4 p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 justify-between items-center shadow-sm">
        {/* Category Submenu Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full xl:w-auto p-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl text-xs font-bold">
          <button
            onClick={() => setCategoryTab('ALL')}
            className={`px-3.5 py-2 rounded-lg transition shrink-0 ${
              categoryTab === 'ALL'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            All Ledger Entries ({payments.length})
          </button>
          <button
            onClick={() => setCategoryTab('INCOME')}
            className={`px-3.5 py-2 rounded-lg transition shrink-0 ${
              categoryTab === 'INCOME'
                ? 'bg-white dark:bg-zinc-800 text-emerald-600 dark:text-emerald-400 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Member Income ({incomePayments.length})
          </button>
          <button
            onClick={() => setCategoryTab('SALARY')}
            className={`px-3.5 py-2 rounded-lg transition shrink-0 ${
              categoryTab === 'SALARY'
                ? 'bg-white dark:bg-zinc-800 text-blue-600 dark:text-blue-400 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Staff Payroll
          </button>
          <button
            onClick={() => setCategoryTab('UTILITY')}
            className={`px-3.5 py-2 rounded-lg transition shrink-0 ${
              categoryTab === 'UTILITY'
                ? 'bg-white dark:bg-zinc-800 text-amber-600 dark:text-amber-400 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Power, Water & Rent
          </button>
          <button
            onClick={() => setCategoryTab('EQUIPMENT')}
            className={`px-3.5 py-2 rounded-lg transition shrink-0 ${
              categoryTab === 'EQUIPMENT'
                ? 'bg-white dark:bg-zinc-800 text-purple-600 dark:text-purple-400 shadow-sm border border-zinc-200/60 dark:border-zinc-700/60'
                : 'text-zinc-600 dark:text-zinc-400 hover:bg-white dark:hover:bg-zinc-800 hover:text-zinc-900 dark:hover:text-white'
            }`}
          >
            Equipment Assets
          </button>
        </div>

        {/* Search & Action Controls */}
        <div className="flex flex-wrap items-center gap-2 w-full xl:w-auto justify-end">
          {/* Member / Ref Search Input */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search member, phone, or ref..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full text-xs pl-8 pr-3 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
            />
          </div>

          <select
            value={paymentModeFilter}
            onChange={(e) => setPaymentModeFilter(e.target.value)}
            className="text-xs px-3 py-1.5 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-medium"
            aria-label="Filter ledger by remittance channel"
          >
            <option value="ALL">All Modes</option>
            <option value="UPI">UPI</option>
            <option value="CASH">Cash</option>
            <option value="CARD">Card</option>
            <option value="BANK_TRANSFER">Bank IMPS/NEFT</option>
          </select>

          <button
            onClick={() => downloadLedgerPdf(filteredPayments, { income: totalIncome, expense: totalExpense, net: netProfit })}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 text-zinc-700 dark:text-zinc-300 rounded-xl transition"
            title="Export Ledger PDF Statement"
          >
            <Download className="w-3.5 h-3.5" /> Statement PDF
          </button>

          {canCreate('accounts') && (
            <>
              <button
                onClick={() => { setModalMode('INCOME'); setIsOpen(true); }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" /> Log Income
              </button>
              <button
                onClick={() => { setModalMode('EXPENSE'); setIsOpen(true); }}
                className="flex items-center gap-1 px-3 py-1.5 text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-sm transition"
              >
                <Plus className="w-3.5 h-3.5" /> Log Expense
              </button>
            </>
          )}
        </div>
      </div>

      {/* General Ledger Directory */}
      <section className="overflow-x-auto rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm" aria-label="Branch General Ledger">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 font-semibold">
              <th className="p-4">Txn Date</th>
              <th className="p-4">COA Code & Category</th>
              <th className="p-4">Linked Member / Party</th>
              <th className="p-4">Reference ID</th>
              <th className="p-4">Remittance Mode</th>
              <th className="p-4 text-right">Amount (INR)</th>
              <th className="p-4 text-center">Receipt & Invoice</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900">
            {filteredPayments.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center text-zinc-400 text-xs">
                  No accounting ledger records found matching the active filter.
                </td>
              </tr>
            ) : (
              filteredPayments.map((pay) => {
                const isIncome = pay.paymentType === 'MEMBERSHIP' || pay.paymentType === 'PT_PACKAGE';
                const coa = getCOACodeInfo(pay.paymentType, pay.notes || '');
                const linkedMember = members.find(m => m.id === pay.userId);
                const linkedStaff = staff.find(s => s.id === pay.staffId);

                return (
                  <tr key={pay.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition">
                    <td className="p-4 font-mono">{pay.paymentDate}</td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold font-mono bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-blue-600 dark:text-blue-400">
                          {coa.code}
                        </span>
                        <div>
                          <span className="font-bold text-zinc-900 dark:text-zinc-50 block">{coa.label}</span>
                          {pay.notes && <span className="text-[10px] text-zinc-400 block mt-0.5">{pay.notes}</span>}
                        </div>
                      </div>
                    </td>
                    <td className="p-4">
                      {linkedMember ? (
                        <button
                          onClick={() => setSelectedMemberAudit(linkedMember)}
                          className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 hover:border-blue-500 text-left transition group"
                        >
                          <User className="w-3.5 h-3.5 text-blue-500" />
                          <div>
                            <span className="font-bold text-zinc-900 dark:text-zinc-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 block text-xs">
                              {linkedMember.name}
                            </span>
                            <span className="text-[10px] font-mono text-zinc-500 block">
                              {linkedMember.userCode || 'MEMBER'} • {linkedMember.phone || 'No Phone'}
                            </span>
                          </div>
                        </button>
                      ) : linkedStaff ? (
                        <div className="flex items-center gap-1.5 text-zinc-700 dark:text-zinc-300">
                          <UserCheck className="w-3.5 h-3.5 text-purple-500" />
                          <div>
                            <span className="font-bold block text-xs">{linkedStaff.name}</span>
                            <span className="text-[10px] text-zinc-400 uppercase font-mono">{linkedStaff.role}</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-zinc-400 text-[11px] font-mono">General Entity / Desk</span>
                      )}
                    </td>
                    <td className="p-4 font-mono font-semibold text-zinc-600 dark:text-zinc-400">{pay.referenceNo}</td>
                    <td className="p-4 font-semibold text-zinc-500">{pay.paymentMode}</td>
                    <td className={`p-4 text-right font-extrabold ${isIncome ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-500'}`}>
                      {isIncome ? '+' : '-'} ₹{pay.amount.toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      {isIncome ? (
                        <button
                          onClick={() => setSelectedInvoicePay(pay)}
                          className="px-2.5 py-1 text-[10px] font-bold rounded border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-blue-600 dark:text-blue-400 flex items-center gap-1 mx-auto"
                        >
                          <FileText className="w-3.5 h-3.5" /> Tax Invoice
                        </button>
                      ) : (
                        <span className="text-[10px] text-zinc-400 font-semibold italic">Expense Voucher</span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </section>

      {/* Member Lifetime Financial Audit Drawer */}
      {selectedMemberAudit && (
        <div className="fixed inset-0 z-50 overflow-hidden flex justify-end bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setSelectedMemberAudit(null)}>
          <div className="w-full max-w-xl bg-white dark:bg-zinc-950 border-l border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-y-auto p-6 space-y-6 flex flex-col justify-between" onClick={(e) => e.stopPropagation()}>
            
            <div className="space-y-6">
              {/* Header */}
              <div className="flex justify-between items-start border-b border-zinc-100 dark:border-zinc-900 pb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white font-bold flex items-center justify-center text-sm shadow-lg shadow-emerald-500/20">
                    {(selectedMemberAudit.name || 'M').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-50">{selectedMemberAudit.name}</h2>
                    <div className="flex items-center gap-2 mt-0.5 text-xs font-mono">
                      <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedMemberAudit.userCode || 'MEMBER'}</span>
                      <span>•</span>
                      <span className="text-zinc-500">{selectedMemberAudit.phone}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${selectedMemberAudit.isActive ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950 dark:text-emerald-400' : 'bg-zinc-100 text-zinc-600'}`}>
                        {selectedMemberAudit.status || (selectedMemberAudit.isActive ? 'Active' : 'Expired')}
                      </span>
                    </div>
                  </div>
                </div>

                <button onClick={() => setSelectedMemberAudit(null)} className="p-2 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-400">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Lifetime Value (LTV) Summary Cards */}
              {(() => {
                const memberPayments = payments.filter(p => p.userId === selectedMemberAudit.id);
                const ltvAmount = memberPayments.reduce((sum, p) => sum + (p.amount || 0), 0);
                const lastPayment = memberPayments[0];

                return (
                  <div className="space-y-6">
                    <div className="grid grid-cols-3 gap-3">
                      <div className="p-3.5 rounded-2xl border border-emerald-200 dark:border-emerald-900/50 bg-emerald-50/50 dark:bg-emerald-950/20 text-center">
                        <p className="text-[10px] font-bold text-emerald-800 dark:text-emerald-400 uppercase tracking-wider">Lifetime Value (LTV)</p>
                        <p className="text-lg font-black font-mono text-emerald-700 dark:text-emerald-400 mt-1">₹{ltvAmount.toLocaleString()}</p>
                      </div>

                      <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-center">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Payment Cycles</p>
                        <p className="text-lg font-black font-mono text-zinc-900 dark:text-zinc-100 mt-1">{memberPayments.length} txns</p>
                      </div>

                      <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-center">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">Active Plan</p>
                        <p className="text-xs font-bold text-blue-600 dark:text-blue-400 mt-1 truncate">{selectedMemberAudit.plan || 'Standard'}</p>
                      </div>
                    </div>

                    {/* Member Plan & Validity info */}
                    <div className="p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs space-y-2">
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-1.5">
                        <CreditCard className="w-4 h-4 text-blue-500" /> Membership Validity Period
                      </h3>
                      <div className="grid grid-cols-2 gap-3 text-zinc-600 dark:text-zinc-400 font-mono pt-1">
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-sans">Start Date</span>
                          <span className="font-bold text-zinc-900 dark:text-zinc-100">{selectedMemberAudit.startDate || '—'}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-zinc-400 block font-sans">End / Expiry Date</span>
                          <span className="font-bold text-blue-600 dark:text-blue-400">{selectedMemberAudit.endDate || '—'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Per-Member Itemized Transaction History Table */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-zinc-900 dark:text-zinc-100 text-xs flex items-center justify-between">
                        <span>Itemized Member Transaction History</span>
                        <span className="text-[10px] font-mono text-zinc-400">{memberPayments.length} records</span>
                      </h3>

                      {memberPayments.length === 0 ? (
                        <div className="p-8 text-center border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 text-xs">
                          No direct desk payment entries linked to this user ID.
                        </div>
                      ) : (
                        <div className="border border-zinc-200 dark:border-zinc-800 rounded-xl overflow-hidden text-xs">
                          <table className="w-full text-left border-collapse">
                            <thead>
                              <tr className="bg-zinc-50 dark:bg-zinc-900 border-b border-zinc-200 dark:border-zinc-800 text-zinc-500 font-bold">
                                <th className="p-3">Date</th>
                                <th className="p-3">Ref ID</th>
                                <th className="p-3">Channel</th>
                                <th className="p-3 text-right">Amount (INR)</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 font-mono">
                              {memberPayments.map((p) => (
                                <tr key={p.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                                  <td className="p-3">{p.paymentDate}</td>
                                  <td className="p-3 font-semibold text-zinc-600 dark:text-zinc-400">{p.referenceNo}</td>
                                  <td className="p-3 text-zinc-500">{p.paymentMode}</td>
                                  <td className="p-3 text-right font-extrabold text-emerald-600 dark:text-emerald-400">
                                    + ₹{p.amount.toLocaleString()}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>

            <div className="pt-4 border-t border-zinc-100 dark:border-zinc-900 flex justify-end">
              <button
                onClick={() => setSelectedMemberAudit(null)}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold text-xs"
              >
                Close Audit View
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Structured GST Tax Invoice Modal */}
      {selectedInvoicePay && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setSelectedInvoicePay(null)}>
          <div className="w-full max-w-lg bg-white text-zinc-900 rounded-2xl shadow-2xl overflow-hidden border border-zinc-200" onClick={(e) => e.stopPropagation()}>
            
            <div className="p-4 bg-zinc-100 border-b border-zinc-200 flex justify-between items-center">
              <span className="text-xs font-bold text-zinc-600 flex items-center gap-1">
                <Calculator className="w-4 h-4 text-blue-500" /> GST Tax Receipt Format
              </span>
              <button onClick={() => setSelectedInvoicePay(null)} className="text-zinc-500 hover:text-zinc-800">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-8 space-y-6 font-mono text-[11px] leading-relaxed bg-amber-50/10">
              <div className="text-center space-y-1 pb-4 border-b border-zinc-300">
                <h4 className="text-sm font-bold tracking-wider uppercase">FITLIFE HEALTH CLUBS PVT LTD</h4>
                <p className="text-[10px] text-zinc-500">Corporate & Operational Head Branch</p>
                <p className="text-[10px] font-bold">GSTIN: 27AAACF8912C1ZS</p>
                <h5 className="text-[10px] font-bold border border-zinc-400 px-2 py-0.5 inline-block rounded uppercase tracking-widest bg-zinc-100 mt-2">
                  Tax Invoice
                </h5>
              </div>

              <div className="grid grid-cols-2 gap-4 pb-4 border-b border-zinc-200">
                <div>
                  <span className="block font-bold text-zinc-500 uppercase text-[9px]">Billed To (Client):</span>
                  <p className="font-bold">{members.find(m => m.id === selectedInvoicePay.userId)?.name || 'Walk-In Client'}</p>
                  <p className="text-[10px] text-zinc-500">Phone: {members.find(m => m.id === selectedInvoicePay.userId)?.phone || 'N/A'}</p>
                </div>
                <div className="text-right">
                  <p><strong>Invoice No:</strong> FT-2026-{selectedInvoicePay.id.slice(-5).toUpperCase()}</p>
                  <p><strong>Date:</strong> {selectedInvoicePay.paymentDate}</p>
                  <p><strong>Channel:</strong> {selectedInvoicePay.paymentMode}</p>
                </div>
              </div>

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

              <div className="text-center text-[10px] text-zinc-400 pt-4 border-t border-zinc-200 space-y-1">
                <p>Official Tax Invoice issued by GymOS Accounting System.</p>
                <p className="font-bold text-zinc-800">Thank you for working out with us!</p>
              </div>
            </div>

            <div className="p-4 bg-zinc-100 border-t border-zinc-200 flex justify-end">
              <button
                onClick={() => {
                  setSelectedInvoicePay(null);
                  triggerAnnouncement('Tax invoice dispatched to printer queue.');
                }}
                className="px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold flex items-center gap-1.5"
              >
                <Printer className="w-4 h-4" /> Print Tax Invoice
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Log Transaction / Expense Modal */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" role="dialog" aria-modal="true" onClick={() => setIsOpen(false)}>
          <div className="w-full max-w-md bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl overflow-hidden text-xs text-zinc-700 dark:text-zinc-300 shadow-2xl" onClick={(e) => e.stopPropagation()}>
            <div className="p-5 border-b border-zinc-150 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 flex justify-between items-center">
              <h4 className="font-bold text-zinc-900 dark:text-zinc-50 text-sm">
                {modalMode === 'INCOME' ? 'Log Income Transaction' : 'Log Operating Expense / Voucher'}
              </h4>
              <button onClick={() => setIsOpen(false)} className="text-zinc-400 hover:text-zinc-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTxn} className="p-5 space-y-4">
              <div>
                <label className="block font-semibold mb-1">Transaction Amount (INR) *</label>
                <input
                  type="number"
                  required
                  value={newTxn.amount}
                  onChange={(e) => setNewTxn({ ...newTxn, amount: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono font-bold"
                  placeholder="₹ e.g. 15000"
                />
              </div>

              {modalMode === 'EXPENSE' ? (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Expense Type</label>
                    <select
                      value={newTxn.paymentType}
                      onChange={(e) => setNewTxn({ ...newTxn, paymentType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold"
                    >
                      <option value="UTILITY">Electricity / Power (5002)</option>
                      <option value="UTILITY">Water & Sanitation (5003)</option>
                      <option value="UTILITY">Facility Rent (5004)</option>
                      <option value="EQUIPMENT">Equipment Purchase (5005)</option>
                      <option value="UTILITY">GST / Tax Remittance (5006)</option>
                      <option value="SALARY">Staff Payroll (5001)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Payment Mode</label>
                    <select
                      value={newTxn.paymentMode}
                      onChange={(e) => setNewTxn({ ...newTxn, paymentMode: e.target.value as any })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold"
                    >
                      <option value="UPI">UPI Transfer</option>
                      <option value="BANK_TRANSFER">Bank IMPS / NEFT</option>
                      <option value="CASH">Cash Drawer</option>
                      <option value="CARD">Debit / Credit Card</option>
                    </select>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold mb-1">Income Category</label>
                    <select
                      value={newTxn.paymentType}
                      onChange={(e) => setNewTxn({ ...newTxn, paymentType: e.target.value as any })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-bold"
                    >
                      <option value="MEMBERSHIP">Membership Plan (4001)</option>
                      <option value="PT_PACKAGE">Personal Training (4002)</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-semibold mb-1">Payment Mode</label>
                    <select
                      value={newTxn.paymentMode}
                      onChange={(e) => setNewTxn({ ...newTxn, paymentMode: e.target.value as any })}
                      className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-semibold"
                    >
                      <option value="UPI">UPI</option>
                      <option value="CASH">Cash Drawer</option>
                      <option value="CARD">Credit/Debit Card</option>
                      <option value="BANK_TRANSFER">Bank Transfer</option>
                    </select>
                  </div>
                </div>
              )}

              {modalMode === 'INCOME' && (
                <div>
                  <label className="block font-semibold mb-1">Link Member / Payer *</label>
                  <SearchableSelect
                    placeholder="Search & Select Member by Name or Code..."
                    options={members.map(m => ({
                      value: m.id,
                      label: m.name,
                      sublabel: `${m.userCode || 'MEMBER'} • ${m.phone}`,
                    }))}
                    value={newTxn.entityId}
                    onChange={(val) => setNewTxn({ ...newTxn, entityId: val })}
                  />
                </div>
              )}

              {newTxn.paymentType === 'SALARY' && (
                <div>
                  <label className="block font-semibold mb-1">Link Staff Member</label>
                  <SearchableSelect
                    placeholder="Search & Select Staff Member..."
                    options={staff.map(s => ({
                      value: s.id,
                      label: s.name,
                      sublabel: s.role,
                    }))}
                    value={newTxn.entityId}
                    onChange={(val) => setNewTxn({ ...newTxn, entityId: val })}
                  />
                </div>
              )}

              <div>
                <label className="block font-semibold mb-1">Receipt Reference No / Chq No</label>
                <input
                  type="text"
                  value={newTxn.referenceNo}
                  onChange={(e) => setNewTxn({ ...newTxn, referenceNo: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100 font-mono"
                  placeholder="e.g. TXN28491823"
                />
              </div>

              <div>
                <label className="block font-semibold mb-1">Detailed Remarks</label>
                <textarea
                  value={newTxn.notes}
                  onChange={(e) => setNewTxn({ ...newTxn, notes: e.target.value })}
                  className="w-full px-3 py-2 border border-zinc-300 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-900 rounded-xl text-zinc-900 dark:text-zinc-100"
                  placeholder="Purpose of transaction e.g. 3-Month Plan Renewal"
                />
              </div>

              <div className="pt-4 border-t border-zinc-150 dark:border-zinc-800 flex justify-between">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 border border-zinc-300 dark:border-zinc-700 rounded-xl text-zinc-700 dark:text-zinc-300 font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className={`px-5 py-2 rounded-xl font-bold text-white shadow-sm ${modalMode === 'INCOME' ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-blue-600 hover:bg-blue-500'}`}
                >
                  Post to General Ledger
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
