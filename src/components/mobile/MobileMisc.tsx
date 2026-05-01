import React from 'react';
import { Box, Wallet, ChevronRight, MapPin, ArrowUpRight, ArrowDownRight } from 'lucide-react';

// Simplified Mobile Inventory
export const MobileInventory: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div style={{ padding: '24px', textAlign: 'center' }}>
    <Box size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
    <h3>庫存管理 (手機版)</h3>
    <p style={{ color: '#64748b' }}>手機版目前僅供檢視，詳細編輯請使用電腦版。</p>
    <button onClick={onBack} className="btn" style={{ marginTop: '20px' }}>返回首頁</button>
  </div>
);

// Simplified Mobile Finance
export const MobileFinance: React.FC<{ onBack: () => void }> = ({ onBack }) => (
  <div style={{ padding: '24px', textAlign: 'center' }}>
    <Wallet size={48} color="#ec4899" style={{ marginBottom: '16px' }} />
    <h3>收支記帳 (手機版)</h3>
    <p style={{ color: '#64748b' }}>手機版目前僅供檢視，詳細編輯請使用電腦版。</p>
    <button onClick={onBack} className="btn" style={{ marginTop: '20px' }}>返回首頁</button>
  </div>
);
