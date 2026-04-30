import React, { useState } from 'react';
import { User, Lock, LogIn, ShieldCheck, Car, Loader2 } from 'lucide-react';
import type { User as UserType } from '../types';

interface LoginPageProps {
  onLogin: (user: UserType) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    setTimeout(() => {
      if (username === '1' && password === '1') {
        onLogin({ username: '1', role: 'admin', name: '店長管理者' });
      } else if (username === 'staff' && password === 'staff123') {
        onLogin({ username: 'staff', role: 'employee', name: '店內員工' });
      } else {
        setError('帳號或密碼錯誤');
        setLoading(false);
      }
    }, 800);
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(circle at top right, #3b82f61a, transparent), radial-gradient(circle at bottom left, #6366f11a, transparent), #f8fafc',
      padding: '20px'
    }}>
      <div className="form-section indigo" style={{
        width: '100%',
        maxWidth: '440px',
        padding: '50px 40px',
        margin: 0,
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.08)',
        textAlign: 'center'
      }}>
        <div style={{ marginBottom: '40px' }}>
          <div style={{ 
            width: '72px', height: '72px', background: '#3b82f6', borderRadius: '20px', 
            display: 'flex', alignItems: 'center', justifyContent: 'center', 
            margin: '0 auto 24px', boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)'
          }}>
            <Car color="white" size={36} />
          </div>
          <h1 style={{ color: '#1e293b', fontSize: '2rem', fontWeight: '900', letterSpacing: '-1px' }}>好室多膜 CRM</h1>
          <p style={{ color: '#64748b', fontSize: '0.95rem', fontWeight: '500' }}>內部營運與客戶管理系統</p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '24px', textAlign: 'left' }}>
          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', color: '#475569' }}>帳號</label>
            <div style={{ position: 'relative' }}>
              <User size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="text" className="form-control" 
                style={{ paddingLeft: '48px', height: '54px' }}
                placeholder="請輸入使用者名稱" value={username} onChange={(e) => setUsername(e.target.value)} required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label" style={{ fontWeight: '700', color: '#475569' }}>密碼</label>
            <div style={{ position: 'relative' }}>
              <Lock size={20} style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
              <input 
                type="password" className="form-control" 
                style={{ paddingLeft: '48px', height: '54px' }}
                placeholder="請輸入存取密碼" value={password} onChange={(e) => setPassword(e.target.value)} required
              />
            </div>
          </div>

          {error && (
            <div style={{ background: '#fef2f2', color: '#ef4444', padding: '12px', borderRadius: '12px', fontSize: '0.85rem', textAlign: 'center', fontWeight: '700', border: '1px solid #fee2e2' }}>
              {error}
            </div>
          )}

          <button 
            type="submit" className="btn btn-primary" disabled={loading}
            style={{ 
              height: '56px', borderRadius: '16px', 
              fontSize: '1.1rem', fontWeight: '900', 
              boxShadow: '0 10px 20px -5px rgba(59, 130, 246, 0.4)',
              marginTop: '10px'
            }}
          >
            {loading ? <Loader2 className="spinner" size={24} /> : '登入系統'}
          </button>
        </form>

        <div style={{ marginTop: '40px', borderTop: '1px solid #e2e8f0', paddingTop: '20px' }}>
          <p style={{ color: '#94a3b8', fontSize: '0.8rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <ShieldCheck size={16} /> 僅授權內部人員訪問 · V.613 PRO
          </p>
        </div>
      </div>
    </div>
  );
};
