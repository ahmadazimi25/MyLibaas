import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, collection, query, where, orderBy, limit, Timestamp } from 'firebase/firestore';
import { ethers } from 'ethers';
import NotificationService from '../NotificationService';

class BlockchainAuditService {
  static AUDIT_TYPES = {
    SECURITY: 'security_event',
    ACCESS: 'access_control',
    DATA: 'data_modification',
    CONFIG: 'configuration_change',
    USER: 'user_action'
  };

  static provider = null;
  static contract = null;
  static signer = null;

  static async initialize() {
    try {
      // Initialize Ethereum provider
      this.provider = new ethers.providers.JsonRpcProvider(
        process.env.ETHEREUM_RPC_URL
      );

      // Load wallet from private key
      this.signer = new ethers.Wallet(
        process.env.ETHEREUM_PRIVATE_KEY,
        this.provider
      );

      // Load smart contract
      this.contract = new ethers.Contract(
        process.env.AUDIT_CONTRACT_ADDRESS,
        this.getAuditContractABI(),
        this.signer
      );

      return {
        success: true,
        message: 'Blockchain audit service initialized'
      };
    } catch (error) {
      console.error('Error initializing blockchain service:', error);
      throw error;
    }
  }

  static async recordAudit(type, data) {
    try {
      // Create audit record
      const auditRecord = {
        type,
        data,
        timestamp: Date.now(),
        hash: this.calculateAuditHash(type, data)
      };

      // Store in blockchain
      const transaction = await this.contract.recordAudit(
        auditRecord.type,
        auditRecord.hash,
        auditRecord.timestamp
      );

      // Wait for confirmation
      const receipt = await transaction.wait();

      // Store full record in database
      await this.storeAuditRecord(auditRecord, receipt.transactionHash);

      return {
        success: true,
        auditId: receipt.transactionHash,
        record: auditRecord
      };
    } catch (error) {
      console.error('Error recording audit:', error);
      throw error;
    }
  }

  static async verifyAudit(auditId) {
    try {
      // Get record from database
      const record = await this.getAuditRecord(auditId);
      if (!record) throw new Error('Audit record not found');

      // Get blockchain record
      const blockchainRecord = await this.contract.getAudit(auditId);

      // Verify hash
      const calculatedHash = this.calculateAuditHash(
        record.type,
        record.data
      );

      const isValid = 
        calculatedHash === record.hash &&
        record.hash === blockchainRecord.hash &&
        record.timestamp.toString() === blockchainRecord.timestamp.toString();

      return {
        isValid,
        record,
        blockchainRecord,
        verification: {
          hashMatch: calculatedHash === record.hash,
          blockchainMatch: record.hash === blockchainRecord.hash,
          timestampMatch: record.timestamp.toString() === blockchainRecord.timestamp.toString()
        }
      };
    } catch (error) {
      console.error('Error verifying audit:', error);
      throw error;
    }
  }

  static async getAuditHistory(filters = {}) {
    try {
      // Query database
      const queryConstraints = [];
      
      if (filters.type) {
        queryConstraints.push(where('type', '==', filters.type));
      }
      if (filters.startTime) {
        queryConstraints.push(where('timestamp', '>=', filters.startTime));
      }
      if (filters.endTime) {
        queryConstraints.push(where('timestamp', '<=', filters.endTime));
      }

      const snapshot = await getDocs(
        query(
          collection(db, 'auditRecords'),
          ...queryConstraints,
          orderBy('timestamp', 'desc'),
          limit(filters.limit || 100)
        )
      );

      const records = [];
      snapshot.forEach(doc => records.push(doc.data()));

      // Verify each record
      const verifiedRecords = await Promise.all(
        records.map(async record => ({
          ...record,
          verification: await this.verifyAudit(record.transactionHash)
        }))
      );

      return verifiedRecords;
    } catch (error) {
      console.error('Error getting audit history:', error);
      throw error;
    }
  }

  static async generateAuditReport(filters = {}) {
    try {
      const records = await this.getAuditHistory(filters);

      const report = {
        timeRange: {
          start: filters.startTime || Math.min(...records.map(r => r.timestamp)),
          end: filters.endTime || Math.max(...records.map(r => r.timestamp))
        },
        summary: this.summarizeAuditRecords(records),
        verification: {
          total: records.length,
          verified: records.filter(r => r.verification.isValid).length
        },
        records: records.map(record => ({
          type: record.type,
          timestamp: record.timestamp,
          transactionHash: record.transactionHash,
          isVerified: record.verification.isValid
        }))
      };

      // Store report
      await this.storeAuditReport(report);

      return report;
    } catch (error) {
      console.error('Error generating audit report:', error);
      throw error;
    }
  }

  // Smart Contract Methods
  static getAuditContractABI() {
    return [
      "function recordAudit(string type, string hash, uint256 timestamp) public",
      "function getAudit(string transactionHash) public view returns (string type, string hash, uint256 timestamp)",
      "event AuditRecorded(string type, string hash, uint256 timestamp, address recorder)"
    ];
  }

  // Utility Methods
  static calculateAuditHash(type, data) {
    const content = JSON.stringify({ type, data, timestamp: Date.now() });
    return ethers.utils.keccak256(ethers.utils.toUtf8Bytes(content));
  }

  static summarizeAuditRecords(records) {
    return {
      byType: this.groupRecordsByType(records),
      timeline: this.createAuditTimeline(records),
      stats: this.calculateAuditStats(records)
    };
  }

  static groupRecordsByType(records) {
    return records.reduce((groups, record) => {
      const type = record.type;
      groups[type] = groups[type] || [];
      groups[type].push(record);
      return groups;
    }, {});
  }

  static createAuditTimeline(records) {
    return records
      .sort((a, b) => a.timestamp - b.timestamp)
      .map(record => ({
        type: record.type,
        timestamp: record.timestamp,
        hash: record.hash
      }));
  }

  static calculateAuditStats(records) {
    return {
      totalRecords: records.length,
      recordsByType: Object.entries(this.groupRecordsByType(records)).reduce(
        (stats, [type, typeRecords]) => {
          stats[type] = typeRecords.length;
          return stats;
        },
        {}
      ),
      verificationRate: records.filter(r => r.verification.isValid).length / records.length
    };
  }

  // Database Methods
  static async storeAuditRecord(record, transactionHash) {
    await setDoc(doc(db, 'auditRecords', transactionHash), {
      ...record,
      transactionHash,
      createdAt: Timestamp.now()
    });
  }

  static async getAuditRecord(transactionHash) {
    const doc = await getDoc(doc(db, 'auditRecords', transactionHash));
    return doc.data();
  }

  static async storeAuditReport(report) {
    const reportId = `report_${Date.now()}`;
    await setDoc(doc(db, 'auditReports', reportId), {
      ...report,
      createdAt: Timestamp.now()
    });
    return reportId;
  }
}

export default BlockchainAuditService;
