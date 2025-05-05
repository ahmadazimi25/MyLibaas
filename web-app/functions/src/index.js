const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Initialize Firebase Admin
admin.initializeApp();

// Import route handlers
const { handleDataDeletion } = require('./facebook');

// Export the functions
exports.facebookDataDeletion = handleDataDeletion;
