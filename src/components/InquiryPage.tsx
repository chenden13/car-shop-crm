import React, { useState } from 'react';
import { Search, UserPlus, Calendar, ChevronRight, Plus } from 'lucide-react';
import type { Customer, Role } from '../types';

interface InquiryPageProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
  userRole?: Role;
  onAddNew?: () => void;
}

export const InquiryPage: React.FC<InquiryPageProps> = ({ customers, onEditCustomer, userRole, onAddNew }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const inquiries = customers.filter(c => 
    c.status === 'new' && 
    (
      c.name.includes(searchTerm) || 
      c.plateNumber.includes(searchTerm) || 
      c.phone.includes(searchTerm) ||
      (c.id && c.id.includes(searchTerm))
    )
  );

  const isMobile = window.innerWidth <= 768;

  return (
    <div style={{ padding: isMobile ? '0 10px 40px 10px' : '0 20px 40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ width: isMobile ? '100%' : 'auto' }}>
          <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserPlus className="text-primary" size={isMobile ? 20 : 24} /> 諮詢進件區
          </h2>
        </div>

        <div style={{ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto', flexWrap: 'wrap' }}>
          <button className="btn btn-primary" style={{ flex: isMobile ? 1 : 'none', padding: '10px 20px', fontSize: '0.85rem', borderRadius: '10px' }} onClick={onAddNew}>
            <Plus size={16} /> 新增諮詢
          </button>
          <div style={{ position: 'relative', flex: isMobile ? 1 : 'none', width: isMobile ? '100%' : '260px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input
              type="text"
              placeholder="搜尋名稱、電話..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-panel"
              style={{
                padding: '10px 15px 10px 40px',
                borderRadius: '12px',
                width: '100%',
                fontSize: '0.9rem',
                outline: 'none',
                border: '1px solid #e2e8f0'
              }}
            />
          </div>
        </div>
      </header>

      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {inquiries.length > 0 ? inquiries.map(customer => (
            <div 
              key={customer.id} 
              className="glass-panel" 
              onClick={() => onEditCustomer(customer)}
              style={{ padding: '16px', borderRadius: '20px', border: '1px solid #e2e8f0', background: '#fff' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                <div>
                  <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>{customer.name}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{customer.phone}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div className="car-plate" style={{ fontSize: '0.85rem' }}>{customer.plateNumber}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>{customer.brand} {customer.model}</div>
                </div>
              </div>

              <div style={{ background: 'rgba(79, 70, 229, 0.05)', padding: '12px', borderRadius: '12px', marginBottom: '12px' }}>
                <div style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>感興趣項目：</div>
                <div style={{ fontSize: '0.9rem', color: '#1e293b', marginTop: '4px', fontWeight: '600' }}>{customer.mainService || '未填'}</div>
                {customer.filmColor && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{customer.filmColor}</div>}
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: '6px' }}>
                  {customer.detailOriented && <span style={{ fontSize: '0.65rem', background: '#ffe4e6', color: '#e11d48', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>細節控</span>}
                  {customer.easyGoing && <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#166534', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>隨和</span>}
                </div>
                <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>諮詢日: {customer.consultationDate || '未知'}</div>
              </div>
            </div>
          )) : (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>無相符資料</div>
          )}
        </div>
      ) : (
        <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          {/* Table Header */}
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: '80px 120px 180px 180px 1.5fr 1.5fr 60px',
            padding: '15px 20px',
            background: '#f8fafc',
            borderBottom: '1px solid #e2e8f0',
            fontWeight: 'bold',
            color: '#475569',
            fontSize: '0.85rem'
          }}>
            <div>編號</div>
            <div>諮詢日期</div>
            <div>車主 / 電話</div>
            <div>車牌 / 車型</div>
            <div>主要興趣膜料</div>
            <div>配件感興趣項目</div>
            <div style={{ textAlign: 'center' }}>操作</div>
          </div>

          {/* Table Body */}
          <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
            {inquiries.length > 0 ? inquiries.map((customer, idx) => (
              <div 
                key={customer.id} 
                className="list-row"
                onClick={() => onEditCustomer(customer)}
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '80px 120px 180px 180px 1.5fr 1.5fr 60px',
                  alignItems: 'center',
                  padding: '18px 20px',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: '0.88rem',
                  background: idx % 2 === 0 ? '#fff' : '#fafafa',
                  cursor: 'pointer'
                }}
              >
                <div style={{ fontWeight: '600', color: '#64748b', fontSize: '0.75rem' }}>
                  {customer.id}
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Calendar size={14} style={{ color: '#94a3b8' }} />
                  <span>{customer.consultationDate || '未記錄'}</span>
                </div>

                <div>
                  <div style={{ fontWeight: '700', color: '#1e293b' }}>{customer.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{customer.phone}</div>
                </div>

                <div>
                  <div style={{ fontWeight: '700', color: '#1e293b' }}>{customer.plateNumber}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{customer.brand} {customer.model}</div>
                </div>

                <div style={{ paddingRight: '15px' }}>
                  <div style={{ fontWeight: '700', color: 'var(--primary)' }}>{customer.mainService || '-'}</div>
                  {customer.filmColor && <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{customer.filmColor}</div>}
                </div>

                <div style={{ paddingRight: '15px' }}>
                  <div style={{ color: '#334155', fontWeight: '500' }}>{customer.interestedAccessories || '-'}</div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                    {customer.detailOriented && <span style={{ fontSize: '0.65rem', background: '#ffe4e6', color: '#e11d48', padding: '1px 6px', borderRadius: '4px' }}>細節</span>}
                    {customer.easyGoing && <span style={{ fontSize: '0.65rem', background: '#dcfce7', color: '#166534', padding: '1px 6px', borderRadius: '4px' }}>隨和</span>}
                    {customer.location && <span style={{ fontSize: '0.65rem', background: '#eff6ff', color: '#3b82f6', padding: '1px 6px', borderRadius: '4px' }}>{customer.location}</span>}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button 
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1' }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            )) : (
              <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>無相符資料</div>
            )}
          </div>
        </div>
      )}

      <style>{`
        .list-row {
          transition: background 0.2s;
        }
        .list-row:hover {
          background: #f1f5f9 !important;
        }
      `}</style>
    </div>
  );
};
