import React from 'react';
import type { Customer } from '../types';
import { LayoutDashboard, Edit3, CheckCircle2, Car, Clock } from 'lucide-react';


interface ConstructionMonitorPageProps {
  customers: Customer[];
  onBack: () => void;
  onEdit: (customer: Customer) => void;
  onUpdateProgress: (customer: Customer) => void;
}

export const ConstructionMonitorPage: React.FC<ConstructionMonitorPageProps> = ({ customers, onBack, onEdit, onUpdateProgress }) => {
  const activeConstructions = customers.filter(c => c.status === 'construction');

  const getProgress = (customer: Customer) => {
    if (!customer.constructionChecklist || customer.constructionChecklist.length === 0) return 0;
    const checked = customer.constructionChecklist.filter(item => item.checked).length;
    return Math.round((checked / customer.constructionChecklist.length) * 100);
  };

  const handleToggleCheck = (customer: Customer, id: string) => {
    const updatedChecklist = customer.constructionChecklist?.map(item => 
      item.id === id ? { ...item, checked: !item.checked } : item
    ) || [];
    onUpdateProgress({ ...customer, constructionChecklist: updatedChecklist });
  };

  return (
    <div style={{ padding: '0 24px 40px', margin: '0 auto', maxWidth: '1400px' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px', paddingTop: '24px' }}>
        <div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, marginBottom: '6px', fontWeight: 'bold' }}>
            ← 返回看板
          </button>
          <h1 style={{ margin: 0, fontSize: '1.8rem', fontWeight: '800' }}>現場施工進度監控</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.9rem' }}>管理現場正在施作的車輛進度 ({activeConstructions.length} 台)</p>
        </div>
      </header>

      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
        {/* Table Header */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '150px 150px 1fr 200px 150px 80px',
          padding: '18px 25px',
          background: '#f8fafc',
          borderBottom: '2px solid #e2e8f0',
          fontWeight: 'bold',
          color: '#475569',
          fontSize: '0.85rem',
          letterSpacing: '0.5px'
        }}>
          <div>車主 / 車牌</div>
          <div>車型 / 型號</div>
          <div>施工細目與即時進度 (可直接點擊確認)</div>
          <div>整體進度概況</div>
          <div>預計完工</div>
          <div style={{ textAlign: 'center' }}>詳細</div>
        </div>

        {/* Table Body */}
        <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
          {activeConstructions.length > 0 ? activeConstructions.map((customer, idx) => {
            const progress = getProgress(customer);
            const checkedCount = customer.constructionChecklist?.filter(i => i.checked).length ?? 0;
            const totalCount = customer.constructionChecklist?.length ?? 0;

            return (
              <div 
                key={customer.id} 
                className="list-row"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '150px 150px 1fr 200px 150px 80px',
                  alignItems: 'start',
                  padding: '24px 25px',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: '0.9rem',
                  background: idx % 2 === 0 ? '#fff' : '#fcfcfc',
                  transition: 'background 0.2s'
                }}
              >
                {/* 1. Owner & Plate */}
                <div>
                  <div style={{ fontWeight: '700', color: '#1e293b', fontSize: '1rem' }}>{customer.name}</div>
                  <div style={{ fontSize: '1rem', color: 'var(--primary)', fontWeight: '800', margin: '4px 0' }}>{customer.plateNumber || '尚未掛牌'}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>ID: {customer.id}</div>
                </div>
                
                {/* 2. Car */}
                <div>
                  <div style={{ fontWeight: '700', color: '#1e293b' }}>{customer.brand}</div>
                  <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{customer.model}</div>
                  {customer.vehicleSize && <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#f1f5f9', borderRadius: '4px', color: '#64748b' }}>{customer.vehicleSize}</span>}
                </div>

                {/* 3. Detailed Progress Checklist */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                   {customer.constructionChecklist?.map(step => (
                     <div 
                      key={step.id} 
                      onClick={() => handleToggleCheck(customer, step.id)}
                      style={{ 
                        display: 'flex', 
                        alignItems: 'center', 
                        gap: '8px', 
                        padding: '6px 10px', 
                        borderRadius: '8px', 
                        background: step.checked ? '#ecfdf5' : '#f8fafc',
                        border: `1px solid ${step.checked ? '#10b981' : '#e2e8f0'}`,
                        cursor: 'pointer',
                        transition: '0.2s',
                        fontSize: '0.8rem'
                      }}
                     >
                       {step.checked ? <CheckCircle2 size={14} color="#10b981" /> : <div style={{ width: 14, height: 14, border: '1px solid #cbd5e1', borderRadius: '50%' }} />}
                       <span style={{ color: step.checked ? '#065f46' : '#64748b', textDecoration: step.checked ? 'line-through' : 'none', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                         {step.name}
                       </span>
                     </div>
                   ))}
                   {(!customer.constructionChecklist || customer.constructionChecklist.length === 0) && (
                     <div style={{ color: '#94a3b8', fontSize: '0.8rem', fontStyle: 'italic' }}>尚未初始化檢核清單</div>
                   )}
                </div>

                {/* 4. Overall Progress Bar */}
                <div style={{ paddingRight: '20px' }}>
                   <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', marginBottom: '8px' }}>
                      <span style={{ fontWeight: '800', color: progress === 100 ? '#10b981' : 'var(--primary)' }}>{progress}% 已完成</span>
                      <span style={{ color: '#94a3b8' }}>{checkedCount}/{totalCount}</span>
                   </div>
                   <div style={{ height: '8px', background: '#e2e8f0', borderRadius: '4px', overflow: 'hidden' }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? '#10b981' : 'var(--primary)', transition: 'width 0.4s ease' }} />
                   </div>
                   <div style={{ marginTop: '10px', fontSize: '0.7rem', color: '#64748b' }}>
                      主項: {customer.mainService}
                   </div>
                </div>

                {/* 5. Expected Delivery */}
                <div>
                   <div style={{ fontSize: '0.9rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>
                     <Clock size={14} color="#94a3b8" /> {customer.expectedEndDate || '-'}
                   </div>
                   <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '4px' }}>
                      {(() => {
                        if (!customer.expectedEndDate) return '剩餘施工時間：未知';
                        const end = new Date(customer.expectedEndDate);
                        const nowArr = new Date().toISOString().split('T')[0];
                        const diff = Math.floor((end.getTime() - new Date(nowArr).getTime()) / (1000 * 60 * 60 * 24));
                        if (diff < 0) return <span style={{ color: '#ef4444', fontWeight: 'bold' }}>已逾期 {Math.abs(diff)} 天</span>;
                        if (diff === 0) return <span style={{ color: '#f59e0b', fontWeight: 'bold' }}>今日完工</span>;
                        return `剩餘施工時間：${diff} 天`;
                      })()}
                   </div>
                </div>

                {/* 6. Action */}
                <div style={{ textAlign: 'center' }}>
                  <button 
                    onClick={() => onEdit(customer)}
                    style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', borderRadius: '50%', width: '40px', height: '40px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: '0.2s' }}
                    onMouseOver={(e) => { e.currentTarget.style.background = 'var(--primary)'; e.currentTarget.style.color = '#fff'; }}
                    onMouseOut={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#64748b'; }}
                  >
                    <Edit3 size={18} />
                  </button>
                </div>
              </div>
            );
          }) : (
            <div style={{ padding: '80px', textAlign: 'center', color: '#94a3b8' }}>
              <Car size={48} style={{ opacity: 0.2, marginBottom: '15px' }} />
              <p>目前的範圍內沒有正在施工的案件。</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
