import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Scale,
  QrCode,
  Building2,
  CheckCircle2,
  ArrowRight,
  Search,
  FileText,
  Award,
  ChevronRight,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';

// ============================================================
// Landing Page
// ============================================================

export default function LandingPage() {
  const navigate = useNavigate();
  const [certId, setCertId] = useState('');

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (certId.trim()) {
      navigate(`/verify?cert=${encodeURIComponent(certId.trim())}`);
    } else {
      navigate('/verify');
    }
  };

  return (
    <div className="bg-white">
      {/* ── Nav ── */}
      <nav className="border-b border-gray-200 sticky top-0 bg-white/95 backdrop-blur-sm z-30">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-7 h-7 text-primary-700" />
            <span className="text-lg font-bold text-gray-900">
              Maanak<span className="text-primary-700">Verify</span>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-6">
            <a href="#how-it-works" className="text-sm text-gray-600 hover:text-gray-900 no-underline">How It Works</a>
            <a href="#verify-quick" className="text-sm text-gray-600 hover:text-gray-900 no-underline">Verify</a>
            <a href="#features" className="text-sm text-gray-600 hover:text-gray-900 no-underline">Features</a>
          </div>
          <div className="flex items-center gap-3">
            <Link to="/verify" className="hidden sm:block text-sm text-gray-600 hover:text-gray-900 no-underline">
              Public Verify
            </Link>
            <Button size="sm" onClick={() => navigate('/login')}>
              Sign In
            </Button>
          </div>
        </div>
      </nav>

      {/* ── Hero ── */}
      <section className="max-w-6xl mx-auto px-4 pt-20 pb-16 text-center">
        <div className="inline-flex items-center gap-2 bg-indigo-50 text-primary-700 text-xs font-semibold px-3 py-1.5 rounded-full mb-6">
          <ShieldCheck className="w-3.5 h-3.5" />
          Under Legal Metrology Act, 2009
        </div>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-4 text-balance">
          Online Verification for<br />
          <span className="text-primary-700">Weighing &amp; Measuring</span> Instruments
        </h1>
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-8">
          MaanakVerify is the official digital platform for registering, inspecting, and certifying
          weighing and measuring instruments. Verify. Certify. Trust.
        </p>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Button size="lg" onClick={() => navigate('/login')} rightIcon={<ArrowRight className="w-4 h-4" />}>
            Get Started
          </Button>
          <Button size="lg" variant="outline" onClick={() => navigate('/verify')}>
            Verify a Certificate
          </Button>
        </div>
      </section>

      {/* ── Stats bar ── */}
      <section className="bg-gray-50 border-y border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
          {[
            { value: '12,450+', label: 'Instruments Certified' },
            { value: '3,200+',  label: 'Businesses Registered' },
            { value: '98.4%',   label: 'Compliance Rate' },
            { value: '24 hrs',  label: 'Avg. Processing Time' },
          ].map(stat => (
            <div key={stat.label}>
              <p className="text-2xl font-bold text-primary-700">{stat.value}</p>
              <p className="text-sm text-gray-500 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── Quick Verify ── */}
      <section id="verify-quick" className="max-w-6xl mx-auto px-4 py-16">
        <div className="bg-white border border-gray-200 rounded-2xl shadow-card p-8 max-w-2xl mx-auto text-center">
          <div className="w-12 h-12 bg-teal-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <QrCode className="w-6 h-6 text-teal-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Verify a Certificate Instantly</h2>
          <p className="text-sm text-gray-500 mb-6">
            Enter a certificate number to check its validity status.
          </p>
          <form onSubmit={handleVerify} className="flex gap-3">
            <Input
              placeholder="e.g. MV/DL/CERT/2024/00123"
              value={certId}
              onChange={e => setCertId(e.target.value)}
              leftIcon={<Search className="w-4 h-4" />}
              wrapperClass="flex-1"
            />
            <Button type="submit">
              Verify
            </Button>
          </form>
          <p className="text-xs text-gray-400 mt-3">
            Or scan the QR code on the instrument's certificate sticker.
          </p>
        </div>
      </section>

      {/* ── How It Works ── */}
      <section id="how-it-works" className="bg-gray-50 border-y border-gray-200 py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">How MaanakVerify Works</h2>
            <p className="text-gray-500 mt-2">A streamlined four-step process from registration to certification</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01',
                icon: <Building2 className="w-5 h-5" />,
                title: 'Register Business',
                desc: 'Create your business account and register your weighing or measuring instruments.',
              },
              {
                step: '02',
                icon: <FileText className="w-5 h-5" />,
                title: 'Submit Application',
                desc: 'Fill out the verification application with instrument details and upload documents.',
              },
              {
                step: '03',
                icon: <Scale className="w-5 h-5" />,
                title: 'Inspector Visits',
                desc: 'A certified Legal Metrology Inspector conducts physical inspection and measurement tests.',
              },
              {
                step: '04',
                icon: <Award className="w-5 h-5" />,
                title: 'Receive Certificate',
                desc: 'Upon approval, a digital certificate with QR code is issued — verifiable by anyone.',
              },
            ].map((s, i) => (
              <div key={s.step} className="relative">
                <div className="bg-white border border-gray-200 rounded-xl p-5 h-full shadow-card">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-xs font-bold text-gray-300">{s.step}</span>
                    <div className="w-9 h-9 bg-primary-50 rounded-lg flex items-center justify-center text-primary-700">
                      {s.icon}
                    </div>
                  </div>
                  <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{s.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
                </div>
                {i < 3 && (
                  <div className="hidden lg:flex absolute top-1/2 -right-3 -translate-y-1/2 z-10">
                    <ChevronRight className="w-5 h-5 text-gray-300" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="py-16">
        <div className="max-w-6xl mx-auto px-4">
          <div className="text-center mb-10">
            <h2 className="text-2xl font-bold text-gray-900">Platform Features</h2>
            <p className="text-gray-500 mt-2">Built for businesses, inspectors, and regulators</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[
              {
                icon: <ShieldCheck className="w-5 h-5 text-primary-700" />,
                title: 'Tamper-proof Certificates',
                desc: 'Every certificate has a unique QR code that can be scanned to verify authenticity instantly.',
              },
              {
                icon: <Scale className="w-5 h-5 text-teal-600" />,
                title: 'Measurement Test Records',
                desc: 'Detailed measurement test logs with pass/fail results and inspector remarks.',
              },
              {
                icon: <FileText className="w-5 h-5 text-primary-700" />,
                title: 'End-to-End Digital Workflow',
                desc: 'From application to certificate, the entire process is paperless and trackable online.',
              },
              {
                icon: <Building2 className="w-5 h-5 text-teal-600" />,
                title: 'Multi-business Support',
                desc: 'Register multiple businesses and manage all your instruments under one account.',
              },
              {
                icon: <Award className="w-5 h-5 text-primary-700" />,
                title: 'Real-time Status Tracking',
                desc: 'Track your application status from submission through inspection to certificate issuance.',
              },
              {
                icon: <QrCode className="w-5 h-5 text-teal-600" />,
                title: 'Public QR Verification',
                desc: 'Anyone — consumer, inspector, or auditor — can verify a certificate using its QR code or number.',
              },
            ].map(f => (
              <div key={f.title} className="bg-white border border-gray-200 rounded-xl p-5 shadow-card">
                <div className="w-9 h-9 bg-gray-50 rounded-lg flex items-center justify-center mb-3">
                  {f.icon}
                </div>
                <h3 className="text-sm font-semibold text-gray-900 mb-1.5">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="bg-primary-700 py-14">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-2xl font-bold text-white mb-3">Ready to get your instruments certified?</h2>
          <p className="text-indigo-200 mb-7">
            Join thousands of businesses that trust MaanakVerify for Legal Metrology compliance.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              size="lg"
              variant="secondary"
              onClick={() => navigate('/login')}
              rightIcon={<ArrowRight className="w-4 h-4" />}
            >
              Register Your Business
            </Button>
            <Button
              size="lg"
              variant="ghost"
              onClick={() => navigate('/verify')}
              className="text-white hover:bg-white/10"
            >
              Verify a Certificate
            </Button>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-gray-900 text-gray-400 py-10">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex flex-col sm:flex-row items-start justify-between gap-6 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <span className="font-bold text-white">MaanakVerify</span>
              </div>
              <p className="text-xs text-gray-500 max-w-xs">
                Official platform for online verification of weighing and measuring instruments under
                the Legal Metrology Act, 2009.
              </p>
            </div>
            <div className="flex gap-10">
              <div>
                <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Portal</p>
                <div className="space-y-1.5">
                  <Link to="/login" className="block text-xs text-gray-500 hover:text-gray-300 no-underline">Business Login</Link>
                  <Link to="/login" className="block text-xs text-gray-500 hover:text-gray-300 no-underline">Inspector Login</Link>
                  <Link to="/verify" className="block text-xs text-gray-500 hover:text-gray-300 no-underline">Verify Certificate</Link>
                </div>
              </div>
              <div>
                <p className="text-xs font-semibold text-gray-300 uppercase tracking-wider mb-2">Legal</p>
                <div className="space-y-1.5">
                  <span className="block text-xs text-gray-500">Legal Metrology Act, 2009</span>
                  <span className="block text-xs text-gray-500">Privacy Policy</span>
                  <span className="block text-xs text-gray-500">Terms of Use</span>
                </div>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-800 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
            <p className="text-xs text-gray-600">
              © {new Date().getFullYear()} MaanakVerify — Department of Legal Metrology, Government of India
            </p>
            <div className="flex items-center gap-1 text-xs text-gray-600">
              <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
              System Status: Operational
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
