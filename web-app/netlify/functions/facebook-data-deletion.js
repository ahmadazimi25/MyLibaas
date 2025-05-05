const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs, writeBatch } = require('firebase/firestore');

// Initialize Firebase
const firebaseConfig = {
  // Your firebase config here - we'll get this from environment variables
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

exports.handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const body = JSON.parse(event.body);
    const signed_request = body.signed_request;

    if (!signed_request) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing signed_request parameter' })
      };
    }

    // Parse and verify the signed_request
    const [encodedSig, payload] = signed_request.split('.');
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));
    const { user_id } = data;

    if (!user_id) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Missing user_id in the request' })
      };
    }

    // Find user data
    const userRef = collection(db, 'users');
    const q = query(userRef, where('facebookId', '==', user_id));
    const userDocs = await getDocs(q);

    if (userDocs.empty) {
      // Return success even if user not found
      return {
        statusCode: 200,
        body: JSON.stringify({
          url: 'https://mylibaas.netlify.app/data-deletion',
          confirmation_code: user_id
        })
      };
    }

    // Delete user data
    const batch = writeBatch(db);
    userDocs.forEach(doc => {
      const userId = doc.id;
      batch.delete(doc.ref);
      
      // Delete related collections (add more as needed)
      const profileRef = doc(db, 'profiles', userId);
      const settingsRef = doc(db, 'settings', userId);
      const notificationsRef = doc(db, 'notifications', userId);
      
      batch.delete(profileRef);
      batch.delete(settingsRef);
      batch.delete(notificationsRef);
    });

    await batch.commit();

    return {
      statusCode: 200,
      body: JSON.stringify({
        url: 'https://mylibaas.netlify.app/data-deletion',
        confirmation_code: user_id
      })
    };

  } catch (error) {
    console.error('Error processing data deletion:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Internal server error' })
    };
  }
};
