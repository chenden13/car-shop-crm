import React, { useState } from 'react';
import { Search, Hammer, Calendar, Clock, ChevronRight, CheckCircle, Package, Settings } from 'lucide-react';
import type { Customer } from '../types';

interface ActiveConstructionPageProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
}

export const ActiveConstructionPage: React.FC<ActiveConstructionPageProps> = ({ customers, onEditCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const constructionCustomers = customers.filter(c => 
    c.status === 'construction' &&
    (
      c.name.includes(searchTerm) || 
      c.plateNumber.includes(searchTerm) || 
      c.phone.includes(searchTerm)
    )
  );

  // 排序：按預計交車日期排序
  const sorted = [...constructionCustomers].sort((a, b) => {
    const dateA = a.expectedEndDate || '9999-99-99';
    const dateB = b.expectedEndDate || '9999-99-99';
    return dateA.localeCompare(dateB);
  });

  return (
    <div style={{ padding: '0 20px 40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: 'var(--primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Hammer size={24} color="var(--accent)" /> 店內施工監控總表
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>即時管理目前正在現場施工中的車輛預期進度</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input
              type="text"
              placeholder="搜尋編號、車牌..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-panel"
              style={{ padding: '10px 15px 10px 40px', borderRadius: '12px', width: '280px', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>
        </div>
      </header>

      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', minWidth: '1100px', border: '1px solid var(--border-light)' }}>
        {/* Table Header */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '160px 1.5fr 150px 1.5fr 180px 60px',
          padding: '18px 25px',
          background: 'var(--primary)',
          fontWeight: 'bold',
          color: '#fff',
          fontSize: '0.85rem',
          letterSpacing: '0.5px'
        }}>
          <div>車主 / 車牌</div>
          <div>施工膜料項目</div>
          <div>施工時間</div>
          <div>加裝配件 / 贈品</div>
          <div>預期交車狀態</div>
          <div style={{ textAlign: 'center' }}>操作</div>
        </div>

        {/* Table Body */}
        <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
          {sorted.length > 0 ? sorted.map((customer, idx) => {
            return (
              <div 
                key={customer.id} 
                className="list-row"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '160px 1.5fr 150px 1.5fr 180px 60px',
                  alignItems: 'center',
                  padding: '18px 20px',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: '0.9rem',
                  transition: 'background 0.2s',
                  background: '#fff'
                }}
              >
                {/* 1. 車主 / 車牌 */}
                <div>
                  <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '1rem' }}>{customer.plateNumber}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{customer.name}</div>
                </div>

                {/* 2. 施工項目/膜料 */}
                <div style={{ paddingRight: '15px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                    {customer.selectedFilms && customer.selectedFilms.length > 0 ? customer.selectedFilms.map((film, fidx) => (
                      <span key={fidx} style={{ background: '#f8fafc', color: 'var(--accent)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '800', border: '1px solid #e2e8f0' }}>
                        {film}
                      </span>
                    )) : (
                      <span style={{ color: '#94a3b8' }}>未標註膜料</span>
                    )}
                  </div>
                  {customer.mainService && <div style={{ fontSize: '0.8rem', marginTop: '4px', color: '#475569' }}>{customer.mainService}</div>}
                </div>

                {/* 3. 施工時間 */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#1e293b', fontWeight: '600' }}>
                    <Calendar size={14} className="text-primary" /> {customer.expectedStartDate || '未定'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '2px', marginLeft: '19px' }}>
                    {customer.constructionTime || '-'}
                  </div>
                </div>

                {/* 4. 配件 / 贈品 */}
                <div style={{ paddingRight: '15px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                    {(customer.giftItems || []).map((gift, gidx) => (
                      <span key={gidx} style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem', color: '#475569', border: '1px solid #e2e8f0' }}>
                        {gift}
                      </span>
                    ))}
                    {(customer.customAccessories || []).map((acc, aidx) => (
                      <span key={aidx} style={{ background: '#f1f5f9', padding: '1px 6px', borderRadius: '4px', fontSize: '0.7rem', color: '#475569', border: '1px solid #e2e8f0' }}>
                        {acc.name}
                      </span>
                    ))}
                    {(!customer.giftItems?.length && !customer.customAccessories?.length) && <span style={{ color: '#cbd5e1', fontSize: '0.8rem' }}>無加裝項目</span>}
                  </div>
                </div>

                {/* 5. 預計交車 */}
                <div style={{ background: '#f0fdf4', padding: '8px 12px', borderRadius: '8px', border: '1px solid #dcfce7' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#166534', fontWeight: '700' }}>
                    <CheckCircle size={14} /> {customer.expectedEndDate || '未設定'}
                  </div>
                  <div style={{ fontSize: '0.75rem', color: '#15803d', marginTop: '2px', marginLeft: '19px' }}>
                    {customer.expectedDeliveryTime || '未定時間'}
                  </div>
                </div>

                {/* 6. 操作 */}
                <div style={{ textAlign: 'center' }}>
                  <button 
                    onClick={() => onEditCustomer(customer)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#e2e8f0', transition: 'color 0.2s' }}
                    className="edit-hover-red"
                  >
                    <Settings size={20} />
                  </button>
                </div>
              </div>
            );
          }) : (
            <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
              目前現場沒有正在施工中的車輛。
            </div>
          )}
        </div>
      </div>

      <style>{`
        .list-row:hover {
          background: #f8fafc !important;
        }
        .edit-hover-red:hover {
          color: var(--accent) !important;
        }
      `}</style>
    </div>
  );
};
