import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  Zap, Shield, Lock, Globe, Activity, Cpu, Eye, ArrowRight,
  CheckCircle, Star, ChevronDown, Server, Users, Wifi
} from 'lucide-react';
import * as THREE from 'three';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import useVpnStore from '../store/vpnStore';

// ── Animated Counter ──────────────────────────────────────────────
function AnimatedCounter({ target, duration = 2000, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });

  useEffect(() => {
    if (!inView) return;
    const start = Date.now();
    const timer = setInterval(() => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.floor(eased * target));
      if (progress >= 1) clearInterval(timer);
    }, 16);
    return () => clearInterval(timer);
  }, [inView, target, duration]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Typing Animation ──────────────────────────────────────────────
const TYPING_PHRASES = ['Browse Privately.', 'Stay Secure.', 'Be Invisible.', 'Stream Freely.'];

function TypingText() {
  const [phraseIndex, setPhraseIndex] = useState(0);
  const [displayed, setDisplayed] = useState('');
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const phrase = TYPING_PHRASES[phraseIndex];
    if (!deleting && displayed === phrase) {
      const t = setTimeout(() => setDeleting(true), 1800);
      return () => clearTimeout(t);
    }
    if (deleting && displayed === '') {
      setDeleting(false);
      setPhraseIndex((i) => (i + 1) % TYPING_PHRASES.length);
      return;
    }
    const t = setTimeout(() => {
      setDisplayed((prev) =>
        deleting ? prev.slice(0, -1) : phrase.slice(0, prev.length + 1)
      );
    }, deleting ? 40 : 80);
    return () => clearTimeout(t);
  }, [displayed, deleting, phraseIndex]);

  return (
    <span className="gradient-text">
      {displayed}
      <span className="animate-pulse">|</span>
    </span>
  );
}

// ── Three.js Globe ────────────────────────────────────────────────
function Globe3D() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const W = mountRef.current.clientWidth;
    const H = mountRef.current.clientHeight;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    mountRef.current.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = 3;

    // Globe sphere
    const geo = new THREE.SphereGeometry(1, 64, 64);
    const mat = new THREE.MeshPhongMaterial({
      color: 0x0a0e1a,
      wireframe: false,
      transparent: true,
      opacity: 0.9,
    });
    const globe = new THREE.Mesh(geo, mat);
    scene.add(globe);

    // Wireframe overlay
    const wireGeo = new THREE.SphereGeometry(1.001, 24, 24);
    const wireMat = new THREE.MeshBasicMaterial({
      color: 0x6C63FF,
      wireframe: true,
      transparent: true,
      opacity: 0.08,
    });
    scene.add(new THREE.Mesh(wireGeo, wireMat));

    // Atmosphere glow
    const atmGeo = new THREE.SphereGeometry(1.15, 64, 64);
    const atmMat = new THREE.MeshPhongMaterial({
      color: 0x6C63FF,
      side: THREE.BackSide,
      transparent: true,
      opacity: 0.08,
    });
    scene.add(new THREE.Mesh(atmGeo, atmMat));

    // Lights
    scene.add(new THREE.AmbientLight(0x6C63FF, 0.4));
    const dLight = new THREE.DirectionalLight(0x00D4FF, 1.2);
    dLight.position.set(5, 3, 5);
    scene.add(dLight);
    const dLight2 = new THREE.DirectionalLight(0x6C63FF, 0.8);
    dLight2.position.set(-5, -3, -5);
    scene.add(dLight2);

    // Connection dots (server locations)
    const locations = [
      [40.7, -74.0], [51.5, -0.1], [48.8, 2.3], [35.7, 139.7],
      [1.3, 103.8], [52.4, 13.4], [55.8, 37.6], [-33.9, 151.2],
      [19.1, 72.9], [43.7, -79.4], [-23.5, -46.6],
    ];

    const dotGeo = new THREE.SphereGeometry(0.015, 8, 8);
    const dotMat = new THREE.MeshBasicMaterial({ color: 0x00D4FF });
    const dots = [];
    locations.forEach(([lat, lon]) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const dot = new THREE.Mesh(dotGeo, dotMat.clone());
      dot.position.setFromSphericalCoords(1.01, phi, theta);
      globe.add(dot);
      dots.push(dot);
    });

    // Connection lines between dots
    const lineMat = new THREE.LineBasicMaterial({
      color: 0x6C63FF, transparent: true, opacity: 0.3
    });
    for (let i = 0; i < locations.length - 1; i += 2) {
      const [lat1, lon1] = locations[i];
      const [lat2, lon2] = locations[i + 1];
      const p1 = new THREE.Vector3();
      const p2 = new THREE.Vector3();
      p1.setFromSphericalCoords(1.01,
        (90 - lat1) * Math.PI / 180, (lon1 + 180) * Math.PI / 180);
      p2.setFromSphericalCoords(1.01,
        (90 - lat2) * Math.PI / 180, (lon2 + 180) * Math.PI / 180);
      const midpoint = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5);
      midpoint.normalize().multiplyScalar(1.3);
      const curve = new THREE.QuadraticBezierCurve3(p1, midpoint, p2);
      const points = curve.getPoints(30);
      const lineGeo = new THREE.BufferGeometry().setFromPoints(points);
      globe.add(new THREE.Line(lineGeo, lineMat));
    }

    // Particles
    const pGeo = new THREE.BufferGeometry();
    const pCount = 600;
    const positions = new Float32Array(pCount * 3);
    for (let i = 0; i < pCount * 3; i++) positions[i] = (Math.random() - 0.5) * 8;
    pGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const pMat = new THREE.PointsMaterial({ color: 0x6C63FF, size: 0.012, transparent: true, opacity: 0.4 });
    scene.add(new THREE.Points(pGeo, pMat));

    // Animation
    let frame;
    let isDragging = false;
    let lastX = 0;
    let rotSpeed = 0.003;

    const onMouseDown = (e) => { isDragging = true; lastX = e.clientX; };
    const onMouseUp = () => { isDragging = false; };
    const onMouseMove = (e) => {
      if (!isDragging) return;
      globe.rotation.y += (e.clientX - lastX) * 0.005;
      lastX = e.clientX;
    };
    renderer.domElement.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);
    window.addEventListener('mousemove', onMouseMove);

    const animate = () => {
      frame = requestAnimationFrame(animate);
      if (!isDragging) globe.rotation.y += rotSpeed;
      dots.forEach((d, i) => {
        const t = Date.now() * 0.001 + i * 0.5;
        d.material.opacity = 0.5 + 0.5 * Math.sin(t);
      });
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!mountRef.current) return;
      const nw = mountRef.current.clientWidth;
      const nh = mountRef.current.clientHeight;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mousemove', onMouseMove);
      renderer.dispose();
      if (mountRef.current?.contains(renderer.domElement)) {
        mountRef.current.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}

// ── Features ──────────────────────────────────────────────────────
const FEATURES = [
  { icon: <Lock size={22} />, title: 'AES-256 Encryption', desc: 'Military-grade encryption that would take billions of years to crack.' },
  { icon: <Eye size={22} />, title: 'Zero Logs Policy', desc: 'We never store your IP, activity, or connection timestamps. Verified.' },
  { icon: <Zap size={22} />, title: '10 Gbps Servers', desc: 'Ultra-fast servers for streaming, gaming, and downloading at full speed.' },
  { icon: <Globe size={22} />, title: '95+ Countries', desc: 'Access servers in 95+ countries with one click from any device.' },
  { icon: <Shield size={22} />, title: 'Kill Switch', desc: 'Instantly cuts internet if VPN drops, so your IP is never exposed.' },
  { icon: <Cpu size={22} />, title: 'Split Tunneling', desc: 'Choose exactly which apps use the VPN and which connect directly.' },
];

const TESTIMONIALS = [
  { name: 'Alex M.', role: 'Security Researcher', text: 'PhantomVPN is the only VPN I trust for sensitive work. The WireGuard implementation is flawless and speeds are incredible.', stars: 5 },
  { name: 'Sarah K.', role: 'Digital Nomad', text: 'I travel constantly and PhantomVPN keeps me connected to Netflix back home. Haven\'t had a single disconnect in 8 months.', stars: 5 },
  { name: 'James T.', role: 'Journalist', text: 'Working in countries with internet censorship requires a reliable VPN. PhantomVPN\'s obfuscated servers are a lifesaver.', stars: 5 },
  { name: 'Maria L.', role: 'Software Developer', text: 'The split tunneling feature is genius. VPN for my dev work, direct connection for gaming. No compromises.', stars: 5 },
];

const HOW_IT_WORKS = [
  { step: '01', title: 'Choose a Server', desc: 'Pick from 95+ countries or let our smart algorithm select the fastest server for you.' },
  { step: '02', title: 'Encrypt & Connect', desc: 'Your traffic is wrapped in AES-256 encryption and routed through our secure tunnel.' },
  { step: '03', title: 'Browse Invisibly', desc: 'Your real IP is hidden. Websites see only our server\'s IP. You\'re completely private.' },
];

export default function Landing() {
  const { activeUsers } = useVpnStore();

  return (
    <div className="min-h-screen bg-[#080B14] overflow-x-hidden">
      <Navbar />

      {/* ── HERO ──────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden pt-16">
        {/* Background gradients */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-[600px] h-[600px] bg-[#6C63FF]/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-[#00D4FF]/08 rounded-full blur-[100px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-12 items-center w-full py-20 relative z-10">
          {/* Left content */}
          <motion.div
            initial={{ opacity: 0, x: -40 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, ease: 'easeOut' }}
          >
            {/* Badge */}
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[#6C63FF]/10 border border-[#6C63FF]/20 text-sm text-[#6C63FF] font-medium mb-8"
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
            >
              <div className="w-2 h-2 rounded-full bg-[#00FF88] animate-pulse" />
              <AnimatedCounter target={activeUsers} duration={1500} /> users protected right now
            </motion.div>

            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight leading-[1.05] mb-6">
              <span className="text-white">The World's</span>
              <br />
              <span className="text-white">Most Private</span>
              <br />
              <TypingText />
            </h1>

            <p className="text-xl text-white/55 leading-relaxed mb-10 max-w-lg">
              Military-grade encryption, zero-logs policy, and 10Gbps servers across 95+ countries.
              Your online freedom starts here.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 mb-12">
              <Link to="/register" className="btn-primary text-base px-8 py-4 animate-glow">
                <Zap size={18} />
                Start Free — No Credit Card
                <ArrowRight size={16} />
              </Link>
              <Link to="/servers" className="btn-secondary text-base px-8 py-4">
                <Globe size={18} />
                View 95+ Servers
              </Link>
            </div>

            {/* Trust indicators */}
            <div className="flex flex-wrap gap-5 text-sm text-white/40">
              {['No credit card required', 'Free forever plan', '30-day money back'].map((item) => (
                <div key={item} className="flex items-center gap-1.5">
                  <CheckCircle size={14} className="text-[#00FF88]" />
                  {item}
                </div>
              ))}
            </div>
          </motion.div>

          {/* Globe */}
          <motion.div
            className="relative h-[480px] lg:h-[580px]"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <Globe3D />
            {/* Floating stats */}
            <FloatingStat top="10%" left="0" icon={<Server size={14} />} label="Servers Online" value="2,847" color="cyan" />
            <FloatingStat top="60%" right="0" icon={<Shield size={14} />} label="Threats Blocked" value="1.2M" color="purple" />
            <FloatingStat bottom="10%" left="20%" icon={<Activity size={14} />} label="Avg Speed" value="950ms" color="green" />
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 text-white/20"
          animate={{ y: [0, 8, 0] }}
          transition={{ repeat: Infinity, duration: 2 }}
        >
          <span className="text-xs tracking-widest">SCROLL</span>
          <ChevronDown size={16} />
        </motion.div>
      </section>

      {/* ── TRUSTED BY ────────────────────────────────────── */}
      <section className="border-y border-white/[0.05] py-10 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6">
          <p className="text-center text-white/25 text-sm font-medium uppercase tracking-widest mb-8">
            As Featured In
          </p>
          <div className="flex items-center justify-center flex-wrap gap-10 opacity-40">
            {['TechCrunch', 'Wired', 'Forbes', 'The Verge', 'Ars Technica', 'PCMag'].map((brand) => (
              <span key={brand} className="text-white font-bold text-lg tracking-tight">{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES ──────────────────────────────────────── */}
      <section id="features" className="py-28 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <p className="text-[#6C63FF] font-semibold text-sm uppercase tracking-widest mb-3">Why PhantomVPN</p>
            <h2 className="section-title mb-4">
              Privacy Without <span className="gradient-text">Compromise</span>
            </h2>
            <p className="text-white/50 text-lg max-w-2xl mx-auto">
              Every feature is engineered to protect your identity and keep you invisible online.
            </p>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <motion.div
                key={f.title}
                className="glass-card-hover p-6 group"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.08, duration: 0.5 }}
              >
                <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-[#6C63FF]/20 to-[#00D4FF]/10 border border-[#6C63FF]/20 flex items-center justify-center text-[#6C63FF] mb-5 group-hover:shadow-lg group-hover:shadow-[#6C63FF]/20 transition-shadow">
                  {f.icon}
                </div>
                <h3 className="text-base font-bold text-white mb-2">{f.title}</h3>
                <p className="text-sm text-white/50 leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ──────────────────────────────────── */}
      <section className="py-24 px-6 bg-gradient-to-b from-transparent via-[#6C63FF]/[0.04] to-transparent">
        <div className="max-w-5xl mx-auto">
          <motion.div
            className="text-center mb-16"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title mb-4">How It <span className="gradient-text">Works</span></h2>
            <p className="text-white/50 text-lg">Connected in seconds. Protected forever.</p>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8 relative">
            {/* Connecting line */}
            <div className="hidden md:block absolute top-12 left-[25%] right-[25%] h-px bg-gradient-to-r from-[#6C63FF]/40 via-[#00D4FF]/40 to-[#6C63FF]/40" />

            {HOW_IT_WORKS.map((step, i) => (
              <motion.div
                key={step.step}
                className="text-center relative"
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
              >
                <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-[#6C63FF]/15 to-[#00D4FF]/08 border border-[#6C63FF]/20 flex items-center justify-center mx-auto mb-6">
                  <span className="text-3xl font-extrabold gradient-text">{step.step}</span>
                </div>
                <h3 className="text-lg font-bold text-white mb-3">{step.title}</h3>
                <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS ─────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <div className="glass-card p-10">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: activeUsers, suffix: '+', label: 'Protected Users', icon: <Users size={20} /> },
                { value: 95, suffix: '+', label: 'Countries', icon: <Globe size={20} /> },
                { value: 99.9, suffix: '%', label: 'Uptime', icon: <Activity size={20} /> },
                { value: 10, suffix: ' Gbps', label: 'Server Speed', icon: <Wifi size={20} /> },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  className="text-center"
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                >
                  <div className="text-[#6C63FF]/60 flex justify-center mb-3">{stat.icon}</div>
                  <div className="text-3xl md:text-4xl font-extrabold gradient-text mb-1">
                    <AnimatedCounter target={stat.value} />{stat.suffix}
                  </div>
                  <p className="text-white/40 text-sm font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────── */}
      <section className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="text-center mb-14"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h2 className="section-title mb-4">Trusted by <span className="gradient-text">Millions</span></h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <motion.div
                key={t.name}
                className="glass-card p-6"
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="flex gap-0.5 mb-4">
                  {[...Array(t.stars)].map((_, j) => (
                    <Star key={j} size={13} className="text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
                <p className="text-white/70 text-sm leading-relaxed mb-5">"{t.text}"</p>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-white/40">{t.role}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────── */}
      <section className="py-28 px-6">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            className="glass-card p-14 relative overflow-hidden"
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-[#6C63FF]/10 via-transparent to-[#00D4FF]/08 pointer-events-none" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-px bg-gradient-to-r from-transparent via-[#6C63FF]/50 to-transparent" />
            <div className="relative z-10">
              <div className="text-5xl mb-5">🛡️</div>
              <h2 className="text-4xl md:text-5xl font-extrabold mb-5 leading-tight">
                Start Browsing <span className="gradient-text">Privately</span> Today
              </h2>
              <p className="text-white/55 text-lg mb-10 max-w-2xl mx-auto">
                Join over 2.8 million users who trust PhantomVPN to protect their privacy. Free forever. No credit card.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link to="/register" className="btn-primary text-base px-10 py-4 animate-glow">
                  <Zap size={18} />
                  Get PhantomVPN Free
                </Link>
                <Link to="/pricing" className="btn-secondary text-base px-10 py-4">
                  View Plans
                  <ArrowRight size={16} />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}

function FloatingStat({ top, bottom, left, right, icon, label, value, color }) {
  const colorMap = {
    cyan: 'border-[#00D4FF]/20 bg-[#00D4FF]/08 text-[#00D4FF]',
    purple: 'border-[#6C63FF]/20 bg-[#6C63FF]/08 text-[#6C63FF]',
    green: 'border-[#00FF88]/20 bg-[#00FF88]/08 text-[#00FF88]',
  };
  return (
    <motion.div
      className={`absolute glass-card border ${colorMap[color]} px-4 py-3 flex items-center gap-2.5 min-w-[140px]`}
      style={{ top, bottom, left, right }}
      animate={{ y: [0, -6, 0] }}
      transition={{ duration: 4 + Math.random() * 2, repeat: Infinity, ease: 'easeInOut' }}
    >
      <div className="shrink-0">{icon}</div>
      <div>
        <p className="text-xs text-white/40 leading-none mb-0.5">{label}</p>
        <p className="text-sm font-bold text-white leading-none">{value}</p>
      </div>
    </motion.div>
  );
}
