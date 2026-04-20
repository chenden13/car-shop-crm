import React, { useState } from 'react';
import type { Customer, Role } from '../types';

  Search, Car, User, Phone, Calendar, ShieldCheck,
  ChevronDown, ChevronUp, Gift, Package, CheckCircle2,
  XCircle, FileText, Glasses, AlertCircle, Hash, Heart, Star, DollarSign,
  ArrowUp, ArrowDown
} from 'lucide-react';


interface ArchivePageProps {
  customers: Customer[];
  onBack: () => void;
  onViewDetail: (customer: Customer) => void;
  onUpdate: (customer: Customer) => void;
  onEdit: (customer: Customer) => void;
  userRole?: Role;
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
  customers, onBack, onUpdate, onEdit, onViewDetail, userRole 
}) => {

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'id' | 'date'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  const completedCustomers = customers.filter(c => c.status === 'completed');
  const filteredCustomers = completedCustomers
    .filter(c =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.plateNumber.toLowerCase().includes(searchTerm.toLowerCase())
    )
    .sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'id') {
        cmp = a.id.localeCompare(b.id, undefined, { numeric: true });
      } else {
        const da = a.deliveryDate || '';
        const db = b.deliveryDate || '';
        cmp = da.localeCompare(db);
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });


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
          <div style={{ position: 'relative', width: '300px' }}>
            <Search style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} size={18} />
            <input
              type="text"
              placeholder="搜尋姓名、電話或車牌..."
              className="form-control"
              style={{ paddingLeft: '40px', borderRadius: '30px', border: '1px solid #e2e8f0', width: '100%' }}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', gap: '8px' }}>
            <button 
              className={`btn ${sortBy === 'id' ? 'btn-primary' : 'btn-outline'}`}
              onClick={() => {
                if (sortBy === 'id') setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc');
                else { setSortBy('id'); setSortOrder('desc'); }
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
              }}
              style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', padding: '8px 12px' }}
            >
              <Calendar size={15} /> 日期 {sortBy === 'date' && (sortOrder === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}
            </button>
          </div>
        </div>

      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredCustomers.length > 0 ? filteredCustomers.map(customer => {
          const isExpanded = expandedId === customer.id;
          return (
            <div key={customer.id} className="glass-panel" style={{ overflow: 'hidden', border: isExpanded ? '1px solid #bfdbfe' : '1px solid #e2e8f0', transition: 'border 0.2s' }}>

              {/* ── Summary Row ── */}
              <div
                style={{ display: 'grid', gridTemplateColumns: 'minmax(180px, 1.5fr) 2fr 1fr 1fr 80px', alignItems: 'center', padding: '18px 20px', cursor: 'pointer', gap: '20px' }}
                onClick={() => toggleExpand(customer.id)}
              >
                {/* ID + Car */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ 
                    background: '#64748b', 
                    color: '#fff', 
                    padding: '3px 8px', 
                    borderRadius: '5px', 
                    fontSize: '0.75rem', 
                    fontWeight: 'bold', 
                    flexShrink: 0,
                    minWidth: '50px',
                    textAlign: 'center',
                    whiteSpace: 'nowrap'
                  }}>
                    {customer.id}
                  </div>

                  <div style={{ background: 'var(--primary)', color: '#fff', padding: '7px', borderRadius: '8px', flexShrink: 0 }}><Car size={18} /></div>
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '1rem' }}>{customer.plateNumber}</div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{customer.brand} {customer.model}</div>
                  </div>
                </div>

                {/* Service */}
                <div style={{ background: '#f0fdf4', padding: '8px 14px', borderRadius: '10px', border: '1px solid #dcfce7' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#166534', fontWeight: 'bold', fontSize: '0.78rem', marginBottom: '3px' }}>
                    <ShieldCheck size={13} /> 施工內容
                  </div>
                  <div style={{ fontSize: '0.88rem', fontWeight: '600' }}>
                    {customer.mainService || '未填'} {customer.mainServiceBrand ? `(${customer.mainServiceBrand})` : ''}
                  </div>
                  {customer.windowTint && <div style={{ fontSize: '0.75rem', color: '#64748b' }}>隔熱紙: {customer.windowTint}</div>}
                </div>

                {/* Customer */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontWeight: '600', fontSize: '0.88rem' }}><User size={13} color="#64748b" /> {customer.name}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.8rem', color: '#64748b' }}><Phone size={13} color="#94a3b8" /> {customer.phone}</div>
                </div>

                {/* Date */}
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '5px', color: '#64748b', fontSize: '0.78rem' }}><Calendar size={12} /> 交車日期</div>
                  <div style={{ fontWeight: '600', fontSize: '0.88rem' }}>{customer.deliveryDate || '不詳'}</div>
                </div>

                {/* Expand button */}
                <div style={{ textAlign: 'right' }}>
                  <button
                    className="btn btn-outline"
                    style={{ padding: '5px 12px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px', marginLeft: 'auto', background: isExpanded ? '#eff6ff' : '', borderColor: isExpanded ? '#bfdbfe' : '' }}
                  >
                    明細 {isExpanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                  </button>
                </div>
              </div>

              {/* ── Expanded Detail Panel ── */}
              {isExpanded && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid #eff6ff', background: '#fafcff' }}>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', paddingTop: '20px' }}>

                    {/* Col 1: 施工項目 */}
                    <div>
                      <Section icon={<ShieldCheck size={13} />} title="施工訂購明細" color="#1d4ed8">
                        <InfoRow label="主施工" value={customer.mainService} />
                        <InfoRow label="品牌" value={customer.mainServiceBrand} />
                        <InfoRow label="膜料顏色" value={customer.filmColor} />
                        <InfoRow label="膜料貨號" value={customer.materialCode} />
                        <InfoRow label="隔熱紙" value={customer.windowTint} />
                        <InfoRow label="隔熱紙品牌" value={customer.windowTintBrand} />
                        <InfoRow label="電子後視鏡" value={customer.digitalMirror} />
                        <InfoRow label="電改" value={customer.electricMod} />
                      </Section>


                      {customer.customAccessories && customer.customAccessories.length > 0 && (
                        <Section icon={<Package size={13} />} title="客製配件" color="#7c3aed">
                          {customer.customAccessories.map(acc => (
                            <InfoRow key={acc.id} label={acc.name} value={acc.price ? `$${acc.price.toLocaleString()}` : '—'} />
                          ))}
                        </Section>
                      )}

                      {customer.giftItems && customer.giftItems.length > 0 && (
                        <Section icon={<Gift size={13} />} title="贈送項目" color="#b45309">
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px' }}>
                            {customer.giftItems.map(g => (
                              <span key={g} style={{ padding: '2px 8px', borderRadius: '12px', background: '#fef3c7', color: '#92400e', fontSize: '0.72rem', fontWeight: '600', border: '1px solid #fde68a' }}>{g}</span>
                            ))}
                          </div>
                        </Section>
                      )}
                    </div>

                    {/* Col 2: 售後關懷 */}
                    <div>
                      <Section icon={<CheckCircle2 size={13} />} title="售後關懷狀態" color="#047857">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '10px' }}>
                          <ToggleBadge ok={customer.giftGiven} label="大禮包發送" onToggle={() => toggle(customer, 'giftGiven')} />
                          <ToggleBadge ok={customer.formSent} label="表單發送" onToggle={() => toggle(customer, 'formSent')} />
                          <ToggleBadge ok={customer.formFilled} label="表單填寫" onToggle={() => toggle(customer, 'formFilled')} />
                          <ToggleBadge ok={customer.quoteCreated} label="報價單已建立" onToggle={() => toggle(customer, 'quoteCreated')} />
                        </div>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          <ToggleBadge ok={customer.followUp3Days} label="3天追蹤" onToggle={() => toggle(customer, 'followUp3Days')} />
                          <ToggleBadge ok={customer.followUp2Weeks} label="2週追蹤" onToggle={() => toggle(customer, 'followUp2Weeks')} />
                          <ToggleBadge ok={customer.followUp6Months} label="6個月追蹤" onToggle={() => toggle(customer, 'followUp6Months')} />
                          <ToggleBadge ok={customer.followUp1Year} label="1年追蹤" onToggle={() => toggle(customer, 'followUp1Year')} />
                        </div>
                      </Section>


                      <Section icon={<Calendar size={13} />} title="日期紀錄" color="#0369a1">
                        <InfoRow label="交車日期" value={customer.deliveryDate} />
                        <InfoRow label="回廠檢查" value={customer.checkupDate} />
                        <InfoRow label="預計施工" value={customer.expectedStartDate} />
                      </Section>

                      {userRole === 'admin' && (
                        <Section icon={<DollarSign size={13} />} title="財務數據" color="#059669">
                          <InfoRow label="金額" value={customer.totalAmount ? `$${customer.totalAmount.toLocaleString()}` : undefined} />
                          <InfoRow label="成本" value={customer.cost ? `$${customer.cost.toLocaleString()}` : undefined} />
                          <InfoRow label="收益" value={customer.revenue ? `$${customer.revenue.toLocaleString()}` : undefined} />
                          {customer.appliedDiscountName && (
                            <div style={{ marginTop: '8px', padding: '6px 10px', background: '#fff5f7', border: '1px solid #fbcfe8', borderRadius: '8px', fontSize: '0.75rem', color: '#be185d' }}>
                              <Star size={12} style={{ marginRight: '4px' }} /> {customer.appliedDiscountName}
                              <span style={{ float: 'right', fontWeight: 'bold' }}>- ${customer.discountAmount?.toLocaleString()}</span>
                            </div>
                          )}
                        </Section>
                      )}
                      
                      {/* If employee, only show Amount (Price) and Discount but not Cost/Revenue */}
                      {userRole === 'employee' && (
                        <Section icon={<DollarSign size={13} />} title="財務金額" color="#059669">
                          <InfoRow label="報價金額" value={customer.totalAmount ? `$${customer.totalAmount.toLocaleString()}` : undefined} />
                          {customer.appliedDiscountName && (
                             <div style={{ marginTop: '8px', padding: '6px 10px', background: '#fff5f7', border: '1px solid #fbcfe8', borderRadius: '8px', fontSize: '0.75rem', color: '#be185d' }}>
                               <Star size={12} style={{ marginRight: '4px' }} /> {customer.appliedDiscountName}
                               <span style={{ float: 'right', fontWeight: 'bold' }}>折扣: - ${customer.discountAmount?.toLocaleString()}</span>
                             </div>
                          )}
                        </Section>
                      )}




                      <Section icon={<FileText size={13} />} title="照片與複拍" color="#6d28d9">
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                          <ToggleBadge ok={customer.photosRetaken} label="照片重拍" onToggle={() => toggle(customer, 'photosRetaken')} />
                          <ToggleBadge ok={customer.photosSent} label="照片發送" onToggle={() => toggle(customer, 'photosSent')} />
                        </div>
                      </Section>


                      {customer.notes && (
                        <Section icon={<AlertCircle size={13} />} title="特殊備註" color="#dc2626">
                          <div style={{ background: '#fff5f5', border: '1px solid #fecaca', borderRadius: '8px', padding: '10px 12px', fontSize: '0.82rem', color: '#7f1d1d', lineHeight: 1.6 }}>
                            {customer.notes}
                          </div>
                        </Section>
                      )}
                    </div>

                    {/* Col 3: 客人特色 */}
                    <div>
                      <Section icon={<Star size={13} />} title="客戶特色" color="#b45309">
                        <InfoRow label="方便時間" value={customer.convenientTime === 'weekday' ? '平日' : customer.convenientTime === 'weekend' ? '假日' : undefined} />
                        <InfoRow label="同行者" value={customer.companion ? companions[customer.companion] : undefined} />
                        <InfoRow label="職業" value={customer.occupation} />
                        <InfoRow label="興趣" value={customer.hobbies} />
                        <InfoRow label="地區" value={customer.location} />
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px', marginTop: '6px' }}>
                          {customer.detailOriented && <span style={{ padding: '2px 8px', borderRadius: '12px', background: '#eff6ff', color: '#1d4ed8', fontSize: '0.72rem', border: '1px solid #bfdbfe' }}>在意細節</span>}
                          {customer.easyGoing && <span style={{ padding: '2px 8px', borderRadius: '12px', background: '#f0fdf4', color: '#166534', fontSize: '0.72rem', border: '1px solid #bbf7d0' }}>好相處</span>}
                          {customer.likesCalls && <span style={{ padding: '2px 8px', borderRadius: '12px', background: '#fef3c7', color: '#92400e', fontSize: '0.72rem', border: '1px solid #fde68a' }}>喜歡電話</span>}
                          {customer.wealthLevel === 'high' && <span style={{ padding: '2px 8px', borderRadius: '12px', background: '#fdf4ff', color: '#7e22ce', fontSize: '0.72rem', border: '1px solid #e9d5ff' }}>高消費力</span>}
                        </div>
                      </Section>

                      <Section icon={<Glasses size={13} />} title="外觀特徵" color="#475569">
                        <InfoRow label="體型" value={customer.bodyType === 'slim' ? '纖細' : customer.bodyType === 'average' ? '中等' : customer.bodyType === 'heavy' ? '豐腴' : undefined} />
                        <InfoRow label="眼鏡" value={customer.wearsGlasses ? '有戴眼鏡' : undefined} />
                        <InfoRow label="髮長" value={customer.hairLength === 'short' ? '短髮' : customer.hairLength === 'medium' ? '中髮' : customer.hairLength === 'long' ? '長髮' : undefined} />
                        <InfoRow label="個性" value={customer.personality === 'introvert' ? '內斂' : customer.personality === 'extrovert' ? '外向開朗' : undefined} />
                        {customer.childAge && <InfoRow label="小孩年齡" value={`${customer.childAge} 歲`} />}
                      </Section>

                      {customer.fromChannel && (
                        <Section icon={<Hash size={13} />} title="來源管道" color="#0891b2">
                          <InfoRow label="來源" value={customer.fromChannel} />
                        </Section>
                      )}

                      <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={(e) => { e.stopPropagation(); onEdit(customer); }} 
                          className="btn btn-outline" 
                          style={{ borderColor: '#3b82f6', color: '#1d4ed8', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
                        >
                          <FileText size={14} /> 編輯微調內容
                        </button>
                      </div>
                    </div>
                  </div>


                  {/* Photos section */}
                  {customer.progressPhotos && customer.progressPhotos.length > 0 && (
                    <div style={{ marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #e2e8f0' }}>
                      <div style={{ fontSize: '0.78rem', fontWeight: 'bold', color: '#64748b', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Heart size={13} /> 施工紀錄照片
                      </div>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                        {customer.progressPhotos.map((photo, idx) => (
                          <div key={idx} style={{ background: '#f1f5f9', borderRadius: '6px', padding: '4px 8px', fontSize: '0.72rem', color: '#475569' }}>
                            📷 {photo.category}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
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
    </div>
  );
};
