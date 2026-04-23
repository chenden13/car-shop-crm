import React, { useState, useEffect } from 'react';
import './App.css';
import { initialCustomers, initialInventory } from './data/mockData';
import { api } from './lib/api';


import type { Customer, StatusType, FilmInventory, User, InventoryLog } from './types';

import { Modal } from './components/Modal';
import { PendingEditForm } from './components/PendingEditForm';
import { InquiryPage } from './components/InquiryPage';
import { ConstructionForm } from './components/ConstructionForm';
import { CompletedForm } from './components/CompletedForm';
import { IntakeForm } from './components/IntakeForm';
import { ArchivePage } from './components/ArchivePage';
import { ConstructionMonitorPage } from './components/ConstructionMonitorPage';
import { ExcelImport } from './components/ExcelImport';
import { PendingExcelImport } from './components/PendingExcelImport';
import { ArchiveEditForm } from './components/ArchiveEditForm';
import { PendingListPage } from './components/PendingListPage';
import { InventoryPage } from './components/InventoryPage';
import { LoginPage } from './components/LoginPage';
import { ActiveConstructionPage } from './components/ActiveConstructionPage';
import { History, Plus, FileUp, Box, LogOut, User as UserIcon, Clock, Archive, Hammer, UserPlus } from 'lucide-react';







function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<FilmInventory[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);
  const [view, setView] = useState<'inquiry' | 'pending' | 'archive' | 'monitor' | 'inventory'>('inquiry');
  const [isLoading, setIsLoading] = useState(true);
  const [importProgress, setImportProgress] = useState<{current: number, total: number} | null>(null);

  useEffect(() => {
    const initCloud = async () => {
      console.log('正在連線至雲端:', 'https://emqtgyntrpounnmssxcf.supabase.co');
      // alert('正在連線至: ' + 'https://emqtgyntrpounnmssxcf.supabase.co'); // 已確認，可暫不彈出
      // 增加超時保護：如果 15 秒內連不上雲端，強行進入離線模式 (針對大量資料優化)
      const timeout = new Promise((_, reject) => setTimeout(() => reject(new Error('雲端連線超時，請檢查網路')), 15000));
      
      try {
        const cloudCustomers = await api.getCustomers().catch(e => { console.error('客戶讀取失敗', e); return []; });
        const cloudInventory = await api.getInventory().catch(e => { console.error('庫存讀取失敗', e); return []; });
        const cloudLogs = await api.getInventoryLogs().catch(e => { console.error('日誌讀取失敗', e); return []; });
        const cloudPurchases = await api.getPurchaseRecords().catch(e => { console.error('叫貨紀錄讀取失敗', e); return []; });
        
        console.log('雲端資料同步完畢:', cloudCustomers?.length, '筆客戶資料');
        setCustomers(cloudCustomers || []);
        setInventory(cloudInventory || []);
        setInventoryLogs(cloudLogs || []);
        setPurchaseRecords(cloudPurchases || []);
      } catch (err: any) {
        console.error('雲端總體初始化失敗:', err);
        alert(`❌ 雲端同步嚴重失敗：\n${err.message}`);
      } finally {
        setIsLoading(false);
      }

    };

    if (currentUser) {
      initCloud();
    }
  }, [currentUser]);





  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isPendingEditModalOpen, setIsPendingEditModalOpen] = useState(false);
  const [isConstructionModalOpen, setIsConstructionModalOpen] = useState(false);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPendingImportModalOpen, setIsPendingImportModalOpen] = useState(false);
  const [isArchiveEditModalOpen, setIsArchiveEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);





  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsPendingEditModalOpen(true);
  };

   const generateCustomerId = () => {
    const list = Array.isArray(customers) ? customers : [];
    return `C-${String(list.length + 1).padStart(3, '0')}`;
  };

  const handleOpenNewModal = () => {
    setSelectedCustomer(null);
    setIsIntakeModalOpen(true);
  };

  const handleAddOrUpdateCustomer = async (target: Customer) => {
    try {
      await api.upsertCustomer(target);
      setCustomers(prev => {
        const exists = prev.find(c => c.id === target.id);
        if (exists) return prev.map(c => c.id === target.id ? target : c);
        return [...prev, target];
      });
    } catch (err) {
      console.error('儲存失敗:', err);
      alert('資料同步失敗，請檢查網路連線');
    }
    
    setIsPendingEditModalOpen(false);
    setIsIntakeModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleGenericUpdate = async (updatedCustomer: Customer) => {
    try {
      await api.upsertCustomer(updatedCustomer);
      setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    } catch (err) {
      console.error('更新失敗:', err);
    }
    setIsConstructionModalOpen(false);
    setIsCompletedModalOpen(false);
    setSelectedCustomer(null);
  };


  const handleImport = async (newCustomers: Customer[]) => {
    setIsImportModalOpen(false);
    setIsPendingImportModalOpen(false);
    
    // 過濾出尚未存在於本地狀態的資料
    const existingIds = new Set(customers.map(c => c.id));
    const filtered = newCustomers.filter(c => !existingIds.has(c.id));

    if (filtered.length === 0) {
      alert('沒有提取到任何新資料，或者編號皆已存在。');
      return;
    }

    try {
      setImportProgress({ current: 0, total: filtered.length });
      // 依序寫入至雲端資料庫 (使用 for...of 避免短時間發出上百個請求導致被阻擋)
      for (let i = 0; i < filtered.length; i++) {
        await api.upsertCustomer(filtered[i]);
        setImportProgress({ current: i + 1, total: filtered.length });
      }
      
      // 雲端確認寫入成功後，一併更新前端畫面
      setCustomers(prev => [...prev, ...filtered]);
      setImportProgress(null);
      alert(`✅ 成功匯入並同步 ${filtered.length} 筆資料至雲端資料庫！`);

    } catch (err) {
      console.error('雲端同步失敗:', err);
      alert('上傳雲端失敗，請檢查網路連線。您可能需要重新整理網頁再試一次。');
      setImportProgress(null);
    }
  };

  const handleUpdateInventory = async (item: FilmInventory, detailsOverride?: string) => {
    const log: InventoryLog = {
      id: `LOG-${Date.now()}`,
      itemId: item.id,
      action: 'update',
      details: detailsOverride || `更新 ${item.brand} ${item.color} (${item.location.zone}${item.location.section}-${item.location.slot})`,
      timestamp: new Date().toLocaleString(),
      operator: currentUser?.name || '未知'
    };

    try {
      await Promise.all([
        api.updateInventory(item),
        api.addInventoryLog(log)
      ]);
      setInventory(prev => prev.map(i => i.id === item.id ? item : i));
      setInventoryLogs(prev => [log, ...prev]);
    } catch (err) {
      console.error('同步庫存失敗:', err);
    }
  };

  const handleAddInventory = async (item: FilmInventory) => {
    const log: InventoryLog = {
      id: `LOG-${Date.now()}`,
      itemId: item.id,
      action: 'add',
      details: `新增 ${item.brand} ${item.color} 於 ${item.location.zone}${item.location.section}-${item.location.slot}`,
      timestamp: new Date().toLocaleString(),
      operator: currentUser?.name || '未知'
    };

    try {
      await Promise.all([
        api.updateInventory(item),
        api.addInventoryLog(log)
      ]);
      setInventory(prev => [...prev, item]);
      setInventoryLogs(prev => [log, ...prev]);
    } catch (err) {
      console.error('新增庫存失敗:', err);
    }
  };


  const handleRemoveInventory = async (id: string) => {
    const item = inventory.find(i => i.id === id);
    if (!item) return;

    const log: InventoryLog = {
      id: `LOG-${Date.now()}`,
      itemId: id,
      action: 'remove',
      details: `移除項目 ${item.brand} ${item.color} (${item.location.zone}${item.location.section}-${item.location.slot})`,
      timestamp: new Date().toLocaleString(),
      operator: currentUser?.name || '未知'
    };

    try {
      await Promise.all([
        api.deleteInventory(id),
        api.addInventoryLog(log)
      ]);
      setInventory(prev => prev.filter(i => i.id !== id));
      setInventoryLogs(prev => [log, ...prev]);
    } catch (err) {
      console.error('移除庫存失敗:', err);
      alert('移除失敗，請稍後再試。');
    }
  };

  const handleAddPurchaseRecord = async (record: PurchaseRecord) => {
    try {
      await api.addPurchaseRecord(record);
      setPurchaseRecords(prev => [record, ...prev]);
    } catch (err) {
      console.error('紀錄叫貨失敗:', err);
    }
  };


  const handleLogout = () => {
    setCurrentUser(null);
    setView('pending');
  };



  if (!currentUser) return <LoginPage onLogin={setCurrentUser} />;
  
  if (isLoading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 'bold' }}>雲端同步中...</p>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  return (

    <div className="app-container">
      {importProgress && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(255,255,255,0.9)', zIndex: 9999, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
          <h2 style={{ marginBottom: '20px', color: '#0f172a' }}>🚀 資料上傳雲端中，請勿關閉網頁...</h2>
          <div style={{ width: '300px', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden', marginBottom: '10px' }}>
            <div style={{ width: `${(importProgress.current / importProgress.total) * 100}%`, height: '100%', background: '#e11d48', transition: 'width 0.2s' }}></div>
          </div>
          <p style={{ color: '#64748b', fontWeight: 'bold' }}>{importProgress.current} / {importProgress.total} 筆已完成</p>
        </div>
      )}
      <header className="app-header glass-panel" style={{ padding: '16px 24px', height: 'auto', gap: '30px' }}>
        <div className="brand" style={{ gap: '15px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>C</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ margin: 0, fontSize: '1.4rem', letterSpacing: '-0.5px' }}>CarShop CRM</h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>VERSION 2.1 PRO</span>
          </div>
        </div>

        <div className="header-actions" style={{ display: 'flex', gap: '24px', alignItems: 'center', flex: 1, justifyContent: 'space-between' }}>
          <div className="nav-group">
            <button className={`nav-tab ${view === 'inquiry' ? 'active' : ''}`} onClick={() => setView('inquiry')}>
              <UserPlus size={18} /> 諮詢進件區
            </button>
            <button className={`nav-tab ${view === 'pending' ? 'active' : ''}`} onClick={() => setView('pending')}>
              <Clock size={18} /> 待施工排程
            </button>
            <button className={`nav-tab ${view === 'monitor' ? 'active' : ''}`} onClick={() => setView('monitor')}>
              <Hammer size={17} /> 現場施工監控
            </button>
            <button className={`nav-tab ${view === 'inventory' ? 'active' : ''}`} onClick={() => setView('inventory')}>
              <Box size={17} /> 膜料庫存
            </button>
            <button className={`nav-tab ${view === 'archive' ? 'active' : ''}`} onClick={() => setView('archive')}>
              <History size={17} /> 完工檔案
            </button>
          </div>

          <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 8px' }}></div>

          <button className="btn btn-primary" style={{ padding: '10px 24px', borderRadius: '12px', background: 'var(--accent)', borderColor: 'var(--accent)', fontWeight: 'bold' }} onClick={handleOpenNewModal}>
            <Plus size={18} /> 新增客戶
          </button>

          <div style={{ marginLeft: '12px', display: 'flex', alignItems: 'center', gap: '15px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>{currentUser.role === 'admin' ? 'ADMIN' : 'STAFF'}</div>
            </div>
            <button className="btn" onClick={handleLogout} style={{ background: '#f8fafc', color: '#64748b', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center' }}>
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      {view === 'inquiry' ? (
        <InquiryPage 
          customers={customers}
          onEditCustomer={handleEditCustomer}
          userRole={currentUser.role}
        />
      ) : view === 'monitor' ? (
        <ActiveConstructionPage
          customers={customers}
          onEditCustomer={(c) => {
            setSelectedCustomer(c);
            setIsConstructionModalOpen(true);
          }}
        />
      ) : view === 'pending' ? (
        <PendingListPage
          customers={customers}
          onEditCustomer={handleEditCustomer}
          userRole={currentUser.role}
          onImportClick={() => setIsPendingImportModalOpen(true)}
        />
      ) : view === 'archive' ? (
        <ArchivePage 
          customers={customers} 
          onBack={() => setView('pending')} 
          onUpdate={(c) => setCustomers(prev => prev.map(x => x.id === c.id ? c : x))}
          onEdit={(c) => {
            setSelectedCustomer(c);
            setIsArchiveEditModalOpen(true);
          }}
          onViewDetail={(c) => { 
            setSelectedCustomer(c); 
            setIsPreviewModalOpen(true); 
          }} 
          userRole={currentUser.role}
          onImportClick={() => setIsImportModalOpen(true)}
        />

      ) : view === 'inventory' ? (
        <InventoryPage 
          inventory={inventory}
          inventoryLogs={inventoryLogs}
          purchaseRecords={purchaseRecords}
          userRole={currentUser.role}
          onAddInventory={handleAddInventory}
          onUpdateInventory={handleUpdateInventory}
          onRemoveInventory={handleRemoveInventory}
          onAddPurchaseRecord={handleAddPurchaseRecord}
          onBack={() => setView('pending')}
        />

      ) : (

        <ConstructionMonitorPage 
          customers={customers} 
          onBack={() => setView('pending')}
          onEdit={(c) => {
            setSelectedCustomer(c);
            setIsConstructionModalOpen(true);
          }}
        />


      )}



      {/* New Inquiry / Intake Modal */}
      <Modal isOpen={isIntakeModalOpen} onClose={() => setIsIntakeModalOpen(false)} title="新增客戶資料表單">
        <IntakeForm 
          onSuggestId={generateCustomerId()}
          onSubmit={(newCustomer) => {
            handleAddOrUpdateCustomer(newCustomer);
          }}
          onCancel={() => setIsIntakeModalOpen(false)}
        />
      </Modal>

      {/* Unified Pending Edit Modal */}
      <Modal isOpen={isPendingEditModalOpen} onClose={() => setIsPendingEditModalOpen(false)} title={selectedCustomer ? "修改待施工案件" : "新增客戶 / 預約單"}>
        <PendingEditForm 
          customer={selectedCustomer} 
          onSuggestId={generateCustomerId()}
          onSubmit={(updatedCustomer, moveToConstruction) => {
             handleAddOrUpdateCustomer(updatedCustomer);
             if (moveToConstruction) {
                // If it moved to construction, we might want some feedback or different behavior, 
                // but handleAddOrUpdate already saves it with the new status.
             }
          }}
          onCancel={() => setIsPendingEditModalOpen(false)}
        />
      </Modal>


      <Modal isOpen={isConstructionModalOpen} onClose={() => setIsConstructionModalOpen(false)} title="施工檢核與照片上傳">
        {selectedCustomer && (
          <ConstructionForm 
            customer={selectedCustomer} 
            onSubmit={handleGenericUpdate} 
            onCancel={() => setIsConstructionModalOpen(false)} 
          />
        )}
      </Modal>

      <Modal isOpen={isCompletedModalOpen} onClose={() => setIsCompletedModalOpen(false)} title="售後關懷與結案設定">
        {selectedCustomer && (
          <CompletedForm 
            customer={selectedCustomer} 
            onSubmit={handleGenericUpdate} 
            onCancel={() => setIsCompletedModalOpen(false)} 
          />
        )}
      </Modal>

      <Modal isOpen={isArchiveEditModalOpen} onClose={() => setIsArchiveEditModalOpen(false)} title="微調完工存檔資料">
        {selectedCustomer && (
          <ArchiveEditForm 
            customer={selectedCustomer} 
            onSubmit={(c) => {
              handleGenericUpdate(c);
              setIsArchiveEditModalOpen(false);
            }} 
            onCancel={() => setIsArchiveEditModalOpen(false)} 
            userRole={currentUser.role}
          />

        )}
      </Modal>

      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="完工資料 Excel 匯入">
        <ExcelImport 
          onImport={handleImport} 
          onCancel={() => setIsImportModalOpen(false)} 
        />
      </Modal>

      <Modal isOpen={isPendingImportModalOpen} onClose={() => setIsPendingImportModalOpen(false)} title="排程資料 Excel 匯入">
        <PendingExcelImport 
          onImport={handleImport} 
          onCancel={() => setIsPendingImportModalOpen(false)} 
        />
      </Modal>

    </div>

  );
}

export default App;
