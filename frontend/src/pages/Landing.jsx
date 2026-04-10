import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useInView } from 'framer-motion';
import {
  ArrowRight, Shield, Lock, Globe, Zap, Eye,
  Cpu, ChevronRight, CheckCircle, Star,
  Fingerprint, Activity, MousePointer
} from 'lucide-react';
import * as THREE from 'three';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

// ── Animation helpers ─────────────────────────────────────────────
const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

// ── Animated counter ──────────────────────────────────────────────
function Counter({ target, suffix = '' }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-50px' });

  useEffect(() => {
    if (!inView) return;
    const duration = 1800;
    const start = performance.now();
    const tick = (now) => {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 4);
      setCount(Math.floor(eased * target));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, target]);

  return <span ref={ref}>{count.toLocaleString()}{suffix}</span>;
}

// ── Three.js Globe ────────────────────────────────────────────────
function StealthGlobe() {
  const mountRef = useRef(null);

  useEffect(() => {
    if (!mountRef.current) return;
    const container = mountRef.current;
    const W = container.clientWidth;
    const H = container.clientHeight;
    if (W === 0 || H === 0) return;

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setSize(W, H);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 1000);
    camera.position.z = 2.8;

    // Core sphere
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(1, 64, 64),
      new THREE.MeshPhongMaterial({ color: 0x080810, transparent: true, opacity: 0.95 })
    );
    scene.add(globe);

    // Wireframe
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.002, 32, 32),
      new THREE.MeshBasicMaterial({ color: 0xC8FF00, wireframe: true, transparent: true, opacity: 0.04 })
    ));

    // Atmosphere
    scene.add(new THREE.Mesh(
      new THREE.SphereGeometry(1.12, 64, 64),
      new THREE.MeshPhongMaterial({ color: 0xC8FF00, side: THREE.BackSide, transparent: true, opacity: 0.04 })
    ));

    // Lights
    scene.add(new THREE.AmbientLight(0xffffff, 0.15));
    const d1 = new THREE.DirectionalLight(0xC8FF00, 0.8);
    d1.position.set(5, 3, 5);
    scene.add(d1);
    const d2 = new THREE.DirectionalLight(0x00E5FF, 0.4);
    d2.position.set(-5, -3, -5);
    scene.add(d2);

    // Server dots
    const locations = [
      [40.7, -74.0], [51.5, -0.1], [48.8, 2.3], [35.7, 139.7],
      [1.3, 103.8], [52.4, 13.4], [55.8, 37.6], [-33.9, 151.2],
      [19.1, 72.9], [43.7, -79.4], [-23.5, -46.6], [37.6, -122.4],
    ];
    const dotGeo = new THREE.SphereGeometry(0.012, 8, 8);
    const dots = [];
    locations.forEach(([lat, lon]) => {
      const phi = (90 - lat) * (Math.PI / 180);
      const theta = (lon + 180) * (Math.PI / 180);
      const dot = new THREE.Mesh(dotGeo, new THREE.MeshBasicMaterial({ color: 0xC8FF00 }));
      dot.position.setFromSphericalCoords(1.015, phi, theta);
      globe.add(dot);
      dots.push(dot);
    });

    // Arc connections
    const arcMat = new THREE.LineBasicMaterial({ color: 0xC8FF00, transparent: true, opacity: 0.15 });
    for (let i = 0; i < locations.length - 1; i += 2) {
      const [lat1, lon1] = locations[i];
      const [lat2, lon2] = locations[i + 1];
      const p1 = new THREE.Vector3().setFromSphericalCoords(1.015, (90 - lat1) * Math.PI / 180, (lon1 + 180) * Math.PI / 180);
      const p2 = new THREE.Vector3().setFromSphericalCoords(1.015, (90 - lat2) * Math.PI / 180, (lon2 + 180) * Math.PI / 180);
      const mid = new THREE.Vector3().addVectors(p1, p2).multiplyScalar(0.5).normalize().multiplyScalar(1.25);
      const curve = new THREE.QuadraticBezierCurve3(p1, mid, p2);
      globe.add(new THREE.Line(new THREE.BufferGeometry().setFromPoints(curve.getPoints(30)), arcMat));
    }

    // Particles
    const pGeo = new THREE.BufferGeometry();
    const pPos = new Float32Array(300 * 3);
    for (let i = 0; i < 300 * 3; i++) pPos[i] = (Math.random() - 0.5) * 7;
    pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
    scene.add(new THREE.Points(pGeo, new THREE.PointsMaterial({ color: 0xC8FF00, size: 0.008, transparent: true, opacity: 0.25 })));

    let frame;
    const animate = () => {
      frame = requestAnimationFrame(animate);
      globe.rotation.y += 0.002;
      dots.forEach((d, i) => { d.material.opacity = 0.4 + 0.6 * Math.sin(Date.now() * 0.0015 + i * 0.7); });
      renderer.render(scene, camera);
    };
    animate();

    const onResize = () => {
      if (!container) return;
      const nw = container.clientWidth;
      const nh = container.clientHeight;
      if (nw === 0 || nh === 0) return;
      camera.aspect = nw / nh;
      camera.updateProjectionMatrix();
      renderer.setSize(nw, nh);
    };
    window.addEventListener('resize', onResize);

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('resize', onResize);
      renderer.dispose();
      if (container?.contains(renderer.domElement)) container.removeChild(renderer.domElement);
    };
  }, []);

  return <div ref={mountRef} className="w-full h-full" />;
}

// ── Bento Card ────────────────────────────────────────────────────
function BentoCard({ icon, title, desc, className = '', accent = false }) {
  return (
    <motion.div
      variants={fadeUp}
      className={`group relative overflow-hidden rounded-2xl border border-white/[0.06] p-6 md:p-8 transition-all duration-500 hover:border-white/[0.12] ${className}`}
      style={{ background: accent ? 'rgba(200,255,0,0.03)' : 'rgba(255,255,255,0.02)' }}
    >
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-5 transition-colors duration-300 ${
        accent
          ? 'bg-[#C8FF00]/15 text-[#C8FF00] group-hover:bg-[#C8FF00]/25'
          : 'bg-white/[0.06] text-white/60 group-hover:text-[#C8FF00] group-hover:bg-[#C8FF00]/10'
      }`}>
        {icon}
      </div>
      <h3 className="font-display text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/40 leading-relaxed">{desc}</p>
      {accent && (
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-[#C8FF00]/5 rounded-full blur-[60px] pointer-events-none" />
      )}
    </motion.div>
  );
}

// ── Testimonial Card ──────────────────────────────────────────────
function TestimonialCard({ name, role, text }) {
  return (
    <motion.div variants={fadeUp} className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-6 flex flex-col">
      <div className="flex gap-1 mb-4">
        {[...Array(5)].map((_, i) => <Star key={i} size={12} className="text-[#C8FF00] fill-[#C8FF00]" />)}
      </div>
      <p className="text-sm text-white/55 leading-relaxed flex-1 mb-5">&ldquo;{text}&rdquo;</p>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-white/[0.06] flex items-center justify-center text-xs font-bold text-white/60">
          {name.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium text-white/80">{name}</p>
          <p className="text-xs text-white/30">{role}</p>
        </div>
      </div>
    </motion.div>
  );
}

// ══════════════════════════════════════════════════════════════════
//  LANDING PAGE
// ══════════════════════════════════════════════════════════════════
export default function Landing() {
  return (
    <div className="min-h-screen bg-[#050508] overflow-x-hidden">
      <Navbar />

      {/* ═══ HERO ═══════════════════════════════════════════════ */}
      <section className="relative min-h-screen flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0 grid-bg opacity-60" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-[#C8FF00]/[0.03] rounded-full blur-[150px] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 w-full relative z-10">
          <div className="grid lg:grid-cols-[1.1fr_0.9fr] gap-12 items-center py-16 lg:py-24">
            {/* Left — Copy */}
            <motion.div
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            >
              {/* Status badge */}
              <motion.div
                className="inline-flex items-center gap-2.5 px-3.5 py-1.5 rounded-full border border-white/[0.08] bg-white/[0.03] mb-8"
                initial={{ opacity: 0, y: -16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#C8FF00] opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-[#C8FF00]" />
                </span>
                <span className="text-xs font-medium text-white/50">
                  <span className="text-[#C8FF00] font-semibold">2,847</span> users protected right now
                </span>
              </motion.div>

              <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-bold leading-[0.95] tracking-tight mb-6">
                <span className="text-white">Your privacy</span>
                <br />
                <span className="text-white">is not</span>
                <br />
                <span className="text-[#C8FF00]">negotiable.</span>
              </h1>

              <p className="text-base md:text-lg text-white/40 leading-relaxed max-w-md mb-10">
                Military-grade WireGuard encryption. Zero logs. Servers across 95+ countries.
                Connect in one click, vanish from the internet.
              </p>

              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <Link to="/register" className="btn-primary text-sm px-7 py-3.5 group">
                  Get started — it&apos;s free
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link to="/servers" className="btn-secondary text-sm px-7 py-3.5">
                  <Globe size={15} />
                  Browse servers
                </Link>
              </div>

              <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-white/30">
                {['No credit card', 'Free forever plan', '10 Gbps speeds', 'Cancel anytime'].map(item => (
                  <span key={item} className="flex items-center gap-1.5">
                    <CheckCircle size={11} className="text-[#C8FF00]/60" />
                    {item}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right — Globe */}
            <motion.div
              className="relative h-[420px] lg:h-[520px]"
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
            >
              <StealthGlobe />

              <motion.div
                className="absolute top-[8%] left-0 rounded-2xl border border-[#C8FF00]/10 bg-[#0F0F16] px-4 py-3 flex items-center gap-3"
                animate={{ y: [0, -6, 0] }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              >
                <div className="w-8 h-8 rounded-lg bg-[#C8FF00]/10 flex items-center justify-center">
                  <Shield size={14} className="text-[#C8FF00]" />
                </div>
                <div>
                  <p className="text-[10px] text-white/30">Status</p>
                  <p className="text-xs font-semibold text-[#C8FF00]">Protected</p>
                </div>
              </motion.div>

              <motion.div
                className="absolute bottom-[15%] right-0 rounded-2xl border border-white/[0.06] bg-[#0F0F16] px-4 py-3 flex items-center gap-3"
                animate={{ y: [0, 6, 0] }}
                transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
              >
                <div className="w-8 h-8 rounded-lg bg-white/[0.06] flex items-center justify-center">
                  <Activity size={14} className="text-white/50" />
                </div>
                <div>
                  <p className="text-[10px] text-white/30">Latency</p>
                  <p className="text-xs font-semibold text-white/80">12ms</p>
                </div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[#050508] to-transparent pointer-events-none" />
      </section>

      {/* ═══ SOCIAL PROOF ══════════════════════════════════════ */}
      <section className="border-y border-white/[0.04] py-8">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex items-center justify-between flex-wrap gap-6">
            <p className="text-xs text-white/20 uppercase tracking-[0.2em] font-medium">Trusted by</p>
            <div className="flex items-center gap-10 opacity-25">
              {['TechCrunch', 'Wired', 'Forbes', 'TheVerge', 'ArsTechnica'].map(brand => (
                <span key={brand} className="font-display text-sm font-bold text-white tracking-tight whitespace-nowrap">{brand}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ FEATURES — BENTO GRID ═════════════════════════════ */}
      <section id="features" className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div
            className="max-w-2xl mb-16"
            initial="hidden" whileInView="show" viewport={{ once: true, margin: '-80px' }} variants={stagger}
          >
            <motion.p variants={fadeUp} className="section-label mb-4">Why PhantomVPN</motion.p>
            <motion.h2 variants={fadeUp} className="section-title mb-5">
              Built for people who<br /><span className="text-[#C8FF00]">take privacy seriously.</span>
            </motion.h2>
            <motion.p variants={fadeUp} className="text-white/40 text-base leading-relaxed">
              Every feature is meticulously engineered for maximum security,
              zero-compromise performance, and complete invisibility.
            </motion.p>
          </motion.div>

          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
            initial="hidden" whileInView="show" viewport={{ once: true, margin: '-50px' }} variants={stagger}
          >
            <BentoCard icon={<Lock size={20} />} title="AES-256 Encryption" desc="Military-grade encryption that wraps every packet. It would take billions of years for a supercomputer to crack." accent className="lg:row-span-2" />
            <BentoCard icon={<Eye size={20} />} title="Strict Zero Logs" desc="We never store your IP address, browsing activity, or connection timestamps. Independently audited." />
            <BentoCard icon={<Zap size={20} />} title="WireGuard® Protocol" desc="Next-gen tunnel protocol. Faster than OpenVPN, more secure than IPSec, leaner codebase to audit." />
            <BentoCard icon={<Globe size={20} />} title="95+ Countries" desc="Access servers in 95+ countries with sub-second switching. Your gateway to the unrestricted internet." className="lg:col-span-2" accent />
            <BentoCard icon={<Fingerprint size={20} />} title="Kill Switch" desc="Instantly kills all internet traffic if the VPN tunnel drops. Your real IP is never exposed." />
            <BentoCard icon={<Cpu size={20} />} title="Split Tunneling" desc="Route selected apps through the VPN while others connect directly. Maximum flexibility, zero compromise." />
          </motion.div>
        </div>
      </section>

      {/* ═══ HOW IT WORKS ══════════════════════════════════════ */}
      <section className="py-24 md:py-32 px-6 relative">
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div className="text-center mb-20" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeUp} className="section-label mb-4">How it works</motion.p>
            <motion.h2 variants={fadeUp} className="section-title">Connected in <span className="text-[#C8FF00]">3 seconds.</span></motion.h2>
          </motion.div>

          <motion.div className="grid md:grid-cols-3 gap-8 md:gap-12 relative" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <div className="hidden md:block absolute top-10 left-[20%] right-[20%] h-px bg-gradient-to-r from-white/[0.06] via-[#C8FF00]/20 to-white/[0.06]" />
            {[
              { num: '01', title: 'Pick a server', desc: 'Choose from 95+ countries or let our algorithm select the fastest one automatically.' },
              { num: '02', title: 'Encrypt everything', desc: 'Your traffic is wrapped in AES-256 encryption and routed through our secure WireGuard tunnel.' },
              { num: '03', title: 'Vanish completely', desc: "Your real IP is gone. Websites, ISPs, and trackers see only our server. You're invisible." },
            ].map((step) => (
              <motion.div key={step.num} variants={fadeUp} className="text-center">
                <div className="w-20 h-20 rounded-2xl border border-white/[0.08] bg-white/[0.02] flex items-center justify-center mx-auto mb-6">
                  <span className="font-display text-2xl font-bold text-[#C8FF00]">{step.num}</span>
                </div>
                <h3 className="font-display text-lg font-semibold text-white mb-3">{step.title}</h3>
                <p className="text-sm text-white/40 leading-relaxed max-w-[280px] mx-auto">{step.desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ═══ STATS ═════════════════════════════════════════════ */}
      <section className="py-20 px-6">
        <div className="max-w-5xl mx-auto">
          <motion.div className="rounded-2xl border border-white/[0.06] bg-white/[0.015] p-8 md:p-12" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-12">
              {[
                { value: 2800, suffix: 'K+', label: 'Protected users' },
                { value: 95, suffix: '+', label: 'Countries covered' },
                { value: 99, suffix: '.9%', label: 'Uptime guarantee' },
                { value: 10, suffix: ' Gbps', label: 'Server capacity' },
              ].map((stat) => (
                <motion.div key={stat.label} variants={fadeUp} className="text-center">
                  <p className="font-display text-3xl md:text-4xl font-bold text-white mb-1.5">
                    <Counter target={stat.value} />{stat.suffix}
                  </p>
                  <p className="text-xs text-white/30 uppercase tracking-wider font-medium">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ TESTIMONIALS ══════════════════════════════════════ */}
      <section className="py-24 md:py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <motion.div className="mb-14" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <motion.p variants={fadeUp} className="section-label mb-4">Testimonials</motion.p>
            <motion.h2 variants={fadeUp} className="section-title">Trusted by <span className="text-[#C8FF00]">millions.</span></motion.h2>
          </motion.div>

          <motion.div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4" initial="hidden" whileInView="show" viewport={{ once: true }} variants={stagger}>
            <TestimonialCard name="Alex M." role="Security Researcher" text="PhantomVPN is the only VPN I trust for sensitive work. The WireGuard implementation is flawless." />
            <TestimonialCard name="Sarah K." role="Digital Nomad" text="I travel constantly and PhantomVPN never drops. Haven't had a single disconnect in 8 months." />
            <TestimonialCard name="James T." role="Journalist" text="Working in countries with internet censorship requires a reliable VPN. This is the one." />
            <TestimonialCard name="Maria L." role="Developer" text="Split tunneling is genius. VPN for my dev work, direct for gaming. No compromises." />
          </motion.div>
        </div>
      </section>

      {/* ═══ FINAL CTA ═════════════════════════════════════════ */}
      <section className="py-24 md:py-32 px-6 relative">
        <div className="absolute inset-0 grid-bg opacity-40" />
        <div className="max-w-3xl mx-auto relative z-10">
          <motion.div
            className="rounded-3xl border border-white/[0.06] p-10 md:p-16 text-center relative overflow-hidden"
            style={{ background: 'rgba(200,255,0,0.015)' }}
            initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-px bg-gradient-to-r from-transparent via-[#C8FF00]/40 to-transparent" />
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[300px] h-[200px] bg-[#C8FF00]/[0.04] rounded-full blur-[80px] pointer-events-none" />

            <div className="relative z-10">
              <div className="w-14 h-14 rounded-2xl bg-[#C8FF00]/10 border border-[#C8FF00]/20 flex items-center justify-center mx-auto mb-8">
                <Shield size={24} className="text-[#C8FF00]" />
              </div>
              <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight mb-5">
                Ready to go <span className="text-[#C8FF00]">invisible?</span>
              </h2>
              <p className="text-white/40 text-base mb-10 max-w-lg mx-auto leading-relaxed">
                Join 2.8 million users who trust PhantomVPN to protect their digital life.
                Free forever. No credit card required.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link to="/register" className="btn-primary px-8 py-4 text-sm group">
                  Start free now
                  <ArrowRight size={15} className="transition-transform group-hover:translate-x-0.5" />
                </Link>
                <Link to="/pricing" className="btn-secondary px-8 py-4 text-sm">
                  View plans <ChevronRight size={15} />
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
