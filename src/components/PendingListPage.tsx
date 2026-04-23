import React, { useState } from 'react';
import { Search, Calendar, Car, Tag, Clock, ChevronRight, FileUp } from 'lucide-react';
import type { Customer, StatusType, Role } from '../types';

interface PendingListPageProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
  userRole?: Role;
  onImportClick?: () => void;
}

export const PendingListPage: React.FC<PendingListPageProps> = ({ customers, onEditCustomer, userRole, onImportClick }) => {
  const [searchTerm, setSearchTerm] = useState('');
  

  const scheduledCustomers = customers.filter(c => 
    ['deposit', 'scheduled'].includes(c.status) &&
    (
      c.name.includes(searchTerm) || 
      c.plateNumber.includes(searchTerm) || 
      c.phone.includes(searchTerm) ||
      (c.id && c.id.includes(searchTerm))
    )
  );

  const sortedScheduled = [...scheduledCustomers].sort((a, b) => {
    const dateA = a.expectedStartDate || '9999-99-99';
    const dateB = b.expectedStartDate || '9999-99-99';
    return dateA.localeCompare(dateB);
  });

  const totalBudgetSum = sortedScheduled.reduce((sum, c) => sum + (c.totalAmount || 0), 0);

  return (
    <div style={{ padding: '0 20px 40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Calendar color="var(--accent)" size={24} /> 待施工排程總表
          </h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <p style={{ color: '#64748b', fontSize: '0.9rem' }}>管理已收訂、預約進場的案件進度</p>
            <div style={{ background: '#f0fdf4', padding: '4px 12px', borderRadius: '20px', border: '1px solid #bbf7d0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <span style={{ fontSize: '0.8rem', color: '#166534', fontWeight: 'bold' }}>待收款總額:</span>
              <span style={{ fontSize: '1.1rem', color: '#15803d', fontWeight: '800' }}>${totalBudgetSum.toLocaleString()}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {userRole === 'admin' && (
             <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#059669', borderColor: '#10b981' }} onClick={onImportClick}>
               <FileUp size={16} /> Excel 匯入
             </button>
          )}
          <div style={{ position: 'relative' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input
              type="text"
              placeholder="搜尋名稱、車牌或編號..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-panel"
              style={{
                padding: '10px 15px 10px 40px',
                borderRadius: '12px',
                width: '300px',
                fontSize: '0.9rem',
                outline: 'none'
              }}
            />
          </div>
        </div>
      </header>

      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '80px 120px 160px 160px 2fr 100px 100px 120px 60px',
          padding: '15px 20px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          fontWeight: 'bold',
          color: '#475569',
          fontSize: '0.85rem'
        }}>
          <div>編號</div>
          <div>預計施工日</div>
          <div>車主 / 電話</div>
          <div>車牌 / 車型</div>
          <div>主施工項目 / 備註</div>
          <div style={{ textAlign: 'center' }}>行事曆</div>
          <div style={{ textAlign: 'center' }}>已叫貨</div>
          <div>預算總計</div>
          <div style={{ textAlign: 'center' }}>操作</div>
        </div>

        {/* Table Body */}
        <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
          {sortedScheduled.length > 0 ? sortedScheduled.map((customer, idx) => {
            return (
              <div 
                key={customer.id} 
                className="list-row"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '80px 120px 160px 160px 2fr 100px 100px 120px 60px',
                  alignItems: 'center',
                  padding: '16px 20px',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: '0.88rem',
                  background: idx % 2 === 0 ? '#fff' : '#fafafa'
                }}
              >
                <div style={{ fontWeight: '600', color: '#64748b', fontSize: '0.75rem' }}>
                  {String(customer.id).includes('無編號') ? '-' : customer.id}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} className="text-primary" style={{ opacity: 0.6 }} />
                    <span style={{ fontWeight: customer.expectedStartDate ? '700' : 'normal', fontSize: '0.85rem' }}>
                      {customer.expectedStartDate || '未定'}
                    </span>
                  </div>
                  {customer.constructionTime && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{customer.constructionTime}</div>}
                </div>

                <div>
                  <div style={{ fontWeight: '700', color: '#1e293b' }}>{customer.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{customer.phone}</div>
                </div>

                <div>
                  <div style={{ fontWeight: '700', color: '#1e293b' }}>{customer.plateNumber}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{customer.model}</div>
                </div>

                <div style={{ paddingRight: '20px' }}>
                  <div style={{ fontWeight: '600', color: '#475569', fontSize: '0.85rem' }}>{customer.mainService}</div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={customer.notes}>
                    {customer.notes || '-'}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  {customer.inCalendar ? <Tag size={18} style={{ color: '#10b981' }} fill="#10b98122" /> : '-'}
                </div>

                <div style={{ textAlign: 'center' }}>
                  {customer.materialOrdered ? <Tag size={18} style={{ color: '#3b82f6' }} fill="#3b82f622" /> : '-'}
                </div>

                <div style={{ fontWeight: '700', color: 'var(--primary)', fontSize: '1rem' }}>
                  ${(customer.totalAmount || 0).toLocaleString()}
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button 
                    onClick={() => onEditCustomer(customer)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1' }}
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            );
          }) : (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
              目前的範圍內沒有待施工的案件資料。
            </div>
          )}
        </div>
      </div>

      <style>{`
        .list-row:hover {
          background: #f8fafc !important;
        }
      `}</style>
    </div>
  );
};
