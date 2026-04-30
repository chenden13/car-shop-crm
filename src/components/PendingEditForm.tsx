import React, { useState, useEffect } from 'react';
import type { Customer, Accessory, StatusType, CategorizedPhoto } from '../types';
import { 
  Plus, Trash2, Calendar, FileText, Settings, Gift, Package, 
  CalendarCheck, User, Star, ChevronDown, ChevronUp, Clock,
  Camera, Car, Loader2, AlertCircle, Video, Upload, Shield, CheckCircle,
  MessageSquare, UserCheck, Activity, Info, Tag, Briefcase, Save
} from 'lucide-react';
import { VehicleAutocomplete } from './VehicleAutocomplete';
import { taiwanCounties } from '../data/counties';
import { api } from '../lib/api';
import { getYouTubeEmbedUrl } from '../lib/utils';
import { authenticateYouTube, uploadVideoToYouTube } from '../lib/youtube';

const TINT_PRICE_TABLE: Record<string, { m3: number; m3_sunroof: number; my: number; my_sunroof: number }> = {
  "極黑": { m3: 26500, m3_sunroof: 29500, my: 24500, my_sunroof: 32500 },
  "極透": { m3: 32500, m3_sunroof: 36500, my: 30500, my_sunroof: 40500 },
  "方案1: 前(透)後(黑)": { m3: 30500, m3_sunroof: 33500, my: 28500, my_sunroof: 36500 },
  "方案2: 前、天(透) 身(黑)": { m3: 30500, m3_sunroof: 34500, my: 28500, my_sunroof: 38500 },
  "XC MAX": { m3: 28500, m3_sunroof: 36500, my: 26500, my_sunroof: 34500 },
  "Smart": { m3: 34500, m3_sunroof: 42500, my: 32500, my_sunroof: 40500 },
  "方案3: 前(Smart)身、天(XC)": { m3: 32500, m3_sunroof: 40500, my: 28500, my_sunroof: 36500 },
  "Vega": { m3: 22500, m3_sunroof: 25500, my: 20500, my_sunroof: 26500 },
  "T4": { m3: 26500, m3_sunroof: 30500, my: 24500, my_sunroof: 31500 },
  "方案4: 前(T4)身、天(Vega)": { m3: 24500, m3_sunroof: 27500, my: 22500, my_sunroof: 28500 },
  "方案5: 前、天(T4) 身(Vega)": { m3: 24500, m3_sunroof: 28500, my: 22500, my_sunroof: 29500 },
  "FSK 冰鑽 KT": { m3: 37500, m3_sunroof: 42500, my: 28500, my_sunroof: 40500 },
  "舒熱佳 XE": { m3: 37500, m3_sunroof: 42500, my: 28500, my_sunroof: 40500 },
  "量子膜 ZX": { m3: 35500, m3_sunroof: 42500, my: 28500, my_sunroof: 40500 },
  "皇家 Supreme": { m3: 27500, m3_sunroof: 32500, my: 22500, my_sunroof: 32500 },
  "Xpel-X2 Plus": { m3: 30500, m3_sunroof: 35500, my: 26500, my_sunroof: 37500 },
};

const TINT_GROUPS: Record<string, string[]> = {
  "3M": ["極黑", "極透", "方案1: 前(透)後(黑)", "方案2: 前、天(透) 身(黑)"],
  "桑馬克": ["XC MAX", "Smart", "方案3: 前(Smart)身、天(XC)"],
  "T4 / Vega": ["Vega", "T4", "方案4: 前(T4)身、天(Vega)", "方案5: 前、天(T4) 身(Vega)"],
  "FSK": ["FSK 冰鑽 KT"],
  "舒熱佳": ["舒熱佳 XE"],
  "量子膜": ["量子膜 ZX"],
  "皇家": ["皇家 Supreme"],
  "Xpel": ["Xpel-X2 Plus"]
};

const GIFT_OPTIONS = [
  '大燈', '日行燈', 'ABC柱', '握把',
  '前踏板', '後踏板', '充電蓋',
  '尾燈(三項)', '玻璃鍍膜(三項)', '彩繪(視範圍)',
  '浮雕(視範圍)', '鋼琴烤漆(視範圍)'
];

const PROMOTIONS = [
  { id: 'none', label: '無優惠', type: 'none', val: 0 },
  { id: '520-1', label: '520活動-1 (98折)', type: 'discount', val: 0.98 },
  { id: '520-2', label: '520活動-2 (95折)', type: 'discount', val: 0.95 },
  { id: '520-3', label: '520活動-3 (9折)', type: 'discount', val: 0.90 },
  { id: '0520', label: '0520限定 (85折)', type: 'discount', val: 0.85 },
  { id: 'front-wind', label: '迎風面方案 (贈玻璃/迎風鍍膜)', type: 'none', val: 0, note: '贈送迎風面鍍膜 玻璃鍍膜' },
  { id: '3m', label: '3M限定 (-3000)', type: 'minus', val: 3000 },
  { id: 'sx-rhino', label: 'S/X限定 犀牛皮 (-10000)', type: 'minus', val: 10000 },
  { id: 'group-4+', label: '團購-4人以上 (9折)', type: 'discount', val: 0.90 },
  { id: 'other', label: '其他 (手動輸入)', type: 'custom', val: 0 },
];

const CAR_PARTS = ['前保桿', '引擎蓋', '車頂', '左前葉', '右前葉', '左前門', '右前門', '左後門', '右後門', '左後葉', '右後葉', '尾箱上', '尾箱下', '後保桿', '鋼琴烤漆', '其他'];

interface PendingEditFormProps {
  customer?: Customer; 
  onSuggestId?: string;
  vehicleMaster?: any[];
  onSubmit: (updatedCustomer: Customer, moveToConstruction: boolean) => void;
  onCancel: () => void;
}

export const PendingEditForm: React.FC<PendingEditFormProps> = ({ 
  customer, onSuggestId, vehicleMaster = [], onSubmit, onCancel 
}) => {
  const [formData, setFormData] = useState<Partial<Customer>>(() => {
    if (customer) return { ...customer, customAccessories: customer.customAccessories || [], preConstructionPhotos: customer.preConstructionPhotos || [] };
    return { id: onSuggestId, status: 'scheduled', customAccessories: [], preConstructionPhotos: [] };
  });
  
  const [showConsultation, setShowConsultation] = useState(formData.status !== 'new');
  const [selectedPart, setSelectedPart] = useState<string>('前保桿');
  const [isUploading, setIsUploading] = useState(false);
  const [tintCategory, setTintCategory] = useState<string>(() => {
    const currentSpec = customer?.windowTintBrand || '';
    const found = Object.entries(TINT_GROUPS).find(([_, specs]) => specs.includes(currentSpec));
    return found ? found[0] : '';
  });

  const [prices, setPrices] = useState({
    mainServicePrice: customer?.mainServicePrice || 0,
    windowTintPrice: customer?.windowTintPrice || 0,
    digitalMirrorPrice: customer?.digitalMirrorPrice || 0,
    electricModPrice: customer?.electricModPrice || 0,
    cost: customer?.cost || 0,
    manualTotalPrice: customer?.totalAmount || 0,
    useManualTotal: false
  });

  const [discountTypes, setDiscountTypes] = useState<string[]>(() => {
     if (!customer?.appliedDiscountName) return [];
     return customer.appliedDiscountName.split(', ').map(name => {
       const matched = PROMOTIONS.find(p => p.label === name);
       return matched ? matched.id : 'other';
     }).filter(id => id !== 'other');
  });

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

  const handlePreConstructionUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const filesArray = Array.from(e.target.files);
    try {
      const uploadPromises = filesArray.map(async (file) => {
        const path = `${formData.id}/preconstruction/${Date.now()}_${file.name}`;
        return await api.uploadPhoto(file, path);
      });
      const uploadedUrls = await Promise.all(uploadPromises);
      setFormData(prev => ({ ...prev, preConstructionPhotos: [...(prev.preConstructionPhotos || []), ...uploadedUrls] }));
    } catch (err) {
      alert('上傳失敗');
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (url: string) => {
    setFormData(prev => ({ ...prev, preConstructionPhotos: prev.preConstructionPhotos?.filter(p => p !== url) }));
  };

  const addAccessory = () => {
    const newAcc: Accessory = { id: `acc_${Date.now()}`, name: '', price: 0 };
    setFormData(prev => ({ ...prev, customAccessories: [...(prev.customAccessories || []), newAcc] }));
  };

  const updateAccessory = (id: string, field: 'name' | 'price', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      customAccessories: prev.customAccessories?.map(acc => acc.id === id ? { ...acc, [field]: value } : acc)
    }));
  };

  // 價格計算
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
      cost: prices.cost
    }, false);
  };

  return (
    <div className="form-container" style={{ display: 'flex', flexDirection: 'column', maxHeight: '85vh', overflowY: 'auto' }}>
      <form onSubmit={handleSave} style={{ padding: '4px' }}>
        
        {/* SECTION 1: BASIC INFO */}
        <div className="form-section indigo">
          <div className="section-header"><h3 className="section-title"><User size={18} /> 客戶與車輛基本資料</h3></div>
          <div className="form-grid">
            <div className="form-group col-span-3"><label className="form-label">編號</label><input type="text" className="form-control" value={formData.id} readOnly style={{ background: '#f8fafc' }} /></div>
            <div className="form-group col-span-3"><label className="form-label">姓名*</label><input required type="text" name="name" className="form-control" value={formData.name || ''} onChange={handleChange} /></div>
            <div className="form-group col-span-3"><label className="form-label">電話*</label><input required type="tel" name="phone" className="form-control" value={formData.phone || ''} onChange={handleChange} /></div>
            <div className="form-group col-span-3"><label className="form-label">生日</label><input type="date" name="birthday" className="form-control" value={formData.birthday || ''} onChange={handleChange} /></div>
            
            <div className="form-group col-span-4"><label className="form-label">車牌號碼*</label><input required type="text" name="plateNumber" className="form-control" value={formData.plateNumber || ''} onChange={handleChange} /></div>
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
        <div className="form-section blue">
          <div className="section-header"><h3 className="section-title blue"><Car size={18} /> 施工項目與報價</h3></div>
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
            <div className="form-group col-span-2"><label className="form-label">金額</label><input type="number" name="mainServicePrice" className="form-control" value={prices.mainServicePrice || ''} onChange={handlePriceChange} /></div>
            
            <div className="form-group col-span-4"><label className="form-label">隔熱紙規格</label><input type="text" name="windowTintBrand" className="form-control" value={formData.windowTintBrand || ''} onChange={handleChange} /></div>
            <div className="form-group col-span-4"><label className="form-label">隔熱紙部位</label><input type="text" name="windowTint" className="form-control" value={formData.windowTint || ''} onChange={handleChange} /></div>
            <div className="form-group col-span-4"><label className="form-label">隔熱紙金額</label><input type="number" name="windowTintPrice" className="form-control" value={prices.windowTintPrice || ''} onChange={handlePriceChange} /></div>

            <div className="form-group col-span-4"><label className="form-label">電子後視鏡</label><input type="text" name="digitalMirror" className="form-control" value={formData.digitalMirror || ''} onChange={handleChange} /></div>
            <div className="form-group col-span-2"><label className="form-label">金額</label><input type="number" name="digitalMirrorPrice" className="form-control" value={prices.digitalMirrorPrice || ''} onChange={handlePriceChange} /></div>
            <div className="form-group col-span-4"><label className="form-label">電動改裝項目</label><input type="text" name="electricMod" className="form-control" value={formData.electricMod || ''} onChange={handleChange} /></div>
            <div className="form-group col-span-2"><label className="form-label">金額</label><input type="number" name="electricModPrice" className="form-control" value={prices.electricModPrice || ''} onChange={handlePriceChange} /></div>
          </div>
        </div>

        {/* SECTION 3: CUSTOM ACCESSORIES */}
        <div className="form-section orange">
          <div className="section-header">
            <h3 className="section-title"><Plus size={18} /> 客製配件與贈品</h3>
            <button type="button" className="btn btn-outline" onClick={addAccessory}>+ 新增配件</button>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' }}>
            {formData.customAccessories?.map(acc => (
              <div key={acc.id} style={{ display: 'flex', gap: '10px' }}>
                <input type="text" className="form-control" style={{ flex: 3 }} value={acc.name} onChange={(e) => updateAccessory(acc.id, 'name', e.target.value)} placeholder="配件名稱" />
                <input type="number" className="form-control" style={{ flex: 1 }} value={acc.price || ''} onChange={(e) => updateAccessory(acc.id, 'price', Number(e.target.value))} placeholder="金額" />
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, customAccessories: prev.customAccessories?.filter(a => a.id !== acc.id) }))} style={{ color: '#ef4444' }}><Trash2 size={18} /></button>
              </div>
            ))}
          </div>
          <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '12px', border: '1px solid #fde68a' }}>
            <label className="form-label" style={{ color: '#92400e' }}><Gift size={16} /> 贈送清單 (點擊切換)</label>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {GIFT_OPTIONS.map(gift => {
                const selected = (formData.giftItems || []).includes(gift);
                return <button key={gift} type="button" onClick={() => {
                  const current = formData.giftItems || [];
                  const next = current.includes(gift) ? current.filter(g => g !== gift) : [...current, gift];
                  setFormData(prev => ({ ...prev, giftItems: next }));
                }} className={`btn ${selected ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '20px', background: selected ? '#f59e0b' : '#fff', borderColor: selected ? '#f59e0b' : '#e2e8f0' }}>{gift}</button>
              })}
            </div>
          </div>
        </div>

        {/* SECTION 4: CHARACTERISTICS & CONSULTATION DETAILS (CRITICAL FIX FOR USER) */}
        <div className="form-section pink">
          <div className="section-header"><h3 className="section-title pink"><MessageSquare size={18} /> 諮詢細節與客戶特徵紀錄</h3></div>
          <div className="form-grid">
            <div className="form-group col-span-3">
              <label className="form-label"><Activity size={14} /> 得知管道</label>
              <input type="text" name="fromChannel" className="form-control" value={formData.fromChannel || ''} onChange={handleChange} placeholder="如：FB、介紹..." />
            </div>
            <div className="form-group col-span-3">
              <label className="form-label"><UserCheck size={14} /> 性格屬性</label>
              <select name="traits" className="form-control" value={formData.traits || ''} onChange={handleChange}>
                <option value="">未記錄</option>
                <option value="detail_oriented">在意細節</option>
                <option value="price_sensitive">價格敏感</option>
                <option value="easy_going">好相處</option>
                <option value="professional">專業/挑剔</option>
              </select>
            </div>
            <div className="form-group col-span-3">
              <label className="form-label"><MessageSquare size={14} /> 溝通習性</label>
              <input type="text" name="communication" className="form-control" value={formData.communication || ''} onChange={handleChange} placeholder="如：喜歡傳訊息、電話聯繫..." />
            </div>
            <div className="form-group col-span-3">
              <label className="form-label"><Clock size={14} /> 詢問工時 (天/時)</label>
              <input type="text" name="workHours" className="form-control" value={formData.workHours || ''} onChange={handleChange} placeholder="客戶詢問的預計工時" />
            </div>
            
            <div className="form-group col-span-6">
              <label className="form-label"><Tag size={14} /> 主要特性標籤 (以逗號分隔)</label>
              <input type="text" name="tags" className="form-control" value={formData.tags || ''} onChange={handleChange} placeholder="如：回頭客, 很準時, 龜毛..." />
            </div>
            <div className="form-group col-span-6">
              <label className="form-label"><Briefcase size={14} /> 職業或背景筆記</label>
              <input type="text" name="background" className="form-control" value={formData.background || ''} onChange={handleChange} placeholder="如：科技業、醫生、改裝車友..." />
            </div>

            <div className="form-group col-span-12">
              <label className="form-label"><AlertCircle size={14} /> 施工細節特別要求 / 折點位置說明</label>
              <textarea name="specialRequests" className="form-control" rows={3} value={formData.specialRequests || ''} onChange={handleChange} placeholder="詳述施工要點、收邊方式、摺點位置特別要求..." />
            </div>
            <div className="form-group col-span-12">
              <label className="form-label"><Info size={14} /> 其他備註項目 / 客戶習慣觀察</label>
              <textarea name="habitNotes" className="form-control" rows={3} value={formData.habitNotes || ''} onChange={handleChange} placeholder="例如：車子很乾淨、不喜歡被推銷、對XX品牌有偏好..." />
            </div>
          </div>
        </div>

        {/* SECTION 5: PHOTOS & VIDEO */}
        <div className="form-section purple">
          <div className="section-header"><h3 className="section-title purple"><Camera size={18} /> 施工前影像紀錄 (可選多張)</h3></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {CAR_PARTS.map(part => (
              <button key={part} type="button" onClick={() => setSelectedPart(part)} className={`btn ${selectedPart === part ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '20px' }}>{part}</button>
            ))}
          </div>
          
          <div className="form-grid">
            <div className="form-group col-span-6">
              <div style={{ padding: '24px', border: '2px dashed #e2e8f0', borderRadius: '16px', background: '#f8fafc', textAlign: 'center' }}>
                <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                  <Plus size={24} color="#94a3b8" />
                  <span style={{ fontWeight: 'bold', color: '#64748b' }}>受損/原樣紀錄 ({selectedPart})</span>
                  <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={handlePreConstructionUpload} />
                </label>
              </div>
            </div>
            <div className="form-group col-span-6">
               <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px' }}>
                 {formData.preConstructionPhotos?.map(url => (
                   <div key={url} style={{ position: 'relative', aspectRatio: '1' }}>
                     <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '12px' }} />
                     <button type="button" onClick={() => removePhoto(url)} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20 }}>×</button>
                   </div>
                 ))}
               </div>
            </div>
          </div>
        </div>

        {/* SECTION 6: SCHEDULING */}
        <div className="form-section orange">
          <div className="section-header"><h3 className="section-title orange"><Calendar size={18} /> 排程日期設定</h3></div>
          <div className="form-grid">
            <div className="form-group col-span-4"><label className="form-label">預計留車進場</label><input type="date" name="expectedStartDate" className="form-control" value={formData.expectedStartDate || ''} onChange={handleChange} /></div>
            <div className="form-group col-span-4"><label className="form-label">預計動工日期</label><input type="date" name="constructionStartDate" className="form-control" value={formData.constructionStartDate || ''} onChange={handleChange} /></div>
            <div className="form-group col-span-4"><label className="form-label">預計交車日期</label><input type="date" name="expectedEndDate" className="form-control" value={formData.expectedEndDate || ''} onChange={handleChange} /></div>
          </div>
        </div>

        {/* SECTION 7: FINANCE */}
        <div className="form-section green" style={{ background: '#f0fdf4' }}>
          <div className="section-header"><h3 className="section-title green"><CheckCircle size={18} /> 財務結算與優惠</h3></div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '16px' }}>
            {PROMOTIONS.filter(p => p.id !== 'none').map(p => {
              const selected = discountTypes.includes(p.id);
              return <button key={p.id} type="button" onClick={() => setDiscountTypes(prev => prev.includes(p.id) ? prev.filter(i => i !== p.id) : [...prev, p.id])} className={`btn ${selected ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '6px 12px', fontSize: '0.8rem', borderRadius: '20px', background: selected ? '#10b981' : '#fff', borderColor: selected ? '#10b981' : '#e2e8f0' }}>{p.label}</button>
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
            <div>
              <div style={{ fontSize: '0.9rem', color: '#64748b' }}>小計: ${subtotal.toLocaleString()}</div>
              <div style={{ fontSize: '0.9rem', color: '#ef4444' }}>優惠折扣: -${discountAmount.toLocaleString()}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '900', color: '#166534' }}>${totalPrice.toLocaleString()}</div>
              <div style={{ fontSize: '0.8rem', color: '#64748b' }}>最終成交總額</div>
            </div>
          </div>
        </div>

        {/* ACTIONS */}
        <div className="form-actions" style={{ position: 'sticky', bottom: 0, background: '#fff', padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', zIndex: 10 }}>
          <button type="button" className="btn btn-outline" onClick={onCancel}>取消</button>
          <div style={{ flex: 1 }}></div>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 40px' }}><Save size={18} /> 儲存變更</button>
          {formData.status !== 'construction' && (
            <button type="button" className="btn btn-primary" style={{ background: '#10b981' }} onClick={() => { if (window.confirm('確定要移入施工監控嗎？')) onSubmit({ ...formData as Customer, status: 'construction' }, true); }}>移入施工監控 →</button>
          )}
        </div>
      </form>
    </div>
  );
};
