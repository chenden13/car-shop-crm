import React, { useState, useEffect } from 'react';
import type { Customer, ChecklistItem, CategorizedPhoto, Accessory } from '../types';

import { Camera, Image as ImageIcon, CheckCircle, AlertTriangle, Truck, Settings, User, Car, Clock, Shield, Save, Plus, Trash2, Gift, Package } from 'lucide-react';
import { api } from '../lib/api';
import { getYouTubeEmbedUrl } from '../lib/utils';
import { PendingEditForm } from './PendingEditForm';

const GIFT_OPTIONS = [
  '大燈', '日行燈', 'ABC柱', '握把',
  '前進氣口', '後進氣口', '充電蓋',
  '尾燈(三項)', '玻璃鍍膜(三項)', '彩繪(視範圍)',
  '浮雕(視範圍)', '鋼琴烤漆(視範圍)'
];

interface ConstructionFormProps {
  customer: Customer;
  onSubmit: (updatedCustomer: Customer) => void;
  onCancel: () => void;
  onSaveProgress?: (updatedCustomer: Customer) => void; 
}

export const ConstructionForm: React.FC<ConstructionFormProps> = ({ customer, onSubmit, onCancel, onSaveProgress }) => {
  const [formData, setFormData] = useState<Customer>(customer);
  const [activeTab, setActiveTab] = useState<'progress' | 'editing'>('progress');
  const [damagePhotos, setDamagePhotos] = useState<CategorizedPhoto[]>(customer.damagePhotos || []);
  const [progressPhotos, setProgressPhotos] = useState<CategorizedPhoto[]>(customer.progressPhotos || []);
  const [selectedPart, setSelectedPart] = useState<string>('前保桿');
  const [isUploading, setIsUploading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const CAR_PARTS = ['前保桿', '引擎蓋', '車頂', '左前葉', '右前葉', '左前門', '右前門', '左後門', '右後門', '左後葉', '右後葉', '尾箱上', '尾箱下', '後保桿', '鋼琴烤漆', '其他'];

  useEffect(() => {
    if (!formData.constructionChecklist || formData.constructionChecklist.length === 0) {
      const initialChecklist: ChecklistItem[] = [];
      const addCheck = (name: string) => {
        initialChecklist.push({ id: `c_${Date.now()}_${Math.random()}`, name, checked: false });
      };

      addCheck('前置清潔 (預洗與表面深層清潔)');
      if (formData.mainService) addCheck(`膜料施工: ${formData.mainService}`);
      if (formData.windowTint) addCheck(`隔熱紙施工: ${formData.windowTint}`);
      if (formData.digitalMirror) addCheck(`電子後視鏡安裝: ${formData.digitalMirror}`);
      if (formData.electricMod) addCheck(`電動改裝項目: ${formData.electricMod}`);
      
      if (formData.giftItems && formData.giftItems.length > 0) {
        addCheck(`贈送配件施工: ${formData.giftItems.join(', ')}`);
      }
      
      addCheck('完工自主檢查 (收邊、氣泡、完整度)');
      addCheck('交車前清潔與環境整理');
      
      setFormData(prev => ({ ...prev, constructionChecklist: initialChecklist }));
    }
  }, []);

  const toggleCheck = (id: string) => {
    setFormData(prev => ({
      ...prev,
      constructionChecklist: prev.constructionChecklist?.map(item => 
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    }));
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
        if (type === 'damage') setDamagePhotos(prev => [...prev, ...uploadedPhotos]);
        else setProgressPhotos(prev => [...prev, ...uploadedPhotos]);
      } catch (err) {
        console.error('上傳失敗:', err);
        alert('照片上傳失敗');
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removePhoto = (url: string, type: 'damage' | 'progress') => {
    if (type === 'damage') setDamagePhotos(prev => prev.filter(p => p.url !== url));
    else setProgressPhotos(prev => prev.filter(p => p.url !== url));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const today = new Date().toISOString().split('T')[0];
    const checkup = new Date();
    checkup.setMonth(checkup.getMonth() + 1);
    
    onSubmit({ 
      ...formData, 
      damagePhotos, 
      progressPhotos, 
      status: 'completed',
      deliveryDate: today,
      checkupDate: checkup.toISOString().split('T')[0]
    });
  };

  const handleSaveProgress = () => {
    if (onSaveProgress) {
      onSaveProgress({ ...formData, damagePhotos, progressPhotos });
    } else {
      onSubmit({ ...formData, damagePhotos, progressPhotos });
    }
  };

  return (
    <div className="form-grid" style={{ maxHeight: '85vh', overflowY: 'auto', padding: '4px' }}>
      <div className="col-span-12" style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '12px', marginBottom: '16px' }}>
         <button 
           type="button"
           onClick={() => setActiveTab('progress')}
           style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'progress' ? '#fff' : 'transparent', fontWeight: 'bold', cursor: 'pointer' }}
         >
           施工進度監控
         </button>
         <button 
           type="button"
           onClick={() => setActiveTab('editing')}
           style={{ flex: 1, padding: '10px', borderRadius: '8px', border: 'none', background: activeTab === 'editing' ? '#fff' : 'transparent', fontWeight: 'bold', cursor: 'pointer' }}
         >
           項目與配件調整
         </button>
      </div>

      {activeTab === 'progress' ? (
        <form onSubmit={handleSubmit} className="form-grid col-span-12">
          <div className="col-span-12" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ padding: '10px', background: 'var(--primary)', color: '#fff', borderRadius: '8px' }}>
              <Truck size={24} />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{formData.plateNumber || '尚未掛牌'} - {formData.brand} {formData.model}</h4>
              <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
                項目：<span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{formData.mainService}</span>
                {formData.windowTint && ` | 隔熱紙：${formData.windowTint}`}
                {formData.electricMod && ` | 電改：${formData.electricMod}`}
              </div>
            </div>
          </div>

          <h3 className="section-title"><CheckCircle size={18} /> 施工進度檢核表</h3>
          <div className="col-span-12" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {formData.constructionChecklist?.map(item => (
              <label key={item.id} className="checkbox-wrap" style={{ background: item.checked ? '#f0fdf4' : '#fff', padding: '14px', border: `1px solid ${item.checked ? '#10b981' : '#e2e8f0'}`, borderRadius: '10px' }}>
                <input type="checkbox" checked={item.checked} onChange={() => toggleCheck(item.id)} />
                <span style={{ color: item.checked ? '#166534' : '#1e293b', textDecoration: item.checked ? 'line-through' : 'none' }}>{item.name}</span>
              </label>
            ))}
          </div>

          <div className="col-span-12" style={{ marginTop: '24px' }}>
            <h3 className="section-title" style={{ color: '#0ea5e9' }}>照相記錄 (當前部位: {selectedPart})</h3>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
              {CAR_PARTS.map(part => (
                <button key={part} type="button" onClick={() => setSelectedPart(part)} style={{ padding: '4px 12px', borderRadius: '16px', border: '1px solid', borderColor: selectedPart === part ? 'var(--primary)' : '#cbd5e1', background: selectedPart === part ? 'var(--primary)' : '#fff', color: selectedPart === part ? '#fff' : '#64748b', fontSize: '0.75rem', cursor: 'pointer' }}>{part}</button>
              ))}
            </div>
            
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
              <div>
                <div style={{ padding: '16px', border: '2px dashed #fbbf24', borderRadius: '12px', textAlign: 'center', background: '#fffbeb' }}>
                  <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                    <Camera size={24} /> 上傳受損照
                    <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'damage')} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
              <div>
                <div style={{ padding: '16px', border: '2px dashed #60a5fa', borderRadius: '12px', textAlign: 'center', background: '#eff6ff' }}>
                  <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                    <ImageIcon size={24} /> 上傳完工照
                    <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'progress')} style={{ display: 'none' }} />
                  </label>
                </div>
              </div>
            </div>
          </div>
          {/* 巡車影片觀看 (如果有的話) */}
          {formData.videoUrl && getYouTubeEmbedUrl(formData.videoUrl) && (
            <div className="col-span-12" style={{ marginTop: '16px', padding: '16px', background: '#fef2f2', borderRadius: '12px', border: '1px dashed #fca5a5' }}>
              <h3 className="section-title" style={{ marginTop: 0, color: '#ef4444' }}><Camera size={18} /> 施工前巡車影片 (供技師對照)</h3>
              <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', border: '1px solid #e2e8f0', maxWidth: '100%' }}>
                <iframe 
                  style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
                  src={getYouTubeEmbedUrl(formData.videoUrl)!} 
                  title="YouTube video player" 
                  frameBorder="0" 
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                  allowFullScreen
                ></iframe>
              </div>
            </div>
          )}

          <div className="form-actions col-span-12" style={{ marginTop: '20px' }}>
            <button type="button" className="btn btn-outline" onClick={handleSaveProgress}><Save size={18} /> 儲存目前進度</button>
            <div style={{ flex: 1 }}></div>
            <button type="submit" className="btn btn-primary" style={{ background: '#10b981' }}>完工並結案 (交車)</button>
          </div>
        </form>
      ) : (
        <div className="col-span-12" style={{ marginTop: '16px' }}>
          <PendingEditForm 
            customer={formData}
            onSubmit={(updatedCustomer) => {
              setFormData(updatedCustomer);
              if (onSaveProgress) {
                onSaveProgress(updatedCustomer);
              }
              alert('客戶資料與報價已更新！請接續完成施工項目。');
              setActiveTab('progress');
            }}
            onCancel={() => setActiveTab('progress')}
          />
        </div>
      )}
    </div>
  );
};
