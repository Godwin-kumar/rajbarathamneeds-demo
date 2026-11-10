import React, { useState } from 'react';
import { BarChart3, Download, FileSpreadsheet, Calendar, CheckCircle } from 'lucide-react';

export default function ReportsPage() {
  const [downloading, setDownloading] = useState(null);

  const reports = [
    {
      id: 'sales',
      title: 'Sales & Orders Ledger',
      description: 'Complete breakdown of all store orders, customer names, payment status, and order totals.',
      filename: 'rajbaratham_sales_report.csv',
      endpoint: '/api/erp/reports/sales/?format=csv',
    },
    {
      id: 'inventory',
      title: 'Inventory & Stock Valuation',
      description: 'Live warehouse SKU counts, current stock levels, low-stock warnings, and unit valuations.',
      filename: 'rajbaratham_inventory_report.csv',
      endpoint: '/api/erp/reports/inventory/?format=csv',
    },
    {
      id: 'customers',
      title: 'Customer Lifetime Value Report',
      description: 'Customer contact directory, purchase frequency, order count, and gross lifetime revenue.',
      filename: 'rajbaratham_customers_report.csv',
      endpoint: '/api/erp/reports/customers/?format=csv',
    },
    {
      id: 'finance',
      title: 'P&L and Expense Audit',
      description: 'Workshop crafting expenses, shipping fees, operational overheads, and net profitability balance.',
      filename: 'rajbaratham_finance_report.csv',
      endpoint: '/api/erp/reports/finance/?format=csv',
    },
  ];

  const handleDownload = (rep) => {
    setDownloading(rep.id);
    // Directly trigger authenticated browser download from the API
    window.location.href = rep.endpoint;
    setTimeout(() => {
      setDownloading(null);
    }, 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-serif font-bold text-[#541D2C]">Reports & Business Intelligence</h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-0.5">
          Export verified PostgreSQL transactional records into CSV spreadsheets for accounting and audit compliance.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {reports.map((rep) => (
          <div
            key={rep.id}
            className="bg-white p-6 rounded-2xl border border-[#E9E2DC] shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
          >
            <div>
              <div className="w-10 h-10 rounded-xl bg-[#70283A]/10 text-[#70283A] flex items-center justify-center mb-4">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#292323]">{rep.title}</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                {rep.description}
              </p>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E9E2DC] flex items-center justify-between">
              <span className="text-[11px] font-mono text-gray-400">CSV Spreadsheet</span>
              <button
                onClick={() => handleDownload(rep)}
                disabled={downloading === rep.id}
                className="flex items-center gap-1.5 px-4 py-2 bg-[#70283A] hover:bg-[#541D2C] text-white rounded-xl text-xs font-semibold shadow-sm transition-all disabled:opacity-60"
              >
                <Download className="w-3.5 h-3.5" />
                <span>{downloading === rep.id ? 'Generating...' : 'Export CSV'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
