import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import {
  ShieldCheck,
  Building2,
  Eye,
  EyeOff,
  Lock,
  Mail,
  User as UserIcon,
  Phone,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  HelpCircle,
  KeyRound,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Modal } from '@/components/ui/Modal';

export default function LoginPage() {
  const navigate = useNavigate();
  const {
    login,
    register,
    resetPassword,
    loginAsDemo,
    isAuthenticated,
    user,
  } = useAuth();

  const [tab, setTab] = useState<'signin' | 'signup'>('signin');

  // Sign In state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);

  // Sign Up state
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regBusiness, setRegBusiness] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirmPassword, setRegConfirmPassword] = useState('');
  const [showRegPass, setShowRegPass] = useState(false);

  // Status & Feedback
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [loading, setLoading] = useState(false);

  // Forgot Password Modal
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotEmail, setForgotEmail] = useState('');
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotMsg, setForgotMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Test credentials accordion
  const [showDemoCredentials, setShowDemoCredentials] = useState(false);

  // Redirect once authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      const target =
        user.role === 'business'
          ? '/business/dashboard'
          : user.role === 'inspector'
          ? '/inspector/dashboard'
          : user.role === 'admin'
          ? '/admin/dashboard'
          : '/';
      navigate(target, { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  // Handle Email & Password Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');
    setLoading(true);

    const result = await login(email, password);
    setLoading(false);

    if (!result.success) {
      setError(result.error ?? 'Sign in failed. Please try again.');
    }
  };

  // Handle Account Registration
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    if (regPassword !== regConfirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (regPassword.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }

    setLoading(true);
    const result = await register(
      regName,
      regEmail,
      regPassword,
      regPhone,
      regBusiness
    );
    setLoading(false);

    if (result.success) {
      setSuccessMsg('Account created successfully! A verification email has been sent to your inbox.');
    } else {
      setError(result.error ?? 'Registration failed. Please try again.');
    }
  };

  // Handle Forgot Password
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotMsg(null);
    setForgotLoading(true);

    const result = await resetPassword(forgotEmail);
    setForgotLoading(false);

    if (result.success) {
      setForgotMsg({
        type: 'success',
        text: 'Password reset link sent! Please check your email inbox.',
      });
    } else {
      setForgotMsg({
        type: 'error',
        text: result.error || 'Failed to send password reset email.',
      });
    }
  };

  // Quick fill helper for review/testing
  const handleQuickFill = (testEmail: string, testPass: string) => {
    setTab('signin');
    setEmail(testEmail);
    setPassword(testPass);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 flex flex-col">
      {/* Top Header */}
      <header className="bg-white/80 backdrop-blur border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2.5 no-underline">
            <div className="w-8 h-8 rounded-lg bg-primary-700 flex items-center justify-center text-white shadow-sm">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span className="font-bold text-gray-900 text-base tracking-tight">
              Maanak<span className="text-primary-700">Verify</span>
            </span>
          </Link>
          <Link
            to="/verify"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary-700 hover:text-primary-800 bg-primary-50 hover:bg-primary-100 px-3 py-1.5 rounded-lg transition-colors no-underline"
          >
            <span>Public Verification</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Main Authentication Card Container */}
      <main className="flex-1 flex items-center justify-center py-10 px-4">
        <div className="w-full max-w-md animate-fade-in">
          {/* Card Branding */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-primary-100/70 text-primary-700 mb-3 shadow-sm">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 tracking-tight">
              National Metrology Portal
            </h1>
            <p className="text-xs text-gray-500 mt-1">
              Department of Consumer Affairs • Legal Metrology Division
            </p>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-xl shadow-gray-200/50 p-6 sm:p-8">
            {/* Tab Switcher */}
            <div className="flex bg-gray-100 p-1 rounded-xl mb-6">
              <button
                type="button"
                onClick={() => {
                  setTab('signin');
                  setError('');
                  setSuccessMsg('');
                }}
                className={[
                  'flex-1 text-xs font-semibold py-2 rounded-lg transition-all',
                  tab === 'signin'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800',
                ].join(' ')}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => {
                  setTab('signup');
                  setError('');
                  setSuccessMsg('');
                }}
                className={[
                  'flex-1 text-xs font-semibold py-2 rounded-lg transition-all',
                  tab === 'signup'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-500 hover:text-gray-800',
                ].join(' ')}
              >
                Create Account
              </button>
            </div>

            {/* Error Banner */}
            {error && (
              <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700 animate-fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-600" />
                <span className="flex-1">{error}</span>
              </div>
            )}

            {/* Success Banner */}
            {successMsg && (
              <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-start gap-2 text-xs text-emerald-700 animate-fade-in">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                <span className="flex-1">{successMsg}</span>
              </div>
            )}

            {/* SIGN IN FORM */}
            {tab === 'signin' && (
              <form onSubmit={handleSignIn} className="space-y-4">
                <Input
                  id="signin-email"
                  label="Email Address"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@organization.in"
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                  autoComplete="email"
                />

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label
                      htmlFor="signin-password"
                      className="block text-xs font-medium text-gray-700"
                    >
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        setForgotEmail(email);
                        setForgotMsg(null);
                        setShowForgotModal(true);
                      }}
                      className="text-xs text-primary-600 hover:text-primary-700 font-semibold hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                  <Input
                    id="signin-password"
                    type={showPass ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    leftIcon={<Lock className="w-4 h-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowPass((p) => !p)}
                        className="text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showPass ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    }
                    required
                    autoComplete="current-password"
                  />
                </div>

                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  isLoading={loading}
                  className="font-semibold text-sm shadow-sm"
                >
                  Sign In
                </Button>
              </form>
            )}

            {/* SIGN UP FORM */}
            {tab === 'signup' && (
              <form onSubmit={handleSignUp} className="space-y-3.5">
                <Input
                  id="signup-name"
                  label="Full Name"
                  type="text"
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="e.g. Rajesh Sharma"
                  leftIcon={<UserIcon className="w-4 h-4" />}
                  required
                />

                <Input
                  id="signup-business"
                  label="Business / Enterprise Name"
                  type="text"
                  value={regBusiness}
                  onChange={(e) => setRegBusiness(e.target.value)}
                  placeholder="e.g. Apex Scale & Weighing Solutions"
                  leftIcon={<Building2 className="w-4 h-4" />}
                />

                <Input
                  id="signup-email"
                  label="Official Email Address"
                  type="email"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="owner@enterprise.in"
                  leftIcon={<Mail className="w-4 h-4" />}
                  required
                />

                <Input
                  id="signup-phone"
                  label="Contact Phone"
                  type="tel"
                  value={regPhone}
                  onChange={(e) => setRegPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                  leftIcon={<Phone className="w-4 h-4" />}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <Input
                    id="signup-pass"
                    label="Password"
                    type={showRegPass ? 'text' : 'password'}
                    value={regPassword}
                    onChange={(e) => setRegPassword(e.target.value)}
                    placeholder="Min. 6 chars"
                    leftIcon={<Lock className="w-4 h-4" />}
                    required
                  />
                  <Input
                    id="signup-confirm-pass"
                    label="Confirm"
                    type={showRegPass ? 'text' : 'password'}
                    value={regConfirmPassword}
                    onChange={(e) => setRegConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    leftIcon={<Lock className="w-4 h-4" />}
                    rightIcon={
                      <button
                        type="button"
                        onClick={() => setShowRegPass((p) => !p)}
                        className="text-gray-400 hover:text-gray-600"
                        tabIndex={-1}
                      >
                        {showRegPass ? (
                          <EyeOff className="w-4 h-4" />
                        ) : (
                          <Eye className="w-4 h-4" />
                        )}
                      </button>
                    }
                    required
                  />
                </div>

                <Button
                  type="submit"
                  fullWidth
                  size="md"
                  isLoading={loading}
                  className="font-semibold text-sm shadow-sm mt-2"
                >
                  Create Business Account
                </Button>
              </form>
            )}

            {/* Test Credentials Accordion (Convenient for Hackathon / Evaluators) */}
            <div className="mt-6 pt-4 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setShowDemoCredentials((prev) => !prev)}
                className="w-full flex items-center justify-between text-xs text-gray-500 hover:text-gray-800 transition-colors py-1"
              >
                <span className="flex items-center gap-1.5 font-medium">
                  <KeyRound className="w-3.5 h-3.5 text-primary-600" />
                  Evaluation Test Accounts
                </span>
                <span className="text-[10px] text-gray-400">
                  {showDemoCredentials ? 'Hide' : 'Show'}
                </span>
              </button>

              {showDemoCredentials && (
                <div className="mt-2.5 p-3 bg-gray-50 border border-gray-200 rounded-xl space-y-2 text-xs animate-fade-in">
                  <p className="text-[11px] text-gray-500 font-medium">
                    Click any credential to autofill the login form:
                  </p>
                  <div className="space-y-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        handleQuickFill('rajesh@kumarweighing.in', 'demo1234')
                      }
                      className="w-full text-left p-2 rounded-lg bg-white border border-gray-200 hover:border-primary-400 hover:bg-primary-50/40 transition-all flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 text-xs">
                          Business Owner (Rajesh Kumar)
                        </p>
                        <p className="text-[11px] text-gray-500 font-mono">
                          rajesh@kumarweighing.in • demo1234
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-primary-700 bg-primary-50 px-2 py-0.5 rounded">
                        Autofill
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleQuickFill(
                          'priya.sharma@legalmetrology.gov.in',
                          'demo1234'
                        )
                      }
                      className="w-full text-left p-2 rounded-lg bg-white border border-gray-200 hover:border-teal-400 hover:bg-teal-50/40 transition-all flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 text-xs">
                          Inspector (Smt. Priya Sharma)
                        </p>
                        <p className="text-[11px] text-gray-500 font-mono">
                          priya.sharma@legalmetrology.gov.in • demo1234
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                        Autofill
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        handleQuickFill(
                          'vikram.singh@legalmetrology.gov.in',
                          'demo1234'
                        )
                      }
                      className="w-full text-left p-2 rounded-lg bg-white border border-gray-200 hover:border-orange-400 hover:bg-orange-50/40 transition-all flex items-center justify-between"
                    >
                      <div>
                        <p className="font-semibold text-gray-900 text-xs">
                          Government Admin (Vikram Singh)
                        </p>
                        <p className="text-[11px] text-gray-500 font-mono">
                          vikram.singh@legalmetrology.gov.in • demo1234
                        </p>
                      </div>
                      <span className="text-[10px] font-semibold text-orange-700 bg-orange-50 px-2 py-0.5 rounded">
                        Autofill
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Forgot Password Modal */}
      <Modal
        isOpen={showForgotModal}
        onClose={() => setShowForgotModal(false)}
        title="Reset Account Password"
        size="sm"
      >
        <form onSubmit={handleForgotPassword} className="space-y-4">
          <p className="text-xs text-gray-500 leading-relaxed">
            Enter your registered email address and Firebase will send a secure password reset link to your inbox.
          </p>

          {forgotMsg && (
            <div
              className={[
                'p-3 rounded-xl text-xs flex items-start gap-2',
                forgotMsg.type === 'success'
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : 'bg-rose-50 text-rose-700 border border-rose-200',
              ].join(' ')}
            >
              {forgotMsg.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600 mt-0.5" />
              ) : (
                <AlertCircle className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              )}
              <span>{forgotMsg.text}</span>
            </div>
          )}

          <Input
            id="forgot-email"
            label="Registered Email Address"
            type="email"
            value={forgotEmail}
            onChange={(e) => setForgotEmail(e.target.value)}
            placeholder="you@organization.in"
            leftIcon={<Mail className="w-4 h-4" />}
            required
          />

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowForgotModal(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={forgotLoading}
              disabled={!forgotEmail.trim()}
            >
              Send Reset Link
            </Button>
          </div>
        </form>
      </Modal>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-gray-400">
        <p>© 2026 MaanakVerify • Department of Legal Metrology, Government of India</p>
      </footer>
    </div>
  );
}
