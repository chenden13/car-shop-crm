import React, { useState } from 'react';
import type { FilmInventory, StorageLocation, InventoryLog, Role } from '../types';
import { 
  Package, Search, Plus, MapPin, Edit2, Trash2, 
  ChevronRight, Box, Layers, Warehouse, Info, Clock, History as HistoryIcon,
  ArrowUpRight, ArrowDownRight, RefreshCw
} from 'lucide-react';

interface InventoryPageProps {
  inventory: FilmInventory[];
  inventoryLogs?: InventoryLog[];
  userRole?: Role;
  onUpdateInventory: (item: FilmInventory) => void;
  onAddInventory: (item: FilmInventory) => void;
  onRemoveInventory: (id: string) => void;
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
  inventory, inventoryLogs = [], userRole, onUpdateInventory, onAddInventory, onRemoveInventory, onBack 
}) => {
  const [activeTab, setActiveTab] = useState<'storage' | 'history'>('storage');
  const [activeZone, setActiveZone] = useState<ZoneKey>('A');

  const [activeSection, setActiveSection] = useState(1);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<FilmInventory> | null>(null);

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
        size: '',
        location: { zone, section, slot },
        lastUpdated: new Date().toISOString().split('T')[0]
      });
    }
    setIsEditModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingItem && editingItem.id) {
      const isNew = !inventory.find(i => i.id === editingItem.id);
      if (isNew) {
        onAddInventory(editingItem as FilmInventory);
      } else {
        onUpdateInventory(editingItem as FilmInventory);
      }
      setIsEditModalOpen(false);
      setEditingItem(null);
    }
  };


  return (
    <div style={{ padding: '24px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <button onClick={onBack} style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', padding: 0, marginBottom: '8px', fontWeight: 'bold' }}>
            ← 返回看板
          </button>
          <h1 style={{ margin: 0, fontSize: '2rem', display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Warehouse color="var(--primary)" size={32} /> 膜料庫存與儲位管理
          </h1>
          <p style={{ color: '#64748b', margin: '4px 0 0 0' }}>管理店內存放的各品牌膜料、顏色及其精確位置</p>
        </div>

        {userRole === 'admin' && (
          <div style={{ display: 'flex', background: '#f1f5f9', padding: '4px', borderRadius: '12px', gap: '4px' }}>
            <button 
              onClick={() => setActiveTab('storage')}
              style={{
                border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold',
                background: activeTab === 'storage' ? '#fff' : 'transparent',
                color: activeTab === 'storage' ? 'var(--primary)' : '#64748b',
                boxShadow: activeTab === 'storage' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <Box size={16} /> 儲位管理
            </button>
            <button 
              onClick={() => setActiveTab('history')}
              style={{
                border: 'none', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '0.9rem', fontWeight: 'bold',
                background: activeTab === 'history' ? '#fff' : 'transparent',
                color: activeTab === 'history' ? 'var(--primary)' : '#64748b',
                boxShadow: activeTab === 'history' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none',
                display: 'flex', alignItems: 'center', gap: '6px'
              }}
            >
              <HistoryIcon size={16} /> 異動紀錄
            </button>
          </div>
        )}
      </header>

        {activeTab === 'storage' ? (
        <>
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
                        boxShadow: item ? '0 2px 4px rgba(59, 130, 246, 0.05)' : 'none'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.background = item ? '#dbeafe' : '#f8fafc'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = item ? 'var(--primary)' : '#e2e8f0'; e.currentTarget.style.background = item ? '#eff6ff' : '#fff'; }}
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
                          <div style={{ width: '150px', fontSize: '0.9rem', color: '#64748b' }}>
                            <Layers size={14} style={{ marginRight: '4px' }} /> {item.size}
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

          {/* Edit Modal */}
          {isEditModalOpen && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
              <div className="glass-panel" style={{ width: '450px', padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Box color="var(--primary)" size={24} /> 儲位資訊：{activeZone}{activeSection}-{editingItem?.location?.slot}
                  </h2>
                  <button onClick={() => setIsEditModalOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#94a3b8' }}><X size={24} /></button>
                </div>

                <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <div className="form-group">
                    <label className="form-label">膜料廠牌</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={editingItem?.brand || ''} 
                      placeholder="例如: 3M, AX, STEK..."
                      onChange={(e) => setEditingItem(prev => prev ? {...prev, brand: e.target.value} : null)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">膜料顏色</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={editingItem?.color || ''} 
                      placeholder="例如: 亮面冰川藍, 啞光黑..."
                      onChange={(e) => setEditingItem(prev => prev ? {...prev, color: e.target.value} : null)}
                      required 
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">膜料尺寸</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={editingItem?.size || ''} 
                      placeholder="例如: 1.52m x 15m..."
                      onChange={(e) => setEditingItem(prev => prev ? {...prev, size: e.target.value} : null)}
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">備註</label>
                    <textarea 
                      className="form-control" 
                      style={{ minHeight: '80px' }}
                      value={editingItem?.notes || ''} 
                      onChange={(e) => setEditingItem(prev => prev ? {...prev, notes: e.target.value} : null)}
                    />
                  </div>

                  <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                    <button 
                      type="button" 
                      className="btn btn-outline" 
                      style={{ flex: 1 }}
                      onClick={() => setIsEditModalOpen(false)}
                    >
                      返回 / 取消
                    </button>
                    {inventory.find(i => i.id === editingItem?.id) && (
                      <button 
                        type="button" 
                        onClick={() => { if(editingItem?.id) onRemoveInventory(editingItem.id); setIsEditModalOpen(false); }}
                        style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '0 16px', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                    <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>儲存資訊</button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </>
      ) : (
        /* History View */
        <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}>
              <Clock size={20} color="var(--primary)" /> 庫存進出紀錄 (僅管理員可見)
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
                
                <div style={{ 
                  fontSize: '0.7rem', padding: '4px 8px', borderRadius: '6px', fontWeight: 'bold', textTransform: 'uppercase',
                  background: log.action === 'add' ? '#d1fae5' : log.action === 'remove' ? '#fee2e2' : '#dbeafe',
                  color: log.action === 'add' ? '#065f46' : log.action === 'remove' ? '#991b1b' : '#1e40af'
                }}>
                  {log.action === 'add' ? '新增入庫' : log.action === 'remove' ? '移除出庫' : '異動更新'}
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', padding: '48px', color: '#94a3b8' }}>
                <Info size={32} style={{ marginBottom: '12px', opacity: 0.5 }} />
                <p>目前尚無異動紀錄</p>
              </div>
            )}
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
