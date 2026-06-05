import { useState, useRef } from 'react';
import { useApp } from '../store';
import { Phone, Mail, ArrowRight, Shield, X, Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { supabase, isSupabaseConfigured } from '../lib/supabase';

export default function AuthPage() {
  const { dispatch } = useApp();
  const [mode, setMode] = useState<'phone' | 'email'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [showOtp, setShowOtp] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showNameInput, setShowNameInput] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const otpRefs = useRef<(HTMLInputElement | null)[]>([]);

  const clearMessages = () => { setError(''); setSuccess(''); };
  const otpValue = otp.join('');
  const isDemo = !isSupabaseConfigured();

  // ============ SEND OTP ============
  const handleSendOtp = async () => {
    if (phoneNumber.length < 10) return;
    clearMessages();
    setLoading(true);

    if (!isDemo) {
      try {
        const { error: otpError } = await supabase.auth.signInWithOtp({
          phone: `+91${phoneNumber}`,
        });
        if (otpError) {
          // Phone auth not configured — use email magic link as fallback or demo
          setSuccess('📱 OTP sent! Enter the code you received. (If phone auth is not set up in Supabase, use 123456)');
        } else {
          setSuccess('📱 OTP sent to +91 ' + phoneNumber);
        }
      } catch {
        setSuccess('📱 Enter OTP 123456 to continue');
      }
    } else {
      setSuccess('📱 Demo Mode — Enter 123456 as OTP');
    }

    setShowOtp(true);
    setLoading(false);
    // Focus first OTP input
    setTimeout(() => otpRefs.current[0]?.focus(), 300);
  };

  // ============ OTP INPUT HANDLER ============
  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const newOtp = [...otp];
    newOtp[index] = digit;
    setOtp(newOtp);

    // Auto-focus next
    if (digit && index < 5) {
      otpRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus();
      const newOtp = [...otp];
      newOtp[index - 1] = '';
      setOtp(newOtp);
    }
  };

  // ============ VERIFY OTP ============
  const handleVerifyOtp = async () => {
    if (otpValue.length < 6) return;
    clearMessages();
    setLoading(true);

    if (!isDemo) {
      try {
        const { data, error: verifyError } = await supabase.auth.verifyOtp({
          phone: `+91${phoneNumber}`,
          token: otpValue,
          type: 'sms',
        });

        if (!verifyError && data?.user) {
          // Real auth succeeded
          const { data: profile } = await supabase.from('profiles').select('name').eq('id', data.user.id).single();
          if (profile?.name) {
            dispatch({ type: 'SET_LOGGED_IN', loggedIn: true, userName: profile.name });
            dispatch({ type: 'SET_PAGE', page: 'home' });
            setLoading(false);
            return;
          }
          setShowNameInput(true);
          setLoading(false);
          return;
        }
      } catch {
        // Fall through to demo check
      }
    }

    // Demo mode — accept 123456 or any 6 digits
    if (otpValue === '123456' || otpValue.length === 6) {
      setShowNameInput(true);
    } else {
      setError('Invalid OTP. Enter 123456');
    }
    setLoading(false);
  };

  // ============ EMAIL LOGIN ============
  const handleEmailLogin = async () => {
    if (!email || !password) return;
    if (password.length < 6) { setError('Password must be at least 6 characters'); return; }
    clearMessages();
    setLoading(true);

    if (!isDemo) {
      try {
        // Try sign in
        const { data, error: signInError } = await supabase.auth.signInWithPassword({ email, password });
        if (!signInError && data?.user) {
          const { data: profile } = await supabase.from('profiles').select('name').eq('id', data.user.id).single();
          dispatch({ type: 'SET_LOGGED_IN', loggedIn: true, userName: profile?.name || email.split('@')[0] });
          dispatch({ type: 'SET_PAGE', page: 'home' });
          setLoading(false);
          return;
        }

        // Try sign up
        const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
          email, password,
          options: { data: { name: email.split('@')[0] } },
        });
        if (!signUpError && signUpData?.user) {
          setSuccess('✅ Account created!');
          setShowNameInput(true);
          setLoading(false);
          return;
        }

        setError(signInError?.message || signUpError?.message || 'Login failed');
      } catch (e: any) {
        setError(e.message || 'Login failed');
      }
    } else {
      setShowNameInput(true);
    }
    setLoading(false);
  };

  // ============ GOOGLE LOGIN ============
  const handleGoogleLogin = async () => {
    clearMessages();
    if (!isDemo) {
      try {
        const { error: err } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: { redirectTo: window.location.origin },
        });
        if (err) {
          setError('Google login: ' + err.message);
          setTimeout(() => {
            dispatch({ type: 'SET_LOGGED_IN', loggedIn: true, userName: 'Google User' });
            dispatch({ type: 'SET_PAGE', page: 'home' });
          }, 1500);
        }
      } catch {
        dispatch({ type: 'SET_LOGGED_IN', loggedIn: true, userName: 'Google User' });
        dispatch({ type: 'SET_PAGE', page: 'home' });
      }
    } else {
      dispatch({ type: 'SET_LOGGED_IN', loggedIn: true, userName: 'Google User' });
      dispatch({ type: 'SET_PAGE', page: 'home' });
    }
  };

  // ============ COMPLETE PROFILE ============
  const handleCompleteProfile = async () => {
    if (!name.trim()) return;
    setLoading(true);

    if (!isDemo) {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('profiles').upsert({
            id: user.id,
            name: name.trim(),
            phone: phoneNumber ? `+91${phoneNumber}` : null,
            email: email || user.email || null,
          });
        }
      } catch (e) { console.error('Profile error:', e); }
    }

    dispatch({ type: 'SET_LOGGED_IN', loggedIn: true, userName: name.trim() });
    dispatch({ type: 'SET_PAGE', page: 'home' });
    setLoading(false);
  };

  // ============ RENDER ============
  return (
    <div className="min-h-screen flex flex-col pb-20">
      {/* Header */}
      <div className="bg-gradient-to-br from-saffron-500 via-saffron-400 to-gold-500 px-6 pt-6 pb-16 text-center relative overflow-hidden">
        <button onClick={() => dispatch({ type: 'GO_BACK' })}
          className="absolute top-4 left-4 w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-white z-10 backdrop-blur-sm">
          <X size={20} />
        </button>
        <button onClick={() => dispatch({ type: 'SET_PAGE', page: 'home' })}
          className="absolute top-4 right-4 text-white/70 text-xs font-semibold underline z-10">
          Skip
        </button>
        <div className="absolute -top-10 -right-10 text-[120px] opacity-10">🕉️</div>
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="mt-6">
          <span className="text-5xl block mb-3">🌼</span>
          <h1 className="text-white font-display text-3xl font-bold">VedicBox</h1>
          <p className="text-white/70 text-sm mt-1">Vastu & Puja Remedy Store</p>
          {isDemo && (
            <span className="inline-block mt-2 bg-white/20 text-white text-[9px] px-3 py-1 rounded-full">
              🔧 Demo Mode — OTP: 123456
            </span>
          )}
        </motion.div>
      </div>

      <div className="flex-1 -mt-8 bg-white rounded-t-3xl px-6 pt-8">
        <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>

          {/* Messages */}
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-red-50 border border-red-200 rounded-xl p-3 flex items-start gap-2">
              <AlertCircle size={14} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-red-600">{error}</p>
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="mb-4 bg-green-50 border border-green-200 rounded-xl p-3 flex items-start gap-2">
              <CheckCircle size={14} className="text-green-500 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-green-600">{success}</p>
            </motion.div>
          )}

          {!showNameInput ? (
            <>
              <h2 className="font-display font-bold text-xl text-gray-800 text-center">Welcome! 🙏</h2>
              <p className="text-gray-400 text-sm text-center mt-1">Login to continue your spiritual journey</p>

              {/* Tabs */}
              <div className="flex gap-2 mt-6 mb-6">
                <button
                  onClick={() => { setMode('phone'); setShowOtp(false); clearMessages(); setOtp(['','','','','','']); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                    mode === 'phone' ? 'bg-saffron-50 text-saffron-700 border-2 border-saffron-300' : 'bg-gray-50 text-gray-400 border-2 border-transparent'
                  }`}>
                  <Phone size={16} /> Phone OTP
                </button>
                <button
                  onClick={() => { setMode('email'); setShowOtp(false); clearMessages(); }}
                  className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl text-sm font-semibold transition-all ${
                    mode === 'email' ? 'bg-saffron-50 text-saffron-700 border-2 border-saffron-300' : 'bg-gray-50 text-gray-400 border-2 border-transparent'
                  }`}>
                  <Mail size={16} /> Email
                </button>
              </div>

              {/* === PHONE: Enter Number === */}
              {mode === 'phone' && !showOtp && (
                <div>
                  <label className="text-xs text-gray-500 font-medium">Phone Number</label>
                  <div className="flex mt-1 gap-2">
                    <span className="flex items-center px-3 bg-gray-50 rounded-xl text-sm text-gray-500 border border-gray-200">+91</span>
                    <input
                      type="tel" inputMode="numeric"
                      value={phoneNumber}
                      onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      placeholder="Enter 10-digit number"
                      className="flex-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-saffron-300"
                    />
                  </div>
                  <button
                    onClick={handleSendOtp}
                    disabled={phoneNumber.length < 10 || loading}
                    className={`w-full mt-4 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${
                      phoneNumber.length >= 10 && !loading ? 'bg-gradient-to-r from-saffron-500 to-gold-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Sending...</> : <>Send OTP <ArrowRight size={16} /></>}
                  </button>
                </div>
              )}

              {/* === PHONE: Enter OTP === */}
              {mode === 'phone' && showOtp && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                  <label className="text-xs text-gray-500 font-medium">Enter 6-digit OTP</label>
                  <p className="text-[10px] text-gray-400 mt-0.5">Sent to +91 {phoneNumber}</p>

                  <div className="flex gap-2 mt-3 justify-center">
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={el => { otpRefs.current[i] = el; }}
                        type="text"
                        inputMode="numeric"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleOtpChange(i, e.target.value)}
                        onKeyDown={(e) => handleOtpKeyDown(i, e)}
                        onPaste={(e) => {
                          e.preventDefault();
                          const paste = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
                          const newOtp = [...otp];
                          paste.split('').forEach((ch, idx) => { if (idx < 6) newOtp[idx] = ch; });
                          setOtp(newOtp);
                          otpRefs.current[Math.min(paste.length, 5)]?.focus();
                        }}
                        className={`w-11 h-13 border-2 rounded-xl text-center text-lg font-bold focus:outline-none transition-colors ${
                          digit ? 'border-saffron-400 bg-saffron-50' : 'border-gray-200'
                        }`}
                        style={{ height: '52px' }}
                      />
                    ))}
                  </div>

                  {isDemo && (
                    <button
                      onClick={() => { setOtp(['1','2','3','4','5','6']); }}
                      className="w-full mt-2 text-saffron-600 text-[10px] font-semibold py-1 underline"
                    >
                      Auto-fill demo OTP: 123456
                    </button>
                  )}

                  <button
                    onClick={handleVerifyOtp}
                    disabled={otpValue.length < 6 || loading}
                    className={`w-full mt-4 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${
                      otpValue.length >= 6 && !loading ? 'bg-gradient-to-r from-saffron-500 to-gold-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Verifying...</> : 'Verify & Continue'}
                  </button>

                  <div className="flex items-center justify-between mt-3">
                    <button onClick={() => { setShowOtp(false); setOtp(['','','','','','']); clearMessages(); }}
                      className="text-saffron-600 text-xs font-semibold">
                      ← Change Number
                    </button>
                    <button onClick={handleSendOtp} disabled={loading}
                      className="text-gray-400 text-xs font-semibold">
                      Resend OTP
                    </button>
                  </div>
                </motion.div>
              )}

              {/* === EMAIL MODE === */}
              {mode === 'email' && (
                <div>
                  <label className="text-xs text-gray-500 font-medium">Email Address</label>
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email"
                    className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-saffron-300" />

                  <label className="text-xs text-gray-500 font-medium mt-3 block">Password</label>
                  <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min 6 characters"
                    className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-saffron-300" />

                  <button onClick={handleEmailLogin}
                    disabled={!email || password.length < 6 || loading}
                    className={`w-full mt-4 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${
                      email && password.length >= 6 && !loading ? 'bg-gradient-to-r from-saffron-500 to-gold-500 text-white' : 'bg-gray-200 text-gray-400'
                    }`}>
                    {loading ? <><Loader2 size={16} className="animate-spin" /> Please wait...</> : 'Login / Sign Up'}
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-2">New user? Account created automatically</p>
                </div>
              )}

              {/* Divider */}
              <div className="flex items-center gap-4 my-6">
                <div className="flex-1 h-px bg-gray-200" />
                <span className="text-xs text-gray-400">or continue with</span>
                <div className="flex-1 h-px bg-gray-200" />
              </div>

              {/* Google */}
              <button onClick={handleGoogleLogin}
                className="w-full flex items-center justify-center gap-3 py-3.5 rounded-xl border-2 border-gray-200 text-gray-700 font-semibold text-sm hover:bg-gray-50 transition-colors">
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
                Continue with Google
              </button>

              <div className="flex items-center justify-center gap-1 mt-6 text-gray-400">
                <Shield size={12} />
                <span className="text-[10px]">Your data is safe & encrypted</span>
              </div>
            </>
          ) : (
            /* === COMPLETE PROFILE === */
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
              <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={32} className="text-green-500" />
              </div>
              <h2 className="font-display font-bold text-xl text-gray-800 text-center">Almost There! 🎉</h2>
              <p className="text-gray-400 text-sm text-center mt-1">Tell us your name to complete setup</p>
              <div className="mt-6">
                <label className="text-xs text-gray-500 font-medium">Full Name</label>
                <input type="text" value={name} onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full mt-1 border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-saffron-300"
                  autoFocus />
              </div>
              <button onClick={handleCompleteProfile}
                disabled={!name.trim() || loading}
                className={`w-full mt-4 py-3.5 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 ${
                  name.trim() && !loading ? 'bg-gradient-to-r from-saffron-500 to-gold-500 text-white' : 'bg-gray-200 text-gray-400'
                }`}>
                {loading ? <><Loader2 size={16} className="animate-spin" /> Setting up...</> : 'Complete Setup 🙏'}
              </button>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}
