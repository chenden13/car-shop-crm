import React, { useState } from 'react';
import type { Customer } from '../types';
import { Calendar, Gift, Heart } from 'lucide-react';

interface CompletedFormProps {
  customer: Customer;
  onSubmit: (updatedCustomer: Customer) => void;
  onCancel: () => void;
}

const timeOptions = [
  '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00', '20:00'
];

export const CompletedForm: React.FC<CompletedFormProps> = ({ customer, onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<Customer>(customer);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleCheckupTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const datePart = formData.checkupDate ? formData.checkupDate.split('T')[0] : '';
    setFormData(prev => ({ ...prev, checkupDate: `${datePart}T${e.target.value}` }));
  };

  const handleCheckupDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const timePart = formData.checkupDate && formData.checkupDate.includes('T') ? formData.checkupDate.split('T')[1] : '13:00';
    setFormData(prev => ({ ...prev, checkupDate: `${e.target.value}T${timePart}` }));
  };

  const checkupDateVal = formData.checkupDate ? formData.checkupDate.split('T')[0] : '';
  const checkupTimeVal = formData.checkupDate && formData.checkupDate.includes('T') ? formData.checkupDate.split('T')[1] : '';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({ ...formData, status: 'completed' });
  };

  return (
    <form onSubmit={handleSubmit} className="form-grid">
      <div className="form-group col-span-12" style={{ background: '#fef2f2', padding: '16px', borderRadius: '8px', border: '1px solid #fca5a5' }}>
        <h4 style={{ margin: 0, color: 'var(--text-primary)' }}>結案管理：{customer.plateNumber} ({customer.name})</h4>
        <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>完成以下項目及未來排程，確保能提供優質的售後服務。</p>
      </div>

      <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#10b981' }}>
        <Calendar size={20} /> 交車與排程
      </h3>
      <div className="form-group col-span-4">
        <label className="form-label">實際交車日期</label>
        <input type="date" name="deliveryDate" className="form-control" value={formData.deliveryDate || ''} onChange={handleChange} />
      </div>
      
      <div className="form-group col-span-5">
        <label className="form-label">未來健檢預約 (日期)</label>
        <input type="date" className="form-control" value={checkupDateVal} onChange={handleCheckupDateChange} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">健檢時間</label>
        <select className="form-control" value={checkupTimeVal} onChange={handleCheckupTimeChange}>
          <option value="">選擇整點</option>
          {timeOptions.map(time => (
            <option key={time} value={time}>{time}</option>
          ))}
        </select>
      </div>

      <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#8b5cf6' }}>
        <Gift size={20} /> 交付與傳送確認
      </h3>
      <div className="form-group col-span-12">
        <div className="radio-group" style={{gap: '24px', flexWrap: 'wrap'}}>
          <label className="checkbox-wrap">
            <input type="checkbox" name="giftGiven" checked={!!formData.giftGiven} onChange={handleChange} /> 大禮包已發送
          </label>
          <label className="checkbox-wrap">
            <input type="checkbox" name="formSent" checked={!!formData.formSent} onChange={handleChange} /> 滿意度表單已傳送
          </label>
          <label className="checkbox-wrap">
            <input type="checkbox" name="formFilled" checked={!!formData.formFilled} onChange={handleChange} /> 表單已回填
          </label>
          <label className="checkbox-wrap">
            <input type="checkbox" name="photosSent" checked={!!formData.photosSent} onChange={handleChange} /> 完工照片以傳送
          </label>
          <label className="checkbox-wrap">
            <input type="checkbox" name="photosRetaken" checked={!!formData.photosRetaken} onChange={handleChange} /> 需要照片補拍
          </label>
        </div>
      </div>

      <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ec4899' }}>
        <Heart size={20} /> 未來關心追蹤進度
      </h3>
      <div className="form-group col-span-12">
        <div style={{ display: 'flex', gap: '12px', flexDirection: 'column' }}>
          <label className="checkbox-wrap" style={{ background: '#fdf2f8', padding: '12px', border: '1px solid #fbcfe8', borderRadius: '8px'}}>
            <input type="checkbox" name="followUp3Days" checked={!!formData.followUp3Days} onChange={handleChange} /> 三天後關心 (滿意度初探)
          </label>
          <label className="checkbox-wrap" style={{ background: '#fdf2f8', padding: '12px', border: '1px solid #fbcfe8', borderRadius: '8px'}}>
            <input type="checkbox" name="followUp2Weeks" checked={!!formData.followUp2Weeks} onChange={handleChange} /> 兩周後關心 (膜料/改裝穩定度檢視)
          </label>
          <label className="checkbox-wrap" style={{ background: '#fdf2f8', padding: '12px', border: '1px solid #fbcfe8', borderRadius: '8px'}}>
            <input type="checkbox" name="followUp6Months" checked={!!formData.followUp6Months} onChange={handleChange} /> 6個月關心 (健檢提醒)
          </label>
          <label className="checkbox-wrap" style={{ background: '#fdf2f8', padding: '12px', border: '1px solid #fbcfe8', borderRadius: '8px'}}>
            <input type="checkbox" name="followUp1Year" checked={!!formData.followUp1Year} onChange={handleChange} /> 1年關心 (回娘家活動推薦)
          </label>
        </div>
      </div>

      <div className="form-group col-span-12">
        <label className="form-label" style={{ color: '#ef4444', fontWeight: 'bold' }}>結案後待處理事項 (補貼、配件未裝等)</label>
        <textarea name="pendingItems" className="form-control" style={{ minHeight: '60px', borderColor: '#fca5a5' }} placeholder="若有漏掉或需要下次補做的請寫在這裡..." value={formData.pendingItems || ''} onChange={handleChange as any}></textarea>
      </div>

      <div className="form-actions col-span-12" style={{ marginTop: '24px' }}>
        <button type="button" className="btn btn-outline" onClick={onCancel}>取消/退出</button>
        <button type="submit" className="btn btn-primary">儲存結案紀錄</button>
      </div>
    </form>
  );
};
