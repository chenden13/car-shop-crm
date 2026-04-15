import React from 'react';
import type { Customer } from '../types';

export const CustomerDetail: React.FC<{ customer: Customer }> = ({ customer }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', paddingBottom: '16px', borderBottom: '1px solid #e5e7eb' }}>
        <div>
          <h2 style={{ margin: 0, color: 'var(--primary-color)' }}>{customer.name}</h2>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{customer.phone} / {customer.fromChannel}</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <h3 style={{ margin: 0 }}>{customer.plateNumber}</h3>
          <p style={{ margin: 0, color: 'var(--text-secondary)' }}>{customer.brand} {customer.model}</p>
        </div>
      </div>
      
      <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
        <h4 style={{ marginTop: 0, color: 'var(--text-primary)' }}>客戶特色</h4>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: 'var(--text-secondary)' }}>
          <li>方便時間: {customer.convenientTime === 'weekday' ? '平日' : customer.convenientTime === 'weekend' ? '假日' : '未定'}</li>
          <li>同行狀態: {customer.companion === 'alone' ? '一個人' : customer.companion === 'with_child' ? `帶小孩 (${customer.childAge}歲)` : customer.companion === 'with_family' ? '帶家人' : '帶伴侶'}</li>
          <li>個性: {customer.personality === 'introvert' ? '內向' : customer.personality === 'extrovert' ? '外向' : '未定'}</li>
          <li>喜歡電話: {customer.likesCalls ? '是' : '否'}</li>
          <li>在意細節: {customer.detailOriented ? '是' : '否'}</li>
          <li>好相處: {customer.easyGoing ? '是' : '否'}</li>
        </ul>
      </div>

      <div style={{ background: '#f9fafb', padding: '16px', borderRadius: '8px' }}>
        <h4 style={{ marginTop: 0, color: 'var(--text-primary)' }}>外觀與社經特徵</h4>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', color: 'var(--text-secondary)' }}>
          <li>所在地: {customer.location || '未填寫'}</li>
          <li>經濟推估: {customer.wealthLevel === 'high' ? '非常有錢' : customer.wealthLevel === 'medium' ? '中等/小康' : '一般'}</li>
          <li>體型/頭髮: {customer.bodyType || '未紀錄'} / {customer.hairLength || '未紀錄'}</li>
          <li>戴眼鏡: {customer.wearsGlasses ? '是' : '否'}</li>
          <li>興趣/職業: {customer.hobbies || '未紀錄'} / {customer.occupation || '未紀錄'}</li>
        </ul>
      </div>

      {customer.notes && (
        <div>
          <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>其他備註</h4>
          <p style={{ margin: 0, padding: '12px', background: '#fef3c7', borderRadius: '8px', color: '#b45309' }}>{customer.notes}</p>
        </div>
      )}
    </div>
  );
};
