import React, { useState, useEffect } from 'react';
import type { Customer, ChecklistItem, CategorizedPhoto, Accessory } from '../types';
import { 
  Camera, Image as ImageIcon, CheckCircle, AlertTriangle, Truck, Settings, 
  User, Car, Clock, Shield, Save, Plus, Trash2, Gift, Package, Activity, ChevronRight
} from 'lucide-react';
import { api } from '../lib/api';
import { getYouTubeEmbedUrl, generateChecklist } from '../lib/utils';
import { PendingEditForm } from './PendingEditForm';

interface ConstructionFormProps {
  customer: Customer;
  onSubmit: (updatedCustomer: Customer) => void;
  onCancel: () => void;
  onSaveProgress?: (updatedCustomer: Customer) => void; 
}

export const ConstructionForm: React.FC<ConstructionFormProps> = ({ customer, onSubmit, onCancel, onSaveProgress }) => {
  const [formData, setFormData] = useState<Customer>(customer);
  const [activeTab, setActiveTab] = useState<'progress' | 'editing'>('progress');
  const [selectedPart, setSelectedPart] = useState<string>('前保桿');
  const [isUploading, setIsUploading] = useState(false);

  const CAR_PARTS = ['前保桿', '引擎蓋', '車頂', '左前葉', '右前葉', '左前門', '右前門', '左後門', '右後門', '左後葉', '右後葉', '尾箱上', '尾箱下', '後保桿', '鋼琴烤漆', '其他'];

  const currentChecklist = generateChecklist(formData);

  const toggleCheck = (name: string) => {
    const nextList = [...currentChecklist];
    const index = nextList.findIndex(n => n.name === name);
    if (index >= 0) {
      nextList[index].checked = !nextList[index].checked;
      setFormData(prev => ({ ...prev, constructionChecklist: nextList }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'damage' | 'progress') => {
    if (!e.target.files || e.target.files.length === 0) return;
    setIsUploading(true);
    const filesArray = Array.from(e.target.files);
    try {
      const uploadPromises = filesArray.map(async (file) => {
        const timestamp = Date.now();
        const path = `${customer.id}/${type}/${timestamp}_${file.name}`;
        const url = await api.uploadPhoto(file, path);
        return { category: selectedPart, url };
      });
      const uploadedPhotos = await Promise.all(uploadPromises);
      if (type === 'damage') setFormData(prev => ({ ...prev, damagePhotos: [...(prev.damagePhotos || []), ...uploadedPhotos] }));
      else setFormData(prev => ({ ...prev, progressPhotos: [...(prev.progressPhotos || []), ...uploadedPhotos] }));
    } catch (err) {
      alert('上傳失敗');
    } finally {
      setIsUploading(false);
    }
  };

  const removePhoto = (url: string, type: 'damage' | 'progress') => {
    if (type === 'damage') setFormData(prev => ({ ...prev, damagePhotos: prev.damagePhotos?.filter(p => p.url !== url) }));
    else setFormData(prev => ({ ...prev, progressPhotos: prev.progressPhotos?.filter(p => p.url !== url) }));
  };

  const handleSaveProgress = () => {
    if (onSaveProgress) onSaveProgress(formData);
    else onSubmit(formData);
    alert('進度已儲存');
  };

  const handleFinish = (e: React.FormEvent) => {
    e.preventDefault();
    if (!window.confirm('確定要完工結案嗎？此案件將移至完工存檔區。')) return;
    const today = new Date().toISOString().split('T')[0];
    const checkup = new Date();
    checkup.setMonth(checkup.getMonth() + 1);
    
    onSubmit({ 
      ...formData, 
      status: 'completed',
      deliveryDate: today,
      checkupDate: checkup.toISOString().split('T')[0]
    });
  };

  return (
    <div className="form-container" style={{ display: 'flex', flexDirection: 'column', maxHeight: '85vh', overflowY: 'auto' }}>
      {/* Premium Tab Header */}
      <div style={{ display: 'flex', gap: '8px', padding: '16px', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', position: 'sticky', top: 0, zIndex: 10 }}>
        <button onClick={() => setActiveTab('progress')} className={`btn ${activeTab === 'progress' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, borderRadius: '12px' }}>
          <Activity size={18} /> 施工進度監控
        </button>
        <button onClick={() => setActiveTab('editing')} className={`btn ${activeTab === 'editing' ? 'btn-primary' : 'btn-outline'}`} style={{ flex: 1, borderRadius: '12px' }}>
          <Settings size={18} /> 項目與配件調整
        </button>
      </div>

      <div style={{ padding: '4px' }}>
        {activeTab === 'progress' ? (
          <form onSubmit={handleFinish}>
            {/* VEHICLE SUMMARY CARD */}
            <div className="form-section indigo" style={{ background: '#f0f9ff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{ padding: '12px', background: '#3b82f6', color: '#fff', borderRadius: '16px', boxShadow: '0 8px 16px -4px rgba(59, 130, 246, 0.4)' }}>
                  <Car size={32} />
                </div>
                <div>
                  <h4 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '900', color: '#1e293b' }}>{formData.plateNumber}</h4>
                  <div style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 'bold' }}>{formData.name} · {formData.brand} {formData.model}</div>
                </div>
              </div>
            </div>

            {/* CHECKLIST SECTION */}
            <div className="form-section green">
              <div className="section-header"><h3 className="section-title green"><CheckCircle size={18} /> 施工進度檢核表</h3></div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {currentChecklist.map(item => (
                  <label key={item.id} style={{ 
                    display: 'flex', alignItems: 'center', gap: '12px', padding: '16px', 
                    background: item.checked ? '#f0fdf4' : '#fff', 
                    border: `1px solid ${item.checked ? '#10b981' : '#e2e8f0'}`, 
                    borderRadius: '12px', cursor: 'pointer', transition: 'all 0.2s'
                  }}>
                    <input type="checkbox" checked={item.checked} onChange={() => toggleCheck(item.name)} style={{ width: '20px', height: '20px' }} />
                    <span style={{ 
                      fontSize: '1rem', fontWeight: item.checked ? '700' : '600', 
                      color: item.checked ? '#166534' : '#334155',
                      textDecoration: item.checked ? 'line-through' : 'none',
                      opacity: item.checked ? 0.7 : 1
                    }}>{item.name}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* PHOTOS SECTION */}
            <div className="form-section blue">
              <div className="section-header">
                <h3 className="section-title blue"><Camera size={18} /> 施工影像管理</h3>
                <div style={{ fontSize: '0.8rem', color: '#64748b' }}>當前部位: {selectedPart}</div>
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '20px' }}>
                {CAR_PARTS.map(part => (
                  <button key={part} type="button" onClick={() => setSelectedPart(part)} className={`btn ${selectedPart === part ? 'btn-primary' : 'btn-outline'}`} style={{ padding: '4px 10px', fontSize: '0.7rem', borderRadius: '20px' }}>{part}</button>
                ))}
              </div>

              <div className="form-grid">
                <div className="col-span-6">
                  <div style={{ padding: '20px', border: '2px dashed #3b82f6', borderRadius: '16px', background: '#f0f7ff', textAlign: 'center' }}>
                    <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <Camera size={24} color="#3b82f6" />
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#3b82f6' }}>上傳施工前/受損照</span>
                      <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'damage')} />
                    </label>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', marginTop: '12px' }}>
                    {formData.damagePhotos?.filter(p => p.category === selectedPart).map(p => (
                      <div key={p.url} style={{ position: 'relative', aspectRatio: '1' }}>
                        <img src={p.url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                        <button type="button" onClick={() => removePhoto(p.url, 'damage')} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18 }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="col-span-6">
                  <div style={{ padding: '20px', border: '2px dashed #10b981', borderRadius: '16px', background: '#f0fdf4', textAlign: 'center' }}>
                    <label style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                      <ImageIcon size={24} color="#10b981" />
                      <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: '#10b981' }}>上傳完工/進度照</span>
                      <input type="file" multiple accept="image/*" style={{ display: 'none' }} onChange={(e) => handleFileUpload(e, 'progress')} />
                    </label>
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(80px, 1fr))', gap: '8px', marginTop: '12px' }}>
                    {formData.progressPhotos?.filter(p => p.category === selectedPart).map(p => (
                      <div key={p.url} style={{ position: 'relative', aspectRatio: '1' }}>
                        <img src={p.url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '8px' }} />
                        <button type="button" onClick={() => removePhoto(p.url, 'progress')} style={{ position: 'absolute', top: 2, right: 2, background: 'rgba(0,0,0,0.5)', color: '#fff', border: 'none', borderRadius: '50%', width: 18, height: 18 }}>×</button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* REFERENCE SECTION */}
            {(formData.preConstructionPhotos?.length || 0) > 0 && (
              <div className="form-section pink">
                <div className="section-header"><h3 className="section-title pink"><Activity size={18} /> 施工前巡車參考</h3></div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
                  {formData.preConstructionPhotos?.map((url, i) => (
                    <a key={i} href={url} target="_blank" rel="noreferrer" style={{ aspectRatio: '1', borderRadius: '8px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
                      <img src={url} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    </a>
                  ))}
                </div>
              </div>
            )}

            <div className="form-actions" style={{ position: 'sticky', bottom: 0, background: '#fff', padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', zIndex: 10 }}>
              <button type="button" className="btn btn-outline" onClick={handleSaveProgress}>儲存目前進度</button>
              <div style={{ flex: 1 }}></div>
              <button type="submit" className="btn btn-primary" style={{ background: '#10b981', padding: '12px 30px' }}>完工結案交車</button>
            </div>
          </form>
        ) : (
          <div style={{ marginTop: '4px' }}>
            <PendingEditForm 
              customer={formData}
              onSubmit={(updated) => {
                setFormData(updated);
                if (onSaveProgress) onSaveProgress(updated);
                setActiveTab('progress');
              }}
              onCancel={() => setActiveTab('progress')}
            />
          </div>
        )}
      </div>
    </div>
  );
};
