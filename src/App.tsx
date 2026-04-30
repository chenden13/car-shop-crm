import React, { useState, useEffect } from 'react';
import './App.css';
import { api } from './lib/api';
import type { Customer, FilmInventory, User, InventoryLog, PurchaseRecord, FinanceRecord } from './types';
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
import { FinancePage } from './components/FinancePage';
import { VehicleMasterImport } from './components/VehicleMasterImport';
import { History, Box, LogOut, Clock, Hammer, UserPlus, Wallet, Save, Car, List } from 'lucide-react';

function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [inventory, setInventory] = useState<FilmInventory[]>([]);
  const [inventoryLogs, setInventoryLogs] = useState<InventoryLog[]>([]);
  const [purchaseRecords, setPurchaseRecords] = useState<PurchaseRecord[]>([]);
  const [financeRecords, setFinanceRecords] = useState<FinanceRecord[]>([]);
  const [settlements, setSettlements] = useState<any[]>([]);
  const [view, setView] = useState<'inquiry' | 'pending' | 'archive' | 'monitor' | 'inventory' | 'finance'>('inquiry');
  const [isLoading, setIsLoading] = useState(true);
  const [importProgress, setImportProgress] = useState<{current: number, total: number} | null>(null);

  const [isIntakeModalOpen, setIsIntakeModalOpen] = useState(false);
  const [isPendingEditModalOpen, setIsPendingEditModalOpen] = useState(false);
  const [isConstructionModalOpen, setIsConstructionModalOpen] = useState(false);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isPendingImportModalOpen, setIsPendingImportModalOpen] = useState(false);
  const [isArchiveEditModalOpen, setIsArchiveEditModalOpen] = useState(false);
  const [isVehicleImportModalOpen, setIsVehicleImportModalOpen] = useState(false);
  
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [vehicleMaster, setVehicleMaster] = useState<any[]>([]);

  useEffect(() => {
    const initCloud = async () => {
      try {
        const [cloudCustomers, cloudInventory, cloudLogs, cloudPurchases, cloudFinance, cloudSettlements, cloudVehicleMaster] = await Promise.all([
          api.getCustomers(),
          api.getInventory(),
          api.getInventoryLogs(),
          api.getPurchaseRecords(),
          api.getFinanceRecords(),
          api.getFinanceSettlements(),
          api.getVehicleMaster()
        ]);
        
        setCustomers(cloudCustomers || []);
        setInventory(cloudInventory || []);
        setInventoryLogs(cloudLogs || []);
        setPurchaseRecords(cloudPurchases || []);
        setFinanceRecords(cloudFinance || []);
        setSettlements(cloudSettlements || []);
        setVehicleMaster(cloudVehicleMaster || []);
      } catch (err: any) {
        console.error('雲端初始化失敗:', err);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser) {
      initCloud();
    }
  }, [currentUser]);

  const refreshVehicleMaster = async () => {
    const data = await api.getVehicleMaster();
    setVehicleMaster(data || []);
  };

  const handleEditCustomer = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsPendingEditModalOpen(true);
  };

  const generateCustomerId = () => {
    const list = Array.isArray(customers) ? customers : [];
    return `C-${String(list.length + 1).padStart(3, '0')}`;
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
    const existingIds = new Set(customers.map(c => c.id));
    const filtered = newCustomers.filter(c => !existingIds.has(c.id));

    if (filtered.length === 0) return;

    try {
      setImportProgress({ current: 0, total: filtered.length });
      for (let i = 0; i < filtered.length; i++) {
        await api.upsertCustomer(filtered[i]);
        setImportProgress({ current: i + 1, total: filtered.length });
      }
      setCustomers(prev => [...prev, ...filtered]);
      setImportProgress(null);
    } catch (err) {
      setImportProgress(null);
    }
  };

  const handleUpdateInventory = async (item: FilmInventory, detailsOverride?: string) => {
    try {
      await api.updateInventory(item);
      setInventory(prev => prev.map(i => i.id === item.id ? item : i));
    } catch (err) {}
  };

  const handleAddInventory = async (item: FilmInventory) => {
    try {
      await api.updateInventory(item);
      setInventory(prev => [...prev, item]);
    } catch (err) {}
  };

  const handleRemoveInventory = async (id: string) => {
    try {
      await api.deleteInventory(id);
      setInventory(prev => prev.filter(i => i.id !== id));
    } catch (err) {}
  };

  const handleAddPurchaseRecord = async (record: PurchaseRecord) => {
    try {
      await api.addPurchaseRecord(record);
      setPurchaseRecords(prev => [record, ...prev]);
    } catch (err) {}
  };

  const handleAddFinanceRecord = async (record: FinanceRecord) => {
    try {
      await api.addFinanceRecord(record);
      setFinanceRecords(prev => [record, ...prev]);
    } catch (err) {}
  };

  const handleDeleteFinanceRecord = async (id: string) => {
    try {
      await api.deleteFinanceRecord(id);
      setFinanceRecords(prev => prev.filter(r => r.id !== id));
    } catch (err) {}
  };

  const handleSettleBook = async (settlement: any, recordIds: string[]) => {
    try {
      await api.addFinanceSettlement(settlement);
      if (recordIds.length > 0) await api.updateFinanceRecordsSettlement(recordIds, settlement.id);
      setSettlements(prev => [settlement, ...prev]);
      setFinanceRecords(prev => prev.map(r => recordIds.includes(r.id) ? { ...r, settlementId: settlement.id } : r));
    } catch (err) {}
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setView('pending');
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const [mobileHome, setMobileHome] = useState(true);

  if (!currentUser) return <LoginPage onLogin={setCurrentUser} />;
  
  if (isLoading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
      <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #e2e8f0', borderTopColor: 'var(--primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
      <p style={{ marginTop: '16px', color: '#64748b', fontWeight: 'bold' }}>雲端同步中...</p>
    </div>
  );

  const menuItems = [
    { id: 'inquiry', name: '諮詢進件區', icon: <UserPlus size={24} />, color: '#4f46e5', desc: '新客諮詢與進件紀錄' },
    { id: 'pending', name: '待施工排程', icon: <Clock size={24} />, color: '#0ea5e9', desc: '預約案件與排程管理' },
    { id: 'monitor', name: '現場施工監控', icon: <Hammer size={24} />, color: '#10b981', desc: '即時進度與檢核追蹤' },
    { id: 'archive', name: '完工案件存檔', icon: <History size={24} />, color: '#ec4899', desc: '過往案件調閱與分析' },
    { id: 'inventory', name: '膜料庫存管理', icon: <Box size={24} />, color: '#f59e0b', desc: '捲料、配件庫存控管' },
    { id: 'finance', name: '收支流水帳', icon: <Wallet size={24} />, color: '#8b5cf6', desc: '每日財務與結算報表' },
  ];

  if (isMobile && mobileHome) {
    return (
      <div style={{ minHeight: '100vh', background: '#f0f9ff', padding: '24px 20px' }}>
        <header style={{ marginBottom: '32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: '900', color: 'var(--primary)', margin: 0 }}>好室多膜</h1>
            <p style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'bold', margin: '4px 0 0 0' }}>{currentUser.name}，歡迎回來</p>
          </div>
          <button onClick={handleLogout} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '12px', borderRadius: '12px', color: '#ef4444' }}>
            <LogOut size={20} />
          </button>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          {menuItems.map(item => (
            <button key={item.id} onClick={() => { setView(item.id as any); setMobileHome(false); }} style={{ background: '#fff', border: '1px solid #e2e8f0', padding: '24px 16px', borderRadius: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.05)', transition: 'transform 0.2s' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: `${item.color}15`, color: item.color, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{item.icon}</div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: '1rem', fontWeight: '800', color: '#1e293b' }}>{item.name}</div>
                <div style={{ fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px' }}>{item.desc}</div>
              </div>
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="app-container">
      <header className="app-header glass-panel">
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <div style={{ width: '38px', height: '38px', background: 'var(--primary)', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: 'bold', fontSize: '1.2rem' }}>C</div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-0.5px' }}>好室多膜 CRM</h1>
            <span style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '5px' }}>V.613.2 PRO <span style={{ width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></span></span>
          </div>
        </div>

        <div className="header-actions">
          {isMobile ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%', justifyContent: 'space-between' }}>
              <button className="btn btn-outline" onClick={() => setMobileHome(true)} style={{ padding: '8px 16px', borderRadius: '10px', fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary)' }}><List size={18} /> 選單</button>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.8rem', fontWeight: '800', color: 'var(--text-main)' }}>{currentUser.name}</div>
              </div>
            </div>
          ) : (
            <>
              <div className="nav-group">
                <button className={`nav-tab ${view === 'inquiry' ? 'active' : ''}`} onClick={() => setView('inquiry')}><UserPlus size={18} /> 諮詢進件</button>
                <button className={`nav-tab ${view === 'pending' ? 'active' : ''}`} onClick={() => setView('pending')}><Clock size={18} /> 待施工排程</button>
                <button className={`nav-tab ${view === 'monitor' ? 'active' : ''}`} onClick={() => setView('monitor')}><Hammer size={17} /> 現場監控</button>
                <button className={`nav-tab ${view === 'archive' ? 'active' : ''}`} onClick={() => setView('archive')}><History size={17} /> 完工檔案</button>
                <button className={`nav-tab ${view === 'inventory' ? 'active' : ''}`} onClick={() => setView('inventory')}><Box size={17} /> 庫存</button>
                <button className={`nav-tab ${view === 'finance' ? 'active' : ''}`} onClick={() => setView('finance')}><Wallet size={17} /> 財務</button>
              </div>
              <div className="user-area" style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.85rem', fontWeight: '800', color: 'var(--text-main)' }}>{currentUser.name}</div>
                </div>
                <button className="btn" onClick={handleLogout} style={{ background: '#f8fafc', color: '#64748b', padding: '10px', borderRadius: '10px', border: '1px solid #e2e8f0' }}><LogOut size={18} /></button>
              </div>
            </>
          )}
        </div>
      </header>

      {view === 'inquiry' ? (
        <InquiryPage customers={customers} onEditCustomer={handleEditCustomer} userRole={currentUser.role} onAddNew={() => setIsIntakeModalOpen(true)} />
      ) : view === 'monitor' ? (
        <ActiveConstructionPage customers={customers} onEditCustomer={(c) => { setSelectedCustomer(c); setIsConstructionModalOpen(true); }} />
      ) : view === 'pending' ? (
        <PendingListPage customers={customers} onEditCustomer={handleEditCustomer} onUpdateCustomer={handleGenericUpdate} userRole={currentUser.role} onImportClick={() => setIsPendingImportModalOpen(true)} onAddNew={() => { setSelectedCustomer(null); setIsPendingEditModalOpen(true); }} />
      ) : view === 'archive' ? (
        <ArchivePage customers={customers} onBack={() => setView('pending')} onUpdate={(c) => setCustomers(prev => prev.map(x => x.id === c.id ? c : x))} onEdit={(c) => { setSelectedCustomer(c); setIsArchiveEditModalOpen(true); }} onViewDetail={() => {}} userRole={currentUser.role} onImportClick={() => setIsImportModalOpen(true)} />
      ) : view === 'inventory' ? (
        <InventoryPage inventory={inventory} inventoryLogs={inventoryLogs} purchaseRecords={purchaseRecords} userRole={currentUser.role} onAddInventory={handleAddInventory} onUpdateInventory={handleUpdateInventory} onRemoveInventory={handleRemoveInventory} onAddPurchaseRecord={handleAddPurchaseRecord} onBack={() => setView('pending')} />
      ) : (
        <FinancePage records={financeRecords} settlements={settlements} onAddRecord={handleAddFinanceRecord} onDeleteRecord={handleDeleteFinanceRecord} onSettle={handleSettleBook} />
      )}

      <Modal isOpen={isIntakeModalOpen} onClose={() => setIsIntakeModalOpen(false)} title="新增客戶資料表單">
        <IntakeForm onSuggestId={generateCustomerId()} vehicleMaster={vehicleMaster} onSubmit={handleAddOrUpdateCustomer} onCancel={() => setIsIntakeModalOpen(false)} />
      </Modal>

      <Modal isOpen={isPendingEditModalOpen} onClose={() => setIsPendingEditModalOpen(false)} title={selectedCustomer ? "修改待施工案件" : "新增客戶 / 預預約單"}>
        <PendingEditForm customer={selectedCustomer} onSuggestId={generateCustomerId()} vehicleMaster={vehicleMaster} onSubmit={handleAddOrUpdateCustomer} onCancel={() => setIsPendingEditModalOpen(false)} />
      </Modal>

      <Modal isOpen={isConstructionModalOpen} onClose={() => setIsConstructionModalOpen(false)} title="施工檢核與照片上傳">
        {selectedCustomer && <ConstructionForm customer={selectedCustomer} onSubmit={(c) => { handleGenericUpdate(c); setIsConstructionModalOpen(false); }} onSaveProgress={handleGenericUpdate} onCancel={() => setIsConstructionModalOpen(false)} />}
      </Modal>

      <Modal isOpen={isArchiveEditModalOpen} onClose={() => setIsArchiveEditModalOpen(false)} title="微調完工存檔資料">
        {selectedCustomer && <ArchiveEditForm customer={selectedCustomer} onSubmit={(c) => { handleGenericUpdate(c); setIsArchiveEditModalOpen(false); }} onCancel={() => setIsArchiveEditModalOpen(false)} userRole={currentUser.role} />}
      </Modal>

      <Modal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} title="完工資料 Excel 匯入">
        <ExcelImport onImport={handleImport} onCancel={() => setIsImportModalOpen(false)} />
      </Modal>

      <Modal isOpen={isPendingImportModalOpen} onClose={() => setIsPendingImportModalOpen(false)} title="排程資料 Excel 匯入">
        <PendingExcelImport onImport={handleImport} onCancel={() => setIsPendingImportModalOpen(false)} />
      </Modal>

      <Modal isOpen={isVehicleImportModalOpen} onClose={() => setIsVehicleImportModalOpen(false)} title="車型母檔匯入">
        <VehicleMasterImport onCancel={() => setIsVehicleImportModalOpen(false)} onSuccess={() => { setIsVehicleImportModalOpen(false); refreshVehicleMaster(); }} />
      </Modal>
    </div>
  );
}

export default App;
