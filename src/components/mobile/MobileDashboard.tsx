import React from 'react';
import { 
  UserPlus, Clock, Hammer, History, Box, Wallet, 
  Settings, LogOut, User as UserIcon, Plus, ChevronRight
} from 'lucide-react';
import type { User } from '../../types';

interface MobileDashboardProps {
  user: User;
  onNavigate: (view: any) => void;
  onLogout: () => void;
  stats: {
    inquiry: number;
    pending: number;
    monitor: number;
  };
}

export const MobileDashboard: React.FC<MobileDashboardProps> = ({ user, onNavigate, onLogout, stats }) => {
  const menuItems = [
    { id: 'inquiry', label: '諮詢進件', icon: UserPlus, color: '#3b82f6', count: stats.inquiry },
    { id: 'pending', label: '待施工區', icon: Clock, color: '#f59e0b', count: stats.pending },
    { id: 'monitor', label: '施工監控', icon: Hammer, color: '#ef4444', count: stats.monitor },
    { id: 'archive', label: '完工檔案', icon: History, color: '#6366f1' },
    { id: 'inventory', label: '膜料庫存', icon: Box, color: '#10b981' },
    { id: 'finance', label: '收支記帳', icon: Wallet, color: '#ec4899' },
  ];

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '24px 16px 40px' }}>
      <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '45px', height: '45px', background: 'var(--primary)', borderRadius: '14px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontSize: '1.4rem', fontWeight: 'bold' }}>H</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.2rem', fontWeight: '900', color: '#1e293b' }}>好室多膜 CRM</h1>
            <div style={{ fontSize: '0.8rem', color: '#94a3b8', fontWeight: 'bold' }}>{user.name} ({user.role.toUpperCase()})</div>
          </div>
        </div>
        <button onClick={onLogout} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px', color: '#64748b' }}>
          <LogOut size={20} />
        </button>
      </header>

      <div style={{ background: 'var(--primary)', borderRadius: '20px', padding: '20px', color: '#fff', marginBottom: '24px', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'relative', zIndex: 1 }}>
          <h2 style={{ margin: 0, fontSize: '1.1rem', opacity: 0.9 }}>早安，準備好開始工作了嗎？</h2>
          <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', opacity: 0.7 }}>目前店內共有 {stats.monitor} 台車正在施工中。</p>
        </div>
        <div style={{ position: 'absolute', right: '-20px', bottom: '-20px', opacity: 0.1 }}>
          <Hammer size={120} />
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
        {menuItems.map(item => (
          <button
            key={item.id}
            onClick={() => onNavigate(item.id)}
            style={{ 
              background: '#fff', 
              border: '1px solid #e2e8f0', 
              borderRadius: '20px', 
              padding: '20px', 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'flex-start', 
              gap: '12px',
              textAlign: 'left',
              position: 'relative'
            }}
          >
            <div style={{ background: `${item.color}15`, color: item.color, padding: '10px', borderRadius: '12px' }}>
              <item.icon size={24} />
            </div>
            <div>
              <div style={{ fontWeight: '900', color: '#1e293b', fontSize: '1rem' }}>{item.label}</div>
              {item.count !== undefined && (
                <div style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>{item.count} 筆案件</div>
              )}
            </div>
            <div style={{ position: 'absolute', top: '15px', right: '15px' }}>
              <ChevronRight size={16} color="#cbd5e1" />
            </div>
          </button>
        ))}
      </div>

      <div style={{ marginTop: '24px' }}>
        <h3 style={{ fontSize: '0.9rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '12px', paddingLeft: '4px' }}>快速捷徑</h3>
        <button 
          style={{ width: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '16px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}
          onClick={() => onNavigate('intake')}
        >
          <div style={{ background: '#f8fafc', padding: '8px', borderRadius: '10px' }}>
            <Plus size={20} color="var(--primary)" />
          </div>
          <div style={{ fontWeight: 'bold', color: '#1e293b', flex: 1, textAlign: 'left' }}>新增諮詢/進件</div>
          <ChevronRight size={16} color="#cbd5e1" />
        </button>
      </div>
    </div>
  );
};
