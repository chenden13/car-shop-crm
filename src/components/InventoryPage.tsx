import React, { useState } from 'react';
import type { FilmInventory, StorageLocation, InventoryLog, Role, PurchaseRecord } from '../types';
import { 
  Package, Search, Plus, MapPin, Trash2, 
  Box, Layers, Warehouse, Info, Clock, History as HistoryIcon,
  ArrowUpRight, ArrowDownRight, RefreshCw, ShoppingCart, User
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

  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, marginBottom: '8px', fontWeight: 'bold' }}>
            ← 返回看板
          </button>
          <h1 style={{ margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Warehouse color="var(--primary)" size={32} /> 膜料庫存管理
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>管理店內存料位置與叫貨採購紀錄</p>
        </div>

        {userRole === 'admin' && (
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', gap: '4px' }}>
            <button 
              onClick={() => setActiveTab('storage')}
              style={{
                border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold',
                background: activeTab === 'storage' ? '#fff' : 'transparent',
                color: activeTab === 'storage' ? 'var(--primary)' : '#64748b',
                boxShadow: activeTab === 'storage' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Box size={16} /> 儲位圖
            </button>
            <button 
              onClick={() => setActiveTab('purchases')}
              style={{
                border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold',
                background: activeTab === 'purchases' ? '#fff' : 'transparent',
                color: activeTab === 'purchases' ? 'var(--primary)' : '#64748b',
                boxShadow: activeTab === 'purchases' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <ShoppingCart size={16} /> 叫貨登記
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              style={{
                border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 'bold',
                background: activeTab === 'history' ? '#fff' : 'transparent',
                color: activeTab === 'history' ? 'var(--primary)' : '#64748b',
                boxShadow: activeTab === 'history' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <HistoryIcon size={16} /> 庫存異動
            </button>
          </div>
        )}
      </header>

      <div style={{ position: 'relative' }}>
        {activeTab === 'storage' && (
          /* Original Storage View code */
          <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: '24px' }}>
            <aside style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {Object.entries(ZONE_CONFIG).map(([key, config]) => (
                <button 
                  key={key}
                  onClick={() => { setActiveZone(key as ZoneKey); setActiveSection(1); }}
                  style={{
                    display: 'flex', flexDirection: 'column', padding: '16px', borderRadius: '12px', textAlign: 'left',
                    background: activeZone === key ? 'var(--primary)' : '#fff',
                    color: activeZone === key ? '#fff' : '#1e293b',
                    border: '1px solid',
                    borderColor: activeZone === key ? 'var(--primary)' : '#e2e8f0',
                    cursor: 'pointer', transition: 'all 0.2s',
                    boxShadow: activeZone === key ? '0 4px 12px rgba(59, 130, 246, 0.3)' : 'none'
                  }}
                >
                  <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' }}>區域 {key}</div>
                  <div style={{ fontSize: '0.8rem', opacity: activeZone === key ? 0.9 : 0.6 }}>{config.name}</div>
                </button>
              ))}
            </aside>

            <main className="glass-panel" style={{ padding: '24px', minHeight: '600px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid #f1f5f9', paddingBottom: '16px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <MapPin color="var(--primary)" size={20} />
                  <span style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>當前區域：{ZONE_CONFIG[activeZone].name}</span>
                </div>
                
                <div style={{ display: 'flex', gap: '8px' }}>
                  {Array.from({ length: ZONE_CONFIG[activeZone].sections }, (_, i) => i + 1).map(s => (
                    <button
                      key={s}
                      onClick={() => setActiveSection(s)}
                      style={{
                        padding: '6px 16px', borderRadius: '6px', border: '1px solid',
                        background: activeSection === s ? '#1e293b' : '#fff',
                        color: activeSection === s ? '#fff' : '#64748b',
                        borderColor: activeSection === s ? '#1e293b' : '#e2e8f0',
                        cursor: 'pointer', fontWeight: 'bold'
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
                        display: 'flex', alignItems: 'center', gap: '16px', borderRadius: '10px', border: '1px solid',
                        borderColor: item ? 'var(--primary)' : '#e2e8f0',
                        background: item ? '#eff6ff' : '#fff',
                        padding: '12px 20px', cursor: 'pointer', transition: 'all 0.2s',
                        boxShadow: item ? '0 2px 4px rgba(59, 130, 246, 0.05)' : 'none',
                        position: 'relative'
                      }}
                    >
                      <div style={{ width: '60px', fontWeight: '800', color: '#94a3b8', fontSize: '1rem' }}>
                        #{slotNum}
                      </div>
                      
                      {item ? (
                        <div style={{ display: 'flex', flex: 1, alignItems: 'center', gap: '24px' }}>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 'bold', fontSize: '1.05rem', color: '#1e293b' }}>{item.color}</div>
                            <div style={{ fontSize: '0.85rem', color: '#64748b' }}>{item.brand}</div>
                          </div>
                          
                          {/* Meter adjustment controls */}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#fff', padding: '4px 10px', borderRadius: '25px', border: '1px solid #e2e8f0' }}>
                             <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                               <button 
                                 onClick={(e) => handleAdjustMeters(item, -0.1, e)}
                                 style={{ width: '35px', height: '18px', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                 title="減少 10cm"
                               >-0.1</button>
                               <button 
                                 onClick={(e) => handleAdjustMeters(item, -1, e)}
                                 style={{ width: '35px', height: '18px', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#fee2e2', color: '#dc2626', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                 title="減少 1M"
                               >-1M</button>
                             </div>

                             <div style={{ minWidth: '50px', textAlign: 'center' }}>
                               <div style={{ fontWeight: '800', color: 'var(--primary)', fontSize: '1rem' }}>{item.currentMeters || 0}</div>
                               <div style={{ fontSize: '0.6rem', color: '#94a3b8', marginTop: '-2px' }}>METERS</div>
                             </div>

                             <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                               <button 
                                 onClick={(e) => handleAdjustMeters(item, 0.1, e)}
                                 style={{ width: '35px', height: '18px', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#fff', color: '#64748b', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                 title="增加 10cm"
                               >+0.1</button>
                               <button 
                                 onClick={(e) => handleAdjustMeters(item, 1, e)}
                                 style={{ width: '35px', height: '18px', borderRadius: '4px', border: '1px solid #e2e8f0', background: '#ecfdf5', color: '#059669', fontSize: '0.7rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                                 title="增加 1M"
                               >+1M</button>
                             </div>
                          </div>

                          <div style={{ width: '120px', fontSize: '0.8rem', color: '#94a3b8', textAlign: 'right' }}>
                            更新: {item.lastUpdated}
                          </div>
                        </div>
                      ) : (
                        <div style={{ display: 'flex', flex: 1, alignItems: 'center', justifyContent: 'space-between', color: '#cbd5e1' }}>
                          <span style={{ fontSize: '0.9rem' }}>尚未存放膜料</span>
                          <Plus size={18} />
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
          /* Purchase Records View */
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
               <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                 <ShoppingCart size={20} color="var(--primary)" /> 叫貨採購登記
               </h3>
               <button className="btn" onClick={() => setIsPurchaseModalOpen(true)} style={{ background: 'var(--primary)', color: '#fff', fontSize: '0.85rem' }}>
                 <Plus size={16} /> 新增叫貨項目
               </button>
            </div>

            <div style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '120px 2fr 1fr 2fr', padding: '12px 20px', background: '#f8fafc', fontWeight: 'bold', fontSize: '0.8rem', color: '#64748b', borderBottom: '1px solid #e2e8f0' }}>
                <div>叫貨日期</div>
                <div>品項名稱 (膜料/配件)</div>
                <div>數量</div>
                <div>備註</div>
              </div>
              <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
                {purchaseRecords.length > 0 ? purchaseRecords.map((rec, idx) => (
                  <div key={rec.id} style={{ display: 'grid', gridTemplateColumns: '120px 2fr 1fr 2fr', padding: '16px 20px', fontSize: '0.88rem', borderBottom: '1px solid #f1f5f9', alignItems: 'center', background: idx % 2 === 0 ? '#fff' : '#fafafa' }}>
                    <div style={{ color: '#64748b' }}>{rec.orderDate}</div>
                    <div style={{ fontWeight: 'bold', color: '#1e293b' }}>{rec.itemName}</div>
                    <div>{rec.quantity}</div>
                    <div style={{ color: '#64748b' }}>{rec.notes || '-'}</div>
                  </div>
                )) : (
                  <div style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>尚無叫貨紀錄</div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'history' && (
          /* History View */
          <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
                <Clock size={20} color="var(--primary)" /> 庫存進出與儲位異動紀錄
              </h3>
              <span style={{ fontSize: '0.85rem', color: '#94a3b8' }}>共 {inventoryLogs.length} 筆異動</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {inventoryLogs.length > 0 ? inventoryLogs.map(log => (
                <div key={log.id} style={{ display: 'flex', alignItems: 'center', gap: '16px', padding: '16px', borderRadius: '12px', background: '#fff', border: '1px solid #f1f5f9' }}>
                  <div style={{ 
                    width: '40px', height: '40px', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: log.action === 'add' ? '#ecfdf5' : log.action === 'remove' ? '#fef2f2' : '#eff6ff',
                    color: log.action === 'add' ? '#10b981' : log.action === 'remove' ? '#ef4444' : '#3b82f6'
                  }}>
                    {log.action === 'add' ? <ArrowUpRight size={20} /> : log.action === 'remove' ? <ArrowDownRight size={20} /> : <RefreshCw size={20} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.95rem', fontWeight: '600', color: '#334155' }}>{log.details}</div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                      經辦人: <span style={{ color: '#64748b', fontWeight: 'bold' }}>{log.operator}</span> • {log.timestamp}
                    </div>
                  </div>
                </div>
              )) : (
                <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>尚無異動紀錄</div>
              )}
            </div>
          </div>
        )}
      </div>


      {/* Purchase Modal */}
      {isPurchaseModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '450px', padding: '32px' }}>
            <h2 style={{ marginBottom: '24px' }}>新增叫貨登記</h2>
            <form onSubmit={handlePurchaseSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">日期</label>
                <input type="date" className="form-control" value={purchaseForm.orderDate} onChange={e => setPurchaseForm({...purchaseForm, orderDate: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">品項名稱 (膜料廠牌色號 / 配件名稱)</label>
                <input type="text" className="form-control" placeholder="例如: AX 亞光黑 1.52m x 15m" value={purchaseForm.itemName} onChange={e => setPurchaseForm({...purchaseForm, itemName: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">數量 (例如: 1 捲 / 5M / 2 個)</label>
                <input type="text" className="form-control" value={purchaseForm.quantity} onChange={e => setPurchaseForm({...purchaseForm, quantity: e.target.value})} required />
              </div>
              <div className="form-group">
                <label className="form-label">備註</label>
                <textarea className="form-control" style={{ minHeight: '80px' }} value={purchaseForm.notes} onChange={e => setPurchaseForm({...purchaseForm, notes: e.target.value})} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsPurchaseModalOpen(false)} style={{ flex: 1 }}>取消</button>
                <button type="submit" className="btn" style={{ flex: 2, background: 'var(--primary)', color: '#fff' }}>確認登記</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Inventory Modal */}
      {isEditModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-panel" style={{ width: '450px', padding: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
              <h2 style={{ margin: 0, fontSize: '1.4rem' }}>儲位資訊：{activeZone}{activeSection}-{editingItem?.location?.slot}</h2>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}>
                 <X size={24} color="#94a3b8" />
              </button>
            </div>

            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div className="form-group">
                <label className="form-label">膜料廠牌</label>
                <input type="text" className="form-control" placeholder="3M, AX, STEK..." value={editingItem?.brand || ''} onChange={(e) => setEditingItem(prev => prev ? {...prev, brand: e.target.value} : null)} required />
              </div>
              <div className="form-group">
                <label className="form-label">顏色</label>
                <input type="text" className="form-control" placeholder="冰川藍, 啞光黑..." value={editingItem?.color || ''} onChange={(e) => setEditingItem(prev => prev ? {...prev, color: e.target.value} : null)} required />
              </div>
              
              <div style={{ display: 'flex', gap: '12px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">目前長度 (公尺/M)</label>
                  <input type="number" step="0.01" className="form-control" value={editingItem?.currentMeters || 0} onChange={(e) => setEditingItem(prev => prev ? {...prev, currentMeters: Number(e.target.value)} : null)} />
                </div>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">完整尺寸規格</label>
                  <input type="text" className="form-control" placeholder="1.52m x 15m" value={editingItem?.size || ''} onChange={(e) => setEditingItem(prev => prev ? {...prev, size: e.target.value} : null)} />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">備註</label>
                <textarea className="form-control" style={{ minHeight: '80px' }} value={editingItem?.notes || ''} onChange={(e) => setEditingItem(prev => prev ? {...prev, notes: e.target.value} : null)} />
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <button type="button" className="btn btn-outline" onClick={() => setIsEditModalOpen(false)} style={{ flex: 1 }}>取消</button>
                
                {inventory.find(i => i.id === editingItem?.id) && (
                  <button 
                    type="button" 
                    onClick={() => { if(window.confirm('確定要移除此儲位的膜料嗎？')) { onRemoveInventory(editingItem!.id!); setIsEditModalOpen(false); } }}
                    style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0 16px', borderRadius: '8px', cursor: 'pointer' }}
                  >
                    <Trash2 size={20} />
                  </button>
                )}
                
                <button type="submit" className="btn" style={{ flex: 2, background: 'var(--primary)', color: '#fff' }}>儲存內容</button>
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
