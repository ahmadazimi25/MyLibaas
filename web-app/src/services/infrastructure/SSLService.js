import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, collection, Timestamp } from 'firebase/firestore';
import { CacheService } from './CacheService';
import NotificationService from '../NotificationService';

class SSLService {
  static CERT_TYPES = {
    DV: 'domain_validation',
    OV: 'organization_validation',
    EV: 'extended_validation',
    WILDCARD: 'wildcard'
  };

  static async initialize() {
    try {
      await Promise.all([
        this.initializeSSLConfig(),
        this.initializeCertificateManager(),
        this.initializeKeyManager()
      ]);

      // Start certificate monitoring
      this.startCertificateMonitoring();

      return { success: true, message: 'SSL service initialized' };
    } catch (error) {
      console.error('Error initializing SSL service:', error);
      throw error;
    }
  }

  static async configureTLS(server) {
    try {
      const config = {
        minVersion: 'TLSv1.2',
        cipherSuites: [
          'TLS_AES_128_GCM_SHA256',
          'TLS_AES_256_GCM_SHA384',
          'TLS_CHACHA20_POLY1305_SHA256'
        ],
        preferServerCipherSuites: true,
        sessionTimeout: 3600,
        certificates: await this.getCertificates(server.domain)
      };

      await this.applyTLSConfig(server, config);
      return { success: true, config };
    } catch (error) {
      console.error('Error configuring TLS:', error);
      throw error;
    }
  }

  static async getCertificates(domain) {
    try {
      // Check cache first
      const cachedCerts = await CacheService.get(`certs_${domain}`);
      if (cachedCerts) return cachedCerts;

      // Get from database
      const certDoc = await getDoc(doc(db, 'certificates', domain));
      if (!certDoc.exists()) {
        throw new Error(`No certificates found for domain: ${domain}`);
      }

      const certs = certDoc.data();
      
      // Cache certificates
      await CacheService.set(`certs_${domain}`, certs, 3600);
      
      return certs;
    } catch (error) {
      console.error('Error getting certificates:', error);
      throw error;
    }
  }

  static async renewCertificate(domain, type = this.CERT_TYPES.DV) {
    try {
      // Check if renewal is needed
      const currentCert = await this.getCertificates(domain);
      if (!this.needsRenewal(currentCert)) {
        return { success: true, message: 'Certificate still valid' };
      }

      // Generate new certificate
      const newCert = await this.generateCertificate(domain, type);

      // Store new certificate
      await this.storeCertificate(domain, newCert);

      // Update cache
      await CacheService.invalidate(`certs_${domain}`);

      // Notify admins
      await NotificationService.notifyAdmins('CERT_RENEWED', {
        domain,
        type,
        expiryDate: newCert.expiryDate
      });

      return { success: true, certificate: newCert };
    } catch (error) {
      console.error('Error renewing certificate:', error);
      throw error;
    }
  }

  static needsRenewal(cert) {
    const expiryDate = new Date(cert.expiryDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);

    return expiryDate <= thirtyDaysFromNow;
  }

  static async generateCertificate(domain, type) {
    // This is a placeholder. In a real implementation,
    // this would interact with a Certificate Authority API
    return {
      domain,
      type,
      issuedDate: new Date(),
      expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
      certificate: '-----BEGIN CERTIFICATE-----\n...',
      privateKey: '-----BEGIN PRIVATE KEY-----\n...'
    };
  }

  static async storeCertificate(domain, cert) {
    try {
      await setDoc(doc(db, 'certificates', domain), {
        ...cert,
        updatedAt: Timestamp.now()
      });
    } catch (error) {
      console.error('Error storing certificate:', error);
      throw error;
    }
  }

  static async configureHSTS(server) {
    try {
      const hstsConfig = {
        maxAge: 31536000, // 1 year
        includeSubDomains: true,
        preload: true
      };

      await this.applyHSTSConfig(server, hstsConfig);
      return { success: true, config: hstsConfig };
    } catch (error) {
      console.error('Error configuring HSTS:', error);
      throw error;
    }
  }

  static startCertificateMonitoring() {
    // Check certificates daily
    setInterval(async () => {
      try {
        const domains = await this.getMonitoredDomains();
        for (const domain of domains) {
          const cert = await this.getCertificates(domain);
          if (this.needsRenewal(cert)) {
            await this.renewCertificate(domain, cert.type);
          }
        }
      } catch (error) {
        console.error('Error in certificate monitoring:', error);
      }
    }, 24 * 60 * 60 * 1000);
  }

  static async getMonitoredDomains() {
    try {
      const domainsDoc = await getDoc(doc(db, 'ssl_config', 'domains'));
      return domainsDoc.data()?.list || [];
    } catch (error) {
      console.error('Error getting monitored domains:', error);
      return [];
    }
  }

  static async getSSLStatus(domain) {
    try {
      const cert = await this.getCertificates(domain);
      const expiryDate = new Date(cert.expiryDate);
      const now = new Date();
      
      return {
        domain,
        status: now < expiryDate ? 'valid' : 'expired',
        daysUntilExpiry: Math.floor((expiryDate - now) / (1000 * 60 * 60 * 24)),
        type: cert.type,
        issuer: cert.issuer,
        issuedDate: cert.issuedDate,
        expiryDate: cert.expiryDate
      };
    } catch (error) {
      console.error('Error getting SSL status:', error);
      throw error;
    }
  }

  static async validateCertificate(cert) {
    // Implement certificate validation logic
    // This is a placeholder for actual validation
    return {
      valid: true,
      errors: [],
      warnings: []
    };
  }
}

export default SSLService;
