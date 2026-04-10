require('dotenv').config({ path: '../../.env' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('../models/User.model');
const Server = require('../models/Server.model');
const { Plan, BlogPost, Connection } = require('../models/index');

const SERVERS = [
  { name: 'US-FREE#85', country: 'United States', city: 'New York', flag: '🇺🇸', countryCode: 'US', region: 'americas', ip: '149.40.51.230', ping: 42, supportsStreaming: true, supportsP2P: true, latitude: 40.7128, longitude: -74.0060 },
  { name: 'JP-FREE#9', country: 'Japan', city: 'Tokyo', flag: '🇯🇵', countryCode: 'JP', region: 'asia', ip: '138.199.21.216', ping: 84, supportsStreaming: true, latitude: 35.6762, longitude: 139.6503 },
  { name: 'NL-FREE#76', country: 'Netherlands', city: 'Amsterdam', flag: '🇳🇱', countryCode: 'NL', region: 'europe', ip: '185.183.33.11', ping: 62, supportsP2P: true, supportsTor: true, latitude: 52.3676, longitude: 4.9041 }
];

const PLANS = [
  {
    name: 'free',
    displayName: 'Free',
    price: { monthly: 0, yearly: 0 },
    features: ['10GB monthly data', '5 server locations', '1 device', 'Standard speed (100Mbps)', 'AES-128 encryption', 'Basic support'],
    maxDevices: 1,
    maxDataGB: 10,
    maxSpeedMbps: 100,
    sortOrder: 0,
  },
  {
    name: 'pro',
    displayName: 'Pro',
    price: { monthly: 9.99, yearly: 4.99 },
    features: ['Unlimited data', '95+ server locations', '6 devices', '10Gbps speed', 'AES-256 encryption', 'Kill switch', 'Split tunneling', 'Streaming servers', 'P2P / torrenting', 'Priority 24/7 support', 'Ad blocker'],
    maxDevices: 6,
    maxDataGB: Infinity,
    maxSpeedMbps: 10000,
    sortOrder: 1,
  },
  {
    name: 'business',
    displayName: 'Business',
    price: { monthly: 19.99, yearly: 9.99 },
    features: ['Everything in Pro', '10 devices', 'Dedicated IP', 'Team management', 'Admin panel', 'API access', 'Custom DNS', 'Obfuscated servers', 'Tor over VPN', '24/7 dedicated support', 'SLA guarantee', 'Invoice billing'],
    maxDevices: 10,
    maxDataGB: Infinity,
    maxSpeedMbps: 10000,
    sortOrder: 2,
  },
];

const BLOG_POSTS = [
  {
    title: 'What is a VPN and Do You Really Need One in 2025?',
    slug: 'what-is-a-vpn',
    category: 'guides',
    tags: ['vpn', 'privacy', 'beginners'],
    readingTime: 8,
    excerpt: 'A VPN encrypts your internet traffic and masks your IP address. But do you actually need one? We break down everything you need to know.',
    content: `# What is a VPN and Do You Really Need One in 2025?

A Virtual Private Network (VPN) is a technology that creates a secure, encrypted tunnel between your device and the internet. Think of it as a private highway through the public internet — your data travels through it invisibly, shielded from prying eyes.

## How Does a VPN Work?

When you connect to a VPN, here's what happens:

1. **Your device connects to a VPN server** — instead of connecting directly to websites, all your traffic routes through a secure server in a location of your choice.
2. **Your traffic is encrypted** — using military-grade AES-256 encryption, your data becomes unreadable to anyone who intercepts it.
3. **Your IP address changes** — websites see the VPN server's IP, not yours, protecting your real location and identity.

## Do You Need a VPN?

If any of these apply to you, the answer is yes:

- **You use public Wi-Fi** (cafes, airports, hotels) — these networks are hunting grounds for hackers.
- **You value your privacy** — your ISP logs and can sell your browsing history.
- **You want to access geo-restricted content** — streaming services differ by country.
- **You live in or travel to countries with heavy censorship** — a VPN is often essential.
- **You do sensitive work** — journalists, activists, and business professionals need VPNs.

## VPN Limitations

A VPN is not a magic shield. It won't protect you from malware, phishing sites, or cookies that already track you. It's one layer of a comprehensive privacy strategy.

## Conclusion

In 2025, digital privacy is not a luxury — it's a necessity. A VPN like PhantomVPN gives you control over who sees your data, where you appear to be located, and how securely your traffic flows across the internet.`,
  },
  {
    title: 'WireGuard vs OpenVPN vs IKEv2: Which Protocol is Best?',
    slug: 'wireguard-vs-openvpn',
    category: 'comparisons',
    tags: ['wireguard', 'openvpn', 'protocols', 'speed'],
    readingTime: 10,
    excerpt: 'WireGuard is the new kid in town, but OpenVPN has decades of trust. Which should you use? We compare speed, security, and compatibility.',
    content: `# WireGuard vs OpenVPN vs IKEv2: Which Protocol is Best?

The VPN protocol you choose determines how your data is encrypted and transmitted. Here's a deep dive into the three most popular options.

## WireGuard

WireGuard is the newest and fastest VPN protocol. With only ~4,000 lines of code (versus OpenVPN's 400,000+), it's lean, auditable, and blazing fast.

**Pros:** Extremely fast, minimal code means fewer vulnerabilities, excellent on mobile, modern cryptography.

**Cons:** Still relatively new, some privacy concerns with IP logging (mitigated by PhantomVPN's implementation).

**Best for:** Speed-sensitive tasks, mobile devices, everyday use.

## OpenVPN

The gold standard for over a decade. OpenVPN is battle-tested, widely supported, and highly configurable.

**Pros:** Proven security, highly configurable, works on almost everything, can bypass firewalls on port 443.

**Cons:** Slower than WireGuard, complex to audit due to code size, battery drain on mobile.

**Best for:** Maximum compatibility, bypassing strict firewalls, paranoid security needs.

## IKEv2/IPSec

Developed by Microsoft and Cisco, IKEv2 is built into most operating systems and excels at reconnecting after network switches.

**Pros:** Native OS support, fast reconnection, great for mobile.

**Cons:** Less configurable, potential NSA backdoors in some implementations.

**Best for:** Mobile users who switch between Wi-Fi and cellular frequently.

## The Verdict

**For most users:** WireGuard. It's the future of VPN protocols — fast, secure, and simple.

**For censored regions:** OpenVPN on port 443 to bypass deep packet inspection.

**For mobile with frequent network switching:** IKEv2.

PhantomVPN supports all three. You can switch protocols in your settings at any time.`,
  },
  {
    title: 'How to Stay Anonymous Online in 2025',
    slug: 'how-to-stay-anonymous-online',
    category: 'privacy',
    tags: ['anonymity', 'privacy', 'security'],
    readingTime: 12,
    excerpt: 'True online anonymity requires more than just a VPN. Here\'s the complete guide to disappearing from the internet\'s prying eyes.',
    content: `# How to Stay Anonymous Online in 2025

Complete online anonymity is a multi-layered challenge. Here's your comprehensive guide.

## Layer 1: Use a VPN

Your first and most important tool. A VPN hides your IP address and encrypts your traffic from your ISP. Use PhantomVPN with the WireGuard protocol for the best combination of speed and security.

## Layer 2: Use a Privacy Browser

Firefox (with hardening) or Brave browser. Avoid Chrome — it's Google's data collection machine.

Key extensions: uBlock Origin, Privacy Badger, Cookie AutoDelete.

## Layer 3: Search Engines

Switch to DuckDuckGo or Startpage. Google logs every search you make.

## Layer 4: Email

Gmail reads your emails. Switch to ProtonMail or Tutanota — end-to-end encrypted email providers.

## Layer 5: DNS Over HTTPS

Use encrypted DNS to prevent DNS leaks. PhantomVPN automatically uses our private DNS servers when connected.

## Layer 6: Two-Factor Authentication

Enable 2FA everywhere. Use an authenticator app, not SMS (which can be SIM-swapped).

## Layer 7: Operating System

Consider Linux for maximum control. Use full-disk encryption on all devices.

## What Won't Make You Anonymous

- **Incognito mode** — only hides history from others using your device.
- **A VPN alone** — if you're logged into Google, they still track you.
- **Tor + bad behavior** — any identifying information you share negates Tor's protection.

## The Pragmatic Approach

You don't need to be a ghost. Focus on the threat model that matters to you — hiding from your ISP, protecting against hackers on public Wi-Fi, or accessing geo-blocked content. Each of these has different solutions.`,
  },
  {
    title: 'Best VPN for Streaming Netflix, HBO, and Disney+ in 2025',
    slug: 'best-vpn-for-streaming',
    category: 'streaming',
    tags: ['streaming', 'netflix', 'hbo', 'disney'],
    readingTime: 7,
    excerpt: 'Want to unlock Netflix libraries from around the world? Here\'s exactly which VPN servers work for major streaming platforms.',
    content: `# Best VPN for Streaming Netflix, HBO, and Disney+ in 2025

Streaming services use geo-blocking to restrict content by country. A VPN lets you bypass this and access any library you want.

## Which Platforms Work With PhantomVPN?

### Netflix
Works with: US, UK, Japan, Canada, Australia libraries.
Best servers: US-East-1 (New York), UK-1 (London), JP-1 (Tokyo).

### HBO Max / Max
Works with: US library.
Best servers: US-East-1 (New York), US-South-1 (Miami).

### Disney+
Works with: US, UK, Australia, Canada libraries.
Most of our servers work with Disney+.

### BBC iPlayer
Best server: UK-1 (London). Requires UK IP.

### Amazon Prime Video
Works with most of our servers. Different libraries available per region.

## Tips for Smooth Streaming

1. **Choose a streaming-optimized server** — look for the streaming badge in our server list.
2. **Use WireGuard protocol** — it's the fastest and least likely to throttle.
3. **Clear cookies before connecting** — streaming services remember your real location via cookies.
4. **If detected, try another server** — Netflix actively detects and blocks VPN IPs.

## Speed Requirements

For HD streaming: 5 Mbps minimum.
For 4K streaming: 25 Mbps minimum.

PhantomVPN's servers deliver 10Gbps bandwidth — more than enough for 4K with multiple devices.`,
  },
  {
    title: 'VPN Kill Switch Explained: What It Is and Why You Need It',
    slug: 'vpn-kill-switch-explained',
    category: 'security',
    tags: ['kill switch', 'security', 'privacy'],
    readingTime: 6,
    excerpt: 'What happens when your VPN connection drops? Without a kill switch, your real IP is exposed instantly. Here\'s how to protect yourself.',
    content: `# VPN Kill Switch Explained: What It Is and Why You Need It

## What is a VPN Kill Switch?

A kill switch is an emergency stop mechanism that cuts off your internet connection the moment your VPN connection drops. Without it, your device would reconnect to the internet directly — revealing your real IP address and unencrypted traffic.

## Why Do VPN Connections Drop?

- **Network instability** — Wi-Fi signal fluctuations, ISP issues.
- **Server maintenance** — VPN servers occasionally restart.
- **Protocol reconnection** — switching networks (Wi-Fi to cellular) causes brief disconnects.
- **Firewall interference** — some networks block VPN traffic.

## Who Absolutely Needs a Kill Switch?

- Journalists and activists in dangerous countries
- BitTorrent users (your real IP must never leak to swarms)
- Whistleblowers and privacy advocates
- Anyone using public Wi-Fi for sensitive tasks

## How PhantomVPN's Kill Switch Works

When enabled, PhantomVPN adds firewall rules that block all traffic that doesn't route through our VPN tunnel. The moment the tunnel drops, traffic stops — not a byte leaks.

To enable: Settings → Privacy → Kill Switch → Toggle on.

## System-Level vs App-Level Kill Switches

**System-level** (what PhantomVPN uses): Blocks ALL internet traffic if VPN drops.

**App-level**: Only blocks specific apps. Less secure but useful if you want some apps to use direct connections.

## Should You Always Have It On?

If privacy is your priority, yes. The trade-off is that if your VPN drops, you lose internet entirely until it reconnects. For most users, this is the right call.`,
  },
  {
    title: 'Five Eyes, Nine Eyes, 14 Eyes: What You Need to Know',
    slug: 'five-eyes-nine-eyes-14-eyes',
    category: 'privacy',
    tags: ['surveillance', 'intelligence', 'privacy'],
    readingTime: 9,
    excerpt: 'Intelligence alliances between governments can compromise your VPN provider\'s no-logs policy. Here\'s what these alliances mean for your privacy.',
    content: `# Five Eyes, Nine Eyes, 14 Eyes: What You Need to Know

## What Are Intelligence Alliances?

After World War II, English-speaking nations established intelligence-sharing agreements. These have expanded over the decades into what we now call the Five, Nine, and 14 Eyes alliances.

## The Five Eyes

**Countries:** USA, UK, Canada, Australia, New Zealand.

The core alliance. These countries share intelligence extensively — if one government legally compels a company to produce data, it can be shared with all five.

## The Nine Eyes

Adds: France, Denmark, Netherlands, Norway.

These countries collaborate with the Five Eyes on signals intelligence.

## The 14 Eyes

Adds: Germany, Belgium, Italy, Sweden, Spain.

A broader intelligence-sharing framework. Less tight-knit than Five Eyes but still significant.

## What This Means for VPN Users

If your VPN provider is based in a Five/Nine/14 Eyes country, they can potentially be compelled — by secret court order — to log and hand over your data.

This is why many premium VPN services are based in privacy-friendly jurisdictions like:
- **Panama** (NordVPN)
- **British Virgin Islands** (ExpressVPN)
- **Switzerland** (Proton)
- **Romania** (CyberGhost)

## The No-Logs Solution

The most effective defense: a genuine zero-logs policy, verified by independent audit. Even if a VPN provider receives a government request, if they have no logs, there's nothing to hand over.

## Conclusion

Choose a VPN with a strict no-logs policy that has been independently audited, ideally headquartered outside Five/Nine/14 Eyes jurisdictions. PhantomVPN maintains a verified zero-logs policy — we cannot share what we do not store.`,
  },
  {
    title: 'How to Set Up a VPN on Your Router',
    slug: 'vpn-router-setup',
    category: 'guides',
    tags: ['router', 'setup', 'guide'],
    readingTime: 11,
    excerpt: 'Install a VPN on your router and protect every device in your home — from smart TVs to gaming consoles — automatically.',
    content: `# How to Set Up a VPN on Your Router

Setting up a VPN on your router means every device connected to your home network is automatically protected — no apps needed.

## Benefits of Router VPN

- Protects devices that can't run VPN apps (smart TVs, game consoles, IoT devices)
- One connection covers your entire home
- No per-device setup required

## Compatible Routers

**Native WireGuard support:**
- Asus (with Merlin firmware)
- GL.iNet (highly recommended for VPN use)
- Netgate (pfSense)

**After installing DD-WRT or OpenWrt:**
- Linksys
- Netgear
- TP-Link

## Step-by-Step: GL.iNet Router

1. Log into your GL.iNet admin panel (192.168.8.1)
2. Navigate to VPN → WireGuard Client
3. Download your PhantomVPN WireGuard config from Settings → Downloads
4. Click "Add Tunnel" → Upload config file
5. Click Connect

## Step-by-Step: DD-WRT Router

1. Flash your router with DD-WRT firmware (check compatibility at dd-wrt.com)
2. Navigate to Services → VPN
3. Enable OpenVPN Client
4. Download your PhantomVPN OpenVPN config from Settings → Downloads
5. Paste the config content and click Apply

## Performance Considerations

Router VPNs encrypt/decrypt all traffic on the router's processor. Older routers may struggle with speeds above 50-100Mbps. For gigabit speeds, use a powerful router like the Asus RT-AX88U or GL.iNet Flint.

## Split Tunneling on Router

Some routers support routing only specific devices through the VPN. This lets you keep your work laptop private while your smart TV uses the direct connection for local streaming.`,
  },
  {
    title: 'What is DNS Leak and How to Prevent It',
    slug: 'dns-leak-prevention',
    category: 'security',
    tags: ['dns', 'leak', 'security'],
    readingTime: 7,
    excerpt: 'Even with a VPN active, DNS leaks can reveal your browsing activity to your ISP. Here\'s how to detect and fix DNS leaks.',
    content: `# What is DNS Leak and How to Prevent It

## Understanding DNS

When you type "google.com" into your browser, a DNS (Domain Name System) server translates that into an IP address. Your device has to look up every domain you visit.

## What is a DNS Leak?

A DNS leak occurs when your DNS queries bypass the VPN tunnel and go directly to your ISP's DNS servers. Even though your browsing traffic is encrypted, your ISP can still see every domain you visit.

## Why DNS Leaks Happen

- **Windows DNS behavior** — Windows sometimes ignores VPN DNS settings and uses the system default.
- **IPv6 leaks** — If you have an IPv6 address, DNS queries may route through IPv6 outside the VPN tunnel.
- **Browser DNS-over-HTTPS** — Chrome and Firefox have built-in DNS resolvers that can bypass VPN DNS.

## How to Test for DNS Leaks

1. Visit our DNS Leak Test tool at phantomvpn.com/tools
2. Connect to PhantomVPN
3. Run the test again — all DNS servers should show PhantomVPN's DNS IPs

## Fixing DNS Leaks

### In PhantomVPN
Enable DNS leak protection in Settings → Privacy → DNS Leak Protection. This forces all DNS queries through our encrypted servers.

### Manually (Windows)
1. Open Network Adapter Settings
2. Right-click your active connection → Properties
3. Select IPv4 → Properties
4. Set DNS to 1.1.1.1 (Cloudflare) or our VPN DNS

### Disable IPv6
In Network Adapter Properties, uncheck IPv6 to prevent IPv6 DNS bypass.

## PhantomVPN's DNS Solution

By default, PhantomVPN routes all DNS through our private, zero-log DNS servers. You can verify this with our leak test tool.`,
  },
  {
    title: 'VPN Split Tunneling: Route Only What You Want',
    slug: 'vpn-split-tunneling',
    category: 'guides',
    tags: ['split tunneling', 'configuration'],
    readingTime: 8,
    excerpt: 'Split tunneling lets you choose which apps use the VPN and which use your regular connection. Here\'s how to set it up perfectly.',
    content: `# VPN Split Tunneling: Route Only What You Want

## What is Split Tunneling?

Split tunneling divides your internet traffic into two paths: some goes through the encrypted VPN tunnel, while the rest goes directly through your regular connection.

## Why Use Split Tunneling?

**Speed:** Routing everything through a VPN adds latency. Local services (banking, delivery apps) work faster on a direct connection.

**Access:** Some services block VPN connections. Local streaming services, banking apps, and corporate intranets may require your real IP.

**Bandwidth:** Reduce VPN server load by only routing privacy-sensitive traffic.

## Common Split Tunneling Configurations

### Route everything EXCEPT these apps through VPN:
- Local banking apps
- Corporate intranet
- Local streaming services
- Printers and local network devices

### Route ONLY these apps through VPN:
- BitTorrent clients
- Browser (for privacy browsing)
- Email client
- Specific apps you want protected

## Inverse Split Tunneling

Also called "exclusive" mode — only the apps you specify use the VPN; everything else goes direct. Useful when you have specific apps that need VPN but want maximum speed everywhere else.

## Setting Up in PhantomVPN

1. Go to Settings → Privacy → Split Tunneling
2. Choose mode: "All apps use VPN except..." or "Only these apps use VPN"
3. Add apps to the list
4. Apply and reconnect

## Caveats

Split tunneling creates two distinct traffic streams. Any app using the direct connection can still be monitored by your ISP. Only use split tunneling for apps you don't need to protect.`,
  },
  {
    title: 'IP Address: Everything You Need to Know',
    slug: 'ip-address-guide',
    category: 'guides',
    tags: ['ip address', 'networking', 'basics'],
    readingTime: 9,
    excerpt: 'Your IP address reveals more about you than you think. Location, ISP, browsing habits — all tied to those four numbers.',
    content: `# IP Address: Everything You Need to Know

## What is an IP Address?

An IP (Internet Protocol) address is a unique numerical label assigned to every device connected to the internet. It serves two functions: identifying the device and providing its network location.

## IPv4 vs IPv6

**IPv4:** 32-bit addresses like 192.168.1.1. The internet is running out of these — only 4.3 billion possible addresses.

**IPv6:** 128-bit addresses like 2001:0db8:85a3:0000:0000:8a2e:0370:7334. Virtually unlimited — 340 undecillion addresses.

## What Your IP Reveals

Your IP address tells websites:
- Your approximate geographic location (city-level)
- Your Internet Service Provider
- Whether you're using a VPN, proxy, or Tor
- Your ASN (Autonomous System Number)

## Static vs Dynamic IP

**Static IP:** Never changes. Used by businesses, servers, and dedicated IP VPN users.
**Dynamic IP:** Changes periodically (usually when you restart your router). Most residential connections.

## Why You Should Hide Your IP

1. **Privacy from websites** — tracking pixels and analytics tie your IP to your behavior across sites.
2. **Privacy from your ISP** — ISPs can and do sell browsing data tied to IP addresses.
3. **Bypass geo-restrictions** — content is gated by IP location.
4. **Protection on public networks** — attackers target IPs on shared networks.

## How a VPN Changes Your IP

When you connect to PhantomVPN, all traffic routes through our server. Websites see our server's IP — not yours. Your real IP is never exposed.

## Dedicated vs Shared IP

**Shared IP:** Multiple users share the same VPN IP. Better for anonymity since your activity blends with others.

**Dedicated IP:** You get a unique IP that's always yours. Better for accessing services that block VPN IPs. Available on PhantomVPN Business plan.`,
  },
  {
    title: 'How to Use a VPN for Torrenting Safely',
    slug: 'vpn-for-torrenting',
    category: 'guides',
    tags: ['torrenting', 'p2p', 'privacy'],
    readingTime: 10,
    excerpt: 'Torrenting without a VPN exposes your IP address to thousands of strangers in the swarm. Here\'s how to torrent safely and legally.',
    content: `# How to Use a VPN for Torrenting Safely

## Why Torrenting Exposes You

The BitTorrent protocol is peer-to-peer — you connect directly to other users to share files. Every peer in a torrent swarm can see your real IP address. Copyright trolls monitor swarms and collect IPs to send DMCA notices.

## What You Need

1. A VPN with P2P support (not all VPNs allow torrenting)
2. A no-logs VPN policy (crucial)
3. Kill switch enabled (essential — if VPN drops, your real IP leaks)

## PhantomVPN P2P Servers

Our servers marked with "P2P" badge support torrenting:
- Netherlands (Amsterdam) — optimal for privacy
- Romania (Bucharest)
- Switzerland (Zurich)
- Sweden (Stockholm)

## Setting Up for Safe Torrenting

1. Connect to a P2P server (filter by "P2P" in server list)
2. Enable kill switch (Settings → Privacy → Kill Switch)
3. Enable DNS leak protection
4. Open your torrent client after connecting
5. Verify your IP in the torrent client settings shows the VPN IP

## Binding Your Torrent Client to the VPN

In qBittorrent: Tools → Options → Advanced → Network Interface → Select your VPN adapter.

This ensures qBittorrent ONLY works when connected to the VPN.

## Legal Considerations

VPNs are legal in most countries. Downloading copyrighted material without permission is not. Always torrent legal, open-source, or Creative Commons content.

## Speed Tips

- Use servers geographically close to you
- Choose servers with low load (green indicator)
- Use WireGuard protocol for maximum speed
- Increase torrent client connection limits`,
  },
  {
    title: 'VPN and Privacy Laws: A Country-by-Country Guide',
    slug: 'vpn-legality-by-country',
    category: 'privacy',
    tags: ['legal', 'countries', 'regulations'],
    readingTime: 11,
    excerpt: 'Is using a VPN legal where you are? From fully legal to outright banned — here\'s the complete legal status of VPNs around the world.',
    content: `# VPN and Privacy Laws: A Country-by-Country Guide

## VPN Legality Overview

VPNs are legal in the vast majority of countries. However, several nations restrict or outright ban VPN use. Here's what you need to know.

## Fully Legal (Most Countries)

**United States, Canada, UK, EU nations, Australia, Japan, South Korea, India, Brazil** — VPNs are completely legal. Using one is your right as a consumer.

## Legal with Restrictions

**Russia** — VPNs must be registered with the government and must block banned content. Most reputable VPNs don't comply, making them technically illegal but widely used.

**China** — Only government-approved VPNs are legal. Unapproved VPNs (virtually all consumer VPNs) are banned. Enforcement primarily targets businesses, not individuals.

**UAE** — Using a VPN for legal purposes is allowed. Using it for illegal activities (including VoIP calls like WhatsApp) is illegal.

**Turkey** — VPNs are technically illegal but widely used and rarely prosecuted.

## Heavily Restricted or Banned

**Iran** — Only government-approved VPNs are legal. Many Iranians use VPNs to bypass restrictions despite this.

**North Korea** — Foreign internet access is effectively banned. VPNs are illegal.

**Turkmenistan** — One of the most restricted internet environments globally.

**Belarus** — VPN use is restricted and monitored.

## Recommendations

If you're in a restricted country, use PhantomVPN's obfuscated servers. These disguise VPN traffic as regular HTTPS traffic, making it harder to detect and block.

Always research local laws before using a VPN abroad.`,
  },
  {
    title: 'What is AES-256 Encryption and Why It Matters',
    slug: 'aes-256-encryption-explained',
    category: 'security',
    tags: ['encryption', 'aes-256', 'security'],
    readingTime: 8,
    excerpt: 'AES-256 is the gold standard of encryption used by banks, militaries, and VPN providers. Here\'s how it actually works.',
    content: `# What is AES-256 Encryption and Why It Matters

## The Basics

AES stands for Advanced Encryption Standard. It's a symmetric encryption algorithm — the same key encrypts and decrypts data. The "256" refers to the key length in bits.

## Why 256 Bits?

A 256-bit key means there are 2^256 possible keys — that's 115,792,089,237,316,195,423,570,985,008,687,907,853,269,984,665,640,564,039,457,584,007,913,129,639,936 possible combinations.

Even if every atom in the universe were a computer working since the Big Bang, brute-forcing AES-256 would still be impossible.

## Who Uses AES-256?

- US military and intelligence agencies (NSA classified documents)
- Banking systems (your online banking)
- File encryption tools (VeraCrypt, BitLocker)
- SSL/TLS (the "S" in HTTPS)
- All quality VPN providers including PhantomVPN

## AES-128 vs AES-256

Both are effectively unbreakable with current technology. AES-128 is slightly faster; AES-256 has a larger security margin against future quantum computing threats.

PhantomVPN uses AES-256-GCM — the GCM mode provides both encryption and authentication in one operation, preventing tampering.

## How PhantomVPN Uses Encryption

**Data channel:** AES-256-GCM encrypts all your traffic.
**Control channel:** RSA-4096 for key exchange, protecting the encryption keys themselves.
**Authentication:** HMAC-SHA256 ensures data integrity.

## Can Governments Break AES-256?

No published evidence of any successful AES-256 brute force attack exists. It is mathematically secure for the foreseeable future, including against quantum computers running Grover's algorithm (which would only reduce effective key strength to 128-bit — still unbreakable).`,
  },
  {
    title: 'Obfuscated Servers: How to Bypass Deep Packet Inspection',
    slug: 'obfuscated-servers-explained',
    category: 'security',
    tags: ['obfuscation', 'dpi', 'censorship'],
    readingTime: 9,
    excerpt: 'In China, Russia, and Iran, regular VPN traffic is detected and blocked. Obfuscated servers disguise your VPN as normal HTTPS traffic.',
    content: `# Obfuscated Servers: How to Bypass Deep Packet Inspection

## The Problem: Deep Packet Inspection

Governments and ISPs use Deep Packet Inspection (DPI) to analyze internet traffic. DPI can identify VPN protocols (WireGuard, OpenVPN) by their traffic patterns and block them.

## What is Obfuscation?

Obfuscation wraps VPN traffic in an additional layer that makes it look like regular HTTPS traffic. To DPI systems, it's indistinguishable from a normal website visit.

## Common Obfuscation Techniques

**Shadowsocks:** A fast, secure SOCKS5 proxy designed specifically to bypass China's Great Firewall. Very difficult to detect.

**V2Ray/Xray:** More advanced obfuscation with multiple protocol options. Used to bypass sophisticated censorship.

**OpenVPN over SSL/TLS:** Wraps OpenVPN traffic inside an SSL tunnel, disguising it as HTTPS.

**Stunnel:** Creates a TLS tunnel around any protocol.

## When to Use Obfuscated Servers

- Traveling to China, Russia, Iran, UAE, or other censored countries
- Your network blocks VPN (corporate networks, universities)
- You suspect your ISP is throttling VPN traffic
- Maximum stealth is required

## PhantomVPN Obfuscated Servers

Our obfuscated servers are marked with a special icon in the server list. They're available in:
- Iceland (Reykjavik)
- Romania (Bucharest)
- Singapore
- Pakistan
- UAE

## Performance Trade-off

Obfuscation adds processing overhead. Expect speeds 20-40% lower than standard servers. This is worth the trade-off when you need to bypass censorship.`,
  },
  {
    title: 'WebRTC Leaks: Is Your Browser Exposing Your Real IP?',
    slug: 'webrtc-leak-protection',
    category: 'security',
    tags: ['webrtc', 'leak', 'browser', 'privacy'],
    readingTime: 7,
    excerpt: 'WebRTC — the technology that powers video calls — can expose your real IP address even when connected to a VPN. Here\'s how to stop it.',
    content: `# WebRTC Leaks: Is Your Browser Exposing Your Real IP?

## What is WebRTC?

WebRTC (Web Real-Time Communication) is a browser API that enables real-time audio, video, and data sharing without plugins. It powers Google Meet, Zoom web, and browser-based calls.

## The WebRTC Leak Problem

To establish peer-to-peer connections, WebRTC needs to discover your device's IP addresses — including your local network IP and, critically, your public IP. This happens at the browser level, bypassing your VPN.

Even with a VPN active, websites using WebRTC can discover your real public IP address.

## How to Test for WebRTC Leaks

Visit phantomvpn.com/tools and run the WebRTC Leak Test. Connect to PhantomVPN first, then run the test. If your real IP appears, you have a leak.

## How to Fix WebRTC Leaks

### Firefox
1. Type 'about:config' in the address bar
2. Search for 'media.peerconnection.enabled'
3. Set it to 'false'

### Chrome / Edge
Install the extension "WebRTC Control" or "uBlock Origin" (with WebRTC blocking enabled).

### Brave
Brave has built-in WebRTC protection: Settings → Privacy → WebRTC IP Handling Policy → Disable non-proxied UDP.

### Safari
Safari already limits WebRTC exposure compared to Chrome.

## The Nuclear Option

Disable WebRTC entirely in your browser. The downside: Google Meet, Zoom web, and similar tools won't work. Most users should use the targeted blocking approach instead.

## PhantomVPN's Approach

Our browser extensions automatically block WebRTC leaks while keeping video calling functional by routing WebRTC through the VPN tunnel where possible.`,
  },
  {
    title: 'VPN for Gaming: Reduce Lag and Protect Against DDoS',
    slug: 'vpn-for-gaming',
    category: 'guides',
    tags: ['gaming', 'lag', 'ddos', 'protection'],
    readingTime: 8,
    excerpt: 'Can a VPN actually improve your gaming experience? The answer is nuanced. Here\'s when a VPN helps and when it hurts gaming.',
    content: `# VPN for Gaming: Reduce Lag and Protect Against DDoS

## Does a VPN Help Gaming?

The honest answer: it depends. Here's when a VPN helps and when it doesn't.

## When a VPN Helps Gaming

**DDoS Protection:** In competitive gaming, opponents sometimes DDoS (Distributed Denial of Service) players to disconnect them. With a VPN, attackers can't find your real IP — they'd have to DDoS our server, which has enterprise-grade DDoS mitigation.

**Bypassing ISP Throttling:** Some ISPs throttle gaming traffic. A VPN encrypts your traffic so your ISP can't identify it as gaming traffic to throttle.

**Accessing Geo-Locked Content:** Early game releases, region-locked servers, or local servers in other countries.

**Bypassing IP Bans:** If you've been IP banned from a game server (though use this ethically).

## When a VPN Hurts Gaming

**Increased Latency:** VPN adds a hop. If the VPN server is far from the game server, ping increases significantly.

**Packet Loss:** Poor VPN infrastructure can cause packet loss, making games feel laggy.

## Optimal Gaming Setup

1. Choose a VPN server as close to the game server as possible.
2. Use WireGuard protocol — lowest latency overhead.
3. Use a server with low load.
4. Test before competitive play.

## Recommended Servers by Game Region

- **North American servers:** US-East-1 (New York) or US-West-1 (LA)
- **European servers:** DE-1 (Frankfurt) or UK-1 (London)
- **Asian servers:** SG-1 (Singapore) or JP-1 (Tokyo)

## Ping Expectations

Adding a local VPN server should increase your ping by only 5-15ms. This is imperceptible in most games. If ping increases by 50ms+, try a server closer to the game server.`,
  },
  {
    title: 'Zero-Knowledge Architecture: How We Protect Your Privacy',
    slug: 'zero-knowledge-vpn-privacy',
    category: 'privacy',
    tags: ['zero-knowledge', 'no-logs', 'privacy'],
    readingTime: 10,
    excerpt: 'A VPN\'s privacy is only as strong as its architecture. Here\'s exactly how PhantomVPN\'s zero-knowledge design ensures we literally cannot see your data.',
    content: `# Zero-Knowledge Architecture: How We Protect Your Privacy

## The Fundamental Question

Can your VPN provider read your traffic? Can they hand over logs to authorities? These questions are why architecture matters more than promises.

## What "Zero-Knowledge" Really Means

Zero-knowledge means our systems are architecturally incapable of accessing your private data — not just that we've promised not to look.

## Our Architecture

**Encrypted tunnel:** All traffic between your device and our servers is encrypted with AES-256-GCM. Only your device has the decryption keys.

**No connection logs:** We do not log which servers you connect to, when you connect, or how long you stay connected.

**No traffic logs:** We do not log any websites you visit, data you download, or content you access.

**RAM-only servers:** Our VPN servers run entirely in RAM. Every time a server reboots, all data is permanently erased. Nothing is ever written to disk.

**Shared IPs:** Hundreds of users share each IP address simultaneously. Even if someone captured all traffic on our server, they couldn't attribute it to any individual user.

## What We Do Store

We store only:
- Your email address (for account management)
- Hashed password (we can't reverse it)
- Plan and payment status (no payment details)
- Aggregate bandwidth stats per user (to enforce free plan limits) — not tied to specific sites

## Independent Audit

Our no-logs policy has been independently verified by a third-party security auditor. The audit confirms that even PhantomVPN employees cannot access your browsing data.

## Warrant Canary

We publish a monthly warrant canary confirming we have not received secret government orders to compromise user privacy.

## The Bottom Line

Privacy is an architectural problem, not a policy problem. You shouldn't have to trust us — our design means there's nothing to betray.`,
  },
  {
    title: 'How to Set Up WireGuard Manually on Any Device',
    slug: 'wireguard-manual-setup',
    category: 'guides',
    tags: ['wireguard', 'setup', 'manual', 'configuration'],
    readingTime: 13,
    excerpt: 'Don\'t want to install our app? Set up WireGuard manually on Windows, macOS, Linux, Android, or iOS using our config files.',
    content: `# How to Set Up WireGuard Manually on Any Device

## Why Manual Setup?

Manual WireGuard setup gives you maximum control and transparency. You can inspect the config file, use it with custom clients, and integrate it with your existing network setup.

## Step 1: Download Your Config

1. Log into PhantomVPN
2. Go to Settings → Downloads
3. Choose a server
4. Click "Download WireGuard Config"
5. Or scan the QR code for mobile devices

## Windows Setup

1. Download WireGuard from wireguard.com/install
2. Open WireGuard
3. Click "Add Tunnel" → "Import tunnel(s) from file"
4. Select your .conf file
5. Click "Activate"

## macOS Setup

1. Download WireGuard from the Mac App Store
2. Click the WireGuard icon in your menu bar
3. "Manage Tunnels" → "+" → "Import tunnel(s) from file"
4. Select your .conf file
5. Toggle on

## Linux Setup

\`\`\`bash
# Install WireGuard
sudo apt install wireguard  # Debian/Ubuntu
sudo dnf install wireguard-tools  # Fedora

# Copy config
sudo cp phantomvpn-de.conf /etc/wireguard/wg0.conf

# Connect
sudo wg-quick up wg0

# Auto-start on boot
sudo systemctl enable wg-quick@wg0
\`\`\`

## Android Setup

1. Install WireGuard from Google Play Store
2. Open the app → tap "+" → "Scan from QR code"
3. Scan the QR code from your PhantomVPN dashboard
4. Tap the toggle to connect

## iOS Setup

1. Install WireGuard from App Store
2. Open the app → tap "+" → "Create from QR code"
3. Scan your QR code
4. Allow VPN configuration

## Verifying Your Connection

After connecting, visit phantomvpn.com/tools to verify your IP has changed to the VPN server's IP.

## Troubleshooting

**Can't connect:** Check your firewall allows UDP on port 51820.

**DNS not working:** Ensure the DNS line in your config matches a working DNS server.

**Slow speeds:** Try a server closer to your location.`,
  },
  {
    title: 'VPN Comparison: PhantomVPN vs NordVPN vs ExpressVPN vs Surfshark',
    slug: 'phantomvpn-vs-competitors',
    category: 'comparisons',
    tags: ['comparison', 'nordvpn', 'expressvpn', 'surfshark'],
    readingTime: 12,
    excerpt: 'How does PhantomVPN stack up against the biggest names in the industry? We compare price, speed, privacy, and features honestly.',
    content: `# PhantomVPN vs NordVPN vs ExpressVPN vs Surfshark

## The Quick Answer

PhantomVPN delivers comparable security and speed to industry leaders at a fraction of the cost — with a genuinely free tier.

## Feature Comparison

| Feature | PhantomVPN | NordVPN | ExpressVPN | Surfshark |
|---------|-----------|---------|------------|-----------|
| Free Plan | ✅ 10GB/mo | ❌ | ❌ | ❌ |
| Servers | 95+ countries | 60+ countries | 94 countries | 100+ countries |
| Protocol | WireGuard | NordLynx | Lightway | WireGuard |
| No-logs | ✅ Audited | ✅ Audited | ✅ Audited | ✅ Audited |
| Kill Switch | ✅ | ✅ | ✅ | ✅ |
| Split Tunneling | ✅ | ✅ | ✅ | ✅ |
| 2FA | ✅ | ✅ | ❌ | ❌ |
| Price (Pro/mo) | $4.99/yr | $3.99/yr | $6.67/yr | $2.49/yr |

## Speed Comparison

All providers offer fast speeds when using their respective optimized protocols. PhantomVPN's WireGuard implementation consistently achieves 90%+ of your base connection speed.

## Privacy

All four providers have independently audited no-logs policies. PhantomVPN additionally uses RAM-only servers in all locations.

## Value

PhantomVPN offers the best entry point with its free tier — perfect for users who want to try before committing. For paid plans, we offer competitive pricing with no artificial feature gates.

## The Bottom Line

There's no bad choice among these providers. The right choice depends on your specific needs, preferred apps, and budget.`,
  },
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/phantomvpn');
  console.log('Connected to MongoDB for seeding...');

  // Clear existing data
  await Promise.all([
    User.deleteMany({}),
    Server.deleteMany({}),
    Plan.deleteMany({}),
    BlogPost.deleteMany({}),
    Connection.deleteMany({}),
  ]);
  console.log('Cleared existing data');

  // Seed plans
  await Plan.insertMany(PLANS);
  console.log('✅ Plans seeded');

  // Seed servers
  const serverDocs = SERVERS.map(s => ({
    ...s,
    port: 51820,
    load: Math.floor(Math.random() * 70) + 10,
    ping: s.ping + Math.floor(Math.random() * 10),
    currentConnections: Math.floor(Math.random() * 200),
    maxCapacity: 1000,
    speedMbps: 10000,
    isOnline: true,
    publicKey: require('crypto').randomBytes(32).toString('base64'),
  }));
  await Server.insertMany(serverDocs);
  console.log(`✅ ${serverDocs.length} servers seeded`);

  // Seed blog posts
  await BlogPost.insertMany(BLOG_POSTS);
  console.log(`✅ ${BLOG_POSTS.length} blog posts seeded`);

  // Seed admin user
  const admin = new User({
    name: 'PhantomVPN Admin',
    email: 'admin@phantomvpn.com',
    password: 'Admin@123',
    role: 'admin',
    plan: 'business',
    isEmailVerified: true,
    planExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
  });
  await admin.save();

  // Seed test user
  const testUser = new User({
    name: 'Test User',
    email: 'test@phantomvpn.com',
    password: 'Test@123',
    role: 'user',
    plan: 'pro',
    isEmailVerified: true,
    planExpiry: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  });
  await testUser.save();
  console.log('✅ Users seeded (admin@phantomvpn.com / Admin@123 | test@phantomvpn.com / Test@123)');

  // Seed fake connection history for test user
  const servers = await Server.find().limit(10);
  const connectionHistory = servers.map((server, i) => ({
    userId: testUser._id,
    serverId: server._id,
    connectedAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000),
    disconnectedAt: new Date(Date.now() - (i + 1) * 24 * 60 * 60 * 1000 + 3600000),
    duration: 3600,
    dataUploaded: Math.floor(Math.random() * 500 * 1024 * 1024),
    dataDownloaded: Math.floor(Math.random() * 2000 * 1024 * 1024),
    clientIp: `192.168.1.${i + 10}`,
    protocol: 'wireguard',
    isActive: false,
  }));
  await Connection.insertMany(connectionHistory);
  console.log('✅ Connection history seeded');

  console.log('\n🚀 PhantomVPN database seeded successfully!');
  process.exit(0);
}

seed().catch(err => {
  console.error('Seed failed:', err);
  process.exit(1);
});
