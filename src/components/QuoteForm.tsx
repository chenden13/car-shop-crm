import React, { useState, useEffect } from 'react';
import type { Customer, Accessory } from '../types';
import { Plus, Trash2, Calendar, FileText, Settings, Gift, Star } from 'lucide-react';


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

  const [discountType, setDiscountType] = useState<'none' | 'birthday' | 'youtube'>('none');
  const [discountAmount, setDiscountAmount] = useState(0);

  useEffect(() => {
    let subtotal = prices.mainServicePrice + prices.windowTintPrice + prices.digitalMirrorPrice + prices.electricModPrice;
    formData.customAccessories?.forEach(acc => {
      subtotal += Number(acc.price) || 0;
    });

    let currentDiscount = 0;
    if (discountType === 'birthday') {
      currentDiscount = Math.round(prices.mainServicePrice * 0.05);
    } else if (discountType === 'youtube') {
      currentDiscount = 3000;
    }

    setDiscountAmount(currentDiscount);
    const finalTotal = subtotal - currentDiscount;
    setTotalPrice(finalTotal);
    setProfit(Math.round(finalTotal * 0.95)); // Simplified profit logic
  }, [prices, formData.customAccessories, discountType]);


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
    const discountNames = { none: '', birthday: '生日優惠 (95折)', youtube: 'YT 介紹優惠 (-3000)' };
    onSubmit({ 
      ...formData, 
      status: 'scheduled',
      totalAmount: totalPrice,
      revenue: profit,
      appliedDiscountName: discountNames[discountType],
      discountAmount: discountAmount
    });
  };




  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="col-span-12" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '12px' }}>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{customer.name} - {customer.plateNumber}</h4>
          <p style={{ margin: '4px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>請填妥排程與各項報價，完成後點選按鈕轉入施工。</p>
        </div>
      </div>


      {/* Row: Scheduling */}
      <h3 className="section-title"><Calendar size={18} /> 施工排程與備料</h3>
      <div className="form-group col-span-6">
        <label className="form-label">預計留車日</label>
        <input required type="date" name="expectedStartDate" className="form-control" value={formData.expectedStartDate || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-6">
        <label className="form-label">預計交車日</label>
        <input required type="date" name="expectedEndDate" className="form-control" value={formData.expectedEndDate || ''} onChange={handleChange} />
      </div>


      {/* Row: Main Quote Items */}
      <h3 className="section-title"><FileText size={18} /> 施工報價項目</h3>
      
      <div className="form-group col-span-4">
        <label className="form-label">主施工項目</label>
        <select name="mainService" className="form-control" value={formData.mainService || ''} onChange={handleChange}>
          <option value="">請選擇</option>
          <option value="全車改色">全車改色</option>
          <option value="全車犀牛皮">全車犀牛皮</option>
          <option value="迎風面犀牛皮">迎風面犀牛皮</option>
        </select>
      </div>

      <div className="form-group col-span-4">
        <label className="form-label">品牌</label>
        <select name="mainServiceBrand" className="form-control" value={formData.mainServiceBrand || ''} onChange={handleChange}>
          <option value="">請選擇</option>
          {(formData.mainService === '全車改色' 
            ? ['AX', '3M', 'CYS', 'TeckWrap'] 
            : ['3M', 'Michelin', 'Atarap', 'Stek']
          ).map(brand => (
            <option key={brand} value={brand}>{brand}</option>
          ))}
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

      {/* Customized Accessories moved inside Quote Items section */}
      <div className="col-span-12" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
        <h4 style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}><Settings size={16} /> 其餘客製化配件</h4>
        <button type="button" className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={addAccessory}>
          <Plus size={14} /> 新增配件
        </button>
      </div>

      <div className="col-span-12">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {formData.customAccessories?.map((acc) => (
            <div key={acc.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
              <div className="form-group" style={{ flex: 3 }}>
                <input type="text" className="form-control" placeholder="配件名稱" value={acc.name} onChange={(e) => updateAccessory(acc.id, 'name', e.target.value)} />
              </div>
              <div className="form-group" style={{ flex: 1 }}>
                <input type="number" className="form-control" placeholder="金額" value={acc.price || ''} onChange={(e) => updateAccessory(acc.id, 'price', Number(e.target.value))} />
              </div>
              <button type="button" className="btn" style={{ background: '#fee2e2', color: '#ef4444', padding: '6px' }} onClick={() => removeAccessory(acc.id)}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
      {/* Row: Activity Discounts */}
      <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#db2777' }}>
        <Star size={18} /> 活動折扣方案
      </h3>
      <div className="form-group col-span-12">
        <div style={{ display: 'flex', gap: '16px', background: '#fff5f7', padding: '16px', borderRadius: '12px', border: '1px solid #fbcfe8' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: discountType === 'none' ? 'bold' : 'normal' }}>
            <input type="radio" name="discount" checked={discountType === 'none'} onChange={() => setDiscountType('none')} /> 無折扣
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#be185d', fontWeight: discountType === 'birthday' ? 'bold' : 'normal' }}>
            <input type="radio" name="discount" checked={discountType === 'birthday'} onChange={() => setDiscountType('birthday')} /> 🎉 生日優惠 (膜料 95 折)
          </label>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', color: '#be185d', fontWeight: discountType === 'youtube' ? 'bold' : 'normal' }}>
            <input type="radio" name="discount" checked={discountType === 'youtube'} onChange={() => setDiscountType('youtube')} /> 🎥 YT 介紹優惠 (-3000)
          </label>
        </div>
      </div>

      <div className="col-span-12" style={{ background: '#0f172a', color: '#fff', padding: '24px', borderRadius: '16px', marginTop: '10px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}>
        {discountAmount > 0 && (
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', color: '#fca5a5', fontSize: '0.9rem' }}>
            <span>已套用折扣方案</span>
            <span>- $ {discountAmount.toLocaleString()}</span>
          </div>
        )}
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
        <button type="submit" className="btn btn-primary" style={{ padding: '12px 32px' }}>收到訂金，排入施工排程 →</button>
      </div>
    </form>

  );
};
