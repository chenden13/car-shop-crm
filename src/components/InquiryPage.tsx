import React, { useState } from 'react';
import { Search, UserPlus, Car, Tag, Clock, User, Phone, Calendar, ChevronRight, Plus } from 'lucide-react';
import type { Customer, StatusType, Role } from '../types';

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

  return (
    <div style={{ padding: '0 20px 40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <UserPlus className="text-primary" size={24} /> 未下定諮詢區
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>追蹤初步諮詢、尚未收訂的潛在客戶資料</p>
        </div>

        <div style={{ display: 'flex', gap: '15px' }}>
          <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem', borderRadius: '10px' }} onClick={onAddNew}>
            <Plus size={16} /> 新增諮詢客戶
          </button>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input
              type="text"
              placeholder="搜尋名稱、電話或車型..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-panel"
              style={{
                padding: '10px 15px 10px 40px',
                borderRadius: '12px',
                width: '260px',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </header>

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
            <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
              目前的範圍內沒有諮詢中的案件資料。
            </div>
          )}
        </div>
      </div>

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
