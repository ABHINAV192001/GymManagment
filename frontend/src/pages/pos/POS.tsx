import React, { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  ShoppingCart, Search, Plus, Minus, Trash2, CheckCircle2,
  RefreshCw, Package, X, CreditCard, Banknote, Smartphone
} from 'lucide-react';
import { getInventory, sellInventoryItem } from '../../lib/api/inventory';
import { createPayment } from '../../lib/api/accounts';
import { InventoryItem } from '../../types';

interface CartItem {
  item: InventoryItem;
  qty: number;
}

const PAYMENT_MODES = [
  { id: 'CASH', label: 'Cash', icon: Banknote },
  { id: 'UPI', label: 'UPI', icon: Smartphone },
  { id: 'CARD', label: 'Card', icon: CreditCard },
];

export const POS: React.FC = () => {
  const { triggerAnnouncement } = useOutletContext<{ triggerAnnouncement: (msg: string) => void; selectedBranchId: string }>();
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [paymentMode, setPaymentMode] = useState<'CASH' | 'UPI' | 'CARD'>('CASH');
  const [isProcessing, setIsProcessing] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<{ total: number; items: CartItem[]; mode: string; time: string } | null>(null);

  const loadInventory = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await getInventory();
      // Only show items with a price set and quantity > 0
      setInventory((Array.isArray(data) ? data : []).filter((i: InventoryItem) => (i as any).price > 0 && i.quantity > 0));
    } catch (err: any) {
      triggerAnnouncement(`Failed to load inventory: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  }, [triggerAnnouncement]);

  useEffect(() => { loadInventory(); }, [loadInventory]);

  const categories = ['ALL', ...Array.from(new Set(inventory.map(i => i.category || 'Other')))];

  const filtered = inventory.filter(i => {
    const matchCat = categoryFilter === 'ALL' || (i.category || 'Other') === categoryFilter;
    const matchSearch = !search || i.name.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const addToCart = (item: InventoryItem) => {
    setCart(prev => {
      const existing = prev.find(c => c.item.id === item.id);
      if (existing) {
        if (existing.qty >= item.quantity) {
          triggerAnnouncement(`Only ${item.quantity} units available.`);
          return prev;
        }
        return prev.map(c => c.item.id === item.id ? { ...c, qty: c.qty + 1 } : c);
      }
      return [...prev, { item, qty: 1 }];
    });
  };

  const updateQty = (itemId: string, delta: number) => {
    setCart(prev => prev.map(c => {
      if (c.item.id !== itemId) return c;
      const newQty = c.qty + delta;
      if (newQty <= 0) return c;
      if (newQty > c.item.quantity) { triggerAnnouncement(`Only ${c.item.quantity} in stock.`); return c; }
      return { ...c, qty: newQty };
    }));
  };

  const removeFromCart = (itemId: string) => setCart(prev => prev.filter(c => c.item.id !== itemId));

  const cartTotal = cart.reduce((sum, c) => sum + ((c.item as any).price || 0) * c.qty, 0);

  const handleCheckout = async () => {
    if (cart.length === 0) return;
    setIsProcessing(true);
    try {
      // 1. Deduct inventory for each item
      await Promise.all(
        cart.map(c => sellInventoryItem(c.item.id!, c.qty))
      );

      // 2. Create single payment record in ledger
      await createPayment({
        paymentType: 'MEMBERSHIP',
        amount: cartTotal,
        currency: 'INR',
        paymentMode,
        referenceNo: `POS-${Date.now()}`,
        paymentDate: new Date().toISOString().split('T')[0],
        status: 'COMPLETED',
        notes: `POS Sale: ${cart.map(c => `${c.item.name} x${c.qty}`).join(', ')}`,
      });

      // 3. Show receipt
      setLastReceipt({ total: cartTotal, items: [...cart], mode: paymentMode, time: new Date().toLocaleTimeString() });
      setCart([]);

      // 4. Refresh inventory list
      loadInventory();
      triggerAnnouncement(`Sale of ₹${cartTotal.toLocaleString()} processed!`);
    } catch (err: any) {
      triggerAnnouncement(`Checkout failed: ${err.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex gap-6 h-[calc(100vh-120px)]">
      {/* Left: Item Catalogue */}
      <div className="flex-1 flex flex-col min-w-0 space-y-4 overflow-hidden">
        <div>
          <h1 className="text-2xl font-black text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-emerald-600" /> POS Billing
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-0.5">Select items to build a cart and process payment.</p>
        </div>

        {/* Search + Filter */}
        <div className="flex gap-2 flex-wrap">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search items…"
              className="w-full pl-9 pr-4 py-2 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-sm text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-emerald-500" />
          </div>
          <div className="flex gap-1 flex-wrap">
            {categories.map(cat => (
              <button key={cat} onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-2 rounded-xl text-xs font-bold transition border ${categoryFilter === cat ? 'bg-emerald-600 text-white border-emerald-600' : 'border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800'}`}>
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Item Grid */}
        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="flex items-center justify-center py-20 text-zinc-400"><RefreshCw className="w-6 h-6 animate-spin mr-2" /> Loading…</div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center">
              <Package className="w-12 h-12 text-zinc-300 dark:text-zinc-600 mb-3" />
              <p className="font-bold text-zinc-600 dark:text-zinc-400">No items available for sale</p>
              <p className="text-sm text-zinc-400 mt-1">Add a price to inventory items to make them available here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 xl:grid-cols-3 gap-3">
              {filtered.map(item => {
                const price = (item as any).price || 0;
                const inCart = cart.find(c => c.item.id === item.id);
                return (
                  <button key={item.id} onClick={() => addToCart(item)}
                    className={`p-4 rounded-2xl border-2 text-left transition hover:shadow-md ${inCart ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30' : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-emerald-300'}`}>
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center mb-3">
                      <Package className="w-5 h-5" />
                    </div>
                    <div className="font-bold text-zinc-900 dark:text-zinc-50 text-sm truncate">{item.name}</div>
                    <div className="text-[11px] text-zinc-500 dark:text-zinc-400 mt-0.5">{item.category || 'General'}</div>
                    <div className="flex items-center justify-between mt-2">
                      <span className="text-emerald-600 dark:text-emerald-400 font-black text-base">₹{price.toLocaleString()}</span>
                      <span className="text-[10px] text-zinc-400">{item.quantity} left</span>
                    </div>
                    {inCart && (
                      <div className="mt-2 flex items-center gap-1 text-emerald-600 font-bold text-xs">
                        <CheckCircle2 className="w-3.5 h-3.5" /> {inCart.qty} in cart
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Right: Cart + Checkout */}
      <div className="w-80 shrink-0 flex flex-col bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl overflow-hidden shadow-xl">
        {/* Cart Header */}
        <div className="p-4 border-b border-zinc-200 dark:border-zinc-800 bg-gradient-to-r from-emerald-600 to-teal-600">
          <div className="flex items-center justify-between text-white">
            <span className="font-black flex items-center gap-2"><ShoppingCart className="w-4 h-4" /> Cart</span>
            <span className="text-sm font-bold bg-white/20 px-2 py-0.5 rounded-full">{cart.reduce((s, c) => s + c.qty, 0)} items</span>
          </div>
        </div>

        {/* Cart Items */}
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {cart.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10">
              <ShoppingCart className="w-10 h-10 text-zinc-300 dark:text-zinc-600 mb-2" />
              <p className="text-sm font-bold text-zinc-500">Your cart is empty</p>
              <p className="text-xs text-zinc-400 mt-1">Tap an item to add it.</p>
            </div>
          ) : (
            cart.map(({ item, qty }) => (
              <div key={item.id} className="p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-800/50 flex items-center gap-2">
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-zinc-900 dark:text-zinc-100 truncate">{item.name}</div>
                  <div className="text-[11px] text-emerald-600 dark:text-emerald-400 font-black mt-0.5">₹{((item as any).price * qty).toLocaleString()}</div>
                </div>
                <div className="flex items-center gap-1">
                  <button onClick={() => updateQty(item.id!, -1)} className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition">
                    <Minus className="w-3 h-3" />
                  </button>
                  <span className="w-5 text-center text-xs font-black text-zinc-900 dark:text-zinc-100">{qty}</span>
                  <button onClick={() => updateQty(item.id!, 1)} className="w-6 h-6 rounded-lg bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center text-zinc-700 dark:text-zinc-300 hover:bg-zinc-300 dark:hover:bg-zinc-600 transition">
                    <Plus className="w-3 h-3" />
                  </button>
                  <button onClick={() => removeFromCart(item.id!)} className="w-6 h-6 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-950 transition flex items-center justify-center ml-1">
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Checkout Panel */}
        <div className="border-t border-zinc-200 dark:border-zinc-800 p-4 space-y-3">
          {/* Payment Mode */}
          <div>
            <div className="text-xs font-bold text-zinc-500 dark:text-zinc-400 mb-2">Payment Mode</div>
            <div className="grid grid-cols-3 gap-1.5">
              {PAYMENT_MODES.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setPaymentMode(id as any)}
                  className={`py-2 rounded-xl text-xs font-black flex flex-col items-center gap-1 border-2 transition ${paymentMode === id ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' : 'border-zinc-200 dark:border-zinc-700 text-zinc-500 hover:border-emerald-300'}`}>
                  <Icon className="w-4 h-4" /> {label}
                </button>
              ))}
            </div>
          </div>

          {/* Total */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800">
            <span className="text-sm font-bold text-zinc-700 dark:text-zinc-300">Total</span>
            <span className="text-xl font-black text-zinc-900 dark:text-zinc-50">₹{cartTotal.toLocaleString()}</span>
          </div>

          {/* Checkout Button */}
          <button onClick={handleCheckout} disabled={cart.length === 0 || isProcessing}
            className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm transition disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20">
            {isProcessing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            {isProcessing ? 'Processing…' : 'Process Payment'}
          </button>
        </div>
      </div>

      {/* Receipt Modal */}
      {lastReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm bg-white dark:bg-zinc-900 rounded-3xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden">
            <div className="p-5 bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-center">
              <CheckCircle2 className="w-10 h-10 mx-auto mb-2" />
              <h2 className="font-black text-lg">Payment Successful!</h2>
              <p className="text-sm opacity-80 mt-1">{lastReceipt.time}</p>
            </div>
            <div className="p-5 space-y-3">
              <div className="space-y-2">
                {lastReceipt.items.map(({ item, qty }) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-zinc-600 dark:text-zinc-400">{item.name} × {qty}</span>
                    <span className="font-bold text-zinc-900 dark:text-zinc-100">₹{((item as any).price * qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              <div className="border-t border-zinc-200 dark:border-zinc-800 pt-3 flex justify-between">
                <span className="font-black text-zinc-900 dark:text-zinc-100">Total Paid</span>
                <span className="font-black text-emerald-600 text-xl">₹{lastReceipt.total.toLocaleString()}</span>
              </div>
              <div className="text-xs text-center text-zinc-400">Mode: <span className="font-bold">{lastReceipt.mode}</span></div>
              <button onClick={() => setLastReceipt(null)} className="w-full py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 transition">
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
