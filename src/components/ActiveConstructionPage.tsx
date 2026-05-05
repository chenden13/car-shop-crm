import React, { useState } from 'react';
import { Search, Hammer, Settings, Camera, Image as ImageIcon } from 'lucide-react';
import type { Customer } from '../types';

interface ActiveConstructionPageProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
}

export const ActiveConstructionPage: React.FC<ActiveConstructionPageProps> = ({ customers, onEditCustomer }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const constructionCustomers = customers.filter(c => {
    if (c.status !== 'construction') return false;

    const name = String(c.name || '').toLowerCase();
    const plate = String(c.plateNumber || '').toLowerCase();
    const phone = String(c.phone || '').toLowerCase();
    const model = String(c.model || '').toLowerCase();
    const brand = String(c.brand || '').toLowerCase();
    const mainService = String(c.mainService || '').toLowerCase();
    const mainServiceBrand = String(c.mainServiceBrand || '').toLowerCase();
    const film = String(c.filmColor || '').toLowerCase();
    const term = searchTerm.toLowerCase();

    return (
      name.includes(term) || 
      plate.includes(term) || 
      phone.includes(term) ||
      model.includes(term) ||
      brand.includes(term) ||
      mainService.includes(term) ||
      mainServiceBrand.includes(term) ||
      film.includes(term)
    );
  });

  // 排序：按預計交車日期排序
  const sorted = [...constructionCustomers].sort((a, b) => {
    const dateA = a.expectedEndDate || '9999-99-99';
    const dateB = b.expectedEndDate || '9999-99-99';
    return dateA.localeCompare(dateB);
  });

  return (
    <div style={{ padding: '0 20px 40px 20px', maxWidth: '1500px', margin: '0 auto' }}>
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
              placeholder="搜尋車主、車牌..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="glass-panel"
              style={{ padding: '10px 15px 10px 40px', borderRadius: '12px', width: '280px', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>
        </div>
      </header>

      <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden', minWidth: '1200px', border: '1px solid var(--border-light)' }}>
        {/* Table Header */}
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: '140px 140px 1.5fr 1.5fr 360px 60px',
          padding: '18px 25px',
          background: 'var(--primary)',
          fontWeight: 'bold',
          color: '#fff',
          fontSize: '0.85rem',
          letterSpacing: '0.5px'
        }}>
          <div>車牌 / 車主</div>
          <div>品牌 / 車型</div>
          <div>膜料施工內容</div>
          <div>加裝配件與贈品</div>
          <div>施工進度時程</div>
          <div style={{ textAlign: 'center' }}>操作</div>
        </div>

        {/* Table Body */}
        <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
          {sorted.length > 0 ? sorted.map((customer) => {
            return (
              <div 
                key={customer.id} 
                className="list-row"
                style={{ 
                  display: 'grid', 
                  gridTemplateColumns: '140px 140px 1.5fr 1.5fr 360px 60px',
                  alignItems: 'center',
                  padding: '20px 25px',
                  borderBottom: '1px solid #f1f5f9',
                  fontSize: '0.9rem',
                  background: '#fff'
                }}
              >
                {/* 1. 車牌 / 車主 */}
                <div>
                  <div style={{ fontWeight: '900', color: '#1e293b', fontSize: '1.1rem' }}>{customer.plateNumber}</div>
                  <div style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 'bold' }}>{customer.name}</div>
                </div>

                {/* 2. 品牌 / 車型 */}
                <div>
                  <div style={{ fontWeight: '700', color: '#0369a1' }}>{customer.brand || '—'}</div>
                  <div style={{ fontSize: '0.85rem', color: '#1e293b' }}>{customer.model || '—'}</div>
                </div>

                {/* 3. 施工項目與膜料 */}
                <div style={{ paddingRight: '15px' }}>
                  <div style={{ background: '#f8fafc', padding: '8px 12px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: '900', color: 'var(--primary)' }}>
                      {customer.mainServiceBrand} - {customer.filmColor}
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '2px' }}>{customer.mainService}</div>
                  </div>
                </div>

                {/* 4. 加裝配件 (隔熱紙/電子鏡/加裝/贈品) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', paddingRight: '15px' }}>
                  {customer.windowTint && (
                    <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ padding: '2px 6px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.7rem' }}>隔熱紙</span>
                      {customer.windowTintBrand} {customer.windowTint}
                    </div>
                  )}
                  {customer.digitalMirror && (
                    <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ padding: '2px 6px', background: '#f3e8ff', color: '#6b21a8', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.7rem' }}>電子鏡</span>
                      {customer.digitalMirrorBrand} {customer.digitalMirror}
                    </div>
                  )}
                  {customer.electricMod && (
                    <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <span style={{ padding: '2px 6px', background: '#fee2e2', color: '#991b1b', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.7rem' }}>電動件</span>
                      {customer.electricModBrand} {customer.electricMod}
                    </div>
                  )}
                  {(customer.customAccessories || []).length > 0 && (
                    <div style={{ fontSize: '0.78rem', color: '#475569', display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                      <span style={{ padding: '2px 6px', background: '#fef9c3', color: '#854d0e', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.7rem' }}>加裝</span>
                      {customer.customAccessories?.map(a => a.name).join(', ')}
                    </div>
                  )}
                  {(!customer.windowTint && !customer.digitalMirror && !customer.electricMod && (customer.customAccessories || []).length === 0) && (
                    <div style={{ fontSize: '0.78rem', color: '#94a3b8' }}>無額外加裝項目</div>
                  )}
                </div>

                {/* 5. 施工時程狀態 */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px' }}>
                  <div style={{ background: '#f0f9ff', padding: '6px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
                    <div style={{ fontSize: '0.65rem', color: '#0369a1', fontWeight: 'bold' }}>1.留車進場</div>
                    <div style={{ fontSize: '0.8rem', color: '#0c4a6e', fontWeight: '800' }}>{customer.expectedStartDate?.slice(5)}</div>
                    <div style={{ fontSize: '0.7rem', color: '#0369a1' }}>{customer.constructionTime}</div>
                  </div>
                  <div style={{ background: '#f0fdf4', padding: '6px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                    <div style={{ fontSize: '0.65rem', color: '#166534', fontWeight: 'bold' }}>2.施工期間</div>
                    <div style={{ fontSize: '0.8rem', color: '#064e3b', fontWeight: '800' }}>
                      {customer.constructionStartDate?.slice(5) || '-'}
                      {customer.constructionEndDate ? ` ~ ${customer.constructionEndDate.slice(5)}` : ''}
                    </div>
                  </div>
                  <div style={{ background: '#fdf2f8', padding: '6px', borderRadius: '8px', border: '1px solid #fbcfe8' }}>
                    <div style={{ fontSize: '0.65rem', color: '#be185d', fontWeight: 'bold' }}>3.預計交車</div>
                    <div style={{ fontSize: '0.8rem', color: '#831843', fontWeight: '800' }}>{customer.expectedEndDate?.slice(5)}</div>
                    <div style={{ fontSize: '0.7rem', color: '#be185d' }}>{customer.expectedDeliveryTime}</div>
                  </div>
                </div>

                {/* 6. 操作 */}
                <div style={{ textAlign: 'center' }}>
                  <button 
                    onClick={() => onEditCustomer(customer)}
                    style={{ background: '#f1f5f9', border: '1px solid #e2e8f0', width: '40px', height: '40px', borderRadius: '12px', cursor: 'pointer', color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
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
