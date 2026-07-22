import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  Wallet, DollarSign, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck,
  CheckCircle2, Plus, AlertCircle, FileText, LayoutDashboard, Package,
  ShoppingCart, BarChart3, Store, Star
} from "lucide-react";
import Button from "../components/ui/Button";
import StatCard from "../components/ui/StatCard";
import Modal from "../components/ui/Modal";
import Badge from "../components/ui/Badge";
import toast from "react-hot-toast";

const VENDOR_TABS = [
  { label: "Vendor Overview", icon: LayoutDashboard, to: "/vendor/dashboard" },
  { label: "My Products", icon: Package, to: "/vendor/products" },
  { label: "My Orders", icon: ShoppingCart, to: "/vendor/orders" },
  { label: "Sales Analytics", icon: BarChart3, to: "/vendor/analytics" },
  { label: "Wallet & Payouts", icon: Wallet, to: "/vendor/wallet" },
  { label: "Store Profile", icon: Store, to: "/vendor/profile" },
  { label: "Customer Reviews", icon: Star, to: "/vendor/reviews" },
];

const INITIAL_TRANSACTIONS = [
  { id: "TXN-98401", date: "Jul 22, 2026", type: "Order Credit", amount: 299.99, status: "Success", desc: "Order #104 Payout" },
  { id: "TXN-98382", date: "Jul 20, 2026", type: "Withdrawal", amount: -1500.00, status: "Success", desc: "Transfer to HDFC Bank (**** 4892)" },
  { id: "TXN-98310", date: "Jul 18, 2026", type: "Order Credit", amount: 450.00, status: "Success", desc: "Order #98 Payout" },
  { id: "TXN-98290", date: "Jul 15, 2026", type: "Order Credit", amount: 199.50, status: "Pending", desc: "Order #95 Escrow" },
];

export default function VendorWalletPage() {
  const [balance, setBalance] = useState(4850.00);
  const [pending, setPending] = useState(1240.00);
  const [totalWithdrawn, setTotalWithdrawn] = useState(12500.00);
  const [transactions, setTransactions] = useState(INITIAL_TRANSACTIONS);

  const [withdrawOpen, setWithdrawOpen] = useState(false);
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [bankAccount, setBankAccount] = useState("HDFC Bank - **** 4892");

  const handleWithdrawSubmit = (e) => {
    e.preventDefault();
    const amt = parseFloat(withdrawAmount);
    if (!amt || amt <= 0 || amt > balance) {
      toast.error("Please enter a valid amount within your available balance");
      return;
    }

    const newTxn = {
      id: `TXN-${Math.floor(10000 + Math.random() * 90000)}`,
      date: new Date().toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
      type: "Withdrawal",
      amount: -amt,
      status: "Pending",
      desc: `Transfer to ${bankAccount}`,
    };

    setBalance((prev) => prev - amt);
    setTotalWithdrawn((prev) => prev + amt);
    setTransactions((prev) => [newTxn, ...prev]);
    setWithdrawOpen(false);
    setWithdrawAmount("");
    toast.success(`Withdrawal request for $${amt.toFixed(2)} submitted!`);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 pb-12 font-sans">
      
      {/* Horizontal Subnav */}
      <div className="bg-white border-b border-slate-200/80 px-8 py-3 shadow-sm mb-6">
        <div className="max-w-7xl mx-auto flex items-center gap-2 overflow-x-auto">
          {VENDOR_TABS.map((tab) => {
            const Icon = tab.icon;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={({ isActive }) =>
                  `flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-blue-600 text-white shadow-sm"
                      : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                  }`
                }
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </NavLink>
            );
          })}
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6 px-8">
        
        {/* Title & Action */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Merchant Wallet & Payouts</h1>
            <p className="text-slate-500 text-xs mt-1">Manage store earnings, escrow balances, and bank withdrawal requests.</p>
          </div>

          <Button
            variant="amber"
            size="md"
            onClick={() => setWithdrawOpen(true)}
            icon={ArrowUpRight}
            className="text-xs font-black"
          >
            Request Payout Withdrawal
          </Button>
        </div>

        {/* Wallet Overview Stat Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Available Balance"
            value={`$${balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon={Wallet}
            color="amber"
            trend="up"
            trendValue={12.5}
          />
          <StatCard
            title="Pending Earnings (Escrow)"
            value={`$${pending.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon={Clock}
            color="blue"
            trend="up"
            trendValue={5.2}
          />
          <StatCard
            title="Total Withdrawn"
            value={`$${totalWithdrawn.toLocaleString(undefined, { minimumFractionDigits: 2 })}`}
            icon={DollarSign}
            color="green"
            trend="up"
            trendValue={8.4}
          />
          <StatCard
            title="Payout Protection"
            value="100% Certified"
            icon={ShieldCheck}
            color="purple"
            trend="up"
            trendValue={0}
          />
        </div>

        {/* Transaction History Table */}
        <div className="bg-white border border-slate-200/80 rounded-[24px] shadow-sm overflow-hidden p-6 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-4">
            <h3 className="text-base font-extrabold text-slate-900">Wallet Transactions & Payout Logs</h3>
            <span className="text-xs font-bold text-slate-500">{transactions.length} Total Activity Logs</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="p-3.5 font-bold text-slate-500 uppercase">Transaction ID</th>
                  <th className="p-3.5 font-bold text-slate-500 uppercase">Date</th>
                  <th className="p-3.5 font-bold text-slate-500 uppercase">Type & Description</th>
                  <th className="p-3.5 font-bold text-slate-500 uppercase text-right">Amount</th>
                  <th className="p-3.5 font-bold text-slate-500 uppercase text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-semibold">
                {transactions.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="p-3.5 font-mono text-blue-600 font-bold">{t.id}</td>
                    <td className="p-3.5 text-slate-500">{t.date}</td>
                    <td className="p-3.5 text-slate-900">
                      <span className="block font-bold">{t.type}</span>
                      <span className="text-[11px] text-slate-400 font-normal">{t.desc}</span>
                    </td>
                    <td className={`p-3.5 text-right font-black ${t.amount >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {t.amount >= 0 ? `+$${t.amount.toFixed(2)}` : `-$${Math.abs(t.amount).toFixed(2)}`}
                    </td>
                    <td className="p-3.5 text-center">
                      <Badge status={t.status.toLowerCase()}>{t.status}</Badge>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>

      {/* Payout Withdrawal Modal */}
      <Modal open={withdrawOpen} onClose={() => setWithdrawOpen(false)} title="Request Payout Withdrawal" size="md">
        <form onSubmit={handleWithdrawSubmit} className="space-y-4 font-sans text-xs">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 font-semibold">
            Available Balance for Withdrawal: <strong className="text-slate-950 font-black">${balance.toFixed(2)}</strong>
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Withdrawal Amount ($) *</label>
            <input
              type="number"
              step="0.01"
              max={balance}
              value={withdrawAmount}
              onChange={(e) => setWithdrawAmount(e.target.value)}
              placeholder="e.g. 500.00"
              className="input-field"
              required
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 uppercase tracking-wider mb-1">Destination Bank Account</label>
            <select value={bankAccount} onChange={(e) => setBankAccount(e.target.value)} className="input-field">
              <option value="HDFC Bank - **** 4892">HDFC Bank (Primary Account - **** 4892)</option>
              <option value="ICICI Bank - **** 9102">ICICI Bank (Secondary - **** 9102)</option>
            </select>
          </div>

          <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
            <Button variant="secondary" size="sm" onClick={() => setWithdrawOpen(false)}>Cancel</Button>
            <Button type="submit" variant="amber" size="sm" className="font-black">Submit Request</Button>
          </div>
        </form>
      </Modal>

    </div>
  );
}
