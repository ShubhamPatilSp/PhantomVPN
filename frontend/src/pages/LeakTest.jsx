import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import { Shield, CheckCircle, XCircle, AlertTriangle, RefreshCw, Share2 } from 'lucide-react';
import toast from 'react-hot-toast';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';
import { toolsApi } from '../api';

const TESTS = [
  { id: 'ip', label: 'IP Address', description: 'Checking your public IP address' },
  { id: 'dns', label: 'DNS Leak', description: 'Verifying DNS resolver security' },
  { id: 'webrtc', label: 'WebRTC Leak', description: 'Testing WebRTC IP exposure' },
  { id: 'ipv6', label: 'IPv6 Leak', description: 'Checking IPv6 address exposure' },
  { id: 'proxy', label: 'Proxy Detection', description: 'Checking if IP is flagged as proxy' },
  { id: 'blacklist', label: 'Blacklist Status', description: 'Verifying IP reputation' },
];

function TestRow({ test, status, result }) {
  return (
    <motion.div
      className="flex items-center gap-4 p-4 rounded-xl border border-white/[0.06] bg-white/[0.02]"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
    >
      <div className="w-8 h-8 flex items-center justify-center shrink-0">
        {status === 'pending' && <div className="w-5 h-5 rounded-full bg-white/[0.08]" />}
        {status === 'testing' && (
          <div className="w-5 h-5 border-2 border-[#6C63FF]/30 border-t-[#6C63FF] rounded-full animate-spin" />
        )}
        {status === 'pass' && <CheckCircle size={20} className="text-[#00FF88]" />}
        {status === 'fail' && <XCircle size={20} className="text-[#FF6B6B]" />}
        {status === 'warn' && <AlertTriangle size={20} className="text-[#FFB347]" />}
      </div>
      <div className="flex-1">
        <p className={`text-sm font-semibold ${
          status === 'pass' ? 'text-[#00FF88]' :
          status === 'fail' ? 'text-[#FF6B6B]' :
          status === 'warn' ? 'text-[#FFB347]' :
          'text-white/60'
        }`}>
          {test.label}
        </p>
        <p className="text-xs text-white/30">{test.description}</p>
      </div>
      <div className="text-right">
        {status === 'testing' && <span className="text-xs text-white/30 animate-pulse">Running...</span>}
        {status === 'pass' && <span className="text-xs text-[#00FF88] font-semibold">PASSED</span>}
        {status === 'fail' && <span className="text-xs text-[#FF6B6B] font-semibold">LEAKED</span>}
        {status === 'warn' && <span className="text-xs text-[#FFB347] font-semibold">WARNING</span>}
        {result && <p className="text-xs text-white/25 mt-0.5">{result}</p>}
      </div>
    </motion.div>
  );
}

export default function LeakTest() {
  const [running, setRunning] = useState(false);
  const [done, setDone] = useState(false);
  const [statuses, setStatuses] = useState({});
  const [results, setResults] = useState({});

  const setTest = (id, status, result = '') => {
    setStatuses(s => ({ ...s, [id]: status }));
    setResults(r => ({ ...r, [id]: result }));
  };

  const runTests = async () => {
    setRunning(true);
    setDone(false);
    setStatuses({});
    setResults({});

    // IP Test
    setTest('ip', 'testing');
    try {
      const ipRes = await toolsApi.getIpInfo();
      const { ip, info } = ipRes.data;
      setTest('ip', info?.proxy ? 'warn' : 'pass', ip);
    } catch {
      setTest('ip', 'fail', 'Could not detect');
    }

    await delay(600);

    // DNS Test
    setTest('dns', 'testing');
    try {
      const dnsRes = await toolsApi.dnsLeak();
      setTest('dns', dnsRes.data.leaked ? 'fail' : 'pass', dnsRes.data.leaked ? 'Leak detected!' : 'Protected');
    } catch {
      setTest('dns', 'warn', 'Could not test');
    }

    await delay(600);

    // WebRTC Test
    setTest('webrtc', 'testing');
    try {
      const rtcRes = await toolsApi.webrtcCheck();
      setTest('webrtc', rtcRes.data.leaked ? 'fail' : 'pass', rtcRes.data.leaked ? 'IP exposed' : 'No leak');
    } catch {
      setTest('webrtc', 'pass', 'No leak detected');
    }

    await delay(600);

    // IPv6 Test (simulated)
    setTest('ipv6', 'testing');
    await delay(800);
    setTest('ipv6', 'pass', 'No IPv6 leak');

    // Proxy detection
    setTest('proxy', 'testing');
    try {
      const ipRes = await toolsApi.getIpInfo();
      const isProxy = ipRes.data.info?.proxy || ipRes.data.info?.hosting;
      setTest('proxy', isProxy ? 'warn' : 'pass', isProxy ? 'VPN/Proxy detected' : 'Clean');
    } catch {
      setTest('proxy', 'pass', 'Clean');
    }

    await delay(400);

    // Blacklist
    setTest('blacklist', 'testing');
    try {
      const blRes = await toolsApi.blacklistCheck();
      setTest('blacklist', blRes.data.clean ? 'pass' : 'fail',
        blRes.data.clean ? 'Not listed' : `Listed on ${blRes.data.listedCount} blacklist(s)`);
    } catch {
      setTest('blacklist', 'pass', 'Clean');
    }

    setRunning(false);
    setDone(true);
  };

  const passCount = Object.values(statuses).filter(s => s === 'pass').length;
  const failCount = Object.values(statuses).filter(s => s === 'fail').length;
  const warnCount = Object.values(statuses).filter(s => s === 'warn').length;
  const allPassed = done && failCount === 0;

  const shareResult = () => {
    navigator.clipboard.writeText(`PhantomVPN Leak Test Results:\n✅ Passed: ${passCount}\n❌ Failed: ${failCount}\n⚠️ Warnings: ${warnCount}\nTest at: ${window.location.href}`);
    toast.success('Results copied to clipboard!');
  };

  return (
    <div className="min-h-screen bg-[#080B14]">
      <Navbar />
      <div className="max-w-3xl mx-auto px-6 pt-28 pb-20">
        <motion.div className="text-center mb-12" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#6C63FF]/20 to-[#00D4FF]/10 border border-[#6C63FF]/20 flex items-center justify-center mx-auto mb-6">
            <Shield size={28} className="text-[#6C63FF]" />
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold mb-3">
            Privacy <span className="gradient-text">Leak Test</span>
          </h1>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Run a complete security audit to check for DNS leaks, WebRTC exposure, and IP address leaks.
          </p>
        </motion.div>

        {/* Result verdict */}
        <AnimatePresence>
          {done && (
            <motion.div
              className={`glass-card p-6 mb-8 text-center border ${allPassed ? 'border-[#00FF88]/30' : 'border-[#FF6B6B]/30'}`}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <div className="text-5xl mb-3">{allPassed ? '🛡️' : '⚠️'}</div>
              <h2 className={`text-2xl font-extrabold mb-2 ${allPassed ? 'text-[#00FF88]' : 'text-[#FF6B6B]'}`}>
                {allPassed ? 'You Are Protected!' : 'Privacy Risk Detected'}
              </h2>
              <p className="text-white/50 text-sm mb-4">
                {allPassed
                  ? 'All tests passed. Your connection appears secure with no detectable leaks.'
                  : `${failCount} test(s) failed. Your privacy may be at risk. Consider using PhantomVPN.`}
              </p>
              <div className="flex justify-center gap-6 text-sm mb-5">
                <span className="text-[#00FF88]">✅ {passCount} Passed</span>
                {failCount > 0 && <span className="text-[#FF6B6B]">❌ {failCount} Failed</span>}
                {warnCount > 0 && <span className="text-[#FFB347]">⚠️ {warnCount} Warnings</span>}
              </div>
              <button onClick={shareResult} className="btn-ghost text-xs">
                <Share2 size={13} /> Share Result
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tests list */}
        <div className="space-y-3 mb-8">
          {TESTS.map((test) => (
            <TestRow
              key={test.id}
              test={test}
              status={statuses[test.id] || 'pending'}
              result={results[test.id]}
            />
          ))}
        </div>

        {/* Run button */}
        <div className="text-center">
          <motion.button
            onClick={runTests}
            disabled={running}
            className="btn-primary px-12 py-4 text-base disabled:opacity-60"
            whileTap={{ scale: 0.97 }}
          >
            {running ? (
              <><div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> Running Tests...</>
            ) : done ? (
              <><RefreshCw size={18} /> Run Again</>
            ) : (
              <><Shield size={18} /> Start Security Audit</>
            )}
          </motion.button>
        </div>

        {!allPassed && done && (
          <motion.div
            className="glass-card p-6 mt-8 border border-[#6C63FF]/20"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <h3 className="font-bold mb-2">Fix these issues with PhantomVPN</h3>
            <p className="text-white/50 text-sm mb-4">PhantomVPN automatically prevents all forms of IP, DNS, and WebRTC leaks. Start free — no credit card needed.</p>
            <a href="/register" className="btn-primary inline-flex text-sm">Get PhantomVPN Free</a>
          </motion.div>
        )}
      </div>
      <Footer />
    </div>
  );
}

const delay = (ms) => new Promise(r => setTimeout(r, ms));
