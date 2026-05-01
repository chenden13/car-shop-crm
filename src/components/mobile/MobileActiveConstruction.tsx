import React, { useState } from 'react';
import { Search, Hammer, Clock, ChevronRight, CheckCircle2, Car } from 'lucide-react';
import type { Customer } from '../../types';

interface MobileActiveConstructionProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
  onBack: () => void;
}

export const MobileActiveConstruction: React.FC<MobileActiveConstructionProps> = ({ customers, onEditCustomer, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const constructionCustomers = customers.filter(c => 
    c.status === 'construction' &&
    (
      String(c.name || '').includes(searchTerm) || 
      String(c.plateNumber || '').includes(searchTerm) || 
      String(c.phone || '').includes(searchTerm)
    )
  );

  const getProgress = (customer: Customer) => {
    if (!customer.constructionChecklist || customer.constructionChecklist.length === 0) return 0;
    const checked = customer.constructionChecklist.filter(item => item.checked).length;
    return Math.round((checked / customer.constructionChecklist.length) * 100);
  };

  return (
    <div style={{ background: '#f8fafc', minHeight: '100vh', padding: '16px' }}>
      <header style={{ marginBottom: '20px' }}>
        <button 
          onClick={onBack}
          style={{ background: 'none', border: 'none', color: '#64748b', fontSize: '0.9rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '4px', padding: 0 }}
        >
          ← 返回首頁
        </button>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: '#1e293b', margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Hammer size={24} color="var(--primary)" /> 店內施工中
          </h2>
          <span style={{ background: 'var(--primary)', color: '#fff', padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
            {constructionCustomers.length} 台
          </span>
        </div>
      </header>

      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
        <input
          type="text"
          placeholder="搜尋車主或車牌..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', background: '#fff' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {constructionCustomers.length > 0 ? constructionCustomers.map(customer => {
          const progress = getProgress(customer);
          return (
            <div 
              key={customer.id} 
              onClick={() => onEditCustomer(customer)}
              style={{ background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#1e293b' }}>{customer.plateNumber || '尚未掛牌'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 'bold' }}>{customer.name} • {customer.brand} {customer.model}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px', justifyContent: 'flex-end' }}>
                    <Clock size={12} /> {customer.expectedEndDate?.slice(5)}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>預計交車</div>
                </div>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span style={{ fontWeight: 'bold', color: progress === 100 ? '#10b981' : 'var(--primary)' }}>施工進度: {progress}%</span>
                  <span style={{ color: '#94a3b8' }}>{customer.mainService}</span>
                </div>
                <div style={{ height: '8px', background: '#f1f5f9', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? '#10b981' : 'var(--primary)', transition: 'width 0.4s' }}></div>
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '8px 12px', borderRadius: '10px' }}>
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                   {customer.windowTint && <span style={{ fontSize: '0.65rem', background: '#e0f2fe', color: '#0369a1', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>隔熱紙</span>}
                   {customer.digitalMirror && <span style={{ fontSize: '0.65rem', background: '#f3e8ff', color: '#6b21a8', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>電子鏡</span>}
                   {(customer.customAccessories || []).length > 0 && <span style={{ fontSize: '0.65rem', background: '#fef9c3', color: '#854d0e', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>加裝</span>}
                </div>
                <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  更新進度 <ChevronRight size={16} />
                </div>
              </div>
            </div>
          );
        }) : (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8', background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <Car size={48} style={{ opacity: 0.1, marginBottom: '12px' }} />
            <p>目前沒有車輛正在施工中</p>
          </div>
        )}
      </div>
    </div>
  );
};
