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
        
        {/* BASIC INFO */}
        <div className="form-section indigo">
          <div className="section-header"><h3 className="section-title"><User size={18} /> 客戶與車輛基本資料</h3></div>
          <div className="form-grid">
            <div className="form-group col-span-3"><label className="form-label">客戶編號</label><input type="text" className="form-control" value={formData.id} readOnly style={{ background: '#f8fafc' }} /></div>
            <div className="form-group col-span-3"><label className="form-label">姓名*</label><input required type="text" name="name" className="form-control" value={formData.name || ''} onChange={handleChange} /></div>
            <div className="form-group col-span-3"><label className="form-label">電話*</label><input required type="tel" name="phone" className="form-control" value={formData.phone || ''} onChange={handleChange} /></div>
            <div className="form-group col-span-3"><label className="form-label">生日</label><input type="date" name="birthday" className="form-control" value={formData.birthday || ''} onChange={handleChange} /></div>
            
            <div className="form-group col-span-4"><label className="form-label">車牌號碼*</label><input required type="text" name="plateNumber" className="form-control" placeholder="ABC-1234" value={formData.plateNumber || ''} onChange={handleChange} /></div>
            <div className="form-group col-span-8">
              <label className="form-label">搜尋車型 (母檔系統)</label>
              <VehicleAutocomplete 
                brand={formData.brand || ''} model={formData.model || ''} vehicleSize={formData.vehicleSize || ''}
                vehicleMaster={vehicleMaster} onSelect={(data) => setFormData(prev => ({ ...prev, ...data }))}
              />
            </div>
          </div>
        </div>

        {/* 1. 膜料施工 (犀牛皮/改色) */}
        <div className="form-section blue">
          <div className="section-header"><h3 className="section-title blue"><Car size={18} /> 膜料施工項目 (犀牛皮/改色)</h3></div>
          <div className="form-grid">
            <div className="form-group col-span-4"><label className="form-label">主施工項目</label>
              <select name="mainService" className="form-control" value={formData.mainService || ''} onChange={handleChange}>
                <option value="">請選擇</option>
                <option value="全車犀牛皮">全車犀牛皮</option>
                <option value="全車改色膜">全車改色膜</option>
                <option value="局部施工">局部施工</option>
              </select>
            </div>
            <div className="form-group col-span-4"><label className="form-label">膜料品牌/規格</label><input type="text" name="mainServiceBrand" className="form-control" value={formData.mainServiceBrand || ''} onChange={handleChange} /></div>
            <div className="form-group col-span-2"><label className="form-label">顏色</label><input type="text" name="filmColor" className="form-control" value={formData.filmColor || ''} onChange={handleChange} /></div>
            <div className="form-group col-span-2"><label className="form-label">施工金額</label><input type="number" name="mainServicePrice" className="form-control" value={prices.mainServicePrice || ''} onChange={handlePriceChange} /></div>
          </div>
        </div>

        {/* 2. 隔熱紙 - EXACT MATCH SCREENSHOT */}
        <div className="form-section blue">
          <div className="section-header"><h3 className="section-title blue"><Shield size={18} /> 隔熱紙 - 品牌類別</h3></div>
          <div className="form-grid">
            <div className="form-group col-span-5">
              <label className="form-label">隔熱紙 - 品牌類別</label>
              <select name="windowTintBrand" className="form-control" value={formData.windowTintBrand || ''} onChange={handleChange}>
                <option value="">請選擇品牌</option>
                <option value="舒熱佳">舒熱佳</option>
                <option value="3M">3M</option>
                <option value="FSK">FSK</option>
              </select>
            </div>
            <div className="form-group col-span-5">
              <label className="form-label">具體規格/型號</label>
              <select name="windowTint" className="form-control" value={formData.windowTint || ''} onChange={handleChange}>
                <option value="">選擇規格 (點選自動報價)</option>
                <option value="LX系列">LX系列</option>
                <option value="Ti系列">Ti系列</option>
                <option value="VX系列">VX系列</option>
              </select>
            </div>
            <div className="form-group col-span-2" style={{ display: 'flex', alignItems: 'center', marginTop: '28px' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold', color: '#0369a1' }}>
                <input type="checkbox" name="hasSunroof" checked={!!formData.hasSunroof} onChange={handleChange} /> 包含天窗施工
              </label>
            </div>

            <div className="form-group col-span-2"><label className="form-label">施工金額</label><input type="number" name="windowTintPrice" className="form-control" placeholder="$" value={prices.windowTintPrice || ''} onChange={handlePriceChange} /></div>
            <div className="form-group col-span-2"><label className="form-label">預計進場日期</label><input type="date" name="expectedStartDate" className="form-control" value={formData.expectedStartDate || ''} onChange={handleChange} /></div>
            <div className="form-group col-span-8"><label className="form-label">備註時段/詳細</label><input type="text" name="notes" className="form-control" placeholder="e.g. 13:30 前擋+身" value={formData.notes || ''} onChange={handleChange} /></div>
          </div>
        </div>

        {/* 3. 電子後視鏡 - EXACT MATCH SCREENSHOT */}
        <div className="form-section purple">
          <div className="section-header"><h3 className="section-title purple"><Settings size={18} /> 電子後視鏡 - 項目</h3></div>
          <div className="form-grid">
            <div className="form-group col-span-4"><label className="form-label">電子後視鏡 - 項目</label><input type="text" name="digitalMirror" className="form-control" placeholder="輸入項目名稱" value={formData.digitalMirror || ''} onChange={handleChange} /></div>
            <div className="form-group col-span-8"><label className="form-label">品牌/規格備註</label><input type="text" name="digitalMirrorNote" className="form-control" placeholder="請輸入品牌或詳細規格" value={formData.digitalMirrorNote || ''} onChange={handleChange} /></div>
            
            <div className="form-group col-span-2"><label className="form-label">施工金額</label><input type="number" name="digitalMirrorPrice" className="form-control" placeholder="$" value={prices.digitalMirrorPrice || ''} onChange={handlePriceChange} /></div>
            <div className="form-group col-span-2"><label className="form-label">預計日期</label><input type="date" name="expectedEndDate" className="form-control" value={formData.expectedEndDate || ''} onChange={handleChange} /></div>
            <div className="form-group col-span-8"><label className="form-label">施工時段/說明</label><input type="text" name="digitalMirrorDesc" className="form-control" placeholder="預約時段或位置說明" value={formData.digitalMirrorDesc || ''} onChange={handleChange} /></div>
          </div>
        </div>

        {/* 4. 電動改裝 - EXACT MATCH SCREENSHOT */}
        <div className="form-section pink">
          <div className="section-header"><h3 className="section-title pink"><Plus size={18} /> 電動改裝 - 項目</h3></div>
          <div className="form-grid">
            <div className="form-group col-span-4"><label className="form-label">電動改裝 - 項目</label><input type="text" name="electricMod" className="form-control" placeholder="輸入項目名稱" value={formData.electricMod || ''} onChange={handleChange} /></div>
            <div className="form-group col-span-8"><label className="form-label">品牌/規格備註</label><input type="text" name="electricModNote" className="form-control" placeholder="請輸入品牌或詳細規格" value={formData.electricModNote || ''} onChange={handleChange} /></div>
            
            <div className="form-group col-span-2"><label className="form-label">施工金額</label><input type="number" name="electricModPrice" className="form-control" placeholder="$" value={prices.electricModPrice || ''} onChange={handlePriceChange} /></div>
            <div className="form-group col-span-2"><label className="form-label">預計日期</label><input type="date" name="deliveryDate" className="form-control" value={formData.deliveryDate || ''} onChange={handleChange} /></div>
            <div className="form-group col-span-8"><label className="form-label">施工時段/說明</label><input type="text" name="electricModDesc" className="form-control" placeholder="預約時段或位置說明" value={formData.electricModDesc || ''} onChange={handleChange} /></div>
          </div>
        </div>

        {/* 5. 客製配件 */}
        <div className="form-section orange">
          <div className="section-header">
            <h3 className="section-title"><Plus size={18} /> 客製配件與贈品</h3>
            <button type="button" className="btn btn-outline" onClick={addAccessory}>+ 新增項目</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {formData.customAccessories?.map(acc => (
              <div key={acc.id} style={{ display: 'flex', gap: '10px' }}>
                <input type="text" className="form-control" style={{ flex: 3 }} value={acc.name} onChange={(e) => updateAccessory(acc.id, 'name', e.target.value)} placeholder="配件名稱" />
                <input type="number" className="form-control" style={{ flex: 1 }} value={acc.price || ''} onChange={(e) => updateAccessory(acc.id, 'price', Number(e.target.value))} placeholder="金額" />
                <button type="button" onClick={() => removeAccessory(acc.id)} style={{ padding: '8px', color: '#ef4444', border: 'none', background: 'none', cursor: 'pointer' }}><Trash2 size={20} /></button>
              </div>
            ))}
          </div>
        </div>

        {/* 6. 優惠與總結 */}
        <div className="form-section green">
          <div className="section-header"><h3 className="section-title green"><Wallet size={18} /> 優惠套用與結算</h3></div>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
            {PROMOTIONS.map(p => (
              <button 
                key={p.id} type="button" 
                onClick={() => toggleDiscount(p.id)}
                className="btn"
                style={{ 
                  background: discountTypes.includes(p.id) ? 'var(--primary)' : 'white',
                  color: discountTypes.includes(p.id) ? 'white' : '#64748b',
                  borderColor: discountTypes.includes(p.id) ? 'var(--primary)' : '#e2e8f0',
                  border: '1px solid'
                }}
              >
                {p.label}
              </button>
            ))}
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: '700' }}>預估總金額 (成交價)</div>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#1e293b' }}>${totalPrice.toLocaleString()}</div>
            </div>
            <button type="submit" className="btn btn-primary" style={{ padding: '16px 40px', borderRadius: '16px', fontSize: '1.1rem' }}>
              <Save size={20} /> 儲存排程變更
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};
