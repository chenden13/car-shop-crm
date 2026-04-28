import React, { useState } from 'react';
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
    <form className="form-grid" onSubmit={handleFormSubmit}>
      <h3 className="section-title" style={{ color: '#ef4444' }}>基本資料</h3>
      
      <div className="form-group col-span-3">
        <label className="form-label">客戶編號*</label>
        <input required type="text" name="id" className="form-control" value={formData.id || ''} onChange={handleChange} />
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
        <label className="form-label">得知管道</label>
        <input type="text" name="fromChannel" placeholder="例如: FB, IG, 朋友介紹" className="form-control" value={formData.fromChannel || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">職業</label>
        <input type="text" name="occupation" className="form-control" value={formData.occupation || ''} onChange={handleChange} />
      </div>

      <h3 className="section-title" style={{ color: '#ef4444', marginTop: '20px' }}>車輛資訊</h3>
      
      <div className="form-group col-span-4">
        <label className="form-label">車牌號碼</label>
        <input type="text" name="plateNumber" className="form-control" placeholder="ABC-1234" value={formData.plateNumber || ''} onChange={handleChange} />
      </div>
      <VehicleAutocomplete 
        brand={formData.brand || ''}
        model={formData.model || ''}
        vehicleSize={formData.vehicleSize || ''}
        vehicleMaster={vehicleMaster}
        onSelect={(data) => setFormData(prev => ({ ...prev, ...data }))}
      />

      <h3 className="section-title" style={{ color: '#ef4444', marginTop: '20px' }}>諮詢需求與興趣</h3>
      
      <div className="form-group col-span-4">
        <label className="form-label">主要施工意向</label>
        <select name="mainService" className="form-control" value={formData.mainService || ''} onChange={handleChange}>
          <option value="">請選擇</option>
          <option value="全車犀牛皮">全車犀牛皮</option>
          <option value="全車改色膜">全車改色膜</option>
          <option value="局部保護/改色">局部保護/改色</option>
        </select>
      </div>

      <div className="form-group col-span-4">
        <label className="form-label">隔熱紙需求</label>
        <input type="text" name="windowTint" className="form-control" placeholder="品牌或型號" value={formData.windowTint || ''} onChange={handleChange} />
      </div>

      <div className="form-group col-span-4">
        <label className="form-label">電改項目</label>
        <input type="text" name="electricMod" className="form-control" placeholder="例如: 吸門, 電動前車箱" value={formData.electricMod || ''} onChange={handleChange} />
      </div>

      <div className="form-group col-span-4">
        <label className="form-label">電子後視鏡</label>
        <input type="text" name="digitalMirror" className="form-control" placeholder="品牌或規格" value={formData.digitalMirror || ''} onChange={handleChange} />
      </div>

      <div className="form-group col-span-8">
        <label className="form-label">感興趣的配件</label>
        <input type="text" name="interestedAccessories" className="form-control" placeholder="車牌框, 卡鉗改色, 其他配件..." value={formData.interestedAccessories || ''} onChange={handleChange} />
      </div>

      <h3 className="section-title" style={{ color: '#ef4444', marginTop: '20px' }}>客戶特色與習性</h3>

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

      <div className="form-group col-span-6">
        <label className="form-label">個性</label>
        <div style={{ display: 'flex', gap: '20px', height: '42px', alignItems: 'center' }}>
          <label className="checkbox-wrap" style={{ fontWeight: 'normal' }}><input type="radio" name="personality" value="introvert" checked={formData.personality === 'introvert'} onChange={handleChange} /> 內向</label>
          <label className="checkbox-wrap" style={{ fontWeight: 'normal' }}><input type="radio" name="personality" value="extrovert" checked={formData.personality === 'extrovert'} onChange={handleChange} /> 外向</label>
        </div>
      </div>

      <div className="form-group col-span-6">
        <label className="form-label">興趣</label>
        <input type="text" name="hobbies" className="form-control" placeholder="高爾夫, 露營..." value={formData.hobbies || ''} onChange={handleChange} />
      </div>

      <h3 className="section-title" style={{ color: '#ef4444', marginTop: '20px' }}>外觀與特徵紀錄 (選填有助於辨識)</h3>
      
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
        <label className="form-label">頭髮</label>
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
        <label className="form-label">特徵</label>
        <label className="checkbox-wrap" style={{ fontWeight: 'normal', height: '42px', display: 'flex', alignItems: 'center' }}><input type="checkbox" name="wearsGlasses" checked={!!formData.wearsGlasses} onChange={handleChange} /> 戴眼鏡</label>
      </div>

      <div className="form-group col-span-12">
        <label className="form-label">其他備註</label>
        <textarea name="notes" className="form-control" rows={3} placeholder="針對客戶的特殊喜好或其他值得注意的地方..." value={formData.notes || ''} onChange={handleChange}></textarea>
      </div>

      <div className="col-span-12 form-actions" style={{ marginTop: '20px' }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>取消</button>
        <button type="submit" className="btn btn-primary" style={{ background: '#ef4444', borderColor: '#ef4444' }}>儲存並建立諮詢檔案</button>
      </div>
    </form>
  );
};
