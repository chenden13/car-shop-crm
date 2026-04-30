import React, { useState } from 'react';
import { Search, Hammer, Settings, Camera, Image as ImageIcon, ChevronRight, User, Car, Clock, Activity } from 'lucide-react';
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

  const sorted = [...constructionCustomers].sort((a, b) => {
    const dateA = a.expectedEndDate || '9999-99-99';
    const dateB = b.expectedEndDate || '9999-99-99';
    return dateA.localeCompare(dateB);
  });

  const isMobile = window.innerWidth <= 768;

  return (
    <div style={{ padding: isMobile ? '0 12px 40px 12px' : '0 20px 40px 20px', maxWidth: '1500px', margin: '0 auto' }}>
      <header style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '15px' }}>
        <div style={{ width: isMobile ? '100%' : 'auto' }}>
          <h2 style={{ fontSize: isMobile ? '1.25rem' : '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Hammer size={isMobile ? 20 : 24} color="#3b82f6" /> 現場施工監控
          </h2>
          <p style={{ fontSize: '0.9rem', color: '#64748b' }}>目前有 {sorted.length} 台車輛正在場內施作</p>
        </div>

        <div style={{ display: 'flex', gap: '10px', width: isMobile ? '100%' : 'auto' }}>
          <div style={{ position: 'relative', width: isMobile ? '100%' : '300px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input
              type="text"
              placeholder="搜尋車牌、車主..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="form-control"
              style={{ paddingLeft: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%' }}
            />
          </div>
        </div>
      </header>

      {isMobile ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {sorted.length > 0 ? sorted.map(customer => {
            const checklist = customer.constructionChecklist || [];
            const completedCount = checklist.filter(i => i.checked).length;
            const totalCount = checklist.length || 5; 
            const progressPercent = Math.round((completedCount / totalCount) * 100);
            const lastCompleted = [...checklist].reverse().find(i => i.checked);
            const currentStep = lastCompleted ? `已完成: ${lastCompleted.name}` : '準備動工中';

            return (
              <div 
                key={customer.id} 
                className="form-section indigo" 
                onClick={() => onEditCustomer(customer)}
                style={{ padding: '20px', cursor: 'pointer', margin: 0 }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                  <div>
                    <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#1e293b' }}>{customer.plateNumber}</div>
                    <div style={{ fontSize: '0.9rem', color: '#64748b' }}>{customer.name} · {customer.brand} {customer.model}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#3b82f6' }}>{progressPercent}%</div>
                    <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>{completedCount}/{totalCount}</div>
                  </div>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px', borderRadius: '12px', marginBottom: '12px', border: '1px solid #e2e8f0' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#1e293b' }}>{customer.mainServiceBrand} - {customer.filmColor}</div>
                  <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{customer.mainService}</div>
                </div>

                <div style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '4px' }}>
                    <span style={{ color: '#3b82f6', fontWeight: 'bold' }}>當前狀態: {currentStep}</span>
                  </div>
                  <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${progressPercent}%`, background: '#3b82f6' }}></div>
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ fontSize: '0.75rem', color: '#ef4444', fontWeight: 'bold' }}>
                    交車: {customer.expectedEndDate?.slice(5)} {customer.expectedDeliveryTime}
                  </div>
                  <ChevronRight size={18} color="#cbd5e1" />
                </div>
              </div>
            );
          }) : (
            <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>目前無場內施工案件</div>
          )}
        </div>
      ) : (
        <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
              <tr>
                <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b' }}>車主 / 車牌</th>
                <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b' }}>車型</th>
                <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b' }}>膜料 / 項目</th>
                <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b' }}>目前進度</th>
                <th style={{ padding: '15px 20px', textAlign: 'left', fontSize: '0.8rem', color: '#64748b' }}>預計交車</th>
                <th style={{ padding: '15px 20px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b' }}>操作</th>
              </tr>
            </thead>
            <tbody>
              {sorted.map(customer => {
                const checklist = customer.constructionChecklist || [];
                const completedCount = checklist.filter(i => i.checked).length;
                const totalCount = checklist.length || 5;
                const progressPercent = Math.round((completedCount / totalCount) * 100);
                const lastCompleted = [...checklist].reverse().find(i => i.checked);

                return (
                  <tr key={customer.id} className="list-row" style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }} onClick={() => onEditCustomer(customer)}>
                    <td style={{ padding: '18px 20px' }}>
                      <div style={{ fontWeight: '800', color: '#1e293b' }}>{customer.plateNumber}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{customer.name}</div>
                    </td>
                    <td style={{ padding: '18px 20px' }}>
                      <div style={{ fontWeight: '600' }}>{customer.brand}</div>
                      <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{customer.model}</div>
                    </td>
                    <td style={{ padding: '18px 20px' }}>
                      <div style={{ fontWeight: 'bold', color: '#3b82f6' }}>{customer.mainServiceBrand} {customer.filmColor}</div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{customer.mainService}</div>
                    </td>
                    <td style={{ padding: '18px 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{ flex: 1, height: '8px', background: '#e2e8f0', borderRadius: '4px', maxWidth: '100px' }}>
                          <div style={{ height: '100%', width: `${progressPercent}%`, background: '#10b981', borderRadius: '4px' }}></div>
                        </div>
                        <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#10b981' }}>{progressPercent}%</span>
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#64748b', marginTop: '4px' }}>
                        {lastCompleted ? `完成: ${lastCompleted.name}` : '準備中'}
                      </div>
                    </td>
                    <td style={{ padding: '18px 20px' }}>
                      <div style={{ fontWeight: 'bold', color: '#ef4444' }}>{customer.expectedEndDate}</div>
                      <div style={{ fontSize: '0.75rem', color: '#ef4444' }}>{customer.expectedDeliveryTime}</div>
                    </td>
                    <td style={{ padding: '18px 20px', textAlign: 'center' }}>
                      <button className="btn btn-outline" style={{ padding: '6px 12px' }}><Settings size={18} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {sorted.length === 0 && (
            <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>目前無施工中車輛</div>
          )}
        </div>
      )}

      <style>{`
        .list-row:hover { background: #f8fafc !important; }
      `}</style>
    </div>
  );
};
