import { db } from './firebase/firebaseConfig';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';

class CaptchaService {
  static CAPTCHA_TYPES = {
    RECAPTCHA: 'google_recaptcha',
    HCAPTCHA: 'hcaptcha',
    SIMPLE: 'simple_math'
  };

  static DIFFICULTY_LEVELS = {
    EASY: 'easy',      // For normal actions
    MEDIUM: 'medium',  // For sensitive actions
    HARD: 'hard'      // For high-risk actions
  };

  // Configure reCAPTCHA (replace with your actual site key)
  static RECAPTCHA_SITE_KEY = 'your_recaptcha_site_key';
  static HCAPTCHA_SITE_KEY = 'your_hcaptcha_site_key';

  static async initializeCaptcha(type = this.CAPTCHA_TYPES.RECAPTCHA) {
    try {
      switch (type) {
        case this.CAPTCHA_TYPES.RECAPTCHA:
          // Load Google reCAPTCHA script
          if (!document.querySelector('#recaptcha-script')) {
            const script = document.createElement('script');
            script.id = 'recaptcha-script';
            script.src = `https://www.google.com/recaptcha/api.js?render=${this.RECAPTCHA_SITE_KEY}`;
            document.head.appendChild(script);
          }
          break;

        case this.CAPTCHA_TYPES.HCAPTCHA:
          // Load hCaptcha script
          if (!document.querySelector('#hcaptcha-script')) {
            const script = document.createElement('script');
            script.id = 'hcaptcha-script';
            script.src = 'https://js.hcaptcha.com/1/api.js';
            document.head.appendChild(script);
          }
          break;
      }

      return {
        success: true,
        message: `${type} initialized successfully`
      };
    } catch (error) {
      console.error('Error initializing CAPTCHA:', error);
      throw error;
    }
  }

  static async generateSimpleCaptcha() {
    try {
      // Generate a simple math problem
      const operations = ['+', '-', '*'];
      const operation = operations[Math.floor(Math.random() * operations.length)];
      let num1, num2, answer;

      switch (operation) {
        case '+':
          num1 = Math.floor(Math.random() * 10) + 1;
          num2 = Math.floor(Math.random() * 10) + 1;
          answer = num1 + num2;
          break;
        case '-':
          num1 = Math.floor(Math.random() * 10) + 1;
          num2 = Math.floor(Math.random() * num1) + 1; // Ensure positive result
          answer = num1 - num2;
          break;
        case '*':
          num1 = Math.floor(Math.random() * 5) + 1; // Smaller numbers for multiplication
          num2 = Math.floor(Math.random() * 5) + 1;
          answer = num1 * num2;
          break;
      }

      const captchaId = `captcha_${Date.now()}`;
      await setDoc(doc(db, 'captchas', captchaId), {
        type: this.CAPTCHA_TYPES.SIMPLE,
        question: `What is ${num1} ${operation} ${num2}?`,
        answer: answer.toString(),
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)), // 5 minutes
        used: false
      });

      return {
        captchaId,
        question: `What is ${num1} ${operation} ${num2}?`,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      };
    } catch (error) {
      console.error('Error generating simple CAPTCHA:', error);
      throw error;
    }
  }

  static async verifyRecaptcha(token) {
    try {
      // Verify with reCAPTCHA API (server-side verification)
      const verifyEndpoint = 'https://www.google.com/recaptcha/api/siteverify';
      const response = await fetch(verifyEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${token}`
      });

      const result = await response.json();

      if (!result.success) {
        throw new Error('reCAPTCHA verification failed');
      }

      // Log verification
      await this.logCaptchaAttempt(this.CAPTCHA_TYPES.RECAPTCHA, result.success);

      return {
        success: true,
        score: result.score // reCAPTCHA v3 provides a score
      };
    } catch (error) {
      console.error('Error verifying reCAPTCHA:', error);
      throw error;
    }
  }

  static async verifySimpleCaptcha(captchaId, answer) {
    try {
      const captchaRef = doc(db, 'captchas', captchaId);
      const captchaDoc = await getDoc(captchaRef);

      if (!captchaDoc.exists()) {
        throw new Error('Invalid CAPTCHA');
      }

      const captchaData = captchaDoc.data();

      // Check if expired
      if (new Date() > captchaData.expiresAt.toDate()) {
        throw new Error('CAPTCHA expired');
      }

      // Check if already used
      if (captchaData.used) {
        throw new Error('CAPTCHA already used');
      }

      // Verify answer
      const isCorrect = captchaData.answer === answer;

      // Mark as used
      await setDoc(captchaRef, {
        used: true,
        verifiedAt: Timestamp.now(),
        correct: isCorrect
      }, { merge: true });

      // Log attempt
      await this.logCaptchaAttempt(this.CAPTCHA_TYPES.SIMPLE, isCorrect);

      return {
        success: isCorrect,
        message: isCorrect ? 'CAPTCHA verified successfully' : 'Incorrect answer'
      };
    } catch (error) {
      console.error('Error verifying simple CAPTCHA:', error);
      throw error;
    }
  }

  static async logCaptchaAttempt(type, success) {
    try {
      await setDoc(doc(db, 'captchaLogs', `${Date.now()}`), {
        type,
        success,
        timestamp: Timestamp.now(),
        ip: await this.getClientIP(),
        userAgent: navigator.userAgent
      });
    } catch (error) {
      console.error('Error logging CAPTCHA attempt:', error);
    }
  }

  static async getClientIP() {
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error('Error getting client IP:', error);
      return null;
    }
  }
}

export default CaptchaService;
