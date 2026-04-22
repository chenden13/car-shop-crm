import React, { useState, useEffect } from 'react';
import { taiwanCounties } from '../data/counties';
import type { Customer } from '../types';

interface NewCustomerFormProps {
  onSuggestId: string;
  initialCustomer?: Customer | null;
  onSubmit: (data: Partial<Customer>, moveToDeposit?: boolean) => void;
  onCancel: () => void;
}

export const NewCustomerForm: React.FC<NewCustomerFormProps> = ({ onSuggestId, initialCustomer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Customer>>({
    id: onSuggestId,
    status: 'new',
    companion: 'alone'
  });

  useEffect(() => {
    if (initialCustomer) {
      setFormData(initialCustomer);
    }
  }, [initialCustomer]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSaveOnly = (e: React.FormEvent) => { e.preventDefault(); onSubmit({ ...formData, status: 'new' }, false); };
  const handleSaveAndMove = (e: React.FormEvent) => { e.preventDefault(); onSubmit({ ...formData, status: 'deposit' }, true); };

  const isEditMode = !!initialCustomer;

  return (
    <div className="form-grid">
      <h3 className="section-title">基本資料</h3>
      
      <div className="form-group col-span-3">
        <label className="form-label">客戶編號*</label>
        <input required type="text" name="id" className="form-control" value={formData.id || ''} onChange={handleChange} disabled={isEditMode} />
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

      <h3 className="section-title">車輛資訊</h3>
      
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

      <h3 className="section-title">客戶特色與習性</h3>

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

      <h3 className="section-title">外觀與特徵紀錄 (選填有助於辨識)</h3>
      
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
          <option value="high">感覺很有錢</option>
          <option value="medium">小康/中等</option>
          <option value="normal">一般</option>
        </select>
      </div>

      <div className="form-group col-span-3">
        <label className="form-label">特徵</label>
        <div style={{ display: 'flex', alignItems: 'center', height: '42px' }}>
          <label className="checkbox-wrap" style={{ fontWeight: 'normal' }}><input type="checkbox" name="wearsGlasses" checked={!!formData.wearsGlasses} onChange={handleChange} /> 戴眼鏡</label>
        </div>
      </div>

      <div className="form-group col-span-12">
        <label className="form-label">其他備註</label>
        <textarea name="notes" className="form-control" rows={3} placeholder="針對客戶的特殊喜好或其他值得注意的地方..." value={formData.notes || ''} onChange={handleChange}></textarea>
      </div>

      <h3 className="section-title">施工與排程</h3>
      
      <div className="form-group col-span-3">
        <label className="form-label">預計施工日期</label>
        <input type="date" name="expectedStartDate" className="form-control" value={formData.expectedStartDate || ''} onChange={handleChange} />
      </div>

      <div className="form-group col-span-3">
        <label className="form-label">預計施工時間</label>
        <input type="text" name="constructionTime" className="form-control" placeholder="e.g. 09:30" value={formData.constructionTime || ''} onChange={handleChange} />
      </div>

      <div className="form-group col-span-3">
        <label className="form-label">預計交車日期</label>
        <input type="date" name="expectedEndDate" className="form-control" value={formData.expectedEndDate || ''} onChange={handleChange} />
      </div>

      <div className="form-group col-span-3">
        <label className="form-label">預計交車時間</label>
        <input type="text" name="expectedDeliveryTime" className="form-control" placeholder="e.g. 17:00" value={formData.expectedDeliveryTime || ''} onChange={handleChange} />
      </div>

      <div className="form-group col-span-3" style={{ display: 'flex', alignItems: 'center', height: '42px', paddingTop: '15px' }}>
        <label className="checkbox-wrap" style={{ fontWeight: 'normal' }}>
          <input type="checkbox" name="inCalendar" checked={!!formData.inCalendar} onChange={handleChange} /> 已加入行事曆
        </label>
      </div>

      <div className="form-group col-span-3" style={{ display: 'flex', alignItems: 'center', height: '42px', paddingTop: '15px' }}>
        <label className="checkbox-wrap" style={{ fontWeight: 'normal' }}>
          <input type="checkbox" name="materialOrdered" checked={!!formData.materialOrdered} onChange={handleChange} /> 膜料已叫貨
        </label>
      </div>

      <div className="form-actions col-span-12">
        <button type="button" className="btn btn-outline" onClick={onCancel}>暫停/取消</button>
        <button type="button" className="btn btn-outline" onClick={handleSaveOnly} style={{ border: 'none', background: '#f1f5f9' }}>
          {isEditMode ? '儲存客戶資料' : '儲存為新客 (先不報價)'}
        </button>
        <button type="button" className="btn btn-primary" onClick={handleSaveAndMove}>資料確認完成，轉至「等待收訂」</button>
      </div>
    </div>
  );
};
