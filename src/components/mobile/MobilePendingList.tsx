import React, { useState } from 'react';
import { Search, Clock, ChevronRight, Hash, Calendar, Phone } from 'lucide-react';
import type { Customer } from '../../types';

interface MobilePendingListProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
  onBack: () => void;
}

export const MobilePendingList: React.FC<MobilePendingListProps> = ({ customers, onEditCustomer, onBack }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const pendingCustomers = customers.filter(c => {
    if (!['deposit', 'scheduled'].includes(c.status)) return false;

    const name = String(c.name || '').toLowerCase();
    const plate = String(c.plateNumber || '').toLowerCase();
    const phone = String(c.phone || '').toLowerCase();
    const brand = String(c.brand || '').toLowerCase();
    const model = String(c.model || '').toLowerCase();
    const mainService = String(c.mainService || '').toLowerCase();
    const mainServiceBrand = String(c.mainServiceBrand || '').toLowerCase();
    const film = String(c.filmColor || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    return (
      name.includes(term) || 
      plate.includes(term) || 
      phone.includes(term) ||
      brand.includes(term) ||
      model.includes(term) ||
      mainService.includes(term) ||
      mainServiceBrand.includes(term) ||
      film.includes(term)
    );
  }).sort((a, b) => {
    const valA = a.constructionStartDate || a.expectedEndDate || a.expectedStartDate || '';
    const valB = b.constructionStartDate || b.expectedEndDate || b.expectedStartDate || '';
    if (!valA && valB) return 1;
    if (valA && !valB) return -1;
    return valA.localeCompare(valB);
  });

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
            <Clock size={24} color="#f59e0b" /> 待施工排程
          </h2>
        </div>
      </header>

      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
        <input
          type="text"
          placeholder="搜尋車主、車牌或電話..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '12px 12px 12px 40px', borderRadius: '12px', border: '1px solid #e2e8f0', fontSize: '0.95rem', outline: 'none', background: '#fff' }}
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {pendingCustomers.length > 0 ? pendingCustomers.map(customer => (
          <div 
            key={customer.id} 
            onClick={() => onEditCustomer(customer)}
            style={{ background: '#fff', borderRadius: '16px', padding: '16px', border: '1px solid #e2e8f0' }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '1.1rem', fontWeight: '900', color: '#1e293b' }}>{customer.name}</div>
                <div style={{ fontSize: '0.85rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={12} /> {customer.phone}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.9rem', fontWeight: '800', color: 'var(--primary)' }}>{customer.plateNumber}</div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>{customer.model}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px', borderTop: '1px dashed #f1f5f9', paddingTop: '12px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>施工時間</div>
                <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#166534' }}>
                  {customer.constructionStartDate || customer.expectedEndDate || '未定'}
                  {customer.constructionEndDate ? ` ~ ${customer.constructionEndDate.slice(5)}` : ''}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>膜料顏色</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--primary)' }}>{customer.filmColor || '未填'}</div>
              </div>
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>預計進場</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '500', color: '#0369a1' }}>{customer.expectedStartDate || '未定'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>預計交車</div>
                <div style={{ fontSize: '0.85rem', fontWeight: '500', color: '#be185d' }}>
                  {customer.constructionStartDate ? (customer.expectedEndDate || '未定') : (customer.deliveryDate || '未定')}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ display: 'flex', gap: '4px' }}>
                 {customer.quoteCreated && <span style={{ fontSize: '0.65rem', background: '#eff6ff', color: '#1e40af', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>報價單</span>}
                 {customer.materialOrdered && <span style={{ fontSize: '0.65rem', background: '#fff7ed', color: '#9a3412', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>已叫料</span>}
              </div>
              <ChevronRight size={18} color="#cbd5e1" />
            </div>
          </div>
        )) : (
          <div style={{ padding: '60px 20px', textAlign: 'center', color: '#94a3b8' }}>
            無相符的排程資料
          </div>
        )}
      </div>
    </div>
  );
};
