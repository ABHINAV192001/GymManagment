import { Staff } from '../types';

export interface PayslipCalculation {
  base: number;
  sessions?: number;
  rate?: number;
  commissionVal: number;
  gross: number;
  pfDeduction: number;
  ptTax: number;
  leaveDeduction?: number;
  customDeduction?: number;
  netPay: number;
  payPeriod: string;
  paymentMode: string;
  referenceNo: string;
  paidDate: string;
}

/**
 * Converts a number to words (Indian Currency standard format)
 */
function numberToWords(amount: number): string {
  const num = Math.floor(amount);
  if (num === 0) return 'Zero Rupees Only';

  const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
                'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  function convertLessThanThousand(n: number): string {
    if (n === 0) return '';
    if (n < 20) return units[n] + ' ';
    if (n < 100) return tens[Math.floor(n / 10)] + ' ' + (n % 10 !== 0 ? units[n % 10] + ' ' : '');
    return units[Math.floor(n / 100)] + ' Hundred ' + (n % 100 !== 0 ? convertLessThanThousand(n % 100) : '');
  }

  let result = '';
  let temp = num;

  if (Math.floor(temp / 10000000) > 0) {
    result += convertLessThanThousand(Math.floor(temp / 10000000)) + 'Crore ';
    temp %= 10000000;
  }

  if (Math.floor(temp / 100000) > 0) {
    result += convertLessThanThousand(Math.floor(temp / 100000)) + 'Lakh ';
    temp %= 100000;
  }

  if (Math.floor(temp / 1000) > 0) {
    result += convertLessThanThousand(Math.floor(temp / 1000)) + 'Thousand ';
    temp %= 1000;
  }

  if (temp > 0) {
    result += convertLessThanThousand(temp);
  }

  return result.trim() + ' Rupees Only';
}

/**
 * Generates a clean, professional, print-ready PDF payslip window.
 */
export function downloadPayslipPdf(staff: Staff, calc: PayslipCalculation, orgName: string = 'GymOS Fitness Club') {
  const netInWords = numberToWords(calc.netPay);
  const printWindow = window.open('', '_blank');
  if (!printWindow) return;

  const totalDeductions = (calc.pfDeduction || 0) + (calc.ptTax || 0) + (calc.leaveDeduction || 0) + (calc.customDeduction || 0);

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>Payslip - ${staff.name} - ${calc.payPeriod}</title>
        <style>
          @page { size: A4; margin: 15mm; }
          body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            color: #1e293b;
            background: #fff;
            margin: 0;
            padding: 20px;
            font-size: 13px;
          }
          .container {
            max-width: 800px;
            margin: 0 auto;
            border: 1px solid #cbd5e1;
            padding: 30px;
            border-radius: 8px;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 2px solid #2563eb;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .org-title {
            font-size: 22px;
            font-weight: 800;
            color: #1e3a8a;
            margin: 0;
          }
          .sub-title {
            font-size: 12px;
            color: #64748b;
            margin-top: 4px;
          }
          .badge {
            background: #eff6ff;
            color: #1d4ed8;
            padding: 6px 12px;
            border-radius: 6px;
            font-weight: 700;
            font-size: 14px;
            border: 1px solid #bfdbfe;
          }
          .section-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 25px;
            background: #f8fafc;
            padding: 15px;
            border-radius: 6px;
            border: 1px solid #f1f5f9;
          }
          .field-label {
            font-size: 11px;
            text-transform: uppercase;
            color: #64748b;
            font-weight: 600;
          }
          .field-val {
            font-weight: 700;
            color: #0f172a;
            margin-top: 2px;
          }
          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 20px;
          }
          th, td {
            padding: 10px 12px;
            text-align: left;
            border-bottom: 1px solid #e2e8f0;
          }
          th {
            background: #f1f5f9;
            color: #334155;
            font-weight: 700;
            font-size: 12px;
            text-transform: uppercase;
          }
          .text-right { text-align: right; }
          .total-row {
            font-weight: 800;
            background: #f8fafc;
            font-size: 14px;
          }
          .net-pay-box {
            background: #ecfdf5;
            border: 1.5px solid #a7f3d0;
            padding: 15px;
            border-radius: 8px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 25px;
          }
          .net-pay-title { font-size: 13px; font-weight: 700; color: #065f46; }
          .net-pay-amount { font-size: 22px; font-weight: 900; color: #047857; }
          .footer-sign {
            display: flex;
            justify-content: space-between;
            margin-top: 40px;
            padding-top: 20px;
            border-top: 1px dashed #cbd5e1;
          }
          .sign-box {
            text-align: center;
            width: 200px;
          }
          .sign-line {
            border-bottom: 1px solid #94a3b8;
            margin-bottom: 8px;
            height: 40px;
          }
          @media print {
            body { padding: 0; }
            .container { border: none; padding: 0; }
            .no-print { display: none; }
          }
        </style>
      </head>
      <body>
        <div class="no-print" style="text-align: right; margin-bottom: 15px;">
          <button onclick="window.print()" style="background: #2563eb; color: white; border: none; padding: 10px 20px; font-weight: bold; border-radius: 6px; cursor: pointer;">
            🖨️ Print / Download PDF Payslip
          </button>
        </div>

        <div class="container">
          <div class="header">
            <div>
              <h1 class="org-title">${orgName}</h1>
              <div class="sub-title">Official Staff Salary Disbursement Payslip</div>
            </div>
            <div class="badge">
              PAYSLIP: ${calc.payPeriod}
            </div>
          </div>

          <div class="section-grid">
            <div>
              <div class="field-label">Employee Name</div>
              <div class="field-val">${staff.name}</div>
            </div>
            <div>
              <div class="field-label">Employee Code / ID</div>
              <div class="field-val">${staff.code || staff.id.slice(0, 8).toUpperCase()}</div>
            </div>
            <div>
              <div class="field-label">Designation / Role</div>
              <div class="field-val">${(staff.role || 'STAFF').replace('_', ' ')}</div>
            </div>
            <div>
              <div class="field-label">Salary Model</div>
              <div class="field-val">${staff.salaryType || 'FIXED'}</div>
            </div>
            <div>
              <div class="field-label">Payment Date</div>
              <div class="field-val">${calc.paidDate}</div>
            </div>
            <div>
              <div class="field-label">Payment Mode & Ref</div>
              <div class="field-val">${calc.paymentMode} (${calc.referenceNo})</div>
            </div>
          </div>

          <table>
            <thead>
              <tr>
                <th>Earnings Component</th>
                <th class="text-right">Amount (₹)</th>
                <th>Deduction Component</th>
                <th class="text-right">Amount (₹)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Basic Salary</td>
                <td class="text-right">₹${calc.base.toLocaleString()}</td>
                <td>Provident Fund (PF - 12%)</td>
                <td class="text-right">₹${calc.pfDeduction.toLocaleString()}</td>
              </tr>
              ${
                calc.commissionVal > 0
                  ? `
                <tr>
                  <td>PT Commission Cut (${calc.rate || 30}% share)</td>
                  <td class="text-right">₹${calc.commissionVal.toLocaleString()}</td>
                  <td>Professional Tax (PT)</td>
                  <td class="text-right">₹${calc.ptTax.toLocaleString()}</td>
                </tr>
              `
                  : `
                <tr>
                  <td>Special Allowances / Bonus</td>
                  <td class="text-right">₹0</td>
                  <td>Professional Tax (PT)</td>
                  <td class="text-right">₹${calc.ptTax.toLocaleString()}</td>
                </tr>
              `
              }
              ${
                (calc.leaveDeduction || 0) > 0
                  ? `
                <tr>
                  <td>—</td>
                  <td class="text-right">—</td>
                  <td>Unexcused Leave Cut</td>
                  <td class="text-right">₹${calc.leaveDeduction.toLocaleString()}</td>
                </tr>
              ` : ''
              }
              ${
                (calc.customDeduction || 0) > 0
                  ? `
                <tr>
                  <td>—</td>
                  <td class="text-right">—</td>
                  <td>Boss / Admin Custom Penalty Cut</td>
                  <td class="text-right">₹${calc.customDeduction.toLocaleString()}</td>
                </tr>
              ` : ''
              }
              <tr class="total-row">
                <td>Total Gross Earnings</td>
                <td class="text-right">₹${calc.gross.toLocaleString()}</td>
                <td>Total Deductions</td>
                <td class="text-right">₹${totalDeductions.toLocaleString()}</td>
              </tr>
            </tbody>
          </table>

          <div class="net-pay-box">
            <div>
              <div class="net-pay-title">NET PAYABLE AMOUNT</div>
              <div style="font-size: 11px; color: #047857; margin-top: 2px;">In words: ${netInWords}</div>
            </div>
            <div class="net-pay-amount">₹${calc.netPay.toLocaleString()}</div>
          </div>

          <div class="footer-sign">
            <div class="sign-box">
              <div class="sign-line"></div>
              <div style="font-size: 11px; font-weight: 600; color: #64748b;">Employee Signature</div>
            </div>
            <div class="sign-box">
              <div class="sign-line"></div>
              <div style="font-size: 11px; font-weight: 600; color: #64748b;">Authorized Signatory / Finance</div>
            </div>
          </div>
        </div>

        <script>
          // Auto trigger print dialog on page load
          window.onload = function() {
            setTimeout(function() {
              window.print();
            }, 500);
          }
        </script>
      </body>
    </html>
  `;

  printWindow.document.write(htmlContent);
  printWindow.document.close();
}
