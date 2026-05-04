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
  
  const archiveCustomers = customers.filter(c => {
    if (c.status !== 'completed') return false;

    const name = String(c.name || '').toLowerCase();
    const plate = String(c.plateNumber || '').toLowerCase();
    const posId = String(c.posId || '').toLowerCase();
    const model = String(c.model || '').toLowerCase();
    const brand = String(c.brand || '').toLowerCase();
    const mainService = String(c.mainService || '').toLowerCase();
    const mainServiceBrand = String(c.mainServiceBrand || '').toLowerCase();
    const film = String(c.filmColor || '').toLowerCase();
    const materialCode = String(c.materialCode || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    return (
      name.includes(term) || 
      plate.includes(term) || 
      posId.includes(term) ||
      model.includes(term) ||
      brand.includes(term) ||
      mainService.includes(term) ||
      mainServiceBrand.includes(term) ||
      film.includes(term) ||
      materialCode.includes(term)
    );
  }).sort((a, b) => {
    const normalizeDate = (d: string) => {
      if (!d) return '';
      const firstPart = d.split('.')[0].trim();
      const parts = firstPart.split(/[-/]/);
      if (parts.length < 3) return firstPart;
      const y = parts[0];
      const m = parts[1].padStart(2, '0');
      const day = parts[2].padStart(2, '0');
      return `${y}-${m}-${day}`;
    };
    const valA = normalizeDate(a.expectedStartDate || a.expectedEndDate || a.deliveryDate || '');
    const valB = normalizeDate(b.expectedStartDate || b.expectedEndDate || b.deliveryDate || '');
    if (!valA && valB) return 1;
    if (valA && !valB) return -1;
    return valB.localeCompare(valA);
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
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px', borderTop: '1px dashed #f1f5f9', paddingTop: '12px' }}>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>施工時間</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#166534' }}>{customer.expectedEndDate || '-'}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', textTransform: 'uppercase' }}>膜料顏色</div>
                <div style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#6366f1' }}>{customer.filmColor || '-'}</div>
              </div>
            </div>
            
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
