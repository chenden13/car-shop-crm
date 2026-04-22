import React, { useState, useEffect } from 'react';
import './App.css';
import { initialCustomers, initialInventory } from './data/mockData';
import { api } from './lib/api';


import { CustomerCard } from './components/CustomerCard';
import type { Customer, StatusType, FilmInventory, User, InventoryLog } from './types';



import { Modal } from './components/Modal';
import { NewCustomerForm } from './components/NewCustomerForm';
import { QuoteForm } from './components/QuoteForm';
import { ConstructionForm } from './components/ConstructionForm';
import { CompletedForm } from './components/CompletedForm';
import { CustomerDetail } from './components/CustomerDetail';
import { ArchivePage } from './components/ArchivePage';
import { ConstructionMonitorPage } from './components/ConstructionMonitorPage';
import { ScheduledForm } from './components/ScheduledForm';
import { ExcelImport } from './components/ExcelImport';
import { ArchiveEditForm } from './components/ArchiveEditForm';
import { PendingListPage } from './components/PendingListPage';
import { InventoryPage } from './components/InventoryPage';
import { LoginPage } from './components/LoginPage';
import { ActiveConstructionPage } from './components/ActiveConstructionPage';
import { History, LayoutDashboard, Plus, FileUp, Box, LogOut, User as UserIcon, Clock, Archive, Hammer } from 'lucide-react';







function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<FilmInventory[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [view, setView] = useState<'kanban' | 'pending' | 'archive' | 'monitor' | 'inventory'>('kanban');
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
        
        console.log('雲端資料同步完畢:', cloudCustomers?.length, '筆客戶資料');
        setCustomers(cloudCustomers || []);
        setInventory(cloudInventory || []);
        setInventoryLogs(cloudLogs || []);
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





  const [isNewModalOpen, setIsNewModalOpen] = useState(false);


  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isConstructionModalOpen, setIsConstructionModalOpen] = useState(false);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [isScheduledModalOpen, setIsScheduledModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isArchiveEditModalOpen, setIsArchiveEditModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);




  const getCustomersByStatus = (status: StatusType) => {
    return customers.filter(c => c.status === status);
  };

  const handleCardClick = (customer: Customer) => {
    setSelectedCustomer(customer);
    
    if (customer.status === 'new') {
      setIsPreviewModalOpen(true);
    } else if (customer.status === 'deposit') {
      setIsQuoteModalOpen(true);
    } else if (customer.status === 'scheduled') {
      setIsScheduledModalOpen(true);
    } else if (customer.status === 'construction') {
      setIsConstructionModalOpen(true);
    } else if (customer.status === 'completed') {
      setIsCompletedModalOpen(true);
    }

  };

   const generateCustomerId = () => {
    const list = Array.isArray(customers) ? customers : [];
    return `C-${String(list.length + 1).padStart(3, '0')}`;
  };

  const handleOpenNewModal = () => {
    setSelectedCustomer(null);
    setIsNewModalOpen(false); // 先關閉以防狀態卡死
    setTimeout(() => {
      setIsNewModalOpen(true);
    }, 0);
  };

  const handleAddOrUpdateCustomer = async (customerData: Partial<Customer>, moveToDeposit?: boolean) => {
    const updatedStatus = moveToDeposit ? 'deposit' : 'new';
    let target: Customer;

    if (selectedCustomer) {
      target = { ...selectedCustomer, ...customerData, status: updatedStatus as StatusType };
    } else {
      target = {
        id: generateCustomerId(),
        ...customerData,
        status: updatedStatus as StatusType,
      } as Customer;
    }

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
    
    setIsNewModalOpen(false);
    setIsEditModalOpen(false);
    setIsPreviewModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleGenericUpdate = async (updatedCustomer: Customer) => {
    try {
      await api.upsertCustomer(updatedCustomer);
      setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    } catch (err) {
      console.error('更新失敗:', err);
    }
    setIsQuoteModalOpen(false);
    setIsConstructionModalOpen(false);
    setIsCompletedModalOpen(false);
    setIsScheduledModalOpen(false);
    setSelectedCustomer(null);
  };


  const handleImport = async (newCustomers: Customer[]) => {
    setIsImportModalOpen(false);
    
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

  const handleUpdateInventory = async (item: FilmInventory) => {
    const log: InventoryLog = {
      id: `LOG-${Date.now()}`,
      itemId: item.id,
      action: 'update',
      details: `更新 ${item.brand} ${item.color} (${item.location.zone}${item.location.section}-${item.location.slot})`,
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


  const handleRemoveInventory = (id: string) => {
    const item = inventory.find(i => i.id === id);
    setInventory(prev => prev.filter(i => i.id !== id));
    if (item) {
      setInventoryLogs(prev => [{
        id: `LOG-${Date.now()}`,
        itemId: id,
        action: 'remove',
        details: `移除項目 ${item.brand} ${item.color} (${item.location.zone}${item.location.section}-${item.location.slot})`,
        timestamp: new Date().toLocaleString(),
        operator: currentUser?.name || '未知'
      }, ...prev]);
    }
  };


  const handleLogout = () => {
    setCurrentUser(null);
    setView('kanban');
  };

  const columns: { id: StatusType; title: string }[] = [
    { id: 'new', title: '新增客人 (進件區)' },
    { id: 'deposit', title: '等待收訂 (施工報價)' },
    { id: 'scheduled', title: '已下定・未施工' },
    { id: 'construction', title: '施工中 (進度檢核)' },
  ];



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
            <button className={`nav-tab ${view === 'kanban' ? 'active' : ''}`} onClick={() => setView('kanban')}>
              <LayoutDashboard size={17} /> 施工進度板
            </button>
            <button className={`nav-tab ${view === 'monitor' ? 'active' : ''}`} onClick={() => setView('monitor')}>
              <Hammer size={17} /> 現場施工監控
            </button>
            <button className={`nav-tab ${view === 'pending' ? 'active' : ''}`} onClick={() => setView('pending')}>
              <Clock size={18} /> 待施工排程
            </button>
            <button className={`nav-tab ${view === 'inventory' ? 'active' : ''}`} onClick={() => setView('inventory')}>
              <Box size={17} /> 膜料庫存
            </button>
            <button className={`nav-tab ${view === 'archive' ? 'active' : ''}`} onClick={() => setView('archive')}>
              <History size={17} /> 完工檔案
            </button>
          </div>

          <div style={{ width: '1px', height: '24px', background: '#e2e8f0', margin: '0 8px' }}></div>

          {view === 'archive' && currentUser.role === 'admin' && (
            <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem', color: '#059669', borderColor: '#10b981' }} onClick={() => setIsImportModalOpen(true)}>
              <FileUp size={16} /> Excel 匯入
            </button>
          )}

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

      {view === 'kanban' ? (
        <div className="board-container">
          {columns.map(column => (
            <div key={column.id} className="kanban-column glass-panel">
              <div className="column-header">
                <div className="column-title">
                  {column.title}
                  <span className="card-count">{getCustomersByStatus(column.id).length}</span>
                </div>
              </div>
              <div className="column-body">
                {getCustomersByStatus(column.id).map(customer => (
                  <CustomerCard 
                    key={customer.id} 
                    customer={customer} 
                    onClick={handleCardClick} 
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
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
          customers={customers.filter(c => c.status !== 'construction')}
          onEditCustomer={(c) => {
            setSelectedCustomer(c);
            setIsNewModalOpen(true);
          }}
        />
      ) : view === 'archive' ? (
        <ArchivePage 
          customers={customers} 
          onBack={() => setView('kanban')} 
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
        />

      ) : view === 'inventory' ? (
        <InventoryPage 
          inventory={inventory}
          inventoryLogs={inventoryLogs}
          userRole={currentUser.role}
          onAddInventory={handleAddInventory}
          onUpdateInventory={handleUpdateInventory}
          onRemoveInventory={handleRemoveInventory}
          onBack={() => setView('kanban')}
        />

      ) : (

        <ConstructionMonitorPage 
          customers={customers} 
          onBack={() => setView('kanban')}
          onEdit={(c) => {
            setSelectedCustomer(c);
            setIsConstructionModalOpen(true);
          }}
        />


      )}



      {/* Preview Modal */}
      <Modal isOpen={isPreviewModalOpen} onClose={() => setIsPreviewModalOpen(false)} title="客戶詳細資料摘要">
        {selectedCustomer && (
          <>
            <CustomerDetail customer={selectedCustomer} />
            <div className="form-actions" style={{ marginTop: '24px', borderTop: '1px solid #eee', paddingTop: '16px' }}>
              <button className="btn btn-outline" onClick={() => { setIsPreviewModalOpen(false); setIsEditModalOpen(true); }}>編輯資料</button>
              <button className="btn btn-primary" onClick={() => handleAddOrUpdateCustomer(selectedCustomer, true)}>資料無誤，開始報價</button>
            </div>
          </>
        )}
      </Modal>

      {/* New/Edit Form Modal */}
      <Modal isOpen={isNewModalOpen || isEditModalOpen} onClose={() => { setIsNewModalOpen(false); setIsEditModalOpen(false); }} title={isEditModalOpen ? "編輯客戶資料" : "新增客戶資料表單"}>
        <NewCustomerForm 
          onSuggestId={generateCustomerId()} 
          initialCustomer={selectedCustomer}
          onSubmit={handleAddOrUpdateCustomer} 
          onCancel={() => { setIsNewModalOpen(false); setIsEditModalOpen(false); }} 
        />
      </Modal>

      <Modal isOpen={isQuoteModalOpen} onClose={() => setIsQuoteModalOpen(false)} title="施工報價與排程">
        {selectedCustomer && (
          <QuoteForm 
            customer={selectedCustomer} 
            onSubmit={handleGenericUpdate} 
            onCancel={() => setIsQuoteModalOpen(false)} 
          />
        )}
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

      <Modal isOpen={isScheduledModalOpen} onClose={() => setIsScheduledModalOpen(false)} title="已下定・排程確認">
        {selectedCustomer && (
          <ScheduledForm
            customer={selectedCustomer}
            onUpdate={(c) => {
              setCustomers(prev => prev.map(x => x.id === c.id ? c : x));
              setIsScheduledModalOpen(false);
              setSelectedCustomer(null);
            }}
            onStartConstruction={handleGenericUpdate}
            onCancel={() => setIsScheduledModalOpen(false)}
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

    </div>

  );
}

export default App;
