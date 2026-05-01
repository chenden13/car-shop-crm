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
        const idA = String(a.id || '');
        const idB = String(b.id || '');
        
        const isAutoA = idA.includes('無編號');
        const isAutoB = idB.includes('無編號');

        if (isAutoA && isAutoB) {
          // Both are auto-generated, sort by their internal timestamp/index to preserve upload order
          return sortOrder === 'asc' ? idA.localeCompare(idB) : idB.localeCompare(idA);
        }
        
        if (isAutoA) return 1; // Put auto-generated at the end
        if (isAutoB) return -1;
        
        const cmp = idA.localeCompare(idB, undefined, { numeric: true });
        return sortOrder === 'asc' ? cmp : -cmp;
      } else {
        const isDate = (d: string) => /^\d{4}[-/]\d{1,2}[-/]\d{1,2}/.test(d.trim());
        let valA = String(a.expectedEndDate || a.deliveryDate || a.expectedStartDate || '').trim();
        let valB = String(b.expectedEndDate || b.deliveryDate || b.expectedStartDate || '').trim();
        
        const hasA = isDate(valA);
        const hasB = isDate(valB);

        if (!hasA && hasB) return 1;
        if (hasA && !hasB) return -1;
        if (!hasA && !hasB) return 0;

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

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
        <div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, marginBottom: '8px', fontWeight: 'bold' }}>
            ← 返回看板
          </button>
          <h1 style={{ margin: 0, fontSize: '2rem' }}>完工案件存檔庫</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>查詢與管理所有已結案的服務紀錄・共 {completedCustomers.length} 筆</p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {userRole === 'admin' && (
            <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#059669', borderColor: '#10b981' }} onClick={onImportClick}>
              <FileUp size={16} /> Excel 匯入
            </button>
          )}
          <div style={{ position: 'relative', width: '300px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input
              type="text"
              placeholder="搜尋姓名、電話或車牌..."
              className="form-control"
              style={{ paddingLeft: '40px', borderRadius: '30px', border: '1px solid #e2e8f0', width: '100%' }}
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`btn ${sortBy === 'id' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                if (sortBy === 'id') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                else { setSortBy('id'); setSortOrder('desc'); }
                setCurrentPage(1);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '8px 12px' }}
            >
              <Hash size={15} /> 編號 {sortBy === 'id' && (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            </button>
            
            <button 
              className={`btn ${sortBy === 'date' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                if (sortBy === 'date') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                else { setSortBy('date'); setSortOrder('desc'); }
                setCurrentPage(1);
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '8px 12px' }}
            >
              <Calendar size={15} /> 日期 {sortBy === 'date' && (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            </button>
          </div>
        </div>

      </header>

      {/* ── Table Header ── */}
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
        <div>膜料品牌與備註項目</div>
        <div style={{ textAlign: 'right' }}>操作</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {paginatedCustomers.length > 0 ? paginatedCustomers.map(customer => {
          const isExpanded = expandedId === customer.id;
          return (
            <div key={customer.id} className="glass-panel" style={{ overflow: 'hidden', border: isExpanded ? '1px solid #bfdbfe' : '1px solid #e2e8f0', transition: 'border 0.2s' }}>

              {/* ── Summary Row ── */}
              <div
                onClick={() => toggleExpand(customer.id)}
                className="list-row"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '70px 180px 180px 110px 110px 110px 1.5fr 50px',
                  alignItems: 'center',
                  padding: '16px',
                  gap: '12px',
                  background: isExpanded ? '#f0f9ff' : '#fff',
                  borderRadius: '12px',
                  border: '1px solid #f1f5f9',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: isExpanded ? '0 10px 25px -5px rgba(0,0,0,0.05)' : 'none'
                }}
              >
                <div style={{ fontWeight: 'bold', color: '#64748b', fontSize: '0.8rem' }}>
                  {String(customer.id).includes('無編號') || (String(customer.id).startsWith('c_') && String(customer.id).length > 10) ? '—' : (customer.id || '—')}
                </div>
                
                {/* 2. 客戶資訊 */}
                <div>
                  <div style={{ fontWeight: '700', color: '#1e293b' }}>{customer.name}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{customer.phone}</div>
                </div>

                {/* 3. 車輛資訊 */}
                <div>
                  <div style={{ fontWeight: '700', color: '#1e293b' }}>{customer.plateNumber}</div>
                  <div style={{ fontSize: '0.78rem', color: '#64748b' }}>{customer.brand} {customer.model}</div>
                </div>

                {/* 4. 原本預約日期 */}
                <div style={{ fontSize: '0.82rem', color: '#64748b' }}>{customer.expectedStartDate || '—'}</div>

                {/* 5. 實際完工日期 */}
                <div style={{ fontSize: '0.85rem', color: '#ec4899', fontWeight: '800' }}>{customer.deliveryDate || '—'}</div>

                {/* 6. 健檢提醒日期 */}
                <div style={{ fontSize: '0.82rem', color: '#3b82f6', fontWeight: '700' }}>{customer.checkupDate || '—'}</div>

                {/* 7. 施工項目與備註 */}
                <div style={{ paddingRight: '20px' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}>
                    {customer.mainServiceBrand} - {customer.filmColor}
                  </div>
                  {customer.notes && <div className="text-truncate" style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{customer.notes}</div>}
                </div>

                {/* 8. 操作 */}
                <div style={{ textAlign: 'right' }}>
                  {isExpanded ? <ChevronUp size={24} color="var(--primary)" /> : <ChevronDown size={24} color="#cbd5e1" />}
                </div>
              </div>

              {/* ── Expanded Detail Panel ── */}
              {isExpanded && (
                <div style={{ padding: '0 24px 24px', borderTop: '2px solid #eff6ff', background: '#fafcff' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 1fr 1fr', gap: '32px', paddingTop: '24px' }}>

                    {/* Col 1: 施工與項目 */}
                    <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', boxShadow: '0 4px 12px rgba(0,0,0,0.03)', border: '1px solid #f1f5f9' }}>
                      <Section icon={<ShieldCheck size={18} />} title="施工訂購明細" color="var(--primary)">
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                          <InfoRow label="主施工項目" value={customer.mainService} />
                          <InfoRow label="膜料顏色" value={customer.filmColor} />
                          <InfoRow label="品牌/等級" value={customer.mainServiceBrand} />
                          <InfoRow label="膜料貨號" value={customer.materialCode} />
                        </div>
                        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                           <InfoRow label="隔熱紙項目" value={customer.windowTint} />
                           {customer.windowTintBrand && <InfoRow label="隔熱紙品牌" value={customer.windowTintBrand} />}
                           <InfoRow label="電子後視鏡" value={customer.digitalMirror} />
                           <InfoRow label="電改項目" value={customer.electricMod} />
                        </div>
                      </Section>

                      {/* 施工過程檢核表 */}
                      <div style={{ marginTop: '20px' }}>
                        <Section icon={<ListChecks size={18} />} title="施工過程檢核 (標準 24 項)" color="#16a34a">
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px 12px' }}>
                            {(customer.constructionChecklist || []).length > 0 ? customer.constructionChecklist?.map(item => (
                              <div key={item.id} style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px', color: item.checked ? '#166534' : '#64748b' }}>
                                {item.checked ? <CheckCircle2 size={12} color="#16a34a" /> : <Clock size={12} color="#cbd5e1" />}
                                <span style={{ fontWeight: item.checked ? '700' : '500' }}>{item.name}</span>
                              </div>
                            )) : <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>無檢核紀錄</div>}
                          </div>
                        </Section>
                      </div>

                      {customer.customAccessories && customer.customAccessories.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                          <Section icon={<Package size={18} />} title="加裝配件" color="#6366f1">
                            {customer.customAccessories.map(acc => (
                              <InfoRow key={acc.id} label={acc.name} value={acc.price ? `$ ${acc.price.toLocaleString()}` : '—'} />
                            ))}
                          </Section>
                        </div>
                      )}

                      {customer.giftItems && customer.giftItems.length > 0 && (
                        <div style={{ marginTop: '20px' }}>
                          <Section icon={<Gift size={18} />} title="贈送與優惠" color="#f59e0b">
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                              {customer.giftItems.map(g => (
                                <span key={g} style={{ padding: '4px 12px', borderRadius: '20px', background: '#fffbeb', color: '#92400e', fontSize: '0.75rem', fontWeight: 'bold', border: '1px solid #fde68a' }}>{g}</span>
                              ))}
                            </div>
                          </Section>
                        </div>
                      )}

                      {/* 客戶習性與特徵 (新增) */}
                      <div style={{ marginTop: '24px', paddingTop: '20px', borderTop: '2px solid #f1f5f9' }}>
                        <Section icon={<UserCheck size={18} />} title="完整客戶習性觀察" color="#ec4899">
                          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                            <InfoRow label="告知管道" value={customer.fromChannel} />
                            <InfoRow label="工作地點" value={customer.location} />
                            <InfoRow label="職業" value={customer.occupation} />
                            <InfoRow label="興趣" value={customer.hobbies} />
                            <InfoRow label="同行狀態" value={customer.companion ? companions[customer.companion] : ''} />
                            <InfoRow label="性格屬性" value={customer.personality === 'introvert' ? '內向' : customer.personality === 'extrovert' ? '外向' : ''} />
                            <InfoRow label="經濟預算" value={customer.wealthLevel === 'high' ? '非常有錢' : customer.wealthLevel === 'medium' ? '中產家庭' : customer.wealthLevel === 'normal' ? '一般小資' : ''} />
                            <InfoRow label="方便聯絡" value={customer.convenientTime === 'weekday' ? '平日' : customer.convenientTime === 'weekend' ? '假日' : ''} />
                            <InfoRow label="體型外觀" value={customer.bodyType === 'slim' ? '瘦' : customer.bodyType === 'average' ? '中等' : customer.bodyType === 'heavy' ? '偏胖' : ''} />
                            <InfoRow label="髮型長度" value={customer.hairLength === 'short' ? '短髮' : customer.hairLength === 'medium' ? '中長' : customer.hairLength === 'long' ? '長髮' : ''} />
                          </div>
                          <div style={{ display: 'flex', gap: '15px', marginTop: '12px', background: '#fff1f2', padding: '8px 12px', borderRadius: '8px' }}>
                            {customer.detailOriented && <span style={{ fontSize: '0.75rem', color: '#be123c', fontWeight: 'bold' }}>#在意細節</span>}
                            {customer.easyGoing && <span style={{ fontSize: '0.75rem', color: '#be123c', fontWeight: 'bold' }}>#好相處</span>}
                            {customer.likesCalls && <span style={{ fontSize: '0.75rem', color: '#be123c', fontWeight: 'bold' }}>#喜歡電話</span>}
                            {customer.wearsGlasses && <span style={{ fontSize: '0.75rem', color: '#be123c', fontWeight: 'bold' }}>#戴眼鏡</span>}
                          </div>
                        </Section>
                      </div>
                    </div>

                    {/* Col 2: 售後追蹤與照片 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                      <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <Section icon={<CheckCircle2 size={18} />} title="售後與交付狀態" color="#10b981">
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
                            <ToggleBadge ok={customer.giftGiven} label="大禮包交付" onToggle={() => toggle(customer, 'giftGiven')} />
                            <ToggleBadge ok={customer.formSent} label="表單發送" onToggle={() => toggle(customer, 'formSent')} />
                            <ToggleBadge ok={customer.photosSent} label="完工照傳送" onToggle={() => toggle(customer, 'photosSent')} />
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                             <ToggleBadge ok={customer.followUp3Days} label="3天初探關心" onToggle={() => toggle(customer, 'followUp3Days')} />
                             <ToggleBadge ok={customer.followUp2Weeks} label="2週穏定度追蹤" onToggle={() => toggle(customer, 'followUp2Weeks')} />
                             <ToggleBadge ok={customer.followUp6Months} label="6個月健檢提醒" onToggle={() => toggle(customer, 'followUp6Months')} />
                             <ToggleBadge ok={customer.followUp1Year} label="1年活動邀約" onToggle={() => toggle(customer, 'followUp1Year')} />
                          </div>
                        </Section>
                      </div>

                      {/* 施工照片區 (新增) */}
                      <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <Section icon={<Camera size={18} />} title="車體受損/原樣紀錄" color="#f59e0b">
                           <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px' }}>
                             {(customer.damagePhotos || []).length > 0 ? customer.damagePhotos?.map((p, i) => (
                               <div key={i} style={{ position: 'relative' }}>
                                 <img src={p.url} alt="damage" style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'zoom-in' }} onClick={() => window.open(p.url)} />
                                 <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '10px', textAlign: 'center', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px' }}>{p.category}</div>
                               </div>
                             )) : <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>無影像紀錄</div>}
                           </div>
                        </Section>
                        <div style={{ marginTop: '20px' }}>
                           <Section icon={<ImageIcon size={18} />} title="施工與完工美照" color="#3b82f6">
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(70px, 1fr))', gap: '8px' }}>
                                {(customer.progressPhotos || []).length > 0 ? customer.progressPhotos?.map((p, i) => (
                                  <div key={i} style={{ position: 'relative' }}>
                                    <img src={p.url} alt="progress" style={{ width: '100%', height: '60px', objectFit: 'cover', borderRadius: '6px', cursor: 'zoom-in' }} onClick={() => window.open(p.url)} />
                                    <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '10px', textAlign: 'center', borderBottomLeftRadius: '6px', borderBottomRightRadius: '6px' }}>{p.category}</div>
                                  </div>
                                )) : <div style={{ fontSize: '0.8rem', color: '#94a3b8' }}>無影像紀錄</div>}
                              </div>
                           </Section>
                        </div>
                      </div>
                    </div>

                    {/* Col 3: 財務與備註 */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                       {customer.pendingItems && (
                        <div style={{ background: '#fef2f2', padding: '16px', borderRadius: '12px', border: '2px solid #fca5a5' }}>
                          <Section icon={<AlertCircle size={18} />} title="待辦事項 (追蹤中)" color="#ef4444">
                            <div style={{ fontSize: '0.9rem', color: '#991b1b', fontWeight: 'bold', lineHeight: 1.5 }}>
                              {customer.pendingItems}
                            </div>
                          </Section>
                        </div>
                      )}

                      <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <Section icon={<DollarSign size={18} />} title="帳務資訊" color="#059669">
                          <InfoRow label="總成交金額" value={customer.totalAmount ? `$ ${customer.totalAmount.toLocaleString()}` : '—'} />
                          {userRole === 'admin' && <InfoRow label="成本支出" value={customer.cost ? `$ ${customer.cost.toLocaleString()}` : '—'} />}
                          {customer.appliedDiscountName && (
                            <div style={{ marginTop: '10px', padding: '10px', background: '#fdf2f8', borderRadius: '8px', fontSize: '0.8rem', color: '#be185d', fontWeight: '600' }}>
                              套用優惠: {customer.appliedDiscountName}
                            </div>
                          )}
                        </Section>
                      </div>

                      <div style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                        <Section icon={<FileText size={18} />} title="最後結案備註" color="#475569">
                          <p style={{ margin: 0, fontSize: '0.85rem', color: '#1e293b', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                             {customer.notes || '無相關客戶習性記錄'}
                          </p>
                        </Section>
                      </div>

                      <div style={{ background: '#fff', padding: '20px', borderRadius: '16px', border: '1px solid #f1f5f9' }}>
                        <Section icon={<Calendar size={18} />} title="關鍵日期紀錄" color="#3b82f6">
                          <InfoRow label="完工交車日期" value={customer.deliveryDate} />
                          <InfoRow label="下次檢查/回廠" value={customer.checkupDate} />
                          <InfoRow label="原本施工日期" value={customer.expectedStartDate} />
                        </Section>
                      </div>

                      <button 
                        onClick={(e) => { e.stopPropagation(); onEdit(customer); }} 
                        className="btn btn-primary" 
                        style={{ width: '100%', borderRadius: '12px', padding: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(37, 99, 235, 0.2)' }}
                      >
                        <Save size={18} /> 編輯檔案 / 修改日期
                      </button>
                    </div>
                  </div>
                </div>
              )}

            </div>
          );
        }) : (
          <div style={{ textAlign: 'center', padding: '100px', color: '#94a3b8' }}>
            <Search size={48} style={{ marginBottom: '16px', opacity: 0.3 }} />
            <p>找不到符合條件的完工檔案</p>
          </div>
        )}
      </div>

      {totalPages > 0 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '16px', marginTop: '32px' }}>
          <button 
            className="btn btn-outline" 
            disabled={currentPage === 1}
            onClick={() => { setCurrentPage(prev => Math.max(1, prev - 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            上一頁
          </button>
          <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'bold' }}>
            第 {currentPage} 頁 / 共 {totalPages} 頁
          </span>
          <button 
            className="btn btn-outline" 
            disabled={currentPage === totalPages}
            onClick={() => { setCurrentPage(prev => Math.min(totalPages, prev + 1)); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
          >
            下一頁
          </button>
        </div>
      )}
    </div>
  );
};
