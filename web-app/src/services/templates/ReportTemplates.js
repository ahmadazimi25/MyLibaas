class ReportTemplates {
  static TEMPLATES = {
    EXECUTIVE_SUMMARY: {
      id: 'executive_summary',
      name: 'Executive Summary',
      sections: [
        {
          title: 'Key Performance Indicators',
          metrics: ['activeUsers', 'newUsers', 'totalRevenue', 'avgOrderValue']
        },
        {
          title: 'Growth Metrics',
          metrics: ['userGrowth', 'revenueGrowth', 'listingGrowth']
        },
        {
          title: 'Platform Health',
          metrics: ['disputeRate', 'resolutionTime', 'userSatisfaction']
        }
      ],
      style: {
        charts: ['line', 'bar'],
        colors: ['#4CAF50', '#2196F3', '#FFC107']
      }
    },

    FINANCIAL_REPORT: {
      id: 'financial_report',
      name: 'Financial Report',
      sections: [
        {
          title: 'Revenue Overview',
          metrics: ['grossRevenue', 'netRevenue', 'commission', 'refunds']
        },
        {
          title: 'Transaction Analysis',
          metrics: ['avgTransactionValue', 'transactionVolume', 'successRate']
        },
        {
          title: 'Payment Methods',
          metrics: ['methodDistribution', 'failureRate', 'processingFees']
        }
      ],
      style: {
        charts: ['pie', 'bar', 'line'],
        colors: ['#1976D2', '#388E3C', '#D32F2F']
      }
    },

    USER_ACTIVITY: {
      id: 'user_activity',
      name: 'User Activity Report',
      sections: [
        {
          title: 'Engagement Metrics',
          metrics: ['dailyActiveUsers', 'sessionDuration', 'interactionRate']
        },
        {
          title: 'User Behavior',
          metrics: ['searchPatterns', 'browsingHabits', 'bookmarkRate']
        },
        {
          title: 'Rental Patterns',
          metrics: ['popularCategories', 'peakTimes', 'repeatRentals']
        }
      ],
      style: {
        charts: ['heatmap', 'bar', 'scatter'],
        colors: ['#7B1FA2', '#00796B', '#FFA000']
      }
    },

    LISTING_PERFORMANCE: {
      id: 'listing_performance',
      name: 'Listing Performance',
      sections: [
        {
          title: 'Listing Metrics',
          metrics: ['activeListings', 'viewsPerListing', 'conversionRate']
        },
        {
          title: 'Category Analysis',
          metrics: ['popularCategories', 'priceRanges', 'seasonalTrends']
        },
        {
          title: 'Quality Metrics',
          metrics: ['completenessScore', 'photoQuality', 'responseTime']
        }
      ],
      style: {
        charts: ['bar', 'radar', 'bubble'],
        colors: ['#E64A19', '#0097A7', '#689F38']
      }
    },

    DISPUTE_ANALYSIS: {
      id: 'dispute_analysis',
      name: 'Dispute Analysis',
      sections: [
        {
          title: 'Dispute Overview',
          metrics: ['totalDisputes', 'resolutionRate', 'avgResolutionTime']
        },
        {
          title: 'Issue Categories',
          metrics: ['issueTypes', 'severityLevels', 'repeatOffenders']
        },
        {
          title: 'Resolution Metrics',
          metrics: ['satisfactionRate', 'compensationAmount', 'appealRate']
        }
      ],
      style: {
        charts: ['pie', 'bar', 'timeline'],
        colors: ['#C2185B', '#00ACC1', '#7CB342']
      }
    },

    SYSTEM_HEALTH: {
      id: 'system_health',
      name: 'System Health Report',
      sections: [
        {
          title: 'Resource Usage',
          metrics: ['databaseReads', 'storageUsage', 'apiCalls']
        },
        {
          title: 'Performance Metrics',
          metrics: ['responseTime', 'errorRate', 'uptime']
        },
        {
          title: 'Security Overview',
          metrics: ['authAttempts', 'suspiciousActivity', 'vulnerabilities']
        }
      ],
      style: {
        charts: ['gauge', 'line', 'status'],
        colors: ['#F57C00', '#0288D1', '#D32F2F']
      }
    }
  };

  static getTemplate(templateId) {
    return this.TEMPLATES[templateId] || null;
  }

  static getAllTemplates() {
    return Object.values(this.TEMPLATES);
  }

  static getTemplateMetrics(templateId) {
    const template = this.getTemplate(templateId);
    if (!template) return [];
    
    return template.sections.reduce((metrics, section) => {
      return [...metrics, ...section.metrics];
    }, []);
  }

  static getChartConfig(templateId, sectionIndex) {
    const template = this.getTemplate(templateId);
    if (!template) return null;
    
    return {
      type: template.style.charts[sectionIndex % template.style.charts.length],
      colors: template.style.colors
    };
  }

  static generateReportStructure(templateId, data) {
    const template = this.getTemplate(templateId);
    if (!template) return null;

    return {
      title: template.name,
      timestamp: new Date().toISOString(),
      sections: template.sections.map(section => ({
        title: section.title,
        data: section.metrics.map(metric => ({
          name: metric,
          value: data[metric] || 0
        }))
      }))
    };
  }
}

export default ReportTemplates;
