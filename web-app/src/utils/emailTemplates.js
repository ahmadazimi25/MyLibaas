// Email template generator for various notifications
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(amount);
};

const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'long',
    timeStyle: 'short',
  }).format(new Date(date));
};

export const emailTemplates = {
  // Dispute related emails
  dispute: {
    created: (data) => ({
      subject: `Dispute Filed - Case #${data.disputeId}`,
      html: `
        <h2>A New Dispute Has Been Filed</h2>
        <p>Hello ${data.userName},</p>
        <p>A dispute has been filed regarding your booking #${data.bookingId}.</p>
        <p><strong>Dispute Details:</strong></p>
        <ul>
          <li>Dispute Type: ${data.type}</li>
          <li>Filed On: ${formatDate(data.createdAt)}</li>
          <li>Amount in Dispute: ${formatCurrency(data.amount)}</li>
        </ul>
        <p>Please log in to respond to this dispute. Our team will review the case and help reach a resolution.</p>
        <a href="${data.disputeUrl}" style="padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px;">View Dispute</a>
      `,
    }),

    resolved: (data) => ({
      subject: `Dispute Resolved - Case #${data.disputeId}`,
      html: `
        <h2>Your Dispute Has Been Resolved</h2>
        <p>Hello ${data.userName},</p>
        <p>The dispute regarding booking #${data.bookingId} has been resolved.</p>
        <p><strong>Resolution Details:</strong></p>
        <ul>
          <li>Resolution Type: ${data.resolutionType}</li>
          <li>Resolved On: ${formatDate(data.resolvedAt)}</li>
          ${data.amount ? `<li>Settlement Amount: ${formatCurrency(data.amount)}</li>` : ''}
        </ul>
        <p>${data.resolutionDetails}</p>
        <a href="${data.disputeUrl}" style="padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px;">View Details</a>
      `,
    }),
  },

  // Damage report emails
  damage: {
    reported: (data) => ({
      subject: `Damage Report Filed - Booking #${data.bookingId}`,
      html: `
        <h2>New Damage Report</h2>
        <p>Hello ${data.userName},</p>
        <p>A damage report has been filed for your rental item.</p>
        <p><strong>Report Details:</strong></p>
        <ul>
          <li>Item: ${data.itemName}</li>
          <li>Reported On: ${formatDate(data.reportedAt)}</li>
          <li>Estimated Cost: ${formatCurrency(data.estimatedCost)}</li>
        </ul>
        <p>Please review the report and respond within 48 hours.</p>
        <a href="${data.reportUrl}" style="padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px;">View Report</a>
      `,
    }),
  },

  // Verification emails
  verification: {
    submitted: (data) => ({
      subject: 'ID Verification Submitted',
      html: `
        <h2>Verification Submitted Successfully</h2>
        <p>Hello ${data.userName},</p>
        <p>Your ID verification documents have been submitted successfully. Our team will review them within 24-48 hours.</p>
        <p><strong>Submission Details:</strong></p>
        <ul>
          <li>Submitted On: ${formatDate(data.submittedAt)}</li>
          <li>Document Type: ${data.documentType}</li>
        </ul>
        <p>We'll notify you once the verification is complete.</p>
        <a href="${data.statusUrl}" style="padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px;">Check Status</a>
      `,
    }),

    approved: (data) => ({
      subject: 'ID Verification Approved',
      html: `
        <h2>Verification Approved!</h2>
        <p>Hello ${data.userName},</p>
        <p>Great news! Your ID verification has been approved. You now have full access to all platform features.</p>
        <p><strong>Verification Details:</strong></p>
        <ul>
          <li>Approved On: ${formatDate(data.approvedAt)}</li>
          <li>Verification Level: ${data.verificationLevel}</li>
        </ul>
        <a href="${data.dashboardUrl}" style="padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px;">Go to Dashboard</a>
      `,
    }),
  },

  // Payment related emails
  payment: {
    received: (data) => ({
      subject: `Payment Received - ${formatCurrency(data.amount)}`,
      html: `
        <h2>Payment Received</h2>
        <p>Hello ${data.userName},</p>
        <p>We've received your payment for booking #${data.bookingId}.</p>
        <p><strong>Payment Details:</strong></p>
        <ul>
          <li>Amount: ${formatCurrency(data.amount)}</li>
          <li>Date: ${formatDate(data.paidAt)}</li>
          <li>Payment Method: ${data.paymentMethod}</li>
        </ul>
        <a href="${data.receiptUrl}" style="padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px;">View Receipt</a>
      `,
    }),

    refunded: (data) => ({
      subject: `Refund Processed - ${formatCurrency(data.amount)}`,
      html: `
        <h2>Refund Processed</h2>
        <p>Hello ${data.userName},</p>
        <p>Your refund has been processed successfully.</p>
        <p><strong>Refund Details:</strong></p>
        <ul>
          <li>Amount: ${formatCurrency(data.amount)}</li>
          <li>Date: ${formatDate(data.refundedAt)}</li>
          <li>Original Payment Method: ${data.paymentMethod}</li>
          <li>Reason: ${data.reason}</li>
        </ul>
        <p>The refund should appear in your account within 5-10 business days.</p>
        <a href="${data.receiptUrl}" style="padding: 10px 20px; background-color: #1976d2; color: white; text-decoration: none; border-radius: 4px;">View Details</a>
      `,
    }),
  },
};
