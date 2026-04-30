import React, { useState } from 'react';
import { User, Car, Shield, Settings, Info, Calendar, Plus } from 'lucide-react';
import { taiwanCounties } from '../data/counties';
import type { Customer } from '../types';
import { VehicleAutocomplete } from './VehicleAutocomplete';

interface IntakeFormProps {
  onSuggestId: string;
  vehicleMaster?: any[];
  onSubmit: (data: Customer) => void;
  onCancel: () => void;
}

export const IntakeForm: React.FC<IntakeFormProps> = ({ onSuggestId, vehicleMaster = [], onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Customer>>({
    id: onSuggestId,
    status: 'new',
    companion: 'alone'
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

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      status: 'new',
      consultationDate: formData.consultationDate || new Date().toISOString().split('T')[0]
    } as Customer);
  };

  return (
    <form className="form-container" onSubmit={handleFormSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0', maxHeight: '80vh', overflowY: 'auto' }}>
      
      {/* BASIC INFO */}
      <div className="form-section indigo">
        <div className="section-header"><h3 className="section-title"><User size={18} /> 基本聯繫資料</h3></div>
        <div className="form-grid">
          <div className="form-group col-span-4"><label className="form-label">客戶編號</label><input type="text" name="id" className="form-control" value={formData.id} readOnly style={{ background: '#f8fafc' }} /></div>
          <div className="form-group col-span-4"><label className="form-label">姓名*</label><input required type="text" name="name" className="form-control" value={formData.name || ''} onChange={handleChange} /></div>
          <div className="form-group col-span-4"><label className="form-label">電話*</label><input required type="tel" name="phone" className="form-control" value={formData.phone || ''} onChange={handleChange} /></div>
          <div className="form-group col-span-4"><label className="form-label">生日</label><input type="date" name="birthday" className="form-control" value={formData.birthday || ''} onChange={handleChange} /></div>
          <div className="form-group col-span-4"><label className="form-label">得知管道</label><input type="text" name="fromChannel" className="form-control" value={formData.fromChannel || ''} onChange={handleChange} /></div>
          <div className="form-group col-span-4"><label className="form-label">地點</label>
            <select name="location" className="form-control" value={formData.location || ''} onChange={handleChange}>
              <option value="">請選擇</option>
              {taiwanCounties.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* VEHICLE INFO */}
      <div className="form-section blue">
        <div className="section-header"><h3 className="section-title blue"><Car size={18} /> 車輛資訊</h3></div>
        <div className="form-grid">
          <div className="form-group col-span-4"><label className="form-label">車牌號碼</label><input type="text" name="plateNumber" className="form-control" placeholder="ABC-1234" value={formData.plateNumber || ''} onChange={handleChange} /></div>
          <div className="form-group col-span-8">
            <label className="form-label">搜尋車型</label>
            <VehicleAutocomplete 
              brand={formData.brand || ''} model={formData.model || ''} vehicleSize={formData.vehicleSize || ''}
              vehicleMaster={vehicleMaster} onSelect={(data) => setFormData(prev => ({ ...prev, ...data }))}
            />
          </div>
        </div>
      </div>

      {/* INTERESTS */}
      <div className="form-section purple">
        <div className="section-header"><h3 className="section-title purple"><Settings size={18} /> 諮詢需求</h3></div>
        <div className="form-grid">
          <div className="form-group col-span-6">
            <label className="form-label">主要興趣項目</label>
            <select name="mainService" className="form-control" value={formData.mainService || ''} onChange={handleChange}>
              <option value="">請選擇</option>
              <option value="全車犀牛皮">全車犀牛皮</option>
              <option value="全車改色膜">全車改色膜</option>
              <option value="局部保護/改色">局部保護/改色</option>
            </select>
          </div>
          <div className="form-group col-span-6"><label className="form-label">隔熱紙/電改</label><input type="text" name="windowTint" className="form-control" placeholder="備註需求..." value={formData.windowTint || ''} onChange={handleChange} /></div>
          <div className="form-group col-span-12"><label className="form-label">感興趣的配件</label><input type="text" name="interestedAccessories" className="form-control" placeholder="配件名稱..." value={formData.interestedAccessories || ''} onChange={handleChange} /></div>
        </div>
      </div>

      {/* CUSTOMER CHARACTERISTICS */}
      <div className="form-section orange">
        <div className="section-header"><h3 className="section-title orange"><Info size={18} /> 客戶特色紀錄</h3></div>
        <div className="form-grid">
          <div className="form-group col-span-4">
            <label className="form-label">同行狀態</label>
            <select name="companion" className="form-control" value={formData.companion || 'alone'} onChange={handleChange}>
              <option value="alone">獨自</option>
              <option value="with_wife">攜伴</option>
              <option value="with_child">帶小孩</option>
              <option value="with_family">全家</option>
            </select>
          </div>
          <div className="form-group col-span-8" style={{ display: 'flex', gap: '20px', alignItems: 'center', marginTop: '24px' }}>
            <label className="checkbox-wrap"><input type="checkbox" name="detailOriented" checked={!!formData.detailOriented} onChange={handleChange} /> 在意細節</label>
            <label className="checkbox-wrap"><input type="checkbox" name="easyGoing" checked={!!formData.easyGoing} onChange={handleChange} /> 好相處</label>
            <label className="checkbox-wrap"><input type="checkbox" name="likesCalls" checked={!!formData.likesCalls} onChange={handleChange} /> 喜歡電話</label>
          </div>
          <div className="form-group col-span-12"><label className="form-label">情資備註</label><textarea name="notes" className="form-control" rows={3} value={formData.notes || ''} onChange={handleChange} placeholder="補充說明..." /></div>
        </div>
      </div>

      <div className="form-actions" style={{ position: 'sticky', bottom: 0, background: '#fff', padding: '16px 24px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '12px', zIndex: 10 }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>取消</button>
        <div style={{ flex: 1 }}></div>
        <button type="submit" className="btn btn-primary" style={{ background: '#ef4444', padding: '12px 30px' }}>儲存並建立諮詢檔案</button>
      </div>
    </form>
  );
};
