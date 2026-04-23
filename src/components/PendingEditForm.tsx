import React, { useState } from 'react';
import type { Customer, Accessory, StatusType } from '../types';
import { Plus, Trash2, Calendar, FileText, Settings, Gift, Package, CalendarCheck, User, Star, Smile } from 'lucide-react';
import { taiwanCounties } from '../data/counties';

const GIFT_OPTIONS = [
  '大燈', '日行燈', 'ABC柱', '握把',
  '前踏板', '後踏板', '充電蓋',
  '尾燈(三項)', '玻璃鍍膜(三項)', '彩繪(視範圍)',
  '浮雕(視範圍)', '鋼琴烤漆(視範圍)'
];

interface PendingEditFormProps {
  customer?: Customer; 
  onSuggestId?: string;
  onSubmit: (updatedCustomer: Customer, moveToConstruction: boolean) => void;
  onCancel: () => void;
}

export const PendingEditForm: React.FC<PendingEditFormProps> = ({ customer, onSuggestId, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Customer>>(() => {
    if (customer) return { ...customer, customAccessories: customer.customAccessories || [] };
    return { id: onSuggestId, status: 'scheduled', customAccessories: [] };
  });
  
  const [prices, setPrices] = useState({
    mainServicePrice: customer?.mainServicePrice || 0,
    windowTintPrice: customer?.windowTintPrice || 0,
    digitalMirrorPrice: customer?.digitalMirrorPrice || 0,
    electricModPrice: customer?.electricModPrice || 0,
  });

  const getInitialDiscount = () => {
     if (customer?.appliedDiscountName?.includes('生日')) return 'birthday';
     if (customer?.appliedDiscountName?.includes('YT')) return 'youtube';
     return 'none';
  };
  const [discountType, setDiscountType] = useState<'none' | 'birthday' | 'youtube'>(getInitialDiscount());

  let subtotal = (prices.mainServicePrice || 0) + (prices.windowTintPrice || 0) + (prices.digitalMirrorPrice || 0) + (prices.electricModPrice || 0);
  formData.customAccessories?.forEach(acc => {
    subtotal += Number(acc.price) || 0;
  });

  let discountAmount = 0;
  if (discountType === 'birthday') {
    discountAmount = Math.round((prices.mainServicePrice || 0) * 0.05);
  } else if (discountType === 'youtube') {
    discountAmount = 3000;
  }
  
  const totalPrice = subtotal - discountAmount;
  const profit = Math.round(totalPrice * 0.95);

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

  const handleToggleState = (field: 'inCalendar' | 'materialOrdered') => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };

  const toggleGift = (gift: string) => {
    const current = formData.giftItems || [];
    const next = current.includes(gift) ? current.filter(g => g !== gift) : [...current, gift];
    setFormData(prev => ({ ...prev, giftItems: next }));
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

  const prepareSubmitData = (status: StatusType): Customer => {
    const discountNames = { none: '', birthday: '生日優惠 (95折)', youtube: 'YT 介紹優惠 (-3000)' };
    return {
      ...(formData as Customer),
      status,
      totalAmount: totalPrice,
      revenue: profit,
      appliedDiscountName: discountNames[discountType],
      discountAmount: discountAmount,
      mainServicePrice: prices.mainServicePrice,
      windowTintPrice: prices.windowTintPrice,
      digitalMirrorPrice: prices.digitalMirrorPrice,
      electricModPrice: prices.electricModPrice
    };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    let status: StatusType = (formData.status === 'construction') ? 'construction' : 'scheduled';
    onSubmit(prepareSubmitData(status), false);
  };

  const handleMoveToConstruction = (e: React.FormEvent) => {
    e.preventDefault();
    const isConfirm = window.confirm('確定要轉入「現場施工」嗎？此案件將從排程區消失，進入施工站！');
    if (!isConfirm) return;
    onSubmit(prepareSubmitData('construction'), true);
  };

  const handleConvert = () => {
    const isConfirm = window.confirm('確定要將此諮詢案件轉為「正式下定」嗎？轉入後將可以填寫報價與排程時間。');
    if (!isConfirm) return;
    onSubmit(prepareSubmitData('scheduled'), false);
  };

  return (
    <form className="form-grid" style={{ maxHeight: '85vh', overflowY: 'auto', paddingRight: '12px' }} onSubmit={(e) => e.preventDefault()}>
      
      {/* ── 諮詢意向 (最上方) ── */}
      <h3 className="section-title col-span-12" style={{ color: '#ef4444', borderBottom: '2px solid #fee2e2', paddingBottom: '8px' }}>
        <Star size={18} /> 諮詢進件重點
      </h3>
      <div className="form-group col-span-12">
        <label className="form-label" style={{ color: '#ef4444', fontWeight: 'bold' }}>諮詢感興趣的配件與需求</label>
        <input type="text" name="interestedAccessories" className="form-control" placeholder="客戶諮詢時提到的配件需求..." value={formData.interestedAccessories || ''} onChange={handleChange} style={{ borderColor: '#fca5a5' }} />
      </div>

      {/* ── 基本資料 ── */}
      <h3 className="section-title col-span-12" style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginTop: '10px' }}>
        <User size={18} /> 客戶基本資料
      </h3>
      
      <div className="form-group col-span-3">
        <label className="form-label">客戶編號*</label>
        <input required type="text" name="id" className="form-control" value={formData.id || ''} onChange={handleChange} disabled={!!customer} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">姓名*</label>
        <input required type="text" name="name" className="form-control" value={formData.name || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">電話*</label>
        <input required type="tel" name="phone" className="form-control" value={formData.phone || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">生日</label>
        <input type="date" name="birthday" className="form-control" value={formData.birthday || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-6">
        <label className="form-label">地址</label>
        <input type="text" name="address" className="form-control" value={formData.address || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">告知管道</label>
        <input type="text" name="fromChannel" className="form-control" value={formData.fromChannel || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">諮詢日期</label>
        <input type="date" name="consultationDate" className="form-control" value={formData.consultationDate || ''} onChange={handleChange} />
      </div>

      {/* ── 客戶習性與紀錄 ── */}
      <h3 className="section-title col-span-12" style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginTop: '20px' }}>
        <Smile size={18} /> 客戶特徵習性與觀察
      </h3>

      <div className="form-group col-span-4">
        <label className="form-label">工作/方便地點</label>
        <select name="location" className="form-control" value={formData.location || ''} onChange={handleChange}>
          <option value="">請選擇縣市</option>
          {taiwanCounties.map(county => (
            <option key={county} value={county}>{county}</option>
          ))}
        </select>
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">方便聯絡/留車時間</label>
        <div style={{ display: 'flex', gap: '20px', height: '42px', alignItems: 'center' }}>
          <label className="checkbox-wrap" style={{ fontWeight: 'normal' }}><input type="radio" name="convenientTime" value="weekday" checked={formData.convenientTime === 'weekday'} onChange={handleChange} /> 平日</label>
          <label className="checkbox-wrap" style={{ fontWeight: 'normal' }}><input type="radio" name="convenientTime" value="weekend" checked={formData.convenientTime === 'weekend'} onChange={handleChange}/> 假日</label>
        </div>
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">同行狀態</label>
        <select name="companion" className="form-control" value={formData.companion || 'alone'} onChange={handleChange}>
          <option value="alone">一個人來</option>
          <option value="with_child">帶小孩</option>
          <option value="with_family">帶家人</option>
          <option value="with_wife">帶老婆/伴侶</option>
        </select>
      </div>

      <div className="form-group col-span-12" style={{ display: 'flex', gap: '24px' }}>
        <label className="checkbox-wrap" style={{ fontWeight: 'normal' }}><input type="checkbox" name="detailOriented" checked={!!formData.detailOriented} onChange={handleChange} /> 在意細節</label>
        <label className="checkbox-wrap" style={{ fontWeight: 'normal' }}><input type="checkbox" name="easyGoing" checked={!!formData.easyGoing} onChange={handleChange} /> 好相處</label>
        <label className="checkbox-wrap" style={{ fontWeight: 'normal' }}><input type="checkbox" name="likesCalls" checked={!!formData.likesCalls} onChange={handleChange} /> 喜歡電話聯絡</label>
      </div>

      <div className="form-group col-span-3">
        <label className="form-label">體型</label>
        <select name="bodyType" className="form-control" value={formData.bodyType || ''} onChange={handleChange}>
          <option value="">未記錄</option>
          <option value="slim">瘦</option>
          <option value="average">適中</option>
          <option value="heavy">偏胖</option>
        </select>
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">髮型</label>
        <select name="hairLength" className="form-control" value={formData.hairLength || ''} onChange={handleChange}>
          <option value="">未記錄</option>
          <option value="short">短髮</option>
          <option value="medium">中長髮</option>
          <option value="long">長髮</option>
        </select>
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">經濟預估</label>
        <select name="wealthLevel" className="form-control" value={formData.wealthLevel || ''} onChange={handleChange}>
          <option value="">未記錄</option>
          <option value="high">很有錢</option>
          <option value="medium">一般</option>
          <option value="normal">普通</option>
        </select>
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">特徵/眼鏡</label>
        <label className="checkbox-wrap" style={{ fontWeight: 'normal', height: '42px', display: 'flex', alignItems: 'center' }}><input type="checkbox" name="wearsGlasses" checked={!!formData.wearsGlasses} onChange={handleChange} /> 戴眼鏡</label>
      </div>

      {/* ── 車輛資訊 ── */}
      <h3 className="section-title col-span-12" style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginTop: '20px' }}>
        <Package size={18} /> 車輛硬體資訊
      </h3>
      <div className="form-group col-span-4">
        <label className="form-label">車牌號碼*</label>
        <input required type="text" name="plateNumber" className="form-control" placeholder="ABC-1234" value={formData.plateNumber || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">汽車品牌</label>
        <input type="text" name="brand" className="form-control" placeholder="Porsche" value={formData.brand || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">車種 (Model)</label>
        <input type="text" name="model" className="form-control" placeholder="911, Model Y..." value={formData.model || ''} onChange={handleChange} />
      </div>

      {/* ── 施工排程與備料 (僅非諮詢狀態顯示) ── */}
      {formData.status !== 'new' && (
        <>
          <h3 className="section-title col-span-12" style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginTop: '20px' }}>
            <Calendar size={18} /> 施工排程與備料
          </h3>

          <div className="form-group col-span-6">
            <label className="form-label">預計施工日期</label>
            <input required type="date" name="expectedStartDate" className="form-control" value={formData.expectedStartDate || ''} onChange={handleChange} />
          </div>
          <div className="form-group col-span-6">
            <label className="form-label">施工時間 (時段)</label>
            <input type="text" name="constructionTime" className="form-control" placeholder="e.g. 09:30" value={formData.constructionTime || ''} onChange={handleChange} />
          </div>

          <div className="form-group col-span-6">
            <label className="form-label">預計交車日期</label>
            <input required type="date" name="expectedEndDate" className="form-control" value={formData.expectedEndDate || ''} onChange={handleChange} />
          </div>
          <div className="form-group col-span-6">
            <label className="form-label">交車時間 (時段)</label>
            <input type="text" name="expectedDeliveryTime" className="form-control" placeholder="e.g. 17:00" value={formData.expectedDeliveryTime || ''} onChange={handleChange} />
          </div>

          <div className="col-span-12">
            <label className="form-label" style={{ marginBottom: '8px' }}>備料與行事曆狀態</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => handleToggleState('inCalendar')}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `2px solid ${formData.inCalendar ? '#10b981' : '#e2e8f0'}`, background: formData.inCalendar ? '#f0fdf4' : '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', color: formData.inCalendar ? '#166534' : '#64748b', transition: 'all 0.2s' }}
              >
                <CalendarCheck size={16} />
                {formData.inCalendar ? '✓ 已加入行事曆' : '加入行事曆'}
              </button>
              <button
                type="button"
                onClick={() => handleToggleState('materialOrdered')}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `2px solid ${formData.materialOrdered ? '#10b981' : '#e2e8f0'}`, background: formData.materialOrdered ? '#f0fdf4' : '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', color: formData.materialOrdered ? '#166534' : '#64748b', transition: 'all 0.2s' }}
              >
                <Package size={16} />
                {formData.materialOrdered ? '✓ 膜料已叫貨' : '膜料叫貨'}
              </button>
            </div>
          </div>

          {/* ── 施工報價項目 ── */}
          <h3 className="section-title col-span-12" style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginTop: '20px' }}>
            <FileText size={18} /> 施工報價明細
          </h3>

          {/* 主施工 */}
          <div className="form-group col-span-4">
            <label className="form-label">主施工項目</label>
            <select name="mainService" className="form-control" value={formData.mainService || ''} onChange={handleChange}>
              <option value="">請選擇</option>
              <option value="全車改色膜">全車改色膜</option>
              <option value="全車犀牛皮">全車犀牛皮</option>
              <option value="局部保護/改色">局部保護/改色</option>
            </select>
          </div>
          <div className="form-group col-span-4">
            <label className="form-label">品牌 / 膜料顏色</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'min-content 1fr', gap: '4px' }}>
              <select name="mainServiceBrand" className="form-control" value={formData.mainServiceBrand || ''} onChange={handleChange} style={{ padding: '8px 4px' }}>
                <option value="">品牌</option>
                {((formData.mainService || '').includes('改色') 
                  ? ['AX', '3M', 'CYS', 'TeckWrap'] 
                  : ['3M', 'Michelin', 'Atarap', 'Stek']
                ).map(brand => <option key={brand} value={brand}>{brand}</option>)}
              </select>
              <input type="text" name="filmColor" className="form-control" placeholder="顏色" value={formData.filmColor || ''} onChange={handleChange} />
            </div>
          </div>
          <div className="form-group col-span-4">
            <label className="form-label">施工價格 ($)</label>
            <input type="number" name="mainServicePrice" className="form-control" value={prices.mainServicePrice || ''} onChange={handlePriceChange} placeholder="0" />
          </div>

          {/* 其他項目 */}
          {[
            { label: '隔熱紙項目', field: 'windowTint', brandField: 'windowTintBrand', priceField: 'windowTintPrice' },
            { label: '電子後視鏡', field: 'digitalMirror', brandField: 'digitalMirrorBrand', priceField: 'digitalMirrorPrice' },
            { label: '電動改裝', field: 'electricMod', brandField: 'electricModBrand', priceField: 'electricModPrice' }
          ].map(row => (
            <React.Fragment key={row.field}>
              <div className="form-group col-span-4">
                <label className="form-label">{row.label}</label>
                <input type="text" name={row.field} className="form-control" value={formData[row.field as keyof Customer] as string || ''} onChange={handleChange} />
              </div>
              <div className="form-group col-span-4">
                <label className="form-label">品牌/規格</label>
                <input type="text" name={row.brandField} className="form-control" value={formData[row.brandField as keyof Customer] as string || ''} onChange={handleChange} />
              </div>
              <div className="form-group col-span-4">
                <label className="form-label">價格 ($)</label>
                <input type="number" name={row.priceField} className="form-control" value={(prices as any)[row.priceField] || ''} onChange={handlePriceChange} placeholder="0" />
              </div>
            </React.Fragment>
          ))}

          {/* 自訂配件 */}
          <div className="col-span-12" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <h4 style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}><Settings size={16} /> 客製化配件加購</h4>
            <button type="button" className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={addAccessory}>
              <Plus size={14} /> 新增配件
            </button>
          </div>

          <div className="col-span-12">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {formData.customAccessories?.map((acc) => (
                <div key={acc.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div className="form-group" style={{ flex: 3 }}>
                    <label className="form-label">配件名稱</label>
                    <input type="text" className="form-control" value={acc.name} onChange={(e) => updateAccessory(acc.id, 'name', e.target.value)} placeholder="例如：車牌框、卡鉗改色" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">價格 ($)</label>
                    <input type="number" className="form-control" value={acc.price || ''} onChange={(e) => updateAccessory(acc.id, 'price', Number(e.target.value))} placeholder="0" />
                  </div>
                  <button type="button" onClick={() => removeAccessory(acc.id)} style={{ padding: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* ── 贈送項目 ── */}
          <h3 className="section-title col-span-12" style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginTop: '20px', color: '#f59e0b' }}>
            <Gift size={18} /> 贈送清單 (不計費)
          </h3>
          <div className="col-span-12">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '14px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
              {GIFT_OPTIONS.map(gift => {
                const selected = (formData.giftItems || []).includes(gift);
                return (
                  <button
                    key={gift}
                    type="button"
                    onClick={() => toggleGift(gift)}
                    style={{ padding: '5px 12px', borderRadius: '20px', border: `1.5px solid ${selected ? '#f59e0b' : '#e2e8f0'}`, background: selected ? '#fef3c7' : '#fff', color: selected ? '#92400e' : '#64748b', fontSize: '0.8rem', fontWeight: selected ? '700' : '500', cursor: 'pointer', transition: 'all 0.15s' }}
                  >
                    {selected ? '✓ ' : ''}{gift}
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── 價格總結區間 ── */}
          <div className="col-span-12" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '20px' }}>
            <div style={{ display: 'flex', alignItems: 'center', marginBottom: '16px', gap: '16px' }}>
              <label className="form-label" style={{ margin: 0, width: '120px' }}>套用優惠方案</label>
              <select className="form-control" value={discountType} onChange={(e) => setDiscountType(e.target.value as any)}>
                <option value="none">無優惠</option>
                <option value="birthday">生日優惠 (全車滿額 95折)</option>
                <option value="youtube">知名車評 YT 帶入 (現折 3000)</option>
              </select>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px dashed #cbd5e1', paddingTop: '16px' }}>
              <div>
                <div style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '4px' }}>小計: ${subtotal.toLocaleString()}</div>
                {discountAmount > 0 && <div style={{ color: '#ef4444', fontSize: '0.9rem', marginBottom: '4px' }}>折抵: -${discountAmount.toLocaleString()}</div>}
                <div style={{ color: '#10b981', fontSize: '0.8rem', fontWeight: 'bold' }}>預估淨利: ${profit.toLocaleString()}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ color: '#64748b', fontSize: '0.9rem', fontWeight: 'bold' }}>總報價金額</div>
                <div style={{ fontSize: '2rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-1px' }}>
                  ${totalPrice.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <div className="form-group col-span-12">
        <label className="form-label">其他備註事項</label>
        <textarea name="notes" className="form-control" rows={3} value={formData.notes || ''} onChange={handleChange}></textarea>
      </div>

      {/* ── 底部操作按鈕 ── */}
      <div className="col-span-12 form-actions" style={{ position: 'sticky', bottom: '-10px', padding: '16px 0', background: 'rgba(255,255,255,0.95)', borderTop: '1px solid #e2e8f0', marginTop: '16px', display: 'flex', gap: '12px' }}>
        <button type="button" className="btn btn-outline" onClick={onCancel} style={{ padding: '10px 24px' }}>取消</button>
        <div style={{ flex: 1 }}></div>
        
        {formData.status === 'new' ? (
          <>
            <button type="button" className="btn" onClick={handleSave} style={{ background: '#3b82f6', color: '#fff', fontSize: '0.95rem', fontWeight: 'bold', padding: '10px 24px' }}>儲存諮詢內容</button>
            <button type="button" className="btn" onClick={handleConvert} style={{ background: '#f59e0b', color: '#fff', fontSize: '0.95rem', fontWeight: 'bold', padding: '10px 24px' }}>
              轉為正式下定 →
            </button>
          </>
        ) : (
          <button type="button" className="btn" onClick={handleSave} style={{ background: '#3b82f6', color: '#fff', fontSize: '0.95rem', fontWeight: 'bold', padding: '10px 24px' }}>儲存表單 (保持排程)</button>
        )}

        {formData.status !== 'new' && customer && (
          <button type="button" className="btn" onClick={handleMoveToConstruction} style={{ background: '#10b981', color: '#fff', fontSize: '0.95rem', fontWeight: 'bold', padding: '10px 24px' }}>確認並轉入現場施工 →</button>
        )}
      </div>

    </form>
  );
};
