import React, { useState, useEffect } from 'react';
import type { Customer, Accessory, Role, CategorizedPhoto } from '../types';
import { 
  Save, Trash2, Car, User, DollarSign, Shield, Calendar, RotateCcw, 
  Camera, Image as ImageIcon, X, Plus, ChevronRight, FileText, AlertTriangle, CheckCircle, Settings, Package, Gift
} from 'lucide-react';
import { api } from '../lib/api';
import { getYouTubeEmbedUrl } from '../lib/utils';

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
    giftItems: customer.giftItems || [],
    damagePhotos: customer.damagePhotos || [],
    progressPhotos: customer.progressPhotos || [],
    preConstructionPhotos: customer.preConstructionPhotos || []
  });

  const [activeTab, setActiveTab] = useState<'info' | 'photos'>('info');
  const [selectedPart, setSelectedPart] = useState<string>('前保桿');
  const [isUploading, setIsUploading] = useState(false);

  const [tintCategory, setTintCategory] = useState<string>(() => {
    const currentSpec = formData.windowTintBrand || '';
    const found = Object.entries(TINT_GROUPS).find(([_, specs]) => specs.includes(currentSpec));
    return found ? found[0] : '';
  });

  const CAR_PARTS = ['前保桿', '引擎蓋', '車頂', '左前葉', '右前葉', '左前門', '右前門', '左後門', '右後門', '左後葉', '右後葉', '尾箱上', '尾箱下', '後保桿', '鋼琴烤漆', '其他'];

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'damage' | 'progress' | 'pre') => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const filesArray = Array.from(e.target.files);
    try {
      const uploadPromises = filesArray.map(async (file) => {
        const timestamp = Date.now();
        const path = `${formData.id}/${type}/${timestamp}_${file.name}`;
        const url = await api.uploadPhoto(file, path);
        return type === 'pre' ? url : { category: selectedPart, url };
      });
      const results = await Promise.all(uploadPromises);
      if (type === 'damage') setFormData(prev => ({ ...prev, damagePhotos: [...(prev.damagePhotos || []), ...results as CategorizedPhoto[]] }));
      else if (type === 'progress') setFormData(prev => ({ ...prev, progressPhotos: [...(prev.progressPhotos || []), ...results as CategorizedPhoto[]] }));
      else setFormData(prev => ({ ...prev, preConstructionPhotos: [...(prev.preConstructionPhotos || []), ...results as string[]] }));
    } catch (err) {
      alert('上傳失敗');
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (url: string, type: 'damage' | 'progress' | 'pre') => {
    if (type === 'damage') setFormData(prev => ({ ...prev, damagePhotos: prev.damagePhotos?.filter(p => p.url !== url) }));
    else if (type === 'progress') setFormData(prev => ({ ...prev, progressPhotos: prev.progressPhotos?.filter(p => p.url !== url) }));
    else setFormData(prev => ({ ...prev, preConstructionPhotos: prev.preConstructionPhotos?.filter(p => p !== url) }));
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <div className="form-container" style={{ display: 'flex', flexDirection: 'column', maxHeight: '85vh', overflowY: 'auto' }}>
      {/* Tab Header */}
      <div style={{ display: 'flex', gap: '8px', padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => setActiveTab('info')} className={`btn ${activeTab === 'info' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, borderRadius: '12px' }}>
          <FileText size={18} /> 基本與配件明細
        </button>
        <button onClick={() => setActiveTab('photos')} className={`btn ${activeTab === 'photos' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, borderRadius: '12px' }}>
          <ImageIcon size={18} /> 照片管理 ({ (formData.damagePhotos?.length || 0) + (formData.progressPhotos?.length || 0) })
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ padding: '4px' }}>
        {activeTab === 'info' ? (
          <>
            {/* SECTION 1: BASIC INFO */}
            <div className="form-section indigo">
              <div className="section-header"><h3 className="section-title"><User size={18} /> 客戶與車輛資料</h3></div>
              <div className="form-grid">
                <div className="form-group col-span-3"><label className="form-label">編號</label><input type="text" className="form-control" value={formData.id} readOnly style={{ background: '#f8fafc' }} /></div>
                <div className="form-group col-span-3"><label className="form-label">姓名</label><input type="text" name="name" className="form-control" value={formData.name || ''} onChange={handleChange} /></div>
                <div className="form-group col-span-3"><label className="form-label">電話</label><input type="text" name="phone" className="form-control" value={formData.phone || ''} onChange={handleChange} /></div>
                <div className="form-group col-span-3"><label className="form-label">車牌</label><input type="text" name="plateNumber" className="form-control" value={formData.plateNumber || ''} onChange={handleChange} /></div>
                <div className="form-group col-span-6"><label className="form-label">品牌/車型</label><div style={{ padding: '10px', background: '#f1f5f9', borderRadius: '8px' }}>{formData.brand} {formData.model}</div></div>
                <div className="form-group col-span-6"><label className="form-label">地址</label><input type="text" name="address" className="form-control" value={formData.address || ''} onChange={handleChange} /></div>
              </div>
            </div>

            {/* SECTION 2: DATES */}
            <div className="form-section blue">
              <div className="section-header"><h3 className="section-title blue"><Calendar size={18} /> 關鍵日期紀錄</h3></div>
              <div className="form-grid">
                <div className="form-group col-span-3"><label className="form-label">進場日期</label><input type="date" name="expectedStartDate" className="form-control" value={formData.expectedStartDate || ''} onChange={handleChange} /></div>
                <div className="form-group col-span-3"><label className="form-label">完工交車</label><input type="date" name="deliveryDate" className="form-control" value={formData.deliveryDate || ''} onChange={handleChange} style={{ color: '#ec4899', fontWeight: 'bold' }} /></div>
                <div className="form-group col-span-3"><label className="form-label">健檢回廠</label><input type="date" name="checkupDate" className="form-control" value={formData.checkupDate || ''} onChange={handleChange} style={{ color: '#3b82f6', fontWeight: 'bold' }} /></div>
              </div>
            </div>

            {/* SECTION 3: SERVICES */}
            <div className="form-section purple">
              <div className="section-header"><h3 className="section-title purple"><Shield size={18} /> 施工項目與配件</h3></div>
              <div className="form-grid">
                <div className="form-group col-span-4"><label className="form-label">主施工</label><input type="text" name="mainService" className="form-control" value={formData.mainService || ''} onChange={handleChange} /></div>
                <div className="form-group col-span-4"><label className="form-label">品牌</label><input type="text" name="mainServiceBrand" className="form-control" value={formData.mainServiceBrand || ''} onChange={handleChange} /></div>
                <div className="form-group col-span-4"><label className="form-label">顏色</label><input type="text" name="filmColor" className="form-control" value={formData.filmColor || ''} onChange={handleChange} /></div>
                
                <div className="form-group col-span-6">
                   <label className="form-label">客製配件</label>
                   <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                     {formData.customAccessories?.map(acc => (
                       <div key={acc.id} style={{ display: 'flex', gap: '8px', background: '#fff', padding: '8px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                         <input type="text" className="form-control" style={{ flex: 1 }} value={acc.name} onChange={(e) => updateAccessory(acc.id, 'name', e.target.value)} />
                         <input type="number" className="form-control" style={{ width: '100px' }} value={acc.price || ''} onChange={(e) => updateAccessory(acc.id, 'price', Number(e.target.value))} />
                         <button type="button" onClick={() => removeAccessory(acc.id)} style={{ color: '#ef4444' }}><Trash2 size={16} /></button>
                       </div>
                     ))}
                     <button type="button" className="btn btn-outline" onClick={addAccessory}>+ 新增配件</button>
                   </div>
                </div>
                <div className="form-group col-span-6">
                   <label className="form-label">贈送清單</label>
                   <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '12px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
                     {GIFT_OPTIONS.map(gift => {
                       const selected = (formData.giftItems || []).includes(gift);
                       return <button key={gift} type="button" onClick={() => {
                         const current = formData.giftItems || [];
                         const next = current.includes(gift) ? current.filter(g => g !== gift) : [...current, gift];
                         setFormData(prev => ({ ...prev, giftItems: next }));
                       }} className={`btn ${selected ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '4px 8px', fontSize: '0.7rem', borderRadius: '20px', background: selected ? '#f59e0b' : '#fff' }}>{gift}</button>
                     })}
                   </div>
                </div>
              </div>
            </div>

            {/* SECTION 4: FINANCE */}
            <div className="form-section green" style={{ background: '#f0fdf4' }}>
              <div className="section-header"><h3 className="section-title" style={{ color: '#059669' }}><DollarSign size={18} /> 最終財務核算</h3></div>
              <div className="form-grid">
                <div className="form-group col-span-3"><label className="form-label">總成交額</label><input type="number" name="totalAmount" className="form-control" value={formData.totalAmount || ''} onChange={handleChange} style={{ fontSize: '1.2rem', fontWeight: 'bold', color: '#15803d' }} /></div>
                <div className="form-group col-span-3"><label className="form-label">材料工本</label><input type="number" name="cost" className="form-control" value={formData.cost || ''} onChange={handleChange} /></div>
                <div className="form-group col-span-3"><label className="form-label">最終利潤</label><div style={{ padding: '10px', background: '#fff', borderRadius: '8px', fontSize: '1.2rem', fontWeight: 'bold', color: '#059669' }}>${((formData.totalAmount || 0) - (formData.cost || 0)).toLocaleString()}</div></div>
                <div className="form-group col-span-3"><label className="form-label">POS編號</label><input type="text" name="posId" className="form-control" value={formData.posId || ''} onChange={handleChange} /></div>
              </div>
            </div>

            {/* SECTION 5: NOTES */}
            <div className="form-section pink">
              <div className="section-header"><h3 className="section-title pink"><AlertTriangle size={18} /> 完工待辦與備註</h3></div>
              <div className="form-grid">
                <div className="form-group col-span-12"><label className="form-label" style={{ color: '#ef4444' }}>結案待辦 (如：補貼、配件未裝)</label><textarea name="pendingItems" className="form-control" rows={2} value={formData.pendingItems || ''} onChange={handleChange} /></div>
                <div className="form-group col-span-12"><label className="form-label">完整紀錄</label><textarea name="notes" className="form-control" rows={4} value={formData.notes || ''} onChange={handleChange} /></div>
              </div>
            </div>
          </>
        ) : (
          <div style={{ padding: '16px' }}>
            <div className="form-section blue">
              <div className="section-header"><h3 className="section-title blue"><ImageIcon size={18} /> 照片管理 - 選擇部位: {selectedPart}</h3></div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '20px' }}>
                {CAR_PARTS.map(part => (
                  <button key={part} type="button" onClick={() => setSelectedPart(part)} className={`btn ${selectedPart === part ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '4px 12px', fontSize: '0.75rem', borderRadius: '20px' }}>{part}</button>
                ))}
              </div>
              
              <div className="form-grid">
                <div className="col-span-6">
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>施工前/受損照</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                    {formData.damagePhotos?.map(p => (
                      <div key={p.url} style={{ position: 'relative', aspectRatio: '1' }}>
                        <img src={p.url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                        <button type="button" onClick={() => removePhoto(p.url, 'damage')} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20 }}>×</button>
                      </div>
                    ))}
                    <label style={{ aspectRatio: '1', border: '2px dashed #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Plus size={24} color="#94a3b8" />
                      <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'damage')} />
                    </label>
                  </div>
                </div>
                <div className="col-span-6">
                  <h4 style={{ fontSize: '0.9rem', marginBottom: '10px' }}>施工進度/完工照</h4>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '10px' }}>
                    {formData.progressPhotos?.map(p => (
                      <div key={p.url} style={{ position: 'relative', aspectRatio: '1' }}>
                        <img src={p.url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                        <button type="button" onClick={() => removePhoto(p.url, 'progress')} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 20, height: 20 }}>×</button>
                      </div>
                    ))}
                    <label style={{ aspectRatio: '1', border: '2px dashed #cbd5e1', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                      <Plus size={24} color="#94a3b8" />
                      <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'progress')} />
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="form-actions" style={{ position: 'sticky', bottom: 0, background: '#fff', padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', zIndex: 10 }}>
          <button type="button" className="btn btn-outline" onClick={onCancel}>取消</button>
          <button type="button" className="btn" onClick={() => { if (window.confirm('確定要退回施工中嗎？')) onSubmit({ ...formData, status: 'construction' }); }} style={{ background: '#f59e0b', color: '#fff' }}>退回施工中</button>
          <div style={{ flex: 1 }}></div>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 40px' }}><Save size={18} /> 完整存檔</button>
        </div>
      </form>
    </div>
  );
};
