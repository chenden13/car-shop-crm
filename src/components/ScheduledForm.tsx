import React, { useState } from 'react';
import type { Customer } from '../types';
import { CalendarCheck, Package, Gift, Truck, Clock, CheckCircle } from 'lucide-react';

const GIFT_OPTIONS = [
  '大燈', '日行燈', 'ABC柱', '握把',
  '前踏板', '後踏板', '充電蓋',
  '尾燈(三項)', '玻璃鍍膜(三項)', '彩繪(視範圍)',
  '浮雕(視範圍)', '鋼琴烤漆(視範圍)'
];

interface ScheduledFormProps {
  customer: Customer;
  onUpdate: (updatedCustomer: Customer) => void;
  onStartConstruction: (updatedCustomer: Customer) => void;
  onCancel: () => void;
}

export const ScheduledForm: React.FC<ScheduledFormProps> = ({ customer, onUpdate, onStartConstruction, onCancel }) => {
  const [formData, setFormData] = useState<Customer>(customer);

  const toggle = (field: 'inCalendar' | 'materialOrdered') => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleGift = (gift: string) => {
    const current = formData.giftItems || [];
    const next = current.includes(gift) ? current.filter(g => g !== gift) : [...current, gift];
    setFormData(prev => ({ ...prev, giftItems: next }));
  };

  const handleSave = () => {
    onUpdate(formData);
  };

  const handleStart = () => {
    onStartConstruction({ ...formData, status: 'construction' });
  };

  const InfoRow = ({ label, value }: { label: string; value?: string }) =>
    value ? (
      <div style={{ display: 'flex', gap: '8px', padding: '6px 0', borderBottom: '1px solid #f8fafc' }}>
        <span style={{ fontSize: '0.8rem', color: '#94a3b8', width: '80px', flexShrink: 0 }}>{label}</span>
        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: '#1e293b' }}>{value}</span>
      </div>
    ) : null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

      {/* Customer & Car Info (read-only) */}
      <div style={{ background: '#f8fafc', borderRadius: '12px', padding: '16px', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>{customer.plateNumber}</h3>
            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{customer.brand} {customer.model} ｜ {customer.name}</div>
          </div>
          <span style={{ background: '#fef3c7', color: '#92400e', padding: '4px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 'bold' }}>已下定・候排</span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', background: '#fff', borderRadius: '8px', padding: '16px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>預計施工日期</label>
              <input 
                type="date" 
                className="form-control" 
                style={{ fontSize: '0.85rem' }}
                value={formData.expectedStartDate || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, expectedStartDate: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>預計施工時間</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. 09:30"
                style={{ fontSize: '0.85rem' }}
                value={formData.constructionTime || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, constructionTime: e.target.value }))}
              />
            </div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>預計交車日期</label>
              <input 
                type="date" 
                className="form-control" 
                style={{ fontSize: '0.85rem' }}
                value={formData.expectedEndDate || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, expectedEndDate: e.target.value }))}
              />
            </div>
            <div>
              <label style={{ fontSize: '0.75rem', color: '#64748b', display: 'block', marginBottom: '4px', fontWeight: 'bold' }}>預計交車時間</label>
              <input 
                type="text" 
                className="form-control" 
                placeholder="e.g. 17:00"
                style={{ fontSize: '0.85rem' }}
                value={formData.expectedDeliveryTime || ''} 
                onChange={(e) => setFormData(prev => ({ ...prev, expectedDeliveryTime: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Construction items (read-only) */}
      <div style={{ borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden' }}>
        <div style={{ background: '#0f172a', color: '#fff', padding: '10px 16px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 'bold' }}>
          <Truck size={15} /> 確認施工項目（不可修改）
        </div>
        <div style={{ padding: '12px 16px' }}>
          <InfoRow label="主施工" value={customer.mainService ? `${customer.mainService}${customer.mainServiceBrand ? ` (${customer.mainServiceBrand})` : ''}` : undefined} />
          <InfoRow label="隔熱紙" value={customer.windowTint ? `${customer.windowTint}${customer.windowTintBrand ? ` (${customer.windowTintBrand})` : ''}` : undefined} />
          <InfoRow label="電子後視鏡" value={customer.digitalMirror} />
          <InfoRow label="電改" value={customer.electricMod} />
          {customer.customAccessories?.filter(a => a.name).map(acc => (
            <InfoRow key={acc.id} label="配件" value={acc.name} />
          ))}
          {!customer.mainService && !customer.windowTint && !customer.digitalMirror && !customer.electricMod && (
            <p style={{ color: '#94a3b8', fontSize: '0.85rem', margin: 0 }}>尚無施工項目資料</p>
          )}
        </div>
      </div>

      {/* Calendar & Material */}
      <div>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#475569', fontWeight: 'bold' }}>備料狀態</h4>
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => toggle('inCalendar')}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `2px solid ${formData.inCalendar ? '#10b981' : '#e2e8f0'}`, background: formData.inCalendar ? '#f0fdf4' : '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', color: formData.inCalendar ? '#166534' : '#64748b', transition: 'all 0.2s' }}
          >
            <CalendarCheck size={16} />
            {formData.inCalendar ? '✓ 已加入行事曆' : '加入行事曆'}
          </button>
          <button
            onClick={() => toggle('materialOrdered')}
            style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `2px solid ${formData.materialOrdered ? '#10b981' : '#e2e8f0'}`, background: formData.materialOrdered ? '#f0fdf4' : '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', color: formData.materialOrdered ? '#166534' : '#64748b', transition: 'all 0.2s' }}
          >
            <Package size={16} />
            {formData.materialOrdered ? '✓ 膜料已叫貨' : '膜料叫貨'}
          </button>
        </div>
      </div>

      {/* Gift Items */}
      <div>
        <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', color: '#f59e0b', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <Gift size={15} /> 贈送項目（勾選後會加入施工清單）
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '14px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
          {GIFT_OPTIONS.map(gift => {
            const selected = (formData.giftItems || []).includes(gift);
            return (
              <button
                key={gift}
                onClick={() => toggleGift(gift)}
                style={{ padding: '5px 12px', borderRadius: '20px', border: `1.5px solid ${selected ? '#f59e0b' : '#e2e8f0'}`, background: selected ? '#fef3c7' : '#fff', color: selected ? '#92400e' : '#64748b', fontSize: '0.8rem', fontWeight: selected ? '700' : '500', cursor: 'pointer', transition: 'all 0.15s' }}
              >
                {selected ? '✓ ' : ''}{gift}
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div style={{ display: 'flex', gap: '10px', paddingTop: '4px' }}>
        <button onClick={onCancel} className="btn btn-outline" style={{ flex: 1 }}>關閉</button>
        <button onClick={handleSave} className="btn btn-outline" style={{ flex: 1, borderColor: '#3b82f6', color: '#3b82f6' }}>儲存變更</button>
        <button
          onClick={handleStart}
          className="btn btn-primary"
          style={{ flex: 2, background: '#10b981', borderColor: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontWeight: 'bold' }}
        >
          <CheckCircle size={16} /> 開始施工
        </button>
      </div>
    </div>
  );
};
