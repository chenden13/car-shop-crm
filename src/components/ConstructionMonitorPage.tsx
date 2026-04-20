import React from 'react';
import type { Customer } from '../types';
import { LayoutDashboard, Edit3, CheckCircle2, Car, Clock } from 'lucide-react';


interface ConstructionMonitorPageProps {
  customers: Customer[];
  onBack: () => void;
  onEdit: (customer: Customer) => void;
}

export const ConstructionMonitorPage: React.FC<ConstructionMonitorPageProps> = ({ customers, onBack, onEdit }) => {
  const activeConstructions = customers.filter(c => c.status === 'construction');

  const getProgress = (customer: Customer) => {
    if (!customer.constructionChecklist || customer.constructionChecklist.length === 0) return 0;
    const checked = customer.constructionChecklist.filter(item => item.checked).length;
    return Math.round((checked / customer.constructionChecklist.length) * 100);
  };


  return (
    <div style={{ padding: '24px', margin: '0 auto', maxWidth: '100%' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '28px' }}>
        <div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, marginBottom: '6px', fontWeight: 'bold' }}>
            ← 返回看板
          </button>
          <h1 style={{ margin: 0, fontSize: '1.8rem' }}>施工進度即時監控</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: '0.9rem' }}>目前施工中共 {activeConstructions.length} 台</p>

        </div>
        <div style={{ background: '#f8fafc', padding: '10px 18px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LayoutDashboard color="var(--primary)" size={22} />
          <div>
            <div style={{ fontSize: '0.7rem', color: '#64748b' }}>施工中</div>
            <div style={{ fontWeight: '800', fontSize: '1.1rem' }}>{activeConstructions.length} <span style={{ fontSize: '0.8rem', color: '#94a3b8' }}>Units</span></div>
          </div>
        </div>
      </header>

      <section>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '700', color: '#1d4ed8', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px', padding: '10px 16px', background: '#eff6ff', borderRadius: '10px', border: '1px solid #bfdbfe' }}>
          <Car size={18} /> 施工進行中 ({activeConstructions.length} 台)
        </h2>


        {activeConstructions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>
            <Car size={40} style={{ marginBottom: '12px', opacity: 0.3 }} />
            <p>目前沒有正在施工中的車輛</p>
          </div>
        ) : (
          <div style={{ overflowX: 'auto', paddingBottom: '12px' }}>
            <div style={{ display: 'flex', gap: '16px', minWidth: 'max-content', alignItems: 'flex-start' }}>
              {activeConstructions.map(customer => {
                const progress = getProgress(customer);
                const checkedCount = customer.constructionChecklist?.filter(i => i.checked).length ?? 0;
                const totalCount = customer.constructionChecklist?.length ?? 0;

                return (
                  <div key={customer.id} style={{ width: '280px', flexShrink: 0, background: '#fff', borderRadius: '16px', border: '1px solid #e2e8f0', overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,0.06)', display: 'flex', flexDirection: 'column' }}>
                    {/* Top progress bar */}
                    <div style={{ height: '5px', background: '#f1f5f9' }}>
                      <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? '#10b981' : 'linear-gradient(90deg, #3b82f6, #60a5fa)', transition: 'width 0.6s ease' }} />
                    </div>

                    {/* Card header */}
                    <div style={{ padding: '16px 16px 12px', borderBottom: '1px solid #f1f5f9' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '3px' }}>
                            <span style={{ background: '#0f172a', color: '#fff', padding: '1px 6px', borderRadius: '3px', fontSize: '0.65rem', fontWeight: 'bold' }}>{customer.id}</span>
                            <span style={{ fontSize: '1.1rem', fontWeight: '800' }}>{customer.plateNumber}</span>
                          </div>
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{customer.brand} {customer.model}</div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '0.65rem', color: '#94a3b8' }}>客人</div>
                          <div style={{ fontWeight: '700', fontSize: '0.95rem' }}>{customer.name}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: '10px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                        <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '6px 8px' }}>
                          <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginBottom: '2px' }}>施工項目</div>
                          <div style={{ fontWeight: '600', fontSize: '0.78rem', color: 'var(--primary)' }}>{customer.mainService}</div>
                        </div>
                        <div style={{ background: '#f8fafc', borderRadius: '8px', padding: '6px 8px' }}>
                          <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginBottom: '2px', display: 'flex', alignItems: 'center', gap: '3px' }}><Clock size={9} />預計交車</div>
                          <div style={{ fontWeight: '600', fontSize: '0.78rem' }}>{customer.expectedEndDate ?? '未設定'}</div>
                        </div>
                      </div>
                      <div style={{ marginTop: '8px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.7rem', marginBottom: '4px' }}>
                          <span style={{ color: '#64748b' }}>完成進度</span>
                          <span style={{ fontWeight: 'bold', color: progress === 100 ? '#10b981' : '#3b82f6' }}>{checkedCount} / {totalCount} ({progress}%)</span>
                        </div>
                        <div style={{ height: '4px', background: '#e2e8f0', borderRadius: '2px', overflow: 'hidden' }}>
                          <div style={{ width: `${progress}%`, height: '100%', background: progress === 100 ? '#10b981' : '#3b82f6', borderRadius: '2px' }} />
                        </div>
                      </div>
                    </div>

                    {/* Checklist items */}
                    <div style={{ padding: '12px 16px', flex: 1, display: 'flex', flexDirection: 'column', gap: '5px' }}>
                      {customer.constructionChecklist && customer.constructionChecklist.length > 0 ? (
                        customer.constructionChecklist.map(item => (
                          <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '6px 10px', borderRadius: '6px', background: item.checked ? '#f0fdf4' : '#fafafa', border: `1px solid ${item.checked ? '#dcfce7' : '#f1f5f9'}` }}>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.78rem', color: item.checked ? '#16a34a' : '#334155' }}>
                              {item.checked
                                ? <CheckCircle2 size={12} style={{ color: '#10b981', flexShrink: 0 }} />
                                : <div style={{ width: '11px', height: '11px', borderRadius: '50%', border: '1.5px solid #cbd5e1', flexShrink: 0 }} />}
                              <span style={{ textDecoration: item.checked ? 'line-through' : 'none', fontWeight: item.checked ? '400' : '600', lineHeight: 1.3 }}>{item.name}</span>
                            </span>
                            <span style={{ marginLeft: '6px', flexShrink: 0, padding: '1px 7px', borderRadius: '20px', fontSize: '0.6rem', fontWeight: 'bold', background: item.checked ? '#dcfce7' : '#fff1f2', color: item.checked ? '#166534' : '#e11d48' }}>
                              {item.checked ? '完成' : '待辦'}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div style={{ color: '#94a3b8', fontSize: '0.8rem', textAlign: 'center', padding: '16px' }}>尚未建立施工清單</div>
                      )}
                    </div>

                    {/* Footer button */}
                    <div style={{ padding: '12px 16px', borderTop: '1px solid #f1f5f9' }}>
                      <button className="btn btn-primary" style={{ width: '100%', padding: '9px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 'bold' }} onClick={() => onEdit(customer)}>
                        <Edit3 size={13} /> 進入檢核 / 修改
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
