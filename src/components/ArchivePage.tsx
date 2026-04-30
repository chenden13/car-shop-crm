import React, { useState } from 'react';
import type { Customer, Role } from '../types';

import {
  Search, Calendar, ShieldCheck,
  ChevronDown, ChevronUp, Gift, Package, CheckCircle2, FileUp, ListChecks,
  XCircle, FileText, AlertCircle, Hash, DollarSign,
  ArrowUp, ArrowDown, Save, Image as ImageIcon, Camera, UserCheck, Clock
} from 'lucide-react';


interface ArchivePageProps {
  customers: Customer[];
  onBack: () => void;
  onViewDetail: (customer: Customer) => void;
  onUpdate: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  userRole?: Role;
  onImportClick: () => void;
}




const ToggleBadge = ({
  ok, label, onToggle
}: { ok?: boolean; label: string; onToggle: () => void }) => (
  <button
    onClick={(e) => { e.stopPropagation(); onToggle(); }}
    style={{
      display: 'inline-flex', alignItems: 'center', gap: '4px',
      padding: '5px 10px', borderRadius: '20px', fontSize: '0.72rem', fontWeight: 'bold',
      background: ok ? '#dcfce7' : '#f8fafc',
      color: ok ? '#166534' : '#64748b',
      border: `1.5px solid ${ok ? '#86efac' : '#e2e8f0'}`,
      cursor: 'pointer', transition: 'all 0.15s'
    }}
  >
    {ok ? <CheckCircle2 size={11} /> : <XCircle size={11} color="#cbd5e1" />} {label}
  </button>
);

const InfoRow = ({ label, value }: { label: string; value?: string | number | boolean | null }) => {
  if (value === undefined || value === null || value === '' || value === false) return null;
  return (
    <div style={{ display: 'flex', gap: '8px', padding: '5px 0', borderBottom: '1px solid #f8fafc' }}>
      <span style={{ fontSize: '0.78rem', color: '#94a3b8', minWidth: '90px', flexShrink: 0 }}>{label}</span>
      <span style={{ fontSize: '0.82rem', fontWeight: '600', color: '#1e293b' }}>{String(value)}</span>
    </div>
  );
};

const Section = ({ icon, title, children, color = '#64748b' }: { icon: React.ReactNode; title: string; children: React.ReactNode; color?: string }) => (
  <div style={{ marginBottom: '16px' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color, fontWeight: 'bold', fontSize: '0.78rem', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '8px' }}>
      {icon} {title}
    </div>
    <div style={{ paddingLeft: '4px' }}>{children}</div>
  </div>
);

export const ArchivePage: React.FC<ArchivePageProps> = ({ 
  customers, onBack, onUpdate, onEdit, userRole, onImportClick
}) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'id' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 200;

  const completedCustomers = customers.filter(c => c.status === 'completed');
  const filteredCustomers = completedCustomers
    .filter(c => {
      const name = String(c.name || '').toLowerCase();
      const phone = String(c.phone || '').toLowerCase();
      const plate = String(c.plateNumber || '').toLowerCase();
      const model = String(c.model || '').toLowerCase();
      const film = String(c.filmColor || '').toLowerCase();
      const brand = String(c.brand || '').toLowerCase();
      const posId = String(c.posId || '').toLowerCase();
      const notes = String(c.notes || '').toLowerCase();
      const term = searchTerm.toLowerCase();

      return name.includes(term) || 
             phone.includes(term) || 
             plate.includes(term) || 
             model.includes(term) || 
             film.includes(term) || 
             brand.includes(term) || 
             posId.includes(term) || 
             notes.includes(term);
    })
    .sort((a, b) => {
      if (sortBy === 'id') {
        const isNumeric = (s: any) => s && /^\d+$/.test(String(s));
        const valA = a.id;
        const valB = b.id;

        const aIsNum = isNumeric(valA);
        const bIsNum = isNumeric(valB);

        if (aIsNum && bIsNum) {
          const numA = parseInt(String(valA), 10);
          const numB = parseInt(String(valB), 10);
          return sortOrder === 'asc' ? numA - numB : numB - numA;
        }
        
        // If one is numeric and the other isn't, numeric comes first in ASC, or last in DESC?
        // Usually, people want numbers first.
        if (aIsNum && !bIsNum) return -1;
        if (!aIsNum && bIsNum) return 1;

        // If both are non-numeric, sort by date (import order)
        const dateA = a.updatedAt || '';
        const dateB = b.updatedAt || '';
        return sortOrder === 'asc' ? dateA.localeCompare(dateB) : dateB.localeCompare(dateA);
      } else {
        const isDate = (d: string) => /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(d.trim());
        let valA = String(a.expectedStartDate || '').trim();
        let valB = String(b.expectedStartDate || '').trim();
        
        if (!isDate(valA)) valA = '0000-00-00';
        if (!isDate(valB)) valB = '0000-00-00';

        const cmp = valA.localeCompare(valB);
        return sortOrder === 'asc' ? cmp : -cmp;
      }
    });

  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const paginatedCustomers = filteredCustomers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  const toggleExpand = (id: string) => setExpandedId(prev => prev === id ? null : id);

  const toggle = (customer: Customer, field: keyof Customer) => {
    onUpdate({ ...customer, [field]: !customer[field] });
  };

  const companions: Record<string, string> = {
    alone: '單獨前來', with_wife: '攜伴(另一半)', with_child: '攜帶小孩', with_family: '全家同行'
  };

  const isMobile = window.innerWidth <= 768;

  return (
    <div style={{ padding: isMobile ? '12px' : '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '32px', gap: '16px' }}>
        <div style={{ width: isMobile ? '100%' : 'auto' }}>
          {!isMobile && (
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, marginBottom: '8px', fontWeight: 'bold' }}>
              ← 返回看板
            </button>
          )}
          <h1 style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '2rem' }}>完工案件存檔庫</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0', fontSize: isMobile ? '0.85rem' : '1rem' }}>共 {completedCustomers.length} 筆服務紀錄</p>
        </div>
        
        <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '12px', width: isMobile ? '100%' : 'auto' }}>
          <div style={{ position: 'relative', flex: isMobile ? 1 : 'none', width: isMobile ? '100%' : '300px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input
              type="text"
              placeholder="搜尋姓名、車牌..."
              className="form-control"
              style={{ paddingLeft: '40px', borderRadius: '12px', border: '1px solid #e2e8f0', width: '100%' }}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px', width: isMobile ? '100%' : 'auto' }}>
            <button 
              className={`btn ${sortBy === 'id' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                if (sortBy === 'id') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                else { setSortBy('id'); setSortOrder('desc'); }
                setCurrentPage(1);
              }}
              style={{ flex: isMobile ? 1 : 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
            >
              <Hash size={14} /> 編號
            </button>
            <button 
              className={`btn ${sortBy === 'date' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                if (sortBy === 'date') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                else { setSortBy('date'); setSortOrder('desc'); }
                setCurrentPage(1);
              }}
              style={{ flex: isMobile ? 1 : 'none', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', padding: '8px 12px' }}
            >
              <Calendar size={14} /> 日期
            </button>
          </div>
        </div>
      </header>

      {!isMobile && (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '70px 180px 180px 110px 110px 110px 1.5fr 50px', 
          padding: '0 16px 12px', 
          gap: '12px', 
          borderBottom: '1px solid #e2e8f0',
          marginBottom: '8px',
          color: '#64748b',
          fontSize: '0.75rem',
          fontWeight: 'bold',
          letterSpacing: '0.05em'
        }}>
          <div>編號</div>
          <div>客戶資訊</div>
          <div>車輛資訊</div>
          <div>1.原本預約</div>
          <div>2.完工交車</div>
          <div>3.健檢提醒</div>
          <div>項目與備註</div>
          <div style={{ textAlign: 'right' }}>操作</div>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {paginatedCustomers.length > 0 ? paginatedCustomers.map(customer => {
          const isExpanded = expandedId === customer.id;
          return (
            <div key={customer.id} className="glass-panel" style={{ overflow: 'hidden', border: isExpanded ? '1px solid #bfdbfe' : '1px solid #e2e8f0', borderRadius: '16px' }}>
              <div
                onClick={() => toggleExpand(customer.id)}
                className="list-row"
                style={{ 
                  display: isMobile ? 'block' : 'grid', 
                  gridTemplateColumns: '70px 180px 180px 110px 110px 110px 1.5fr 50px',
                  padding: isMobile ? '16px' : '16px 20px',
                  gap: '12px',
                  background: isExpanded ? '#f0f9ff' : '#fff',
                  cursor: 'pointer',
                  position: 'relative'
                }}
              >
                {isMobile ? (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8' }}>#{/^\d+$/.test(String(customer.id)) ? customer.id : '—'}</span>
                      <div className="car-plate" style={{ fontSize: '0.8rem' }}>{customer.plateNumber}</div>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
                      <div>
                        <div style={{ fontSize: '1.1rem', fontWeight: '800', color: '#1e293b' }}>{customer.name}</div>
                        <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{customer.phone}</div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.85rem', fontWeight: '800', color: '#ec4899' }}>完工: {customer.deliveryDate || '—'}</div>
                        <div style={{ fontSize: '0.8rem', color: '#3b82f6', fontWeight: '700' }}>回檢: {customer.checkupDate || '—'}</div>
                      </div>
                    </div>
                    <div style={{ background: 'rgba(79, 70, 229, 0.05)', padding: '8px 12px', borderRadius: '8px', fontSize: '0.85rem', color: 'var(--primary)', fontWeight: 'bold', marginTop: '4px' }}>
                      {customer.mainServiceBrand} - {customer.filmColor}
                    </div>
                  </div>
                ) : (
                  <>
                    <div style={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.8rem' }}>{/^\d+$/.test(String(customer.id)) ? customer.id : '—'}</div>
                    <div>
                      <div style={{ fontWeight: '700', color: '#1e293b' }}>{customer.name}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{customer.phone}</div>
                    </div>
                    <div>
                      <div style={{ fontWeight: '700', color: '#1e293b' }}>{customer.plateNumber}</div>
                      <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{customer.brand} {customer.model}</div>
                    </div>
                    <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{customer.expectedStartDate || '—'}</div>
                    <div style={{ fontSize: '0.85rem', color: '#ec4899', fontWeight: '800' }}>{customer.deliveryDate || '—'}</div>
                    <div style={{ fontSize: '0.82rem', color: '#3b82f6', fontWeight: '700' }}>{customer.checkupDate || '—'}</div>
                    <div style={{ paddingRight: '20px' }}>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>{customer.mainServiceBrand} - {customer.filmColor}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      {isExpanded ? <ChevronUp size={20} color="var(--primary)" /> : <ChevronDown size={20} color="#cbd5e1" />}
                    </div>
                  </>
                )}
              </div>

              {isExpanded && (
                <div style={{ padding: isMobile ? '16px' : '24px', borderTop: '2px solid #eff6ff', background: '#fafcff' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1.2fr 1fr 1fr', gap: isMobile ? '16px' : '32px' }}>
                      {/* Section 1 */}
                      <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <Section icon={<ShieldCheck size={18} />} title="施工明細" color="var(--primary)">
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                            <InfoRow label="主項目" value={customer.mainService} />
                            <InfoRow label="顏色" value={customer.filmColor} />
                            <InfoRow label="品牌" value={customer.mainServiceBrand} />
                            <InfoRow label="隔熱紙" value={customer.windowTint} />
                          </div>
                        </Section>
                        <div style={{ marginTop: '16px' }}>
                          <Section icon={<ListChecks size={18} />} title="檢核進度" color="#16a34a">
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
                              已完成 {Array.isArray(customer.constructionChecklist) ? customer.constructionChecklist.filter(i => i.checked).length : 0} / 24 項標準作業
                            </div>
                          </Section>
                        </div>
                      </div>

                      {/* Section 2 */}
                      <div style={{ background: '#fff', padding: '16px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <Section icon={<CheckCircle2 size={18} />} title="售後狀態" color="#10b981">
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                            <ToggleBadge ok={!!customer.giftGiven} label="禮包" onToggle={() => toggle(customer, 'giftGiven')} />
                            <ToggleBadge ok={!!customer.photosSent} label="照片" onToggle={() => toggle(customer, 'photosSent')} />
                            <ToggleBadge ok={!!customer.followUp3Days} label="3日" onToggle={() => toggle(customer, 'followUp3Days')} />
                            <ToggleBadge ok={!!customer.followUp2Weeks} label="2週" onToggle={() => toggle(customer, 'followUp2Weeks')} />
                            <ToggleBadge ok={!!customer.followUp6Months} label="6月" onToggle={() => toggle(customer, 'followUp6Months')} />
                          </div>
                        </Section>
                        <div style={{ marginTop: '16px' }}>
                          <Section icon={<Camera size={18} />} title="影像紀錄" color="#f59e0b">
                            <div style={{ display: 'flex', gap: '8px' }}>
                              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>車況照: {Array.isArray(customer.damagePhotos) ? customer.damagePhotos.length : 0} 張</span>
                              <span style={{ fontSize: '0.8rem', color: '#64748b' }}>完工照: {Array.isArray(customer.progressPhotos) ? customer.progressPhotos.length : 0} 張</span>
                            </div>
                          </Section>
                        </div>
                      </div>

                      {/* Section 3 */}
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                        <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                          <Section icon={<DollarSign size={18} />} title="財務金額" color="#059669">
                            <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#15803d' }}>
                              ${(Number(customer.totalAmount) || 0).toLocaleString()}
                            </div>
                          </Section>
                        </div>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEdit(customer); }} 
                          className="btn btn-primary" 
                          style={{ width: '100%', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                        >
                          <Save size={18} /> 編輯完整檔案
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        }) : (
          <div style={{ textAlign: 'center', padding: '60px', color: '#94a3b8' }}>無相符資料</div>
        )}
      </div>

      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '12px', marginTop: '32px' }}>
          <button className="btn btn-outline" disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)}>上一頁</button>
          <span style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>{currentPage} / {totalPages}</span>
          <button className="btn btn-outline" disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)}>下一頁</button>
        </div>
      )}
    </div>
  );
};
