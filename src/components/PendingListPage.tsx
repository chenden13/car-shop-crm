import React, { useState } from 'react';
import { Search, Filter, Calendar, Car, Tag, Clock, ChevronRight } from 'lucide-react';
import type { Customer, StatusType } from '../types';

interface PendingListPageProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
}

export const PendingListPage: React.FC<PendingListPageProps> = ({ customers, onEditCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  // 篩選「未完工進度」的所有狀態 (包含施工中)
  const pendingStatuses: StatusType[] = ['new', 'deposit', 'scheduled', 'construction'];
  
  console.log('Pending List Debug:', {
    allCount: customers.length,
    statuses: pendingStatuses,
    constructionCount: customers.filter(c => c.status === 'construction').length,
    sampleStatus: customers.find(c => c.name.includes('趙六'))?.status
  });

  const pendingCustomers = customers.filter(c => 
    pendingStatuses.includes(c.status) &&
    (
      c.name.includes(searchTerm) || 
      c.plateNumber.includes(searchTerm) || 
      c.phone.includes(searchTerm) ||
      (c.id && c.id.includes(searchTerm))
    )
  );

  // 排序：按日期排序（如果有預計日期的話）
  const sortedPending = [...pendingCustomers].sort((a, b) => {
    const dateA = a.expectedStartDate || '9999-99-99';
    const dateB = b.expectedStartDate || '9999-99-99';
    return dateA.localeCompare(dateB);
  });

  const getStatusLabel = (status: StatusType) => {
    switch (status) {
      case 'new': return { text: '進件', color: '#3b82f6', bg: '#eff6ff' };
      case 'deposit': return { text: '收訂', color: '#f59e0b', bg: '#fffbeb' };
      case 'scheduled': return { text: '預約', color: '#10b981', bg: '#ecfdf5' };
      case 'construction': return { text: '施工', color: '#e11d48', bg: '#fff1f2' };
      default: return { text: status, color: '#64748b', bg: '#f1f5f9' };
    }
  };

  return (
    <div style={{ padding: '0 20px 40px 20px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Clock className="text-primary" size={24} /> 未完工排程總表
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>管理所有新增、已收訂、預約及施工中的客戶進度</p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
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

      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', minWidth: '1100px' }}>
        {/* Table Header */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '80px 120px 160px 160px 2fr 80px 80px 100px 100px 50px',
          padding: '15px 20px',
          background: '#f8fafc',
          borderBottom: '1px solid #e2e8f0',
          fontWeight: 'bold',
          color: '#475569',
          fontSize: '0.85rem'
        }}>
          <div>編號</div>
          <div>施工日期</div>
          <div>車主 / 電話</div>
          <div>車牌 / 車型</div>
          <div>膜料項目 / 備註</div>
          <div style={{ textAlign: 'center' }}>行事曆</div>
          <div style={{ textAlign: 'center' }}>叫貨</div>
          <div>預算金額</div>
          <div>目前狀態</div>
          <div style={{ textAlign: 'center' }}>操作</div>
        </div>

        {/* Table Body */}
        <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
          {sortedPending.length > 0 ? sortedPending.map((customer, idx) => {
            const statusStyle = getStatusLabel(customer.status);
            return (
              <div 
                key={customer.id} 
                className="list-row"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '80px 120px 160px 160px 2fr 80px 80px 100px 100px 50px',
                  alignItems: 'center',
                  padding: '16px 20px',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: '0.88rem',
                  transition: 'background 0.2s',
                  background: idx % 2 === 0 ? '#fff' : '#fafafa'
                }}
              >
                <div style={{ fontWeight: '600', color: '#64748b', fontSize: '0.75rem' }}>
                  {String(customer.id).includes('無編號') ? '-' : customer.id}
                </div>
                
                <div style={{ display: 'flex', flexDirection: 'column', color: '#1e293b' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Calendar size={13} className="text-primary" style={{ opacity: 0.6 }} />
                    <span style={{ fontWeight: customer.expectedStartDate ? '700' : 'normal', fontSize: '0.85rem' }}>
                      {customer.expectedStartDate || <span style={{ color: '#cbd5e1' }}>未定日期</span>}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748b', marginTop: '2px' }}>
                    <Clock size={12} />
                    <span>{customer.constructionTime || '未定時間'}</span>
                  </div>
                </div>

                <div>
                  <div style={{ fontWeight: '700', color: '#1e293b' }}>{customer.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{customer.phone}</div>
                </div>

                <div>
                  <div style={{ fontWeight: '700', color: '#1e293b' }}>{customer.plateNumber}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{customer.brand} {customer.model}</div>
                </div>

                <div style={{ paddingRight: '20px' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginBottom: '4px' }}>
                    {customer.selectedFilms && customer.selectedFilms.length > 0 ? customer.selectedFilms.map((film, fidx) => (
                      <span key={fidx} style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', color: '#475569', border: '1px solid #e2e8f0' }}>
                        {film}
                      </span>
                    )) : (
                      customer.mainService && <span style={{ background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', fontSize: '0.7rem', color: '#475569', border: '1px solid #e2e8f0' }}>{customer.mainService}</span>
                    )}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#94a3b8', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={customer.notes}>
                    {customer.notes || '-'}
                  </div>
                </div>

                <div style={{ textAlign: 'center' }}>
                  {customer.inCalendar ? <Tag size={18} style={{ color: '#10b981' }} fill="#10b98122" /> : <span style={{ color: '#cbd5e1' }}>-</span>}
                </div>

                <div style={{ textAlign: 'center' }}>
                  {customer.materialOrdered ? <Tag size={18} style={{ color: '#3b82f6' }} fill="#3b82f622" /> : <span style={{ color: '#cbd5e1' }}>-</span>}
                </div>

                <div style={{ fontWeight: '700', color: 'var(--primary)' }}>
                  ${(customer.totalAmount || 0).toLocaleString()}
                </div>

                <div>
                  <span style={{ 
                    background: statusStyle.bg, 
                    color: statusStyle.color, 
                    padding: '4px 10px', 
                    borderRadius: '8px', 
                    fontSize: '0.72rem', 
                    fontWeight: '800',
                    border: `1px solid ${statusStyle.color}22`
                  }}>
                    {statusStyle.text}
                  </span>
                </div>

                <div style={{ textAlign: 'center' }}>
                  <button 
                    onClick={() => onEditCustomer(customer)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#cbd5e1', transition: 'color 0.2s' }}
                    className="edit-hover"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              </div>
            );
          }) : (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>
              目前的篩選範圍內沒有待施工的客人資料。
            </div>
          )}
        </div>
      </div>

      <style>{`
        .list-row:hover {
          background: #f8fafc !important;
        }
        .edit-hover:hover {
          color: var(--primary) !important;
        }
      `}</style>
    </div>
  );
};
