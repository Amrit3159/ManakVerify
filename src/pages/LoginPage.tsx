import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Microscope,
  LayoutDashboard,
  Eye,
  EyeOff,
  ArrowRight,
  Lock,
  Mail,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { DEMO_USERS } from '@/data/mockData';

// ============================================================
// Role icon map
// ============================================================

const RoleIcon = ({ role }: { role: string }) => {
  const cls = 'w-5 h-5';
  if (role === 'business')  return <Building2   className={cls} />;
  if (role === 'inspector') return <Microscope  className={cls} />;
  if (role === 'admin')     return <LayoutDashboard className={cls} />;
  return null;
};

const roleColorMap: Record<string, string> = {
  business:  'bg-indigo-50 text-primary-700 border-indigo-200',
  inspector: 'bg-teal-50 text-teal-700 border-teal-200',
  admin:     'bg-orange-50 text-orange-700 border-orange-200',
};

const roleActiveBorder: Record<string, string> = {
  business:  'border-indigo-400',
  inspector: 'border-teal-500',
  admin:     'border-orange-400',
};

// ============================================================
// Login Page
// ============================================================

export default function LoginPage() {
  const navigate    = useNavigate();
  const { login, loginAsDemo, isAuthenticated, user } = useAuth();

  const [tab, setTab]           = useState<'demo' | 'email'>('demo');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  // If already logged in, redirect
  React.useEffect(() => {
    if (isAuthenticated && user) {
      navigate(redirectFor(user.role), { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const redirectFor = (role: string) => {
    if (role === 'business')  return '/business/dashboard';
    if (role === 'inspector') return '/inspector/dashboard';
    if (role === 'admin')     return '/admin/dashboard';
    return '/';
  };

  const handleDemoLogin = (userId: string, role: string) => {
    loginAsDemo(userId);
    navigate(redirectFor(role));
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (result.success) {
      // redirect handled by useEffect above
    } else {
      setError(result.error ?? 'Login failed.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 no-underline">
            <ShieldCheck className="w-6 h-6 text-primary-700" />
            <span className="font-bold text-gray-900">
              Maanak<span className="text-primary-700">Verify</span>
            </span>
          </Link>
          <Link to="/verify" className="text-sm text-gray-500 hover:text-gray-800 no-underline">
            Verify Certificate →
          </Link>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-lg">
          {/* Heading */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-primary-50 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <ShieldCheck className="w-7 h-7 text-primary-700" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Sign in to MaanakVerify</h1>
            <p className="text-sm text-gray-500 mt-1.5">
              Select your role below or enter your credentials
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex bg-gray-100 rounded-lg p-1 mb-6">
            <button
              onClick={() => setTab('demo')}
              className={[
                'flex-1 text-sm font-medium py-2 rounded-md transition-all',
                tab === 'demo'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              Demo Access
            </button>
            <button
              onClick={() => setTab('email')}
              className={[
                'flex-1 text-sm font-medium py-2 rounded-md transition-all',
                tab === 'email'
                  ? 'bg-white text-gray-900 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700',
              ].join(' ')}
            >
              Email & Password
            </button>
          </div>

          {/* Demo tab */}
          {tab === 'demo' && (
            <div className="space-y-3 animate-fade-in">
              <p className="text-xs text-center text-gray-400 mb-4">
                Click any role card below to instantly access the demo
              </p>
              {DEMO_USERS.map(du => (
                <button
                  key={du.userId}
                  onClick={() => handleDemoLogin(du.userId, du.role)}
                  className={[
                    'w-full text-left bg-white border-2 rounded-xl p-4',
                    'flex items-start gap-4',
                    'hover:shadow-card-hover transition-all duration-150',
                    roleActiveBorder[du.role],
                  ].join(' ')}
                >
                  <div className={[
                    'w-10 h-10 rounded-lg flex items-center justify-center shrink-0 border',
                    roleColorMap[du.role],
                  ].join(' ')}>
                    <RoleIcon role={du.role} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900">{du.label}</p>
                      <ArrowRight className="w-4 h-4 text-gray-400 shrink-0" />
                    </div>
                    <p className="text-xs text-gray-500 mt-0.5">{du.name} — {du.email}</p>
                    <p className="text-xs text-gray-400 mt-1 leading-relaxed">{du.description}</p>
                  </div>
                </button>
              ))}

              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <p className="text-xs text-gray-500 text-center">
                  <strong>Demo:</strong> No registration required. Click any role to explore the full platform.
                </p>
              </div>
            </div>
          )}

          {/* Email tab */}
          {tab === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-4 animate-fade-in">
              <Input
                id="login-email"
                label="Email Address"
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                leftIcon={<Mail className="w-4 h-4" />}
                required
                autoComplete="email"
              />
              <Input
                id="login-password"
                label="Password"
                type={showPass ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                leftIcon={<Lock className="w-4 h-4" />}
                rightIcon={
                  <button
                    type="button"
                    onClick={() => setShowPass(p => !p)}
                    className="text-gray-400 hover:text-gray-600"
                    tabIndex={-1}
                  >
                    {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                }
                required
                autoComplete="current-password"
                error={error}
              />
              <Button type="submit" fullWidth size="lg" isLoading={loading}>
                Sign In
              </Button>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mt-2">
                <p className="text-xs font-semibold text-gray-700 mb-1.5">Demo Credentials</p>
                <div className="space-y-1 text-xs text-gray-500 font-mono">
                  <p>rajesh@kumarweighing.in / demo1234 (Business)</p>
                  <p>priya.sharma@legalmetrology.gov.in / demo1234 (Inspector)</p>
                  <p>vikram.singh@legalmetrology.gov.in / demo1234 (Admin)</p>
                </div>
              </div>
            </form>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center">
        <p className="text-xs text-gray-400">
          © {new Date().getFullYear()} MaanakVerify — Department of Legal Metrology, Government of India
        </p>
      </footer>
    </div>
  );
}
