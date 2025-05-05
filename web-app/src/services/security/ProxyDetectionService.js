import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import IPBlockingService from '../IPBlockingService';

class ProxyDetectionService {
  static PROXY_TYPES = {
    VPN: 'vpn',
    TOR: 'tor',
    DATACENTER: 'datacenter',
    PUBLIC_PROXY: 'public_proxy',
    WEB_PROXY: 'web_proxy',
    ANONYMOUS: 'anonymous'
  };

  static async detectProxy(ip) {
    try {
      // Check multiple proxy detection services for accuracy
      const [ipQualityScore, proxyCheck, ipApi] = await Promise.all([
        this.checkIPQualityScore(ip),
        this.checkProxyCheck(ip),
        this.checkIPAPI(ip)
      ]);

      const result = {
        isProxy: ipQualityScore.isProxy || proxyCheck.isProxy || ipApi.isProxy,
        proxyType: this.determineProxyType(ipQualityScore, proxyCheck, ipApi),
        riskScore: this.calculateRiskScore(ipQualityScore, proxyCheck, ipApi),
        details: {
          ip,
          location: ipApi.location,
          isp: ipApi.isp,
          asn: ipApi.asn,
          organization: ipApi.organization,
          detectionSources: {
            ipQualityScore,
            proxyCheck,
            ipApi
          }
        }
      };

      // Log detection result
      await this.logProxyDetection(ip, result);

      // Auto-block high-risk proxies
      if (result.riskScore > 0.8) {
        await IPBlockingService.blockIP(
          ip,
          'high_risk_proxy',
          IPBlockingService.BLOCK_DURATIONS.MEDIUM,
          result
        );
      }

      return result;
    } catch (error) {
      console.error('Error detecting proxy:', error);
      throw error;
    }
  }

  static async checkIPQualityScore(ip) {
    try {
      const response = await fetch(
        `https://ipqualityscore.com/api/json/ip/${process.env.IPQS_API_KEY}/${ip}?strictness=1&allow_public_access_points=true`
      );
      const data = await response.json();

      return {
        isProxy: data.proxy,
        isVPN: data.vpn,
        isTor: data.tor,
        isCrawler: data.is_crawler,
        fraudScore: data.fraud_score,
        connectionType: data.connection_type,
        abuseVelocity: data.abuse_velocity,
        source: 'ipqualityscore'
      };
    } catch (error) {
      console.error('Error checking IPQualityScore:', error);
      return {
        isProxy: false,
        error: true,
        source: 'ipqualityscore'
      };
    }
  }

  static async checkProxyCheck(ip) {
    try {
      const response = await fetch(
        `https://proxycheck.io/v2/${ip}?key=${process.env.PROXYCHECK_API_KEY}&vpn=1&risk=1`
      );
      const data = await response.json();

      return {
        isProxy: data[ip]?.proxy === 'yes',
        proxyType: data[ip]?.type,
        provider: data[ip]?.provider,
        risk: data[ip]?.risk,
        source: 'proxycheck'
      };
    } catch (error) {
      console.error('Error checking ProxyCheck:', error);
      return {
        isProxy: false,
        error: true,
        source: 'proxycheck'
      };
    }
  }

  static async checkIPAPI(ip) {
    try {
      const response = await fetch(
        `http://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,zip,lat,lon,timezone,isp,org,as,proxy,hosting`
      );
      const data = await response.json();

      return {
        isProxy: data.proxy || data.hosting,
        location: {
          country: data.country,
          region: data.regionName,
          city: data.city,
          coordinates: {
            lat: data.lat,
            lon: data.lon
          }
        },
        isp: data.isp,
        asn: data.as,
        organization: data.org,
        source: 'ip-api'
      };
    } catch (error) {
      console.error('Error checking IP-API:', error);
      return {
        isProxy: false,
        error: true,
        source: 'ip-api'
      };
    }
  }

  static determineProxyType(ipQualityScore, proxyCheck, ipApi) {
    if (ipQualityScore.isTor) return this.PROXY_TYPES.TOR;
    if (ipQualityScore.isVPN) return this.PROXY_TYPES.VPN;
    if (proxyCheck.proxyType) return proxyCheck.proxyType.toLowerCase();
    if (ipApi.isProxy && !ipApi.hosting) return this.PROXY_TYPES.PUBLIC_PROXY;
    if (ipApi.hosting) return this.PROXY_TYPES.DATACENTER;
    return this.PROXY_TYPES.ANONYMOUS;
  }

  static calculateRiskScore(ipQualityScore, proxyCheck, ipApi) {
    let score = 0;
    let sources = 0;

    if (!ipQualityScore.error) {
      score += ipQualityScore.fraudScore / 100;
      sources++;
    }

    if (!proxyCheck.error) {
      score += proxyCheck.risk / 100;
      sources++;
    }

    if (!ipApi.error) {
      score += ipApi.isProxy ? 0.7 : 0;
      sources++;
    }

    return sources > 0 ? score / sources : 0;
  }

  static async logProxyDetection(ip, result) {
    try {
      await setDoc(doc(db, 'proxyDetections', `${ip}_${Date.now()}`), {
        ip,
        timestamp: Timestamp.now(),
        result,
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error logging proxy detection:', error);
    }
  }

  static async getProxyHistory(ip) {
    try {
      const detections = [];
      const querySnapshot = await getDocs(
        query(
          collection(db, 'proxyDetections'),
          where('ip', '==', ip),
          orderBy('timestamp', 'desc'),
          limit(10)
        )
      );

      querySnapshot.forEach(doc => {
        detections.push({
          id: doc.id,
          ...doc.data()
        });
      });

      return detections;
    } catch (error) {
      console.error('Error getting proxy history:', error);
      throw error;
    }
  }
}

export default ProxyDetectionService;
