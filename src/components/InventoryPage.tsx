import React, { useState } from 'react';
import type { FilmInventory, InventoryLog, Role, PurchaseRecord } from '../types';
import { 
  Plus, MapPin, Trash2, 
  Box, Warehouse, Clock, History as HistoryIcon,
  ArrowUpRight, ArrowDownRight, RefreshCw, ShoppingCart
} from 'lucide-react';

interface InventoryPageProps {
  inventory: FilmInventory[];
  inventoryLogs?: InventoryLog[];
  purchaseRecords?: PurchaseRecord[];
  userRole?: Role;
  onUpdateInventory: (item: FilmInventory, detailsOverride?: string) => void;
  onAddInventory: (item: FilmInventory) => void;
  onRemoveInventory: (id: string) => void;
  onAddPurchaseRecord: (record: PurchaseRecord) => void;
  onBack: () => void;
}


const ZONE_CONFIG = {
  A: { sections: 5, slots: 20, name: '牆面 (A1~A5)' },
  B: { sections: 2, slots: 20, name: '靠牆兩層架 (B1~B2)' },
  C: { sections: 6, slots: 12, name: '倒V型貨架 (C1~C6)' },
  D: { sections: 5, slots: 30, name: '直立層架1 (D1~D5)' },
  E: { sections: 5, slots: 30, name: '直立層架2 (E1~E5)' },
  F: { sections: 5, slots: 30, name: '直立層架3 (F1~F5)' }
};

type ZoneKey = keyof typeof ZONE_CONFIG;

export const InventoryPage: React.FC<InventoryPageProps> = ({ 
  inventory, inventoryLogs = [], purchaseRecords = [], userRole, onUpdateInventory, onAddInventory, onRemoveInventory, onAddPurchaseRecord, onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'storage' | 'history' | 'purchases'>('storage');
  const [activeZone, setActiveZone] = useState<ZoneKey>('A');

  const [activeSection, setActiveSection] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<FilmInventory> | null>(null);

  // New states for purchase form
  const [isPurchaseModalOpen, setIsPurchaseModalOpen] = useState(false);
  const [purchaseForm, setPurchaseForm] = useState({
    itemName: '',
    quantity: '1 捲',
    notes: '',
    orderDate: new Date().toISOString().split('T')[0]
  });

  const getInventoryAt = (zone: string, section: number, slot: number) => {
    return inventory.find(item => 
      item.location.zone === zone && 
      item.location.section === section && 
      item.location.slot === slot
    );
  };

  const handleSlotClick = (zone: ZoneKey, section: number, slot: number) => {
    const existing = getInventoryAt(zone, section, slot);
    if (existing) {
      setEditingItem(existing);
    } else {
      setEditingItem({
        id: `INV-${Date.now()}`,
        brand: '',
        color: '',
        size: '1.52m x 15m',
        currentMeters: 15, // 預設一捲約 15 米
        location: { zone, section, slot },
        lastUpdated: new Date().toISOString().split('T')[0]
      });
    }
    setIsEditModalOpen(true);
  };

  const handleAdjustMeters = (item: FilmInventory, amount: number, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    // 使用 Math.round(val * 100) / 100 處理浮點數精度，確保 CM 計算準確
    const newMeters = Math.max(0, Math.round(((item.currentMeters || 0) + amount) * 100) / 100);
    const action = amount > 0 ? '增加' : '使用';
    
    // 格式化細項，如果小於 1M 則顯示 CM
    const absAmount = Math.abs(amount);
    const amountStr = absAmount < 1 ? `${Math.round(absAmount * 100)}cm` : `${absAmount}M`;
    
    const details = `${action} ${item.brand} ${item.color} ${amountStr} (餘: ${newMeters}M)`;
    onUpdateInventory({ ...item, currentMeters: newMeters, lastUpdated: new Date().toISOString().split('T')[0] }, details);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && editingItem.id) {
      const isNew = !inventory.find(i => i.id === editingItem.id);
      if (isNew) {
        onAddInventory(editingItem as FilmInventory);
      } else {
        onUpdateInventory({...(editingItem as FilmInventory), lastUpdated: new Date().toISOString().split('T')[0]});
      }
      setIsEditModalOpen(false);
      setEditingItem(null);
    }
  };

  const handlePurchaseSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('InventoryPage: 提交表單内容', purchaseForm);
    const newRecord: PurchaseRecord = {
      id: `PUR-${Date.now()}`,
      orderDate: purchaseForm.orderDate,
      itemName: purchaseForm.itemName,
      quantity: purchaseForm.quantity,
      price: 0,
      status: 'ordered',
      notes: purchaseForm.notes,
      operator: '系統成員'
    };
    onAddPurchaseRecord(newRecord);
    setIsPurchaseModalOpen(false);
    setPurchaseForm({
      itemName: '',
      quantity: '1 捲',
      notes: '',
      orderDate: new Date().toISOString().split('T')[0]
    });
  };


  console.log('InventoryPage Received PurchaseRecords:', purchaseRecords?.length);

  const isMobile = window.innerWidth <= 768;

  return (
    <div style={{ padding: isMobile ? '12px' : '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '24px', gap: '16px' }}>
        <div style={{ width: isMobile ? '100%' : 'auto' }}>
          {!isMobile && (
            <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, marginBottom: '8px', fontWeight: 'bold' }}>
              ← 返回看板
            </button>
          )}
          <h1 style={{ margin: 0, fontSize: isMobile ? '1.5rem' : '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Warehouse color="var(--primary)" size={isMobile ? 24 : 32} /> 膜料庫存管理
          </h1>
        </div>

        {userRole === 'admin' && (
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', gap: '4px', width: isMobile ? '100%' : 'auto', overflowX: 'auto' }}>
            <button 
              onClick={() => setActiveTab('storage')}
              style={{
                flex: isMobile ? 1 : 'none', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold',
                background: activeTab === 'storage' ? '#fff' : 'transparent',
                color: activeTab === 'storage' ? 'var(--primary)' : '#64748b',
                boxShadow: activeTab === 'storage' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', whiteSpace: 'nowrap'
              }}
            >
              <Box size={14} /> 儲位圖
            </button>
            <button 
              onClick={() => setActiveTab('purchases')}
              style={{
                flex: isMobile ? 1 : 'none', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold',
                background: activeTab === 'purchases' ? '#fff' : 'transparent',
                color: activeTab === 'purchases' ? 'var(--primary)' : '#64748b',
                boxShadow: activeTab === 'purchases' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', whiteSpace: 'nowrap'
              }}
            >
              <ShoppingCart size={14} /> 叫貨
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              style={{
                flex: isMobile ? 1 : 'none', border: 'none', padding: '8px 12px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 'bold',
                background: activeTab === 'history' ? '#fff' : 'transparent',
                color: activeTab === 'history' ? 'var(--primary)' : '#64748b',
                boxShadow: activeTab === 'history' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', whiteSpace: 'nowrap'
              }}
            >
              <HistoryIcon size={14} /> 異動
            </button>
          </div>
        )}
      </header>

      <div style={{ position: 'relative' }}>
        {activeTab === 'storage' && (
          <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', gap: '24px' }}>
            <aside style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '8px', overflowX: isMobile ? 'auto' : 'visible', paddingBottom: isMobile ? '12px' : 0 }}>
              {Object.entries(ZONE_CONFIG).map(([key, config]) => (
                <button 
                  key={key}
                  onClick={() => { setActiveZone(key as ZoneKey); setActiveSection(1); }}
                  style={{
                    display: 'flex', flexDirection: 'column', padding: isMobile ? '10px 16px' : '16px', borderRadius: '12px', textAlign: 'left',
                    background: activeZone === key ? 'var(--primary)' : '#fff',
                    color: activeZone === key ? '#fff' : '#1e293b',
                    border: '1px solid',
                    borderColor: activeZone === key ? 'var(--primary)' : '#e2e8f0',
                    cursor: 'pointer', transition: 'all 0.2s',
                    minWidth: isMobile ? '100px' : 'auto',
                    flexShrink: 0
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: isMobile ? '0.9rem' : '1.1rem' }}>區域 {key}</div>
                  {!isMobile && <div style={{ fontSize: '0.8rem', opacity: 0.8 }}>{config.name}</div>}
                </button>
              ))}
            </aside>

            <main className="glass-panel" style={{ padding: isMobile ? '16px' : '24px', flex: 1 }}>
              <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'flex-start' : 'center', marginBottom: '24px', gap: '12px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <MapPin color="var(--primary)" size={18} />
                  <span style={{ fontSize: isMobile ? '1rem' : '1.2rem', fontWeight: 'bold' }}>{ZONE_CONFIG[activeZone].name}</span>
                </div>
                
                <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                  {Array.from({ length: ZONE_CONFIG[activeZone].sections }, (_, i) => i + 1).map(s => (
                    <button
                      key={s}
                      onClick={() => setActiveSection(s)}
                      style={{
                        padding: '6px 12px', borderRadius: '6px', border: '1px solid',
                        background: activeSection === s ? '#1e293b' : '#fff',
                        color: activeSection === s ? '#fff' : '#64748b',
                        borderColor: activeSection === s ? '#1e293b' : '#e2e8f0',
                        cursor: 'pointer', fontWeight: 'bold', fontSize: '0.8rem'
                      }}
                    >
                      {activeZone}{s}
                    </button>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {Array.from({ length: ZONE_CONFIG[activeZone].slots }, (_, i) => i + 1).map(slotNum => {
                  const item = getInventoryAt(activeZone, activeSection, slotNum);
                  return (
                    <div 
                      key={slotNum}
                      onClick={() => handleSlotClick(activeZone, activeSection, slotNum)}
                      style={{
                        display: 'flex', flexDirection: isMobile && item ? 'column' : 'row', alignItems: isMobile && item ? 'flex-start' : 'center', gap: '12px', borderRadius: '12px', border: '1px solid',
                        borderColor: item ? 'var(--primary)' : '#e2e8f0',
                        background: item ? '#eff6ff' : '#fff',
                        padding: '12px 16px', cursor: 'pointer', transition: 'all 0.2s'
                      }}
                    >
                      <div style={{ width: '40px', fontWeight: '800', color: '#94a3b8', fontSize: '0.9rem' }}>#{slotNum}</div>
                      
                      {item ? (
                        <div style={{ display: 'flex', flex: 1, flexDirection: isMobile ? 'column' : 'row', alignItems: isMobile ? 'stretch' : 'center', gap: '12px', width: '100%' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#1e293b' }}>{item.color}</div>
                            <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.brand}</div>
                          </div>
                          
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: isMobile ? 'space-between' : 'flex-end', gap: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '4px 10px', borderRadius: '25px', border: '1px solid #e2e8f0' }}>
                              <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '4px' }}>
                                <button onClick={(e) => handleAdjustMeters(item, -0.1, e)} style={{ width: isMobile ? '45px' : '35px', height: '22px', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.65rem' }}>-0.1</button>
                                <button onClick={(e) => handleAdjustMeters(item, -1, e)} style={{ width: isMobile ? '45px' : '35px', height: '22px', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#fee2e2', color: '#dc2626', fontSize: '0.7rem', fontWeight: 'bold' }}>-1M</button>
                              </div>
                              <div style={{ minWidth: '45px', textAlign: 'center' }}>
                                <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '0.95rem' }}>{item.currentMeters || 0}</div>
                                <div style={{ fontSize: '0.55rem', color: '#94a3b8' }}>M</div>
                              </div>
                              <div style={{ display: 'flex', flexDirection: isMobile ? 'row' : 'column', gap: '4px' }}>
                                <button onClick={(e) => handleAdjustMeters(item, 0.1, e)} style={{ width: isMobile ? '45px' : '35px', height: '22px', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '0.65rem' }}>+0.1</button>
                                <button onClick={(e) => handleAdjustMeters(item, 1, e)} style={{ width: isMobile ? '45px' : '35px', height: '22px', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#ecfdf5', color: '#059669', fontSize: '0.7rem', fontWeight: 'bold' }}>+1M</button>
                              </div>
                            </div>
                            {!isMobile && <div style={{ width: '100px', fontSize: '0.75rem', color: '#94a3b8', textAlign: 'right' }}>{item.lastUpdated}</div>}
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between', color: '#cbd5e1' }}>
                          <span style={{ fontSize: '0.85rem' }}>尚未存放膜料</span>
                          <Plus size={16} />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </main>
          </div>
        )}
        
        {activeTab === 'purchases' && (
          <div className="glass-panel" style={{ padding: isMobile ? '16px' : '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
               <h3 style={{ margin: 0, fontSize: isMobile ? '1.1rem' : '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <ShoppingCart size={20} color="var(--primary)" /> 叫貨採購
               </h3>
               <button className="btn" onClick={() => setIsPurchaseModalOpen(true)} style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.8rem', padding: '8px 16px' }}>
                 <Plus size={16} /> 新增
               </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {purchaseRecords.length > 0 ? purchaseRecords.map(rec => (
                <div key={rec.id} style={{ padding: '16px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8', fontWeight: 'bold' }}>{rec.orderDate}</span>
                    <span style={{ fontSize: '0.75rem', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px', color: '#64748b' }}>數量: {rec.quantity}</span>
                  </div>
                  <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#1e293b' }}>{rec.itemName}</div>
                  {rec.notes && <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{rec.notes}</div>}
                </div>
              )) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>尚無紀錄</div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          <div className="glass-panel" style={{ padding: isMobile ? '16px' : '24px', borderRadius: '16px' }}>
            <h3 style={{ margin: '0 0 20px 0', fontSize: isMobile ? '1.1rem' : '1.25rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Clock size={20} color="var(--primary)" /> 異動紀錄
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {inventoryLogs.length > 0 ? inventoryLogs.map(log => (
                <div key={log.id} style={{ display: 'flex', gap: '12px', padding: '12px', background: '#fff', border: '1px solid #f1f5f9', borderRadius: '10px' }}>
                  <div style={{ 
                    width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: log.action === 'add' ? '#ecfdf5' : log.action === 'remove' ? '#fef2f2' : '#eff6ff',
                    color: log.action === 'add' ? '#10b981' : log.action === 'remove' ? '#ef4444' : '#3b82f6'
                  }}>
                    {log.action === 'add' ? <ArrowUpRight size={16} /> : log.action === 'remove' ? <ArrowDownRight size={16} /> : <RefreshCw size={16} />}
                  </div>
                  <div>
                    <div style={{ fontSize: '0.9rem', fontWeight: '600', color: '#334155' }}>{log.details}</div>
                    <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginTop: '2px' }}>{log.timestamp} • {log.operator}</div>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '40px', color: '#94a3b8' }}>無異動紀錄</div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Purchase Modal */}
      {isPurchaseModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: isMobile ? '24px' : '32px' }}>
            <h2 style={{ marginBottom: '24px', fontSize: '1.25rem' }}>新增叫貨登記</h2>
            <form onSubmit={handlePurchaseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">日期</label>
                <input type="date" className="form-control" value={purchaseForm.orderDate} onChange={e => setPurchaseForm({...purchaseForm, orderDate: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">品項名稱</label>
                <input type="text" className="form-control" placeholder="廠牌色號 / 配件名稱" value={purchaseForm.itemName} onChange={e => setPurchaseForm({...purchaseForm, itemName: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">數量</label>
                <input type="text" className="form-control" value={purchaseForm.quantity} onChange={e => setPurchaseForm({...purchaseForm, quantity: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">備註</label>
                <textarea className="form-control" style={{ minHeight: '60px' }} value={purchaseForm.notes} onChange={e => setPurchaseForm({...purchaseForm, notes: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsPurchaseModalOpen(false)} style={{ flex: 1 }}>取消</button>
                <button type="submit" className="btn" style={{ flex: 2, background: 'var(--primary)', color: '#fff' }}>確認登記</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Inventory Modal */}
      {isEditModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '20px' }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: isMobile ? '24px' : '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.25rem' }}>{activeZone}{activeSection}-{editingItem?.location?.slot} 儲位</h2>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}>
                 <X size={24} color="#94a3b8" />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">廠牌</label>
                <input type="text" className="form-control" placeholder="3M, AX, STEK..." value={editingItem?.brand || ''} onChange={(e) => setEditingItem(prev => prev ? {...prev, brand: e.target.value} : null)} required />
              </div>
              <div className="form-group">
                <label className="form-label">顏色</label>
                <input type="text" className="form-control" placeholder="冰川藍, 啞光黑..." value={editingItem?.color || ''} onChange={(e) => setEditingItem(prev => prev ? {...prev, color: e.target.value} : null)} required />
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">長度 (M)</label>
                  <input type="number" step="0.01" className="form-control" value={editingItem?.currentMeters || 0} onChange={(e) => setEditingItem(prev => prev ? {...prev, currentMeters: Number(e.target.value)} : null)} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">規格</label>
                  <input type="text" className="form-control" placeholder="1.52m x 15m" value={editingItem?.size || ''} onChange={(e) => setEditingItem(prev => prev ? {...prev, size: e.target.value} : null)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">備註</label>
                <textarea className="form-control" style={{ minHeight: '60px' }} value={editingItem?.notes || ''} onChange={(e) => setEditingItem(prev => prev ? {...prev, notes: e.target.value} : null)} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsEditModalOpen(false)} style={{ flex: 1 }}>取消</button>
                {inventory.find(i => i.id === editingItem?.id) && (
                  <button type="button" onClick={() => { if(window.confirm('確定要移除此儲位的膜料嗎？')) { onRemoveInventory(editingItem!.id!); setIsEditModalOpen(false); } }} style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0 12px', borderRadius: '8px', cursor: 'pointer' }}>
                    <Trash2 size={20} />
                  </button>
                )}
                <button type="submit" className="btn" style={{ flex: 2, background: 'var(--primary)', color: '#fff' }}>儲存</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

const X = ({ size, color }: { size: number, color: string }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"></line>
    <line x1="6" y1="6" x2="18" y2="18"></line>
  </svg>
);
