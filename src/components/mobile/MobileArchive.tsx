import React, { useState } from 'react';
import { Search, History, ChevronRight, Hash, UserCheck } from 'lucide-react';
import type { Customer } from '../../types';

interface MobileArchiveProps {
  customers: Customer[];
  onEdit: (customer: Customer) => void;
  onBack: () => void;
}

export const MobileArchive: React.FC<MobileArchiveProps> = ({ customers, onEdit, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const archiveCustomers = customers.filter(c => 
    c.status === 'completed' &&
    (
      String(c.name || '').includes(searchTerm) || 
      String(c.plateNumber || '').includes(searchTerm) || 
      String(c.posId || '').includes(searchTerm)
    )
  );

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
            <History size={24} color="#6366f1" /> 完工檔案庫
          </h2>
        </div>
      </header>

      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
        <input
          type="text"
          placeholder="搜尋車主、車牌、POS編號..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', background: '#fff' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {archiveCustomers.length > 0 ? archiveCustomers.slice(0, 50).map(customer => (
          <div 
            key={customer.id} 
            onClick={() => onEdit(customer)}
            style={{ background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontWeight: '900', color: '#1e293b', fontSize: '1.1rem' }}>{customer.plateNumber}</div>
              <div style={{ fontSize: '0.8rem', color: '#6366f1', fontWeight: 'bold' }}>POS: {customer.posId || '-'}</div>
            </div>
            
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '12px' }}>{customer.name} • {customer.model}</div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              <div style={{ color: '#94a3b8', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <UserCheck size={14} /> 完工日期: {customer.deliveryDate || '-'}
              </div>
              <ChevronRight size={18} color="#cbd5e1" />
            </div>
          </div>
        )) : (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
            無相符的完工資料
          </div>
        )}
      </div>
    </div>
  );
};
