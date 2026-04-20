import React, { useState, useEffect } from 'react';
import type { Customer, ChecklistItem, CategorizedPhoto } from '../types';

import { Camera, Image as ImageIcon, CheckCircle, AlertTriangle, Truck, Loader2 } from 'lucide-react';
import { api } from '../lib/api';


interface ConstructionFormProps {
  customer: Customer;
  onSubmit: (updatedCustomer: Customer) => void;
  onCancel: () => void;
}

export const ConstructionForm: React.FC<ConstructionFormProps> = ({ customer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Customer>(customer);
  const [damagePhotos, setDamagePhotos] = useState<CategorizedPhoto[]>(customer.damagePhotos || []);
  const [progressPhotos, setProgressPhotos] = useState<CategorizedPhoto[]>(customer.progressPhotos || []);
  const [selectedPart, setSelectedPart] = useState<string>('前保桿');
  const [isUploading, setIsUploading] = useState(false);


  const CAR_PARTS = ['前保桿', '引擎蓋', '車頂', '左前葉', '右前葉', '左前門', '右前門', '左後門', '右後門', '左後葉', '右後葉', '尾箱上', '尾箱下', '後保桿', '鋼琴烤漆', '其他'];


  useEffect(() => {
    if (!formData.constructionChecklist || formData.constructionChecklist.length === 0) {
      const initialChecklist: ChecklistItem[] = [];
      const addCheck = (name: string) => {
        initialChecklist.push({ id: `c_${Date.now()}_${Math.random()}`, name, checked: false });
      };

      // 1. 前置清洗
      addCheck('預洗與表面深層清潔 (前置清洗)');

      // 2. 主施工 (通常為車體貼模)
      if (formData.mainService) {
        addCheck(`車體貼模: ${formData.mainService}`);
      }

      // 3. 隔熱紙
      if (formData.windowTint) {
        addCheck(`隔熱紙施工: ${formData.windowTint}`);
      }

      // 4. 電子後視鏡
      if (formData.digitalMirror) {
        addCheck(`電子後視鏡安裝: ${formData.digitalMirror}`);
      }

      // 5. 電改
      if (formData.electricMod) {
        addCheck(`電改項目: ${formData.electricMod}`);
      }

      // 6. 配件
      formData.customAccessories?.forEach(acc => {
        if (acc.name) addCheck(`配件安裝: ${acc.name}`);
      });

      // 7. 贈送項目
      formData.giftItems?.forEach(gift => {
        addCheck(`贈送項目: ${gift}`);
      });
      
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
      } catch (err) {
        console.error('上傳失敗:', err);
        alert('照片上傳至雲端失敗，請檢查 Supabase Store 設定');
      } finally {
        setIsUploading(false);
      }
    }
  };


  const removePhoto = (index: number, type: 'damage' | 'progress') => {
    if (type === 'damage') {
      setDamagePhotos(prev => prev.filter((_, i) => i !== index));
    } else {
      setProgressPhotos(prev => prev.filter((_, i) => i !== index));
    }
  };


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, damagePhotos, progressPhotos, status: 'completed' });
  };


  return (
    <form onSubmit={handleSubmit} className="form-grid">
      {/* Header Info */}
      <div className="col-span-12" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ padding: '10px', background: 'var(--primary)', color: '#fff', borderRadius: '8px' }}>
          <Truck size={24} />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{customer.plateNumber} - {customer.brand} {customer.model}</h4>
          <p style={{ margin: '2px 0', color: '#64748b', fontSize: '0.85rem' }}>
            施工時間：<span style={{ fontWeight: '600' }}>{customer.expectedStartDate} ~ {customer.expectedEndDate}</span>
          </p>
          <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px' }}>
            項目：<span style={{ color: 'var(--primary)', fontWeight: 'bold' }}>{customer.mainService}</span>
            {customer.windowTint && ` | 隔熱紙：${customer.windowTint}`}
            {customer.digitalMirror && ` | 電子後視鏡：${customer.digitalMirror}`}
            {customer.electricMod && ` | 電改：${customer.electricMod}`}
          </div>
          {customer.customAccessories && customer.customAccessories.length > 0 && (
            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>
              配件：{customer.customAccessories.map(acc => acc.name).join(', ')}
            </div>
          )}
        </div>

      </div>

      <h3 className="section-title"><CheckCircle size={18} /> 施工進度檢核表</h3>
      <div className="col-span-12" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        {formData.constructionChecklist?.map(item => (
          <label key={item.id} className={`checkbox-wrap`} style={{ background: item.checked ? '#f0fdf4' : '#fff', padding: '16px', border: `1px solid ${item.checked ? '#10b981' : '#e2e8f0'}`, borderRadius: '10px', transition: 'all 0.2s' }}>
            <input type="checkbox" checked={item.checked} onChange={() => toggleCheck(item.id)} />
            <span style={{ fontSize: '1rem', color: item.checked ? '#166534' : '#1e293b', textDecoration: item.checked ? 'line-through' : 'none', fontWeight: item.checked ? '600' : '500' }}>
              {item.name}
            </span>
          </label>
        ))}
      </div>

      <div className="col-span-12" style={{ marginTop: '24px' }}>
        <h3 className="section-title" style={{ color: '#0ea5e9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span><ImageIcon size={18} /> 照片部位選擇 (當前選擇: <span style={{ color: 'var(--primary)', textDecoration: 'underline' }}>{selectedPart}</span>)</span>
        </h3>
        
        <div style={{ background: '#f1f5f9', borderRadius: '12px', padding: '16px', marginBottom: '16px', textAlign: 'center' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
            {CAR_PARTS.map(part => (
              <button
                key={part}
                type="button"
                onClick={() => setSelectedPart(part)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  border: '1px solid',
                  borderColor: selectedPart === part ? 'var(--primary)' : '#cbd5e1',
                  background: selectedPart === part ? 'var(--primary)' : '#fff',
                  color: selectedPart === part ? '#fff' : '#64748b',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s'
                }}
              >
                {part}
              </button>
            ))}
          </div>
        </div>
      </div>

      <h3 className="section-title" style={{ color: '#f59e0b' }}><AlertTriangle size={18} /> 車體受損照片紀錄 ({selectedPart})</h3>
      <div className="col-span-12">
        <div style={{ padding: '24px', border: '2px dashed #fbbf24', borderRadius: '12px', textAlign: 'center', background: '#fffbeb' }}>
          <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#b45309' }}>
            <Camera size={32} />
            <span style={{ fontWeight: '700' }}>上傳【{selectedPart}】受損照片</span>
            <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'damage')} style={{ display: 'none' }} />
          </label>
        </div>
        
        {damagePhotos.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', paddingTop: '16px' }}>
            {damagePhotos.map((photo, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={photo.url} alt="damage" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px', textAlign: 'center' }}>
                  {photo.category}
                </div>
                <button type="button" onClick={() => removePhoto(i, 'damage')} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', lineHeight: '20px' }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      <h3 className="section-title" style={{ color: '#3b82f6', marginTop: '24px' }}><ImageIcon size={18} /> 施工/完工美照上傳 ({selectedPart})</h3>
      <div className="col-span-12">
        <div style={{ padding: '24px', border: '2px dashed #60a5fa', borderRadius: '12px', textAlign: 'center', background: '#eff6ff' }}>
          <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#1d4ed8' }}>
            <ImageIcon size={32} />
            <span style={{ fontWeight: '700' }}>上傳【{selectedPart}】施工/完工照</span>
            <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'progress')} style={{ display: 'none' }} />
          </label>
        </div>
        
        {progressPhotos.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: '12px', paddingTop: '16px' }}>
            {progressPhotos.map((photo, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={photo.url} alt="progress" style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #fff', boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }} />
                <div style={{ position: 'absolute', bottom: '0', left: '0', right: '0', background: 'rgba(0,0,0,0.6)', color: '#fff', fontSize: '0.7rem', padding: '2px 6px', borderBottomLeftRadius: '10px', borderBottomRightRadius: '10px', textAlign: 'center' }}>
                  {photo.category}
                </div>
                <button type="button" onClick={() => removePhoto(i, 'progress')} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '20px', height: '20px', cursor: 'pointer', fontSize: '12px', lineHeight: '20px' }}>×</button>
              </div>
            ))}
          </div>
        )}
      </div>


      <div className="form-actions">
        <button type="button" className="btn btn-outline" onClick={onCancel}>暫存退出</button>
        <button type="submit" className="btn btn-primary" style={{ background: '#10b981', borderColor: '#10b981', padding: '12px 32px' }}>施工檢查完畢，轉至施工完成</button>
      </div>
    </form>
  );
};
