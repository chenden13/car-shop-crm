import React, { useState } from 'react';
import { Search, Calendar, ChevronRight, FileUp, Plus, ArrowUpDown, Clock, Hash, CalendarCheck } from 'lucide-react';
import type { Customer, Role } from '../types';

interface PendingListPageProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
  onUpdateCustomer: (customer: Customer) => void;
  userRole?: Role;
  onImportClick?: () => void;
  onAddNew?: () => void;
}

export const PendingListPage: React.FC<PendingListPageProps> = ({ 
  customers, onEditCustomer, onUpdateCustomer, userRole, onImportClick, onAddNew 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<keyof Customer>('expectedEndDate');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  

  const scheduledCustomers = customers.filter(c => 
    ['deposit', 'scheduled'].includes(c.status) &&
    (
      String(c.name || '').includes(searchTerm) || 
      String(c.plateNumber || '').includes(searchTerm) || 
      String(c.phone || '').includes(searchTerm) ||
      (c.id && String(c.id).includes(searchTerm))
    )
  );

  const toggleSort = (key: keyof Customer) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  const sortedScheduled = [...scheduledCustomers].sort((a, b) => {
    const valA = String(a[sortKey] || (sortOrder === 'asc' ? '9999-99-99' : '0000-00-00'));
    const valB = String(b[sortKey] || (sortOrder === 'asc' ? '9999-99-99' : '0000-00-00'));
    
    // Numeric sort for ID if applicable
    if (sortKey === 'id') {
      const numA = parseInt(valA.replace(/\D/g, '')) || 0;
      const numB = parseInt(valB.replace(/\D/g, '')) || 0;
      return sortOrder === 'asc' ? numA - numB : numB - numA;
    }

    return sortOrder === 'asc' ? valA.localeCompare(valB) : valB.localeCompare(valA);
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
          {/* 排序按鈕 */}
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginRight: '10px' }}>
            {[
              { key: 'id', label: '編號', icon: Hash },
              { key: 'expectedStartDate', label: '留車時間', icon: Clock },
              { key: 'expectedEndDate', label: '施工時間', icon: Calendar },
              { key: 'deliveryDate', label: '交車時間', icon: CalendarCheck },
            ].map(item => {
              const isActive = sortKey === item.key;
              return (
                <button
                  key={item.key}
                  onClick={() => toggleSort(item.key as keyof Customer)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '8px',
                    border: 'none', background: isActive ? '#fff' : 'transparent',
                    color: isActive ? 'var(--accent)' : '#64748b',
                    fontSize: '0.8rem', fontWeight: isActive ? 'bold' : '500', 
                    cursor: 'pointer', boxShadow: isActive ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                    transition: 'all 0.2s'
                  }}
                >
                  <item.icon size={14} />
                  {item.label}
                  {isActive && <ArrowUpDown size={12} style={{ marginLeft: '2px', opacity: 0.7 }} />}
                </button>
              );
            })}
          </div>

          <button className="btn btn-primary" style={{ padding: '8px 20px', fontSize: '0.85rem', borderRadius: '10px', background: 'var(--accent)', borderColor: 'var(--accent)' }} onClick={onAddNew}>
            <Plus size={16} /> 新增排程
          </button>
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
                  gridTemplateColumns: '70px 150px 150px 2.5fr 115px 115px 115px 240px 90px',
          padding: '18px 25px',
          background: '#f8fafc',
          borderBottom: '2px solid #e2e8f0',
          fontWeight: 'bold',
          color: '#475569',
          fontSize: '0.85rem',
          letterSpacing: '0.5px'
        }}>
          <div>編號</div>
          <div>車主 / 電話</div>
          <div>車牌 / 車型</div>
          <div>施工項目(品牌/顏色)</div>
          <div>1.留車進場</div>
          <div>2.預計施工</div>
          <div>3.預計交車</div>
          <div>狀態追蹤</div>
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
                  gridTemplateColumns: '70px 150px 150px 2.5fr 115px 115px 115px 240px 90px',
                  alignItems: 'center',
                  padding: '20px 25px',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: '0.9rem',
                  background: idx % 2 === 0 ? '#fff' : '#fcfcfc',
                  transition: 'background 0.2s'
                }}
              >
                {/* 1. ID */}
                <div style={{ fontWeight: '600', color: '#64748b', fontSize: '0.75rem' }}>
                  {String(customer.id).includes('無編號') || (String(customer.id).startsWith('c_') && String(customer.id).length > 10) ? '—' : (customer.id || '—')}
                </div>
                
                {/* 2. Owner */}
                <div>
                  <div style={{ fontWeight: '700', color: '#1e293b' }}>{customer.name}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{customer.phone}</div>
                </div>

                {/* 3. Car */}
                <div>
                  <div style={{ fontWeight: '700', color: '#1e293b' }}>{customer.plateNumber}</div>
                  <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{customer.model}</div>
                </div>

                {/* 4. Service Items (主次調換) */}
                <div style={{ paddingRight: '15px' }}>
                  <div style={{ fontWeight: '800', color: '#0f172a', fontSize: '0.95rem' }}>
                    {customer.mainService || '未填項目'}
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b', marginTop: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <span style={{ padding: '2px 8px', background: '#f1f5f9', borderRadius: '4px', fontWeight: '600' }}>
                      {customer.mainServiceBrand || '無品牌'}
                    </span>
                    <span style={{ color: '#94a3b8' }}>|</span>
                    <span>{customer.filmColor || '未填顏色'}</span>
                  </div>
                </div>

                {/* 5. Check-in (留車) */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <input 
                    type="date" 
                    value={customer.expectedStartDate || ''} 
                    onChange={(e) => onUpdateCustomer({ ...customer, expectedStartDate: e.target.value })}
                    style={{ fontSize: '0.75rem', padding: '2px 4px', width: '105px', border: '1px solid #e2e8f0', borderRadius: '4px', fontWeight: '700', color: '#0369a1' }}
                  />
                  {customer.constructionTime && (
                    <div style={{ fontSize: '0.72rem', color: '#0ea5e9', marginTop: '2px' }}>{customer.constructionTime} (進)</div>
                  )}
                </div>

                {/* 6. Construction */}
                <div>
                   <input 
                    type="date" 
                    value={customer.expectedEndDate || ''} 
                    onChange={(e) => onUpdateCustomer({ ...customer, expectedEndDate: e.target.value })}
                    style={{ fontSize: '0.75rem', padding: '2px 4px', width: '105px', border: '1px solid #e2e8f0', borderRadius: '4px', fontWeight: '700', color: '#166534' }}
                  />
                </div>
                
                {/* 7. Delivery (交車) */}
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                  <input 
                    type="date" 
                    value={customer.deliveryDate || ''} 
                    onChange={(e) => onUpdateCustomer({ ...customer, deliveryDate: e.target.value })}
                    style={{ fontSize: '0.75rem', padding: '2px 4px', width: '105px', border: '1px solid #e2e8f0', borderRadius: '4px', fontWeight: '700', color: '#be185d' }}
                  />
                  {customer.expectedDeliveryTime && (
                    <div style={{ fontSize: '0.72rem', color: '#ec4899', marginTop: '2px' }}>{customer.expectedDeliveryTime} (交)</div>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                   <div 
                     onClick={() => onUpdateCustomer({ ...customer, inCalendar: !customer.inCalendar })}
                     style={{ 
                       display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                       padding: '2px 8px', borderRadius: '20px', 
                       background: customer.inCalendar ? '#ecfdf5' : '#f8fafc',
                       border: `1px solid ${customer.inCalendar ? '#10b981' : '#e2e8f0'}`
                     }}
                   >
                     <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: customer.inCalendar ? '#10b981' : '#cbd5e1' }}></div>
                     <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: customer.inCalendar ? '#065f46' : '#64748b' }}>行事曆</span>
                   </div>

                   <div 
                     onClick={() => onUpdateCustomer({ ...customer, quoteCreated: !customer.quoteCreated })}
                     style={{ 
                       display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                       padding: '2px 8px', borderRadius: '20px', 
                       background: customer.quoteCreated ? '#eff6ff' : '#f8fafc',
                       border: `1px solid ${customer.quoteCreated ? '#3b82f6' : '#e2e8f0'}`
                     }}
                   >
                     <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: customer.quoteCreated ? '#3b82f6' : '#cbd5e1' }}></div>
                     <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: customer.quoteCreated ? '#1e40af' : '#64748b' }}>報價單</span>
                   </div>

                   <div 
                     onClick={() => onUpdateCustomer({ ...customer, materialOrdered: !customer.materialOrdered })}
                     style={{ 
                       display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer',
                       padding: '2px 8px', borderRadius: '20px', 
                       background: customer.materialOrdered ? '#fff7ed' : '#f8fafc',
                       border: `1px solid ${customer.materialOrdered ? '#f59e0b' : '#e2e8f0'}`
                     }}
                   >
                     <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: customer.materialOrdered ? '#f59e0b' : '#cbd5e1' }}></div>
                     <span style={{ fontSize: '0.72rem', fontWeight: 'bold', color: customer.materialOrdered ? '#9a3412' : '#64748b' }}>已叫料</span>
                   </div>
                </div>

                {/* 9. Actions */}
                <div style={{ textAlign: 'center' }}>
                  <button 
                    onClick={() => onEditCustomer(customer)}
                    style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    <ChevronRight size={18} />
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
