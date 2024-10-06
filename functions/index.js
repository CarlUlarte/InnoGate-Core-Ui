const functions = require('firebase-functions')
const admin = require('firebase-admin')
admin.initializeApp()

// HTTP callable function to delete user from Auth
exports.deleteUser = functions.https.onCall(async (data, context) => {
  const uid = data.uid

  try {
    // Deletes the user from Firebase Authentication
    await admin.auth().deleteUser(uid)
    return { success: true, message: `Successfully deleted user with UID: ${uid}` }
  } catch (error) {
    console.error('Error deleting user:', error)
    return { success: false, message: 'Failed to delete user' }
  }
})
