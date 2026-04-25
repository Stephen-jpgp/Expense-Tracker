import * as XLSX from 'xlsx';

export const exportToXlsx = (expenses, monthLabel = 'All') => {
  if (!expenses || expenses.length === 0) {
    alert('No expenses to export.');
    return;
  }

  const rows = expenses.map((e) => ({
    Date: new Date(e.date).toLocaleDateString(),
    Amount: e.amount,
    Category: e.category,
    Note: e.note || '',
  }));

  // Summary row
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);
  rows.push({});
  rows.push({ Date: 'TOTAL', Amount: total, Category: '', Note: '' });

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Expenses');

  // Column widths
  ws['!cols'] = [{ wch: 14 }, { wch: 12 }, { wch: 14 }, { wch: 30 }];

  XLSX.writeFile(wb, `expenses-${monthLabel}.xlsx`);
};
