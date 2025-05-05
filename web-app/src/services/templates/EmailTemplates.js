class EmailTemplates {
  static TEMPLATES = {
    WELCOME: {
      subject: 'Welcome to MyLibaas - Verify Your Email',
      template: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <img src="{logoUrl}" alt="MyLibaas Logo" style="max-width: 150px; margin-bottom: 20px;">
          <h1 style="color: #333; margin-bottom: 20px;">Welcome to MyLibaas!</h1>
          <p>Hi {username},</p>
          <p>Thank you for joining MyLibaas! We're excited to have you as part of our community.</p>
          <p>To get started, please verify your email address by clicking the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{verificationLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Verify Email Address
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 24 hours. If you didn't create an account, you can safely ignore this email.
          </p>
          <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee;">
            <p style="color: #666; font-size: 12px;">
              MyLibaas - Your Fashion Rental Destination<br>
              Need help? Contact us at support@mylibaas.com
            </p>
          </div>
        </div>
      `
    },

    VERIFICATION_SUCCESS: {
      subject: 'Email Verified - Welcome to MyLibaas',
      template: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <img src="{logoUrl}" alt="MyLibaas Logo" style="max-width: 150px; margin-bottom: 20px;">
          <h1 style="color: #333; margin-bottom: 20px;">Email Verified Successfully!</h1>
          <p>Hi {username},</p>
          <p>Your email has been successfully verified. You now have full access to all MyLibaas features!</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{dashboardUrl}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Go to Dashboard
            </a>
          </div>
          <h2 style="color: #333; margin-top: 30px;">What's Next?</h2>
          <ul style="color: #666; line-height: 1.6;">
            <li>Complete your profile</li>
            <li>Browse available rentals</li>
            <li>List your first item</li>
          </ul>
        </div>
      `
    },

    PASSWORD_RESET: {
      subject: 'Reset Your MyLibaas Password',
      template: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <img src="{logoUrl}" alt="MyLibaas Logo" style="max-width: 150px; margin-bottom: 20px;">
          <h1 style="color: #333; margin-bottom: 20px;">Password Reset Request</h1>
          <p>Hi {username},</p>
          <p>We received a request to reset your MyLibaas password. Click the button below to choose a new password:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{resetLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Reset Password
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This link will expire in 1 hour. If you didn't request a password reset, please ignore this email.
          </p>
          <p style="color: #666; font-size: 14px;">
            For security, this request was received from {deviceInfo} with IP address {ipAddress}.
          </p>
        </div>
      `
    },

    ACCOUNT_RECOVERY: {
      subject: 'Recover Your MyLibaas Account',
      template: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <img src="{logoUrl}" alt="MyLibaas Logo" style="max-width: 150px; margin-bottom: 20px;">
          <h1 style="color: #333; margin-bottom: 20px;">Account Recovery Request</h1>
          <p>Hi {username},</p>
          <p>We received a request to recover your MyLibaas account. Your recovery code is:</p>
          <div style="text-align: center; margin: 30px 0;">
            <div style="background-color: #f5f5f5; padding: 15px; border-radius: 4px; font-size: 24px; letter-spacing: 5px;">
              {recoveryCode}
            </div>
          </div>
          <p>Enter this code on the recovery page or click the button below:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{recoveryLink}" style="background-color: #4CAF50; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Recover Account
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            This code will expire in 15 minutes. If you didn't request account recovery, please contact support immediately.
          </p>
        </div>
      `
    },

    SECURITY_ALERT: {
      subject: 'Security Alert - MyLibaas Account',
      template: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <img src="{logoUrl}" alt="MyLibaas Logo" style="max-width: 150px; margin-bottom: 20px;">
          <h1 style="color: #333; margin-bottom: 20px;">Security Alert</h1>
          <p>Hi {username},</p>
          <p>We noticed some unusual activity on your account:</p>
          <div style="background-color: #fff3cd; padding: 15px; border-radius: 4px; margin: 20px 0;">
            <p style="color: #856404; margin: 0;">{alertMessage}</p>
          </div>
          <p>Details:</p>
          <ul style="color: #666; line-height: 1.6;">
            <li>Time: {timestamp}</li>
            <li>Location: {location}</li>
            <li>Device: {deviceInfo}</li>
            <li>IP Address: {ipAddress}</li>
          </ul>
          <div style="text-align: center; margin: 30px 0;">
            <a href="{securitySettingsUrl}" style="background-color: #dc3545; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; display: inline-block;">
              Review Account Activity
            </a>
          </div>
          <p style="color: #666; font-size: 14px;">
            If this wasn't you, please change your password immediately and contact our support team.
          </p>
        </div>
      `
    }
  };

  static getTemplate(templateName) {
    return this.TEMPLATES[templateName];
  }

  static formatTemplate(templateName, data) {
    const template = this.getTemplate(templateName);
    if (!template) {
      throw new Error(`Template ${templateName} not found`);
    }

    let formattedSubject = template.subject;
    let formattedHtml = template.template;

    // Replace all placeholders in subject and template
    Object.entries(data).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      formattedSubject = formattedSubject.replace(placeholder, value);
      formattedHtml = formattedHtml.replace(new RegExp(placeholder, 'g'), value);
    });

    return {
      subject: formattedSubject,
      html: formattedHtml
    };
  }
}

export default EmailTemplates;
