import webpush from 'web-push';

const vapidKeys = webpush.generateVAPIDKeys();

console.log(`
Generated Vapid key pair
=========================

Public Key:
${vapidKeys.publicKey}

Private Key:
${vapidKeys.privateKey}

`);
