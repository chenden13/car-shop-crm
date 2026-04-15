import React, { useState, useEffect } from 'react';
import type { Customer, Accessory } from '../types';
import { Plus, Trash2, Calendar, FileText, Settings } from 'lucide-react';

interface QuoteFormProps {
  customer: Customer;
  onSubmit: (updatedCustomer: Customer) => void;
  onCancel: () => void;
}

export const QuoteForm: React.FC<QuoteFormProps> = ({ customer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Customer>(customer);
  const [totalPrice, setTotalPrice] = useState(0);
  const [profit, setProfit] = useState(0);

  useEffect(() => {
    if (!formData.customAccessories) {
      setFormData(prev => ({ ...prev, customAccessories: [] }));
    }
  }, []);

  const [prices, setPrices] = useState({
    mainServicePrice: 0,
    windowTintPrice: 0,
    digitalMirrorPrice: 0,
    electricModPrice: 0,
  });

  useEffect(() => {
    let total = prices.mainServicePrice + prices.windowTintPrice + prices.digitalMirrorPrice + prices.electricModPrice;
    formData.customAccessories?.forEach(acc => {
      total += Number(acc.price) || 0;
    });
    setTotalPrice(total);
    setProfit(Math.round(total * 0.95));
  }, [prices, formData.customAccessories]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPrices(prev => ({ ...prev, [name]: Number(value) }));
  };

  const addAccessory = () => {
    const newAcc: Accessory = { id: `acc_${Date.now()}`, name: '', price: 0 };
    setFormData(prev => ({ ...prev, customAccessories: [...(prev.customAccessories || []), newAcc] }));
  };

  const updateAccessory = (id: string, field: 'name' | 'price', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      customAccessories: prev.customAccessories?.map(acc => 
        acc.id === id ? { ...acc, [field]: value } : acc
      )
    }));
  };

  const removeAccessory = (id: string) => {
    setFormData(prev => ({
      ...prev,
      customAccessories: prev.customAccessories?.filter(acc => acc.id !== id)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, status: 'construction' });
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      {/* Header Banner */}
      <div className="col-span-12" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{customer.name} - {customer.plateNumber}</h4>
            <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>請填妥排程與各項報價，完成後點選按鈕轉入施工。</p>
          </div>
          <label className="checkbox-wrap" style={{ background: '#fff', padding: '8px 16px', borderRadius: '30px', border: '1px solid #e2e8f0' }}>
            <input required type="checkbox" name="inCalendar" checked={!!formData.inCalendar} onChange={handleChange} /> 
            <span>已加入行事曆排程*</span>
          </label>
        </div>
      </div>

      {/* Row: Scheduling */}
      <h3 className="section-title"><Calendar size={18} /> 施工排程與備料</h3>
      <div className="form-group col-span-4">
        <label className="form-label">預計留車日</label>
        <input required type="date" name="expectedStartDate" className="form-control" value={formData.expectedStartDate || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">預計交車日</label>
        <input required type="date" name="expectedEndDate" className="form-control" value={formData.expectedEndDate || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-4" style={{ display: 'flex', justifyContent: 'center', paddingTop: '28px' }}>
        <label className="checkbox-wrap">
          <input type="checkbox" name="materialOrdered" checked={!!formData.materialOrdered} onChange={handleChange} /> 膜料已叫貨
        </label>
      </div>

      {/* Row: Main Quote Items */}
      <h3 className="section-title"><FileText size={18} /> 施工報價項目</h3>
      
      <div className="form-group col-span-4">
        <label className="form-label">主施工項目</label>
        <input type="text" name="mainService" className="form-control" placeholder="全車改色..." value={formData.mainService || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">品牌</label>
        <select name="mainServiceBrand" className="form-control" value={formData.mainServiceBrand || ''} onChange={handleChange}>
          <option value="">請選擇</option>
          <option value="3M">3M</option>
          <option value="Avery">Avery</option>
          <option value="Stek">Stek</option>
        </select>
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">價格 ($)</label>
        <input type="number" name="mainServicePrice" className="form-control" onChange={handlePriceChange} placeholder="0" />
      </div>

      <div className="form-group col-span-4">
        <label className="form-label">隔熱紙項目</label>
        <input type="text" name="windowTint" className="form-control" placeholder="前檔+車身" value={formData.windowTint || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">品牌</label>
        <select name="windowTintBrand" className="form-control" value={formData.windowTintBrand || ''} onChange={handleChange}>
          <option value="">請選擇</option>
          <option value="V-KOOL">V-KOOL</option>
          <option value="FSK">FSK</option>
        </select>
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">價格 ($)</label>
        <input type="number" name="windowTintPrice" className="form-control" onChange={handlePriceChange} placeholder="0" />
      </div>

      <div className="form-group col-span-4">
        <label className="form-label">電子後視鏡</label>
        <input type="text" name="digitalMirror" className="form-control" value={formData.digitalMirror || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">品牌/型號</label>
        <input type="text" name="digitalMirrorBrand" className="form-control" value={formData.digitalMirrorBrand || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">價格 ($)</label>
        <input type="number" name="digitalMirrorPrice" className="form-control" onChange={handlePriceChange} placeholder="0" />
      </div>

      <div className="form-group col-span-4">
        <label className="form-label">電動改裝</label>
        <input type="text" name="electricMod" className="form-control" value={formData.electricMod || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">品牌/規格</label>
        <input type="text" name="electricModBrand" className="form-control" value={formData.electricModBrand || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">價格 ($)</label>
        <input type="number" name="electricModPrice" className="form-control" onChange={handlePriceChange} placeholder="0" />
      </div>

      {/* Row: Additional Accessories */}
      <div className="col-span-12" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px' }}>
        <h3 className="section-title" style={{ margin: 0, border: 'none' }}><Settings size={18} /> 其餘客製化配件</h3>
        <button type="button" className="btn btn-outline" style={{ padding: '6px 16px', fontSize: '0.85rem' }} onClick={addAccessory}>
          <Plus size={16} /> 新增配件
        </button>
      </div>

      <div className="col-span-12">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {formData.customAccessories?.map((acc) => (
            <div key={acc.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-end', background: '#f8fafc', padding: '12px', borderRadius: '10px' }}>
              <div className="form-group" style={{ flex: 3 }}>
                <label className="form-label">配件名稱</label>
                <input type="text" className="form-control" value={acc.name} onChange={(e) => updateAccessory(acc.id, 'name', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <label className="form-label">金額</label>
                <input type="number" className="form-control" value={acc.price || ''} onChange={(e) => updateAccessory(acc.id, 'price', Number(e.target.value))} />
              </div>
              <button type="button" className="btn" style={{ background: '#fee2e2', color: '#ef4444', padding: '9px' }} onClick={() => removeAccessory(acc.id)}>
                <Trash2 size={20} />
              </button>
            </div>
          ))}
          {formData.customAccessories?.length === 0 && (
            <div style={{ padding: '24px', textAlign: 'center', background: '#f8fafc', border: '1px dashed #e2e8f0', borderRadius: '12px', color: '#94a3b8', fontSize: '0.9rem' }}>
              無新增客製化配件
            </div>
          )}
        </div>
      </div>

      {/* Totals Section */}
      <div className="col-span-12" style={{ background: '#0f172a', color: '#fff', padding: '24px', borderRadius: '16px', marginTop: '20px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
          <span style={{ color: '#94a3b8', fontWeight: '500' }}>報價總計金額</span>
          <span style={{ fontSize: '1.4rem', fontWeight: '800' }}>$ {totalPrice.toLocaleString()}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#94a3b8', fontWeight: '500' }}>預估淨收益 (扣除5%稅金)</span>
          <span style={{ fontSize: '1.8rem', fontWeight: '800', color: '#10b981' }}>$ {profit.toLocaleString()}</span>
        </div>
      </div>

      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>返回</button>
        <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>收到訂金，轉入施工流程</button>
      </div>
    </form>
  );
};
