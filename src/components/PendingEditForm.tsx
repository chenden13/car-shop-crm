import React, { useState, useEffect } from 'react';
import { User, Car, Shield, Settings, Info, Calendar, Plus, Trash2, Tag, Save, Clock, ChevronRight, Package, Truck, Wallet } from 'lucide-react';
import type { Customer, Accessory, Promotion } from '../types';
import { VehicleAutocomplete } from './VehicleAutocomplete';

const PROMOTIONS: Promotion[] = [
  { id: 'early_bird', label: '早鳥預約 (95折)', type: 'discount', val: 0.95 },
  { id: 'member_ref', label: '老客戶介紹 (-$1000)', type: 'minus', val: 1000 },
  { id: 'combo_deal', label: '套餐優惠 (9折)', type: 'discount', val: 0.90 },
  { id: 'seasonal', label: '季節活動 (-$500)', type: 'minus', val: 500 },
];

interface PendingEditFormProps {
  customer: Customer | null;
  onSuggestId: string;
  vehicleMaster?: any[];
  onSubmit: (updatedCustomer: Customer, moveToConstruction: boolean) => void;
  onCancel: () => void;
}

export const PendingEditForm: React.FC<PendingEditFormProps> = ({ customer, onSuggestId, vehicleMaster = [], onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Customer>>(customer || {
    id: onSuggestId,
    status: 'scheduled',
    consultationDate: new Date().toISOString().split('T')[0],
    customAccessories: [],
    appliedDiscountIds: []
  });

  const [prices, setPrices] = useState({
    mainServicePrice: customer?.mainServicePrice || 0,
    windowTintPrice: customer?.windowTintPrice || 0,
    digitalMirrorPrice: customer?.digitalMirrorPrice || 0,
    electricModPrice: customer?.electricModPrice || 0,
    cost: customer?.cost || 0
  });

  const [discountTypes, setDiscountTypes] = useState<string[]>(customer?.appliedDiscountIds || []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
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

  const toggleDiscount = (id: string) => {
    setDiscountTypes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const addAccessory = () => {
    const newAcc: Accessory = { id: `ACC-${Date.now()}`, name: '', price: 0 };
    setFormData(prev => ({ ...prev, customAccessories: [...(prev.customAccessories || []), newAcc] }));
  };

  const removeAccessory = (id: string) => {
    setFormData(prev => ({ ...prev, customAccessories: prev.customAccessories?.filter(acc => acc.id !== id) }));
  };

  const updateAccessory = (id: string, field: 'name' | 'price', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      customAccessories: prev.customAccessories?.map(acc => acc.id === id ? { ...acc, [field]: value } : acc)
    }));
  };

  let subtotal = (prices.mainServicePrice || 0) + (prices.windowTintPrice || 0) + (prices.digitalMirrorPrice || 0) + (prices.electricModPrice || 0);
  formData.customAccessories?.forEach(acc => { subtotal += Number(acc.price) || 0; });

  let discountAmount = 0;
  discountTypes.forEach(id => {
    const promo = PROMOTIONS.find(p => p.id === id);
    if (promo && promo.type === 'discount') discountAmount += Math.round(subtotal * (1 - promo.val));
    else if (promo && promo.type === 'minus') discountAmount += promo.val;
  });
  
  const totalPrice = subtotal - discountAmount;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const appliedNames = discountTypes.map(id => PROMOTIONS.find(p => p.id === id)?.label).filter(Boolean).join(', ');
    onSubmit({
      ...(formData as Customer),
      totalAmount: totalPrice,
      revenue: totalPrice - (prices.cost || 0),
      appliedDiscountName: appliedNames,
      discountAmount,
      digitalMirrorPrice: prices.digitalMirrorPrice,
      electricModPrice: prices.electricModPrice,
      mainServicePrice: prices.mainServicePrice,
      windowTintPrice: prices.windowTintPrice,
      cost: prices.cost,
      appliedDiscountIds: discountTypes
    }, false);
  };

  return (
    <div className="form-container" style={{ display: 'flex', flexDirection: 'column', maxHeight: '85vh', overflowY: 'auto' }}>
      <form onSubmit={handleSave} style={{ padding: '4px' }}>
        
        {/* SECTION 1: BASIC INFO */}
        <div className="form-section" style={{ borderTop: '6px solid var(--primary)' }}>
          <div className="section-header">
            <h3 className="section-title"><User size={20} color="var(--primary)" /> 客戶與車輛基本資料</h3>
          </div>
          <div className="form-grid">
            <div className="form-group col-span-3">
              <label className="form-label">編號</label>
              <input type="text" className="form-control" value={formData.id} readOnly style={{ background: '#f7f7f7', border: 'none' }} />
            </div>
            <div className="form-group col-span-3">
              <label className="form-label">姓名*</label>
              <input required type="text" name="name" className="form-control" value={formData.name || ''} onChange={handleChange} placeholder="輸入姓名" />
            </div>
            <div className="form-group col-span-3">
              <label className="form-label">電話*</label>
              <input required type="tel" name="phone" className="form-control" value={formData.phone || ''} onChange={handleChange} placeholder="輸入電話" />
            </div>
            <div className="form-group col-span-3">
              <label className="form-label">生日</label>
              <input type="date" name="birthday" className="form-control" value={formData.birthday || ''} onChange={handleChange} />
            </div>
            
            <div className="form-group col-span-4">
              <label className="form-label">車牌號碼*</label>
              <input required type="text" name="plateNumber" className="form-control" value={formData.plateNumber || ''} onChange={handleChange} placeholder="ABC-1234" />
            </div>
            <div className="form-group col-span-8">
              <label className="form-label">車型搜尋</label>
              <VehicleAutocomplete 
                brand={formData.brand || ''} model={formData.model || ''} vehicleSize={formData.vehicleSize || ''}
                vehicleMaster={vehicleMaster} onSelect={(data) => setFormData(prev => ({ ...prev, ...data }))}
              />
            </div>
          </div>
        </div>

        {/* SECTION 2: CONSTRUCTION DETAILS */}
        <div className="form-section" style={{ borderTop: '6px solid #3b82f6' }}>
          <div className="section-header">
            <h3 className="section-title" style={{ color: '#3b82f6' }}><Car size={20} /> 施工項目與報價</h3>
          </div>
          <div className="form-grid">
            <div className="form-group col-span-4"><label className="form-label">主施工項目</label>
              <select name="mainService" className="form-control" value={formData.mainService || ''} onChange={handleChange}>
                <option value="">請選擇</option>
                <option value="全車犀牛皮">全車犀牛皮</option>
                <option value="全車改色膜">全車改色膜</option>
                <option value="局部施工">局部施工</option>
              </select>
            </div>
            <div className="form-group col-span-4"><label className="form-label">膜料品牌/規格</label><input type="text" name="mainServiceBrand" className="form-control" value={formData.mainServiceBrand || ''} onChange={handleChange} placeholder="例如: 3M, Avery" /></div>
            <div className="form-group col-span-2"><label className="form-label">顏色</label><input type="text" name="filmColor" className="form-control" value={formData.filmColor || ''} onChange={handleChange} placeholder="顏色備註" /></div>
            <div className="form-group col-span-2"><label className="form-label">金額</label><input type="number" name="mainServicePrice" className="form-control" value={prices.mainServicePrice || ''} onChange={handlePriceChange} /></div>
            
            {/* MISSING FIELDS RESTORED */}
            <div className="form-group col-span-4"><label className="form-label">隔熱紙品牌</label><input type="text" name="windowTintBrand" className="form-control" value={formData.windowTintBrand || ''} onChange={handleChange} placeholder="例如: 舒熱佳" /></div>
            <div className="form-group col-span-4"><label className="form-label">隔熱紙部位</label><input type="text" name="windowTint" className="form-control" value={formData.windowTint || ''} onChange={handleChange} placeholder="前擋/車身" /></div>
            <div className="form-group col-span-4"><label className="form-label">隔熱紙金額</label><input type="number" name="windowTintPrice" className="form-control" value={prices.windowTintPrice || ''} onChange={handlePriceChange} /></div>

            <div className="form-group col-span-4"><label className="form-label">電子後視鏡型號</label><input type="text" name="digitalMirror" className="form-control" value={formData.digitalMirror || ''} onChange={handleChange} placeholder="型號備註" /></div>
            <div className="form-group col-span-2"><label className="form-label">金額</label><input type="number" name="digitalMirrorPrice" className="form-control" value={prices.digitalMirrorPrice || ''} onChange={handlePriceChange} /></div>
            <div className="form-group col-span-4"><label className="form-label">電動改裝項目</label><input type="text" name="electricMod" className="form-control" value={formData.electricMod || ''} onChange={handleChange} placeholder="尾門/吸門" /></div>
            <div className="form-group col-span-2"><label className="form-label">金額</label><input type="number" name="electricModPrice" className="form-control" value={prices.electricModPrice || ''} onChange={handlePriceChange} /></div>
          </div>
        </div>

        {/* SECTION 3: SCHEDULING */}
        <div className="form-section" style={{ borderTop: '6px solid #a855f7' }}>
          <div className="section-header">
            <h3 className="section-title" style={{ color: '#a855f7' }}><Calendar size={20} /> 排程與時程</h3>
          </div>
          <div className="form-grid">
            <div className="form-group col-span-4">
              <label className="form-label">進場日期</label>
              <input type="date" name="expectedStartDate" className="form-control" value={formData.expectedStartDate || ''} onChange={handleChange} />
            </div>
            <div className="form-group col-span-4">
              <label className="form-label">預計完工</label>
              <input type="date" name="expectedEndDate" className="form-control" value={formData.expectedEndDate || ''} onChange={handleChange} />
            </div>
            <div className="form-group col-span-4">
              <label className="form-label">預計交車</label>
              <input type="date" name="deliveryDate" className="form-control" value={formData.deliveryDate || ''} onChange={handleChange} />
            </div>
          </div>
        </div>

        {/* SECTION 4: CUSTOM ACCESSORIES */}
        <div className="form-section" style={{ borderTop: '6px solid var(--accent)' }}>
          <div className="section-header">
            <h3 className="section-title" style={{ color: 'var(--accent)' }}><Plus size={20} /> 客製配件與贈品</h3>
            <button type="button" className="btn btn-outline" onClick={addAccessory} style={{ padding: '6px 12px', fontSize: '0.8rem' }}>+ 新增項目</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
            {formData.customAccessories?.map(acc => (
              <div key={acc.id} style={{ display: 'flex', gap: '10px' }}>
                <input type="text" className="form-control" style={{ flex: 3 }} value={acc.name} onChange={(e) => updateAccessory(acc.id, 'name', e.target.value)} placeholder="配件名稱" />
                <input type="number" className="form-control" style={{ flex: 1 }} value={acc.price || ''} onChange={(e) => updateAccessory(acc.id, 'price', Number(e.target.value))} placeholder="金額" />
                <button type="button" onClick={() => removeAccessory(acc.id)} style={{ padding: '8px', background: 'none', border: 'none', color: '#ff385c', cursor: 'pointer' }}><Trash2 size={20} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* SECTION 5: CONSULTATION & PROMOTIONS */}
        <div className="form-section" style={{ borderTop: '6px solid #10b981' }}>
          <div className="section-header">
            <h3 className="section-title" style={{ color: '#10b981' }}><Info size={20} /> 諮詢細節與活動</h3>
          </div>
          <div className="form-grid">
            <div className="form-group col-span-4">
              <label className="form-label">同行狀況</label>
              <select name="companion" className="form-control" value={formData.companion || 'alone'} onChange={handleChange}>
                <option value="alone">單獨前來</option>
                <option value="with_wife">攜伴(另一半)</option>
                <option value="with_child">攜帶小孩</option>
                <option value="with_family">全家同行</option>
              </select>
            </div>
            <div className="form-group col-span-8" style={{ display: 'flex', gap: '15px', alignItems: 'center', marginTop: '24px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}>
                <input type="checkbox" name="detailOriented" checked={!!formData.detailOriented} onChange={handleChange} /> 在意細節
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}>
                <input type="checkbox" name="easyGoing" checked={!!formData.easyGoing} onChange={handleChange} /> 好相處
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '0.9rem' }}>
                <input type="checkbox" name="likesCalls" checked={!!formData.likesCalls} onChange={handleChange} /> 喜歡電話
              </label>
            </div>
            <div className="form-group col-span-12">
              <label className="form-label">優惠活動套用 (可複選)</label>
              <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                {PROMOTIONS.map(p => (
                  <button 
                    key={p.id} type="button" 
                    onClick={() => toggleDiscount(p.id)}
                    className="btn"
                    style={{ 
                      fontSize: '0.8rem', 
                      padding: '6px 12px',
                      background: discountTypes.includes(p.id) ? 'var(--primary)' : 'white',
                      color: discountTypes.includes(p.id) ? 'white' : '#717171',
                      borderColor: discountTypes.includes(p.id) ? 'var(--primary)' : '#ebebeb',
                      border: '1px solid'
                    }}
                  >
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
            <div className="form-group col-span-12">
              <label className="form-label">情資備註</label>
              <textarea name="notes" className="form-control" rows={3} value={formData.notes || ''} onChange={handleChange} placeholder="記錄客戶偏好、溝通重點..." />
            </div>
          </div>
        </div>

        {/* SECTION 6: SUMMARY & BUDGET */}
        <div className="form-section" style={{ background: '#f7f7f7', border: '1px solid #222', position: 'sticky', bottom: 0, zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '30px' }}>
              <div>
                <div style={{ fontSize: '0.8rem', color: '#717171', fontWeight: '700' }}>折抵金額</div>
                <div style={{ fontSize: '1.25rem', fontWeight: '700', color: '#ff385c' }}>-${discountAmount.toLocaleString()}</div>
              </div>
              <div>
                <div style={{ fontSize: '0.9rem', color: '#717171', fontWeight: '700' }}>預估總金額 (成交價)</div>
                <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#222' }}>${totalPrice.toLocaleString()}</div>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '16px 40px', borderRadius: '16px', fontSize: '1.1rem' }}>
              <Save size={20} /> 儲存變更
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
