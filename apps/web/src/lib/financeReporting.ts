import { FinanceRecord, MOCK_FINANCE_RECORDS, MOCK_COSTS } from './financeDemoData';

export function calculateFinanceMetrics(records: FinanceRecord[] = MOCK_FINANCE_RECORDS) {
  let totalRevenue = 0;
  let totalCollected = 0;
  let totalDebt = 0;
  let currentMonthRevenue = 0;
  let currentMonthCollected = 0;

  let overdueCount = 0;
  let expiringSessionsCount = 0;
  let approvalRequiredCount = 0;

  let debtCurrent = 0;
  let debt1to7Days = 0;
  let debt8to14Days = 0;
  let debt15PlusDays = 0;

  // Giả lập tháng hiện tại là '2026-06'
  const CURRENT_MONTH = '2026-06';

  records.forEach(r => {
    totalRevenue += r.tuitionAmount;
    totalCollected += r.paidAmount;
    totalDebt += r.debtAmount;

    if (r.revenueMonth === CURRENT_MONTH) {
      currentMonthRevenue += r.tuitionAmount;
      currentMonthCollected += r.paidAmount;
    }

    if (r.debtAmount > 0) {
      if (r.overdueDays === 0) {
        debtCurrent += r.debtAmount;
      } else if (r.overdueDays >= 1 && r.overdueDays <= 7) {
        debt1to7Days += r.debtAmount;
        overdueCount++;
      } else if (r.overdueDays >= 8 && r.overdueDays <= 14) {
        debt8to14Days += r.debtAmount;
        overdueCount++;
      } else {
        debt15PlusDays += r.debtAmount;
        overdueCount++;
      }
    }

    if (r.remainingSessions <= 5 && r.remainingSessions > 0) {
      expiringSessionsCount++;
    }

    if (r.approvalRequired) {
      approvalRequiredCount++;
    }
  });

  const totalCost = MOCK_COSTS.reduce((acc, c) => acc + c.amount, 0);
  const estimatedProfit = currentMonthCollected - totalCost;

  // Tính hoa hồng theo nhân viên (tạm tính cho tháng hiện tại)
  const commissionsByStaff: Record<string, { wonStudents: number, collectedTuition: number, commissionAmount: number }> = {};
  
  records.forEach(r => {
    if (r.revenueMonth === CURRENT_MONTH || r.paidAmount > 0) {
      if (!commissionsByStaff[r.owner]) {
        commissionsByStaff[r.owner] = { wonStudents: 0, collectedTuition: 0, commissionAmount: 0 };
      }
      commissionsByStaff[r.owner].wonStudents += 1;
      commissionsByStaff[r.owner].collectedTuition += r.paidAmount;
      commissionsByStaff[r.owner].commissionAmount += r.commissionAmount;
    }
  });

  return {
    totalRevenue,
    totalCollected,
    totalDebt,
    currentMonthRevenue,
    currentMonthCollected,
    overdueCount,
    expiringSessionsCount,
    approvalRequiredCount,
    debtCurrent,
    debt1to7Days,
    debt8to14Days,
    debt15PlusDays,
    totalCost,
    estimatedProfit,
    commissionsByStaff
  };
}
