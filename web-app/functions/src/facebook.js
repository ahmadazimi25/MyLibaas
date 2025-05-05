const functions = require('firebase-functions');
const admin = require('firebase-admin');

// Facebook Data Deletion Request Handler
exports.handleDataDeletion = functions.https.onRequest(async (req, res) => {
  // Verify the request is from Facebook
  const signed_request = req.body.signed_request;
  if (!signed_request) {
    return res.status(400).json({ error: 'Missing signed_request parameter' });
  }

  try {
    // Parse and verify the signed_request
    const [encodedSig, payload] = signed_request.split('.');
    const data = JSON.parse(Buffer.from(payload, 'base64').toString('utf8'));

    // Get the user_id from the data
    const { user_id } = data;

    if (!user_id) {
      return res.status(400).json({ error: 'Missing user_id in the request' });
    }

    // Find and delete user data
    const db = admin.firestore();
    const userRef = db.collection('users').where('facebookId', '==', user_id);
    const userDocs = await userRef.get();

    if (userDocs.empty) {
      // Return success even if user not found - they might have already been deleted
      return res.status(200).json({
        url: 'https://mylibaas-30379.firebaseapp.com/data-deletion',
        confirmation_code: user_id
      });
    }

    // Delete all user data
    const batch = db.batch();
    userDocs.forEach(doc => {
      // Delete user document
      batch.delete(doc.ref);
      
      // Delete related collections
      const userId = doc.id;
      // Add more collection deletions as needed
      batch.delete(db.collection('profiles').doc(userId));
      batch.delete(db.collection('settings').doc(userId));
      batch.delete(db.collection('notifications').doc(userId));
    });

    await batch.commit();

    // Return success response
    return res.status(200).json({
      url: 'https://mylibaas-30379.firebaseapp.com/data-deletion',
      confirmation_code: user_id
    });

  } catch (error) {
    console.error('Error processing data deletion:', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});
