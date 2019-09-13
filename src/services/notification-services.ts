import fs from 'fs';
import * as admin from 'firebase-admin';

export class NotificationService {
  constructor() {
    if (admin.apps.length === 0) {
      const databaseURLFile = process.env.FIREBASE_DATABASE_URL || '';
      const databaseURL = fs.readFileSync(databaseURLFile, 'utf8').trim();
      const credentialFile = process.env.FIREBASE_SERVICE_ACCOUNT || '';
      const data = fs.readFileSync(credentialFile, 'utf8').trim();
      const credential = JSON.parse(data);
      admin.initializeApp({
        credential: admin.credential.cert(credential),
        databaseURL,
      });
    }
  }

  async sendMessage(message: admin.messaging.Message) {
    await admin.messaging().send(message);
  }

  async sendMulticast(message: admin.messaging.MulticastMessage) {
    await admin.messaging().sendMulticast(message);
  }
}
