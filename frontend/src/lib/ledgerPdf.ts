import { Payment } from '../types';

export function downloadLedgerPdf(payments: Payment[], summary: { income: number; expense: number; net: number }, orgName: string = 'GymOS Fitness Club') {
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const rows = payments.map((p) => {
    const isIncome = p.paymentType === 'MEMBERSHIP' || p.paymentType === 'PT_PACKAGE';
    return `
      <tr>
        <td>${p.paymentDate || 'N/A'}</td>
        <td style="font-family: monospace; font-weight: bold;">${p.referenceNo || p.id.slice(0, 8)}</td>
        <td><span style="font-weight: 700; font-size: 11px;">${p.paymentType}</span></td>
        <td>${p.paymentMode}</td>
        <td class="text-right" style="color: ${isIncome ? '#047857' : '#dc2626'}; font-weight: bold;">
          ${isIncome ? '+' : '-'} ₹${p.amount.toLocaleString()}
        </td>
      </tr>
    `;
  }).join('');

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>General Ledger & Financial Statement - ${orgName}</title>
        <style>
          @page { size: A4 portrait; margin: 15mm; }
          body { font-family: sans-serif; color: #0f172a; margin: 0; padding: 20px; font-size: 12px; }
          .container { max-width: 900px; margin: 0 auto; }
          .header { border-bottom: 2px solid #2563eb; padding-bottom: 10px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: flex-end; }
          .title { font-size: 20px; font-weight: 800; color: #1e3a8a; margin: 0; }
          .summary-cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 12px; margin-bottom: 20px; }
          .card { padding: 12px; border-radius: 6px; border: 1px solid #e2e8f0; background: #f8fafc; }
          .card-lbl { font-size: 10px; text-transform: uppercase; color: #64748b; font-weight: 700; }
          .card-val { font-size: 16px; font-weight: 800; margin-top: 4px; }
          table { width: 100%; border-collapse: collapse; margin-top: 15px; }
          th, td { padding: 8px 10px; border-bottom: 1px solid #e2e8f0; text-align: left; }
          th { background: #f1f5f9; font-weight: 700; font-size: 11px; text-transform: uppercase; }
          .text-right { text-align: right; }
          .no-print { text-align: right; margin-bottom: 15px; }
          .btn { background: #2563eb; color: white; border: none; padding: 8px 16px; font-weight: bold; border-radius: 6px; cursor: pointer; }
          @media print { .no-print { display: none; } }
        </style>
      </head>
      <body>
        <div class="no-print">
          <button class="btn" onclick="window.print()">🖨️ Print / Download Financial Statement PDF</button>
        </div>
        <div class="container">
          <div class="header">
            <div>
              <h1 class="title">${orgName}</h1>
              <div style="color: #64748b; font-size: 11px; margin-top: 2px;">Official General Accounting Ledger & Cashflow Report</div>
            </div>
            <div style="font-weight: 700; font-size: 11px; color: #64748b;">
              Generated: ${new Date().toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' })}
            </div>
          </div>

          <div class="summary-cards">
            <div class="card">
              <div class="card-lbl">Total Gross Revenue</div>
              <div class="card-val" style="color: #047857;">₹${summary.income.toLocaleString()}</div>
            </div>
            <div class="card">
              <div class="card-lbl">Total Expenditures</div>
              <div class="card-val" style="color: #dc2626;">₹${summary.expense.toLocaleString()}</div>
            </div>
            <div class="card">
              <div class="card-lbl">Net Cashflow Surplus</div>
              <div class="card-val" style="color: ${summary.net >= 0 ? '#047857' : '#dc2626'};">₹${summary.net.toLocaleString()}</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Reference ID</th>
                <th>Type / Account</th>
                <th>Mode</th>
                <th class="text-right">Amount (INR)</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>
        </div>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
