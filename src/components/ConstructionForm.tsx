import React, { useState, useEffect } from 'react';
import type { Customer, ChecklistItem } from '../types';
import { Camera, Image as ImageIcon, CheckCircle, AlertTriangle, Truck } from 'lucide-react';

interface ConstructionFormProps {
  customer: Customer;
  onSubmit: (updatedCustomer: Customer) => void;
  onCancel: () => void;
}

export const ConstructionForm: React.FC<ConstructionFormProps> = ({ customer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Customer>(customer);
  const [damagePreviews, setDamagePreviews] = useState<string[]>([]);
  const [progressPreviews, setProgressPreviews] = useState<string[]>([]);

  useEffect(() => {
    if (!formData.constructionChecklist || formData.constructionChecklist.length === 0) {
      const initialChecklist: ChecklistItem[] = [];
      const addIfExist = (val: string | undefined, label: string) => {
        if (val) initialChecklist.push({ id: `c_${Date.now()}_${Math.random()}`, name: `${label}: ${val}`, checked: false });
      };

      addIfExist(formData.mainService, "主施工");
      addIfExist(formData.windowTint, "隔熱紙");
      addIfExist(formData.digitalMirror, "電子後照鏡");
      addIfExist(formData.electricMod, "電動改裝");
      
      formData.customAccessories?.forEach(acc => {
        addIfExist(acc.name, "配件");
      });

      initialChecklist.unshift({ id: 'base_1', name: '預洗與表面深層清潔', checked: false });
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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'damage' | 'progress') => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      const urlArray = filesArray.map(file => URL.createObjectURL(file));
      if (type === 'damage') {
        setDamagePreviews(prev => [...prev, ...urlArray]);
      } else {
        setProgressPreviews(prev => [...prev, ...urlArray]);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, status: 'completed' });
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      {/* Header Info */}
      <div className="col-span-12" style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ padding: '10px', background: 'var(--primary)', color: '#fff', borderRadius: '8px' }}>
          <Truck size={24} />
        </div>
        <div>
          <h4 style={{ margin: 0, fontSize: '1.2rem', color: '#0f172a' }}>{customer.plateNumber} - {customer.brand}</h4>
          <p style={{ margin: '2px 0 0 0', color: '#64748b', fontSize: '0.85rem' }}>請勾選施工進度並上傳相關紀錄照片。</p>
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

      <h3 className="section-title" style={{ color: '#f59e0b', marginTop: '24px' }}><AlertTriangle size={18} /> 車體受損照片紀錄</h3>
      <div className="col-span-12">
        <div style={{ padding: '32px', border: '2px dashed #fbbf24', borderRadius: '12px', textAlign: 'center', background: '#fffbeb' }}>
          <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#b45309' }}>
            <Camera size={32} />
            <span style={{ fontWeight: '700' }}>上傳受損點照片</span>
            <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'damage')} style={{ display: 'none' }} />
          </label>
        </div>
        
        {damagePreviews.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '12px 0' }}>
            {damagePreviews.map((src, i) => (
              <img key={i} src={src} alt="damage" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
            ))}
          </div>
        )}
      </div>

      <h3 className="section-title" style={{ color: '#3b82f6', marginTop: '24px' }}><ImageIcon size={18} /> 施工/完工美照上傳</h3>
      <div className="col-span-12">
        <div style={{ padding: '32px', border: '2px dashed #60a5fa', borderRadius: '12px', textAlign: 'center', background: '#eff6ff' }}>
          <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', color: '#1d4ed8' }}>
            <ImageIcon size={32} />
            <span style={{ fontWeight: '700' }}>上傳施作過程或完美完工照</span>
            <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'progress')} style={{ display: 'none' }} />
          </label>
        </div>
        
        {progressPreviews.length > 0 && (
          <div style={{ display: 'flex', gap: '12px', overflowX: 'auto', padding: '12px 0' }}>
            {progressPreviews.map((src, i) => (
              <img key={i} src={src} alt="progress" style={{ width: '120px', height: '120px', objectFit: 'cover', borderRadius: '12px', border: '2px solid #fff', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }} />
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
