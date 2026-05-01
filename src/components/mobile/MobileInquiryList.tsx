import React, { useState } from 'react';
import { Search, UserPlus, ChevronRight, Calendar, Plus } from 'lucide-react';
import type { Customer } from '../../types';

interface MobileInquiryListProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
  onAddNew: () => void;
  onBack: () => void;
}

export const MobileInquiryList: React.FC<MobileInquiryListProps> = ({ customers, onEditCustomer, onAddNew, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const inquiries = customers.filter(c => 
    c.status === 'new' && 
    (
      String(c.name || '').includes(searchTerm) || 
      String(c.plateNumber || '').includes(searchTerm) || 
      String(c.phone || '').includes(searchTerm)
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
            <UserPlus size={24} color="#3b82f6" /> 諮詢進件區
          </h2>
          <button 
            onClick={onAddNew}
            style={{ background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '50%', width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            <Plus size={24} />
          </button>
        </div>
      </header>

      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
        <input
          type="text"
          placeholder="搜尋名稱或電話..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', background: '#fff' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {inquiries.length > 0 ? inquiries.map(customer => (
          <div 
            key={customer.id} 
            onClick={() => onEditCustomer(customer)}
            style={{ background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <div style={{ fontWeight: '900', color: '#1e293b', fontSize: '1.1rem' }}>{customer.name}</div>
              <div style={{ fontSize: '0.8rem', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <Calendar size={12} /> {customer.consultationDate || '未記'}
              </div>
            </div>
            
            <div style={{ fontSize: '0.9rem', color: '#64748b', marginBottom: '12px' }}>{customer.phone}</div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid #f1f5f9', paddingTop: '12px' }}>
              <div style={{ color: 'var(--primary)', fontWeight: 'bold', fontSize: '0.85rem' }}>
                {customer.mainService || '尚未選擇服務'}
              </div>
              <div style={{ display: 'flex', gap: '4px' }}>
                {customer.detailOriented && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444' }} title="完美主義" />}
                {customer.easyGoing && <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#10b981' }} title="隨和" />}
                <ChevronRight size={18} color="#cbd5e1" />
              </div>
            </div>
          </div>
        )) : (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
            無相符的諮詢資料
          </div>
        )}
      </div>
    </div>
  );
};
