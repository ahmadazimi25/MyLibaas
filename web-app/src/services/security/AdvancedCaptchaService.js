import { db } from '../firebase/firebaseConfig';
import { doc, setDoc, getDoc, Timestamp } from 'firebase/firestore';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { createCanvas, loadImage } from 'canvas';
import { generateSecureCode } from '../../utils/security';

class AdvancedCaptchaService {
  static CAPTCHA_TYPES = {
    IMAGE: 'image',
    AUDIO: 'audio',
    BEHAVIORAL: 'behavioral'
  };

  static async generateImageCaptcha() {
    try {
      const canvas = createCanvas(200, 80);
      const ctx = ctx.getContext('2d');
      const text = generateSecureCode(6);

      // Add background noise
      ctx.fillStyle = '#f0f0f0';
      ctx.fillRect(0, 0, 200, 80);
      for (let i = 0; i < 50; i++) {
        ctx.fillStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.2)`;
        ctx.fillRect(Math.random() * 200, Math.random() * 80, 2, 2);
      }

      // Add distorted text
      ctx.font = '36px Arial';
      ctx.fillStyle = '#333';
      ctx.translate(100, 40);
      ctx.rotate(Math.random() * 0.2 - 0.1);
      ctx.fillText(text, -50, 15);

      // Add lines
      for (let i = 0; i < 5; i++) {
        ctx.strokeStyle = `rgba(${Math.random() * 255},${Math.random() * 255},${Math.random() * 255},0.5)`;
        ctx.beginPath();
        ctx.moveTo(Math.random() * 200 - 100, Math.random() * 80 - 40);
        ctx.lineTo(Math.random() * 200 - 100, Math.random() * 80 - 40);
        ctx.stroke();
      }

      // Upload to Firebase Storage
      const storage = getStorage();
      const imageRef = ref(storage, `captchas/image_${Date.now()}.png`);
      const buffer = canvas.toBuffer('image/png');
      await uploadBytes(imageRef, buffer);
      const imageUrl = await getDownloadURL(imageRef);

      // Store in Firestore
      const captchaId = `image_captcha_${Date.now()}`;
      await setDoc(doc(db, 'captchas', captchaId), {
        type: this.CAPTCHA_TYPES.IMAGE,
        answer: text,
        imageUrl,
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)),
        used: false
      });

      return {
        captchaId,
        imageUrl,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      };
    } catch (error) {
      console.error('Error generating image CAPTCHA:', error);
      throw error;
    }
  }

  static async generateAudioCaptcha() {
    try {
      const text = generateSecureCode(6);
      const audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const audioBuffer = audioContext.createBuffer(1, 44100 * 2, 44100);
      const channelData = audioBuffer.getChannelData(0);

      // Generate audio for each character
      let offset = 0;
      for (const char of text) {
        const frequency = 200 + (char.charCodeAt(0) - 48) * 100;
        for (let i = 0; i < 44100 * 0.3; i++) {
          channelData[offset + i] = Math.sin(2 * Math.PI * frequency * i / 44100);
        }
        offset += 44100 * 0.4;
      }

      // Add noise
      for (let i = 0; i < channelData.length; i++) {
        channelData[i] += (Math.random() - 0.5) * 0.1;
      }

      // Convert to WAV and upload
      const wavBuffer = this.audioBufferToWav(audioBuffer);
      const storage = getStorage();
      const audioRef = ref(storage, `captchas/audio_${Date.now()}.wav`);
      await uploadBytes(audioRef, wavBuffer);
      const audioUrl = await getDownloadURL(audioRef);

      // Store in Firestore
      const captchaId = `audio_captcha_${Date.now()}`;
      await setDoc(doc(db, 'captchas', captchaId), {
        type: this.CAPTCHA_TYPES.AUDIO,
        answer: text,
        audioUrl,
        createdAt: Timestamp.now(),
        expiresAt: Timestamp.fromDate(new Date(Date.now() + 5 * 60 * 1000)),
        used: false
      });

      return {
        captchaId,
        audioUrl,
        expiresAt: new Date(Date.now() + 5 * 60 * 1000)
      };
    } catch (error) {
      console.error('Error generating audio CAPTCHA:', error);
      throw error;
    }
  }

  static async trackBehavior(userId, event) {
    try {
      const behaviors = {
        mouseMovements: [],
        keyboardPatterns: [],
        timings: []
      };

      // Track mouse movements
      document.addEventListener('mousemove', (e) => {
        behaviors.mouseMovements.push({
          x: e.clientX,
          y: e.clientY,
          timestamp: Date.now()
        });
      });

      // Track keyboard patterns
      document.addEventListener('keydown', (e) => {
        behaviors.keyboardPatterns.push({
          key: e.key,
          timePressed: Date.now()
        });
      });

      // Calculate behavior score
      const score = await this.analyzeBehavior(behaviors);

      await setDoc(doc(db, 'behaviorScores', `${userId}_${Date.now()}`), {
        userId,
        score,
        behaviors,
        timestamp: Timestamp.now()
      });

      return {
        score,
        requiresCaptcha: score < 0.7
      };
    } catch (error) {
      console.error('Error tracking behavior:', error);
      throw error;
    }
  }

  static async analyzeBehavior(behaviors) {
    try {
      // Analyze mouse movements
      const mouseScore = this.analyzeMouseMovements(behaviors.mouseMovements);
      
      // Analyze keyboard patterns
      const keyboardScore = this.analyzeKeyboardPatterns(behaviors.keyboardPatterns);
      
      // Combine scores
      return (mouseScore + keyboardScore) / 2;
    } catch (error) {
      console.error('Error analyzing behavior:', error);
      throw error;
    }
  }

  static analyzeMouseMovements(movements) {
    // Check for natural mouse movements
    let score = 1.0;

    // Check for too straight lines
    for (let i = 2; i < movements.length; i++) {
      const angle = this.calculateAngle(
        movements[i-2],
        movements[i-1],
        movements[i]
      );
      if (angle < 0.1) score -= 0.1; // Too straight movement
    }

    // Check for consistent speed
    const speeds = [];
    for (let i = 1; i < movements.length; i++) {
      const speed = this.calculateSpeed(movements[i-1], movements[i]);
      speeds.push(speed);
    }
    const speedVariance = this.calculateVariance(speeds);
    if (speedVariance < 0.1) score -= 0.2; // Too consistent speed

    return Math.max(0, score);
  }

  static analyzeKeyboardPatterns(patterns) {
    let score = 1.0;

    // Check typing rhythm
    const intervals = [];
    for (let i = 1; i < patterns.length; i++) {
      intervals.push(patterns[i].timePressed - patterns[i-1].timePressed);
    }

    // Check for too consistent timing
    const variance = this.calculateVariance(intervals);
    if (variance < 10) score -= 0.3; // Too consistent timing

    // Check for impossible typing speeds
    const maxSpeed = Math.min(...intervals);
    if (maxSpeed < 50) score -= 0.4; // Humanly impossible typing speed

    return Math.max(0, score);
  }

  // Utility methods
  static calculateAngle(p1, p2, p3) {
    const angle1 = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    const angle2 = Math.atan2(p3.y - p2.y, p3.x - p2.x);
    return Math.abs(angle1 - angle2);
  }

  static calculateSpeed(p1, p2) {
    const dx = p2.x - p1.x;
    const dy = p2.y - p1.y;
    const dt = p2.timestamp - p1.timestamp;
    return Math.sqrt(dx*dx + dy*dy) / dt;
  }

  static calculateVariance(numbers) {
    const mean = numbers.reduce((a, b) => a + b) / numbers.length;
    const variance = numbers.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / numbers.length;
    return Math.sqrt(variance);
  }

  static audioBufferToWav(buffer) {
    // Convert AudioBuffer to WAV format
    const numChannels = buffer.numberOfChannels;
    const sampleRate = buffer.sampleRate;
    const format = 1; // PCM
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    const buffer = new ArrayBuffer(44 + buffer.length * bytesPerSample);
    const view = new DataView(buffer);
    
    // Write WAV header
    writeString(view, 0, 'RIFF');
    view.setUint32(4, 36 + buffer.length * bytesPerSample, true);
    writeString(view, 8, 'WAVE');
    writeString(view, 12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(view, 36, 'data');
    view.setUint32(40, buffer.length * bytesPerSample, true);
    
    return new Uint8Array(buffer);
  }
}

export default AdvancedCaptchaService;
