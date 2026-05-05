import React, { useState } from 'react';
import type { Customer, Accessory, Role } from '../types';

import { 
  Save, Trash2, Car, User, DollarSign, Shield, Calendar, RotateCcw, 
  Camera, Image as ImageIcon, X, Plus, ChevronRight, FileText,
  AlertTriangle
} from 'lucide-react';
import { api } from '../lib/api';
import { getYouTubeEmbedUrl } from '../lib/utils';
import type { CategorizedPhoto } from '../types';

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

  const [formData, setFormData] = useState<Customer>(() => {
    // Data Migration: If it's an old record (missing constructionStartDate), 
    // move expectedEndDate to constructionStartDate and deliveryDate to expectedEndDate.
    const hasNewFormat = !!customer.constructionStartDate;
    return {
      ...customer,
      constructionStartDate: customer.constructionStartDate || customer.expectedEndDate || '',
      expectedEndDate: hasNewFormat ? customer.expectedEndDate : (customer.deliveryDate || ''),
      customAccessories: customer.customAccessories || [],
      giftItems: customer.giftItems || []
    };
  });

  const [damagePhotos, setDamagePhotos] = useState<CategorizedPhoto[]>(customer.damagePhotos || []);
  const [progressPhotos, setProgressPhotos] = useState<CategorizedPhoto[]>(customer.progressPhotos || []);
  const [selectedPart, setSelectedPart] = useState<string>('前保桿');
  const [isUploading, setIsUploading] = useState(false);
  const [activeTab, setActiveTab] = useState<'info' | 'photos'>('info');

  const CAR_PARTS = ['前保桿', '引擎蓋', '車頂', '左前葉', '右前葉', '左前門', '右前門', '左後門', '右後門', '左後葉', '右後葉', '尾箱上', '尾箱下', '後保桿', '鋼琴烤漆', '其他'];

  const [tintCategory, setTintCategory] = useState<string>(() => {
    const currentSpec = formData.windowTintBrand || '';
    const found = Object.entries(TINT_GROUPS).find(([_, specs]) => specs.includes(currentSpec));
    return found ? found[0] : '';
  });

  // 自動計算利潤 (僅針對管理員)
  React.useEffect(() => {
    if (userRole === 'admin') {
      const total = Number(formData.totalAmount || 0);
      const cost = Number(formData.cost || 0);
      const profit = total - cost;
      if (formData.revenue !== profit) {
        setFormData(prev => ({ ...prev, revenue: profit }));
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData.totalAmount, formData.cost, userRole]);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'damage' | 'progress') => {
    if (e.target.files && e.target.files.length > 0) {
      setIsUploading(true);
      const filesArray = Array.from(e.target.files);
      
      try {
        const uploadPromises = filesArray.map(async (file) => {
          const timestamp = Date.now();
          const fileName = `${customer.id}_${type}_${selectedPart}_${timestamp}_${file.name}`;
          const path = `${customer.id}/${type}/${fileName}`;
          const url = await api.uploadPhoto(file, path);
          return { category: selectedPart, url };
        });

        const uploadedPhotos = await Promise.all(uploadPromises);

        if (type === 'damage') {
          setDamagePhotos(prev => [...prev, ...uploadedPhotos]);
        } else {
          setProgressPhotos(prev => [...prev, ...uploadedPhotos]);
        }
      } catch (err: any) {
        console.error('上傳失敗:', err);
        alert('照片上傳失敗: ' + (err.message || '請檢查網路連線'));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removePhoto = (url: string, type: 'damage' | 'progress') => {
    if (type === 'damage') {
      setDamagePhotos(prev => prev.filter(p => p.url !== url));
    } else {
      setProgressPhotos(prev => prev.filter(p => p.url !== url));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      damagePhotos,
      progressPhotos
    });
  };

  return (
    <div style={{ padding: '0 10px' }}>
      {/* Tab Switcher */}
      <div style={{ display: 'flex', gap: '8px', marginBottom: '20px', background: '#f1f5f9', padding: '4px', borderRadius: '12px' }}>
        <button 
          type="button"
          onClick={() => setActiveTab('info')}
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'info' ? '#fff' : 'transparent', color: activeTab === 'info' ? '#1e293b' : '#64748b', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'info' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
        >
          <FileText size={16} /> 基本與配件明細
        </button>
        <button 
          type="button"
          onClick={() => setActiveTab('photos')}
          style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'photos' ? '#fff' : 'transparent', color: activeTab === 'photos' ? '#1e293b' : '#64748b', fontWeight: 'bold', fontSize: '0.85rem', cursor: 'pointer', transition: 'all 0.2s', boxShadow: activeTab === 'photos' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none' }}
        >
          <ImageIcon size={16} /> 檔案庫照片管理 ({damagePhotos.length + progressPhotos.length})
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: activeTab === 'info' ? 'grid' : 'none', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
      
      {/* ── 基本資訊 ── */}
      <div className="form-group col-span-12">
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
          <Car size={18} /> 客戶與車輛基本資料
        </h3>
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">客戶編號</label>
        <input type="text" name="id" className="form-control" value={formData.id} onChange={handleChange} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">車主姓名</label>
        <input type="text" name="name" className="form-control" value={formData.name} onChange={handleChange} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">聯絡電話</label>
        <input type="text" name="phone" className="form-control" value={formData.phone} onChange={handleChange} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">車牌號碼</label>
        <input type="text" name="plateNumber" className="form-control" value={formData.plateNumber} onChange={handleChange} />
      </div>
      
      <div className="form-group col-span-3">
        <label className="form-label">汽車品牌</label>
        <input type="text" name="brand" className="form-control" value={formData.brand || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">車種 (Model)</label>
        <input type="text" name="model" className="form-control" value={formData.model || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-6">
        <label className="form-label">通訊地址</label>
        <input type="text" name="address" className="form-control" value={formData.address || ''} onChange={handleChange} />
      </div>

      {/* ── 關鍵日期 ── */}
      <div className="form-group col-span-12">
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
          <Calendar size={18} /> 施工與關鍵日期紀錄
        </h3>
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">施工時間</label>
        <input type="date" name="expectedStartDate" className="form-control" value={formData.expectedStartDate || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">預計施工時間 (範圍)</label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
          <input type="date" name="constructionStartDate" className="form-control" value={formData.constructionStartDate || ''} onChange={handleChange} style={{ fontSize: '0.75rem', padding: '4px' }} />
          <span style={{ fontSize: '0.7rem', color: '#94a3b8' }}>~</span>
          <input type="date" name="constructionEndDate" className="form-control" value={formData.constructionEndDate || ''} onChange={handleChange} style={{ fontSize: '0.75rem', padding: '4px' }} />
        </div>
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">預計交車時間</label>
        <input type="date" name="deliveryDate" className="form-control" value={formData.deliveryDate || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">健檢回廠日期</label>
        <input type="date" name="checkupDate" className="form-control" value={formData.checkupDate || ''} onChange={handleChange} />
      </div>

      {/* ── 施工項目 ── */}
      <div className="form-group col-span-12">
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6366f1' }}>
          <Shield size={18} /> 施工內容與配件
        </h3>
      </div>
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
        <label className="form-label">施工品牌/系列</label>
        <input type="text" name="mainServiceBrand" className="form-control" value={formData.mainServiceBrand || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-4">
        <label className="form-label">膜料顏色 (細項)</label>
        <input type="text" name="filmColor" className="form-control" value={formData.filmColor || ''} onChange={handleChange} />
      </div>
      
      <div className="form-group col-span-3">
        <label className="form-label">隔熱紙品牌/項目</label>
        <select 
          className="form-control" 
          value={tintCategory} 
          onChange={(e) => {
            setTintCategory(e.target.value);
            setFormData(prev => ({ ...prev, windowTintBrand: '' }));
          }}
        >
          <option value="">選擇品項</option>
          {Object.keys(TINT_GROUPS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">具體規格選擇</label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <select name="windowTintBrand" className="form-control" value={formData.windowTintBrand || ''} onChange={handleChange}>
            <option value="">選擇規格</option>
            {(TINT_GROUPS[tintCategory] || []).map(b => <option key={b} value={b}>{b}</option>)}
          </select>
          <label style={{ fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '5px', color: '#0369a1', cursor: 'pointer' }}>
            <input type="checkbox" name="hasSunroof" checked={formData.hasSunroof || false} onChange={handleChange} /> 
            包含天窗施工
          </label>
        </div>
      </div>
      
      <div className="form-group col-span-3">
        <label className="form-label">電子後視鏡</label>
        <input type="text" name="digitalMirror" className="form-control" value={formData.digitalMirror || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">電改項目</label>
        <input type="text" name="electricMod" className="form-control" value={formData.electricMod || ''} onChange={handleChange} />
      </div>

      {/* ── 客製配件 ── */}
      <div className="form-group col-span-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
          <label className="form-label" style={{ margin: 0 }}>客製配件明細</label>
          <button type="button" onClick={addAccessory} className="btn btn-outline" style={{ padding: '2px 8px', fontSize: '0.7rem' }}>+ 新增</button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', padding: '4px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
          {formData.customAccessories?.length === 0 && <p style={{ textAlign: 'center', fontSize: '0.8rem', color: '#94a3b8', margin: '10px 0' }}>尚無客製配件</p>}
          {formData.customAccessories?.map((acc) => (
            <div key={acc.id} style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <input type="text" placeholder="配件名稱" className="form-control" style={{ flex: 3, fontSize: '0.85rem' }} value={acc.name} onChange={(e) => updateAccessory(acc.id, 'name', e.target.value)} />
              <input type="number" placeholder="金額" className="form-control" style={{ flex: 1, fontSize: '0.85rem' }} value={acc.price || ''} onChange={(e) => updateAccessory(acc.id, 'price', Number(e.target.value))} />
              <button type="button" onClick={() => removeAccessory(acc.id)} style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer' }}><Trash2 size={16} /></button>
            </div>
          ))}
        </div>
      </div>

      <div className="form-group col-span-6">
        <label className="form-label">贈送項目實績</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', padding: '10px', background: '#fffbeb', borderRadius: '8px', border: '1px solid #fde68a' }}>
          {GIFT_OPTIONS.map(gift => {
            const selected = (formData.giftItems || []).includes(gift);
            return (
              <button key={gift} type="button" onClick={() => {
                const current = formData.giftItems || [];
                const next = current.includes(gift) ? current.filter(g => g !== gift) : [...current, gift];
                setFormData(prev => ({ ...prev, giftItems: next }));
              }} style={{ padding: '3px 8px', borderRadius: '15px', border: `1px solid ${selected ? '#f59e0b' : '#e2e8f0'}`, background: selected ? '#fef3c7' : '#fff', color: selected ? '#92400e' : '#64748b', fontSize: '0.72rem', cursor: 'pointer' }}>
                {gift}
              </button>
            );
          })}
        </div>
      </div>

      {/* ── 財務資訊 ── */}
      <div className="form-group col-span-12">
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#059669' }}>
          <DollarSign size={18} /> 最終帳務核算
        </h3>
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">總成交報價</label>
        <input type="number" name="totalAmount" className="form-control" style={{ fontWeight: 'bold', color: 'var(--primary)' }} value={formData.totalAmount || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">材料/工本支出</label>
        <input type="number" name="cost" className="form-control" value={formData.cost || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">最終利潤</label>
        <input type="number" name="revenue" className="form-control" style={{ fontWeight: 'bold', color: '#166534' }} value={formData.revenue || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">POS/內部編號</label>
        <input type="text" name="posId" className="form-control" value={formData.posId || ''} onChange={handleChange} />
      </div>

      {/* ── 客戶特徵 (新增) ── */}
      <div className="form-group col-span-12">
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ec4899' }}>
          <User size={18} /> 客戶習性與特徵紀錄
        </h3>
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">告知管道</label>
        <input type="text" name="fromChannel" className="form-control" value={formData.fromChannel || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">職業背景</label>
        <input type="text" name="occupation" className="form-control" value={formData.occupation || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">性格屬性</label>
        <select name="personality" className="form-control" value={formData.personality || ''} onChange={handleChange}>
          <option value="">未記錄</option>
          <option value="introvert">內向</option>
          <option value="extrovert">外向</option>
        </select>
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">經濟預算</label>
        <select name="wealthLevel" className="form-control" value={formData.wealthLevel || ''} onChange={handleChange}>
          <option value="">未記錄</option>
          <option value="high">預算高</option>
          <option value="medium">一般</option>
          <option value="normal">小資</option>
        </select>
      </div>
      
      <div className="form-group col-span-12" style={{ display: 'flex', gap: '15px', padding: '12px', background: '#fdf2f8', borderRadius: '10px' }}>
        <label className="checkbox-wrap"><input type="checkbox" name="detailOriented" checked={!!formData.detailOriented} onChange={handleChange} /> 完美主義</label>
        <label className="checkbox-wrap"><input type="checkbox" name="easyGoing" checked={!!formData.easyGoing} onChange={handleChange} /> 隨和好商量</label>
        <label className="checkbox-wrap"><input type="checkbox" name="likesCalls" checked={!!formData.likesCalls} onChange={handleChange} /> 偏好電話</label>
        <label className="checkbox-wrap"><input type="checkbox" name="wearsGlasses" checked={!!formData.wearsGlasses} onChange={handleChange} /> 戴眼鏡</label>
      </div>

      <div className="form-group col-span-12">
        <label className="form-label" style={{ color: '#ef4444', fontWeight: 'bold' }}>完工結案待辦 (如紅標提醒)</label>
        <textarea name="pendingItems" className="form-control" rows={2} style={{ borderColor: '#fca5a5' }} value={formData.pendingItems || ''} onChange={handleChange}></textarea>
      </div>
      
      <div className="form-group col-span-12">
        <label className="form-label">完整情資紀錄</label>
        <textarea name="notes" className="form-control" rows={3} value={formData.notes || ''} onChange={handleChange}></textarea>
      </div>

      <div className="form-actions col-span-12" style={{ marginTop: '20px', display: 'flex', gap: '15px' }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>取消返回</button>
        
        <button 
          type="button" 
          className="btn" 
          onClick={() => {
            if (window.confirm('確定要將此案件退回「施工中」狀態嗎？')) {
              onSubmit({ ...formData, status: 'construction' });
            }
          }}
          style={{ background: '#f59e0b', color: '#fff', display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 20px' }}
        >
          <RotateCcw size={18} /> 返回施工中
        </button>

        <div style={{ flex: 1 }}></div>

        <button type="submit" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px 30px' }}>
          <Save size={20} /> 完成檔案完整存檔
        </button>
      </div>
      </form>

      {/* ── 照片管理分頁 ── */}
      <div style={{ display: activeTab === 'photos' ? 'block' : 'none' }}>
        <div className="form-group" style={{ marginBottom: '24px' }}>
          <label className="form-label">選擇部位 (用於上傳與歸類)</label>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {CAR_PARTS.map(part => (
              <button key={part} type="button" onClick={() => setSelectedPart(part)} style={{ padding: '6px 12px', borderRadius: '20px', border: `1px solid ${selectedPart === part ? '#3b82f6' : '#e2e8f0'}`, background: selectedPart === part ? '#eff6ff' : '#fff', color: selectedPart === part ? '#1e40af' : '#64748b', fontSize: '0.8rem', fontWeight: selectedPart === part ? 'bold' : 'normal', cursor: 'pointer' }}>
                {part}
              </button>
            ))}
          </div>
        </div>

        {/* 影片連結 */}
        <div style={{ marginBottom: '24px', paddingBottom: '24px', borderBottom: '1px dashed #cbd5e1' }}>
          <h3 className="section-title" style={{ marginTop: 0, color: '#ef4444' }}><Camera size={18} /> 施工前巡車影片</h3>
          <label className="form-label">YouTube 不公開連結</label>
          <input 
            type="text" 
            name="videoUrl" 
            className="form-control" 
            placeholder="貼上 YouTube 影片網址 (例如: https://youtu.be/...)" 
            value={formData.videoUrl || ''} 
            onChange={handleChange}
            style={{ marginBottom: '12px' }}
          />
          {getYouTubeEmbedUrl(formData.videoUrl) && (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', border: '1px solid #e2e8f0', maxWidth: '600px' }}>
              <iframe 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
                src={getYouTubeEmbedUrl(formData.videoUrl)!} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          <div>
            <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><AlertTriangle size={16} /> 車損照片</h4>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
              <label 
                style={{ aspectRation: '1/1', border: '2px dashed #cbd5e1', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: isUploading ? 'not-allowed' : 'pointer', background: '#f8fafc', padding: '10px' }}
              >
                <input type="file" multiple accept="image/*" style={{ display: 'none' }} disabled={isUploading} onChange={(e) => handleFileUpload(e, 'damage')} />
                <Plus size={20} color="#64748b" />
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>新增照片</span>
              </label>
              {damagePhotos.map((photo, idx) => (
                <div key={idx} style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
                  <img src={photo.url} alt={photo.category} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '10px', padding: '2px 4px', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>{photo.category}</div>
                  <button type="button" onClick={() => removePhoto(photo.url, 'damage')} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>

          <div>
             <h4 style={{ fontSize: '0.9rem', marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}><ImageIcon size={16} /> 施工紀錄照片</h4>
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))', gap: '10px' }}>
              <label 
                style={{ aspectRation: '1/1', border: '2px dashed #cbd5e1', borderRadius: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', cursor: isUploading ? 'not-allowed' : 'pointer', background: '#f8fafc', padding: '10px' }}
              >
                <input type="file" multiple accept="image/*" style={{ display: 'none' }} disabled={isUploading} onChange={(e) => handleFileUpload(e, 'progress')} />
                <Plus size={20} color="#64748b" />
                <span style={{ fontSize: '0.7rem', color: '#64748b' }}>新增照片</span>
              </label>
              {progressPhotos.map((photo, idx) => (
                <div key={idx} style={{ position: 'relative', width: '100%', aspectRatio: '1/1' }}>
                  <img src={photo.url} alt={photo.category} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '10px', padding: '2px 4px', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>{photo.category}</div>
                  <button type="button" onClick={() => removePhoto(photo.url, 'progress')} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}><X size={12} /></button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '30px', padding: '15px', background: '#f8fafc', borderRadius: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h5 style={{ margin: 0, color: '#1e293b' }}>照片修改完畢？</h5>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>點擊下方按鈕存檔所有變更。</p>
          </div>
          <button type="button" onClick={() => setActiveTab('info')} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            返回詳細內容 <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
