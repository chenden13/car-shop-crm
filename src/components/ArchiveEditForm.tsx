import React, { useState } from 'react';
import type { Customer, Accessory, Role } from '../types';

import { Save, X, Plus, Trash2, Car, User, DollarSign, Gift, Shield } from 'lucide-react';

const GIFT_OPTIONS = [
  '大燈', '日行燈', 'ABC柱', '握把',
  '前踏板', '後踏板', '充電蓋',
  '尾燈(三項)', '玻璃鍍膜(三項)', '彩繪(視範圍)',
  '浮雕(視範圍)', '鋼琴烤漆(視範圍)'
];

interface ArchiveEditFormProps {
  customer: Customer;
  onSubmit: (updatedCustomer: Customer) => void;
  onCancel: () => void;
  userRole?: Role;
}


export const ArchiveEditForm: React.FC<ArchiveEditFormProps> = ({ customer, onSubmit, onCancel, userRole }) => {

  const [formData, setFormData] = useState<Customer>({
    ...customer,
    customAccessories: customer.customAccessories || [],
    giftItems: customer.giftItems || []
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      const val = type === 'number' ? Number(value) : value;
      setFormData(prev => ({ ...prev, [name]: val }));
    }
  };

  const addAccessory = () => {
    const newAcc: Accessory = { id: `acc_${Date.now()}`, name: '', price: 0 };
    setFormData(prev => ({ ...prev, customAccessories: [...(prev.customAccessories || []), newAcc] }));
  };

  const removeAccessory = (id: string) => {
    setFormData(prev => ({ ...prev, customAccessories: prev.customAccessories?.filter(a => a.id !== id) }));
  };

  const updateAccessory = (id: string, field: 'name' | 'price', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      customAccessories: prev.customAccessories?.map(a => a.id === id ? { ...a, [field]: value } : a)
    }));
  };

  const toggleGift = (gift: string) => {
    const current = formData.giftItems || [];
    const next = current.includes(gift) ? current.filter(g => g !== gift) : [...current, gift];
    setFormData(prev => ({ ...prev, giftItems: next }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px', padding: '10px' }}>
      
      {/* ── 基本資訊 ── */}
      <div className="form-group col-span-12">
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
          <Car size={18} /> 車輛與基本資料
        </h3>
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">車牌號碼</label>
        <input type="text" name="plateNumber" className="form-control" value={formData.plateNumber} onChange={handleChange} />
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">車主姓名</label>
        <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} />
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">聯絡電話</label>
        <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
      </div>

      {/* ── 施工項目 ── */}
      <div className="form-group col-span-12">
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
          <Shield size={18} /> 施工明細
        </h3>
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">主施工項目</label>
        <input type="text" name="mainService" className="form-control" value={formData.mainService || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">主施工品牌</label>
        <input type="text" name="mainServiceBrand" className="form-control" value={formData.mainServiceBrand || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">膜料顏色 (細項)</label>
        <input type="text" name="filmColor" className="form-control" value={formData.filmColor || ''} onChange={handleChange} />
      </div>
      
      <div className="form-group col-span-4">
        <label className="form-label">隔熱紙項目</label>
        <input type="text" name="windowTint" className="form-control" value={formData.windowTint || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">隔熱紙品牌</label>
        <input type="text" name="windowTintBrand" className="form-control" value={formData.windowTintBrand || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">膜料貨號</label>
        <input type="text" name="materialCode" className="form-control" value={formData.materialCode || ''} onChange={handleChange} />
      </div>

      <div className="form-group col-span-6">
        <label className="form-label">電子後視鏡</label>
        <input type="text" name="digitalMirror" className="form-control" value={formData.digitalMirror || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-6">
        <label className="form-label">電改項目</label>
        <input type="text" name="electricMod" className="form-control" value={formData.electricMod || ''} onChange={handleChange} />
      </div>

      {/* ── 客製配件 ── */}
      <div className="form-group col-span-12">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#6366f1' }}>客製化配件與額外項目</h4>
          <button type="button" onClick={addAccessory} className="btn btn-outline" style={{ padding: '4px 8px', fontSize: '0.75rem', height: 'auto' }}>
            <Plus size={14} /> 新增配件
          </button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {formData.customAccessories?.map((acc) => (
            <div key={acc.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input 
                type="text" 
                placeholder="配件名稱" 
                className="form-control" 
                style={{ flex: 3 }} 
                value={acc.name} 
                onChange={(e) => updateAccessory(acc.id, 'name', e.target.value)} 
              />
              <input 
                type="number" 
                placeholder="金額" 
                className="form-control" 
                style={{ flex: 1 }} 
                value={acc.price || ''} 
                onChange={(e) => updateAccessory(acc.id, 'price', Number(e.target.value))} 
              />
              <button type="button" onClick={() => removeAccessory(acc.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}>
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ── 贈送項目 ── */}
      <div className="form-group col-span-12">
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f59e0b' }}>
          <Gift size={18} /> 贈送項目
        </h3>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '12px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
          {GIFT_OPTIONS.map(gift => {
            const selected = (formData.giftItems || []).includes(gift);
            return (
              <button
                key={gift}
                type="button"
                onClick={() => toggleGift(gift)}
                style={{ 
                  padding: '5px 12px', borderRadius: '20px', 
                  border: `1.5px solid ${selected ? '#f59e0b' : '#e2e8f0'}`, 
                  background: selected ? '#fef3c7' : '#fff', 
                  color: selected ? '#92400e' : '#64748b', 
                  fontSize: '0.8rem', fontWeight: selected ? '700' : '500', 
                  cursor: 'pointer', transition: 'all 0.1s' 
                }}
              >
                {selected ? '✓ ' : ''}{gift}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 財務資訊 ── */}
      <div className="form-group col-span-12">
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669' }}>
          <DollarSign size={18} /> 財務數據追蹤
        </h3>
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">總金額 (收入)</label>
        <input type="number" name="totalAmount" className="form-control" value={formData.totalAmount || ''} onChange={handleChange} />
      </div>
      
      {userRole === 'admin' && (
        <>
          <div className="form-group col-span-4">
            <label className="form-label">成本支出</label>
            <input type="number" name="cost" className="form-control" value={formData.cost || ''} onChange={handleChange} />
          </div>
          <div className="form-group col-span-4">
            <label className="form-label">預估收益</label>
            <input type="number" name="revenue" className="form-control" value={formData.revenue || ''} onChange={handleChange} />
          </div>
        </>
      )}

      <div className="form-group col-span-8">
        <label className="form-label">套用折扣方案名稱</label>
        <input type="text" name="appliedDiscountName" className="form-control" value={formData.appliedDiscountName || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">折扣金額</label>
        <input type="number" name="discountAmount" className="form-control" value={formData.discountAmount || ''} onChange={handleChange} />
      </div>



      {/* ── 客戶特色 ── */}
      <div className="form-group col-span-12">
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#64748b' }}>
          <User size={18} /> 備註與客戶特徵
        </h3>
      </div>
      <div className="form-group col-span-12">
        <label className="form-label">特殊備註</label>
        <textarea name="notes" className="form-control" style={{ minHeight: '80px' }} value={formData.notes || ''} onChange={handleChange}></textarea>
      </div>

      <div className="form-actions col-span-12" style={{ marginTop: '24px' }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>取消/退出</button>
        <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Save size={18} /> 儲存微調內容
        </button>
      </div>
    </form>
  );
};
