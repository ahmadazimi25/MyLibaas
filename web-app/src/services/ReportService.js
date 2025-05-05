import { db } from './firebase/firebaseConfig';
import { collection, query, where, getDocs, addDoc, Timestamp } from 'firebase/firestore';
import { storage } from './firebase/firebaseConfig';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import ExcelJS from 'exceljs';

class ReportService {
  static REPORT_TYPES = {
    DAILY: 'daily',
    WEEKLY: 'weekly',
    MONTHLY: 'monthly',
    CUSTOM: 'custom'
  };

  static async generateReport(type, options = {}) {
    const reportData = await this.gatherReportData(type);
    const report = await this.formatReport(reportData, type);
    const reportUrl = await this.saveReport(report, type);
    
    if (options.sendEmail) {
      await this.emailReport(reportUrl, type);
    }
    
    return reportUrl;
  }

  static async gatherReportData(type) {
    const endDate = new Date();
    let startDate = new Date();

    switch (type) {
      case this.REPORT_TYPES.DAILY:
        startDate.setDate(startDate.getDate() - 1);
        break;
      case this.REPORT_TYPES.WEEKLY:
        startDate.setDate(startDate.getDate() - 7);
        break;
      case this.REPORT_TYPES.MONTHLY:
        startDate.setMonth(startDate.getMonth() - 1);
        break;
      default:
        throw new Error('Invalid report type');
    }

    const data = {
      period: {
        start: startDate,
        end: endDate
      },
      metrics: await this.getMetrics(startDate, endDate),
      userActivity: await this.getUserActivity(startDate, endDate),
      financials: await this.getFinancials(startDate, endDate),
      listings: await this.getListingStats(startDate, endDate),
      disputes: await this.getDisputeStats(startDate, endDate)
    };

    return data;
  }

  static async getMetrics(startDate, endDate) {
    const usersRef = collection(db, 'users');
    const rentalsRef = collection(db, 'rentals');

    const [newUsers, activeUsers, completedRentals] = await Promise.all([
      // New users in period
      getDocs(query(usersRef, 
        where('createdAt', '>=', startDate),
        where('createdAt', '<=', endDate)
      )),
      // Active users in period
      getDocs(query(usersRef,
        where('lastActive', '>=', startDate)
      )),
      // Completed rentals in period
      getDocs(query(rentalsRef,
        where('status', '==', 'completed'),
        where('completedAt', '>=', startDate),
        where('completedAt', '<=', endDate)
      ))
    ]);

    return {
      newUsers: newUsers.size,
      activeUsers: activeUsers.size,
      completedRentals: completedRentals.size,
      averageRental: completedRentals.size > 0 
        ? completedRentals.docs.reduce((acc, doc) => acc + doc.data().amount, 0) / completedRentals.size 
        : 0
    };
  }

  static async getUserActivity(startDate, endDate) {
    // Implementation for user activity metrics
    const activityRef = collection(db, 'userActivity');
    const activities = await getDocs(query(activityRef,
      where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate)
    ));

    return activities.docs.reduce((acc, doc) => {
      const data = doc.data();
      const type = data.type;
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {});
  }

  static async getFinancials(startDate, endDate) {
    const transactionsRef = collection(db, 'transactions');
    const transactions = await getDocs(query(transactionsRef,
      where('timestamp', '>=', startDate),
      where('timestamp', '<=', endDate)
    ));

    return transactions.docs.reduce((acc, doc) => {
      const data = doc.data();
      acc.totalRevenue += data.amount;
      acc.totalCommission += data.commission;
      acc[data.type] = (acc[data.type] || 0) + data.amount;
      return acc;
    }, { totalRevenue: 0, totalCommission: 0 });
  }

  static async getListingStats(startDate, endDate) {
    const listingsRef = collection(db, 'listings');
    const listings = await getDocs(query(listingsRef,
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate)
    ));

    return {
      newListings: listings.size,
      byCategory: listings.docs.reduce((acc, doc) => {
        const category = doc.data().category;
        acc[category] = (acc[category] || 0) + 1;
        return acc;
      }, {})
    };
  }

  static async getDisputeStats(startDate, endDate) {
    const disputesRef = collection(db, 'disputes');
    const disputes = await getDocs(query(disputesRef,
      where('createdAt', '>=', startDate),
      where('createdAt', '<=', endDate)
    ));

    return {
      total: disputes.size,
      byStatus: disputes.docs.reduce((acc, doc) => {
        const status = doc.data().status;
        acc[status] = (acc[status] || 0) + 1;
        return acc;
      }, {}),
      averageResolutionTime: this.calculateAverageResolutionTime(disputes.docs)
    };
  }

  static async formatReport(data, type) {
    const workbook = new ExcelJS.Workbook();
    
    // Overview Sheet
    const overviewSheet = workbook.addWorksheet('Overview');
    overviewSheet.addRow(['Report Type', type.toUpperCase()]);
    overviewSheet.addRow(['Period', `${data.period.start.toLocaleDateString()} - ${data.period.end.toLocaleDateString()}`]);
    overviewSheet.addRow([]);
    
    // Key Metrics
    overviewSheet.addRow(['Key Metrics']);
    overviewSheet.addRow(['New Users', data.metrics.newUsers]);
    overviewSheet.addRow(['Active Users', data.metrics.activeUsers]);
    overviewSheet.addRow(['Completed Rentals', data.metrics.completedRentals]);
    overviewSheet.addRow(['Average Rental Value', `₹${data.metrics.averageRental.toFixed(2)}`]);
    
    // Financial Sheet
    const financialSheet = workbook.addWorksheet('Financials');
    financialSheet.addRow(['Metric', 'Amount']);
    financialSheet.addRow(['Total Revenue', `₹${data.financials.totalRevenue}`]);
    financialSheet.addRow(['Total Commission', `₹${data.financials.totalCommission}`]);
    
    // Listings Sheet
    const listingsSheet = workbook.addWorksheet('Listings');
    listingsSheet.addRow(['Category', 'Count']);
    Object.entries(data.listings.byCategory).forEach(([category, count]) => {
      listingsSheet.addRow([category, count]);
    });
    
    // Disputes Sheet
    const disputesSheet = workbook.addWorksheet('Disputes');
    disputesSheet.addRow(['Status', 'Count']);
    Object.entries(data.disputes.byStatus).forEach(([status, count]) => {
      disputesSheet.addRow([status, count]);
    });
    
    return workbook;
  }

  static async saveReport(workbook, type) {
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const fileName = `reports/${type}_report_${timestamp}.xlsx`;
    
    const storageRef = ref(storage, fileName);
    await uploadBytes(storageRef, blob);
    
    return await getDownloadURL(storageRef);
  }

  static calculateAverageResolutionTime(disputes) {
    const resolvedDisputes = disputes.filter(doc => doc.data().resolvedAt);
    if (resolvedDisputes.length === 0) return 0;
    
    const totalTime = resolvedDisputes.reduce((acc, doc) => {
      const data = doc.data();
      return acc + (data.resolvedAt.toMillis() - data.createdAt.toMillis());
    }, 0);
    
    return totalTime / resolvedDisputes.length / (1000 * 60 * 60); // Convert to hours
  }
}

export default ReportService;
