const crypto = require('crypto');

exports.generateConfig = (server, user) => {
  // If Netherlands is clicked in the UI, use the Netherlands config
  if (server.countryCode === 'NL') {
    return `[Interface]
PrivateKey = +Hq+V2oH7NEPrnCytOuGUvuUQfEkE0Jl8m5atHRxoHk=
Address = 10.2.0.2/32, 2a07:b944::2:2/128
DNS = 10.2.0.1, 2a07:b944::2:1

[Peer]
PublicKey = KJ7R+L65d6HOlSCMvQKFEbEzWga5MtlR24Plh7afIGI=
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = 185.183.33.11:51820
PersistentKeepalive = 25`;
  }

  // If Japan is clicked in the UI, use the Japan config
  if (server.countryCode === 'JP') {
    return `[Interface]
PrivateKey = CKd4HXb6KEEFxTJFBtV7qwEnIUlieX1aXlJLw/NL63g=
Address = 10.2.0.2/32, 2a07:b944::2:2/128
DNS = 10.2.0.1, 2a07:b944::2:1

[Peer]
PublicKey = 9T76/iy7U1loVTPaREbDPqS3PhHOe+zrwsdrS4WleSo=
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = 138.199.21.216:51820
PersistentKeepalive = 25`;
  }

  // Default fallback for USA (and any other unconfigured country)
  return `[Interface]
PrivateKey = uGfhReOsK98uLggXhWql/cpccJNYocHBdIxY1iwVQ2w=
Address = 10.2.0.2/32, 2a07:b944::2:2/128
DNS = 10.2.0.1, 2a07:b944::2:1

[Peer]
PublicKey = gDmb0KtRVAd2UYnKs0UkXqS0tgcqk7UNw6yTb+loQ1c=
AllowedIPs = 0.0.0.0/0, ::/0
Endpoint = 149.40.51.230:51820
PersistentKeepalive = 25`;
};

exports.generateKeys = () => {
  const privateKey = crypto.randomBytes(32).toString('base64');
  const publicKey = crypto.createHash('sha256').update(privateKey).digest('base64');
  return { privateKey, publicKey };
};
