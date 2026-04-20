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

      <div style={{ background: '#f0f9ff', padding: '16px', borderRadius: '8px', border: '1px solid #bae6fd' }}>
        <h4 style={{ marginTop: 0, color: '#0369a1' }}>施工項目清單</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)', gap: '12px' }}>
          {customer.mainService && (
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>主施工項目</div>
              <div style={{ fontWeight: '600' }}>{customer.mainService} ({customer.mainServiceBrand || '無'})</div>
            </div>
          )}
          {customer.windowTint && (
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>隔熱紙</div>
              <div style={{ fontWeight: '600' }}>{customer.windowTint} ({customer.windowTintBrand || '無'})</div>
            </div>
          )}
          {customer.digitalMirror && (
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>電子後視鏡</div>
              <div style={{ fontWeight: '600' }}>{customer.digitalMirror} ({customer.digitalMirrorBrand || '無'})</div>
            </div>
          )}
          {customer.electricMod && (
            <div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>電動改裝</div>
              <div style={{ fontWeight: '600' }}>{customer.electricMod} ({customer.electricModBrand || '無'})</div>
            </div>
          )}
        </div>

        {customer.customAccessories && customer.customAccessories.length > 0 && (
          <div style={{ marginTop: '12px', borderTop: '1px dashed #bae6fd', paddingTop: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>客製化配件</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
              {customer.customAccessories.map(acc => (
                <span key={acc.id} style={{ background: '#fff', padding: '2px 8px', borderRadius: '4px', border: '1px solid #e0f2fe', fontSize: '0.85rem' }}>{acc.name}</span>
              ))}
            </div>
          </div>
        )}

        {customer.giftItems && customer.giftItems.length > 0 && (
          <div style={{ marginTop: '12px', borderTop: '1px dashed #bae6fd', paddingTop: '8px' }}>
            <div style={{ fontSize: '0.75rem', color: '#64748b' }}>贈送項目</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '4px' }}>
              {customer.giftItems.map(gift => (
                <span key={gift} style={{ background: '#fef2f2', padding: '2px 8px', borderRadius: '4px', border: '1px solid #fee2e2', fontSize: '0.85rem', color: '#b91c1c' }}>{gift}</span>
              ))}
            </div>
          </div>
        )}
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

      {(customer.damagePhotos?.length || 0) > 0 && (
        <div style={{ background: '#fffbeb', padding: '16px', borderRadius: '8px', border: '1px solid #fef3c7' }}>
          <h4 style={{ marginTop: 0, color: '#b45309' }}>車體受損紀錄</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
            {customer.damagePhotos?.map((photo, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={photo.url} alt="damage" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.65rem', padding: '2px', textAlign: 'center', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                  {photo.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {(customer.progressPhotos?.length || 0) > 0 && (
        <div style={{ background: '#eff6ff', padding: '16px', borderRadius: '8px', border: '1px solid #dbeafe' }}>
          <h4 style={{ marginTop: 0, color: '#1d4ed8' }}>施工/完工美照</h4>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(100px, 1fr))', gap: '8px' }}>
            {customer.progressPhotos?.map((photo, i) => (
              <div key={i} style={{ position: 'relative' }}>
                <img src={photo.url} alt="progress" style={{ width: '100%', height: '80px', objectFit: 'cover', borderRadius: '8px' }} />
                <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', color: '#fff', fontSize: '0.65rem', padding: '2px', textAlign: 'center', borderBottomLeftRadius: '8px', borderBottomRightRadius: '8px' }}>
                  {photo.category}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {customer.notes && (
        <div>
          <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-primary)' }}>其他備註</h4>
          <p style={{ margin: 0, padding: '12px', background: '#fef3c7', borderRadius: '8px', color: '#b45309' }}>{customer.notes}</p>
        </div>
      )}
    </div>

  );
};
