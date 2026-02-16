const functions = require("firebase-functions");
const admin = require("firebase-admin");

admin.initializeApp();

exports.requestStudentVerification = functions.https.onCall(
  async (data, context) => {
    if (!context.auth) {
      throw new functions.https.HttpsError(
        "unauthenticated",
        "Sign in required."
      );
    }
    const { studentEmail, cardUrl, university } = data;
    if (!studentEmail || !cardUrl) {
      throw new functions.https.HttpsError(
        "invalid-argument",
        "Missing studentEmail or cardUrl."
      );
    }
    await admin.firestore().collection("verificationRequests").add({
      studentEmail,
      cardUrl,
      university: university || "",
      ownerId: context.auth.uid,
      status: "pending",
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });
    return { status: "pending" };
  }
);

exports.approveStudent = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Sign in required."
    );
  }
  const { requestId, userId } = data;
  if (!requestId || !userId) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing requestId or userId."
    );
  }
  await admin.firestore().collection("verificationRequests").doc(requestId).update({
    status: "approved",
    approvedAt: admin.firestore.FieldValue.serverTimestamp(),
  });
  await admin.auth().setCustomUserClaims(userId, { studentVerified: true });
  return { status: "approved" };
});
