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
import { History, Box, LogOut, Clock, Hammer, UserPlus, Wallet, Save, Car, List, Menu, X } from 'lucide-react';

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
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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

  const handleUpdateInventory = async (item: FilmInventory) => {
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
    setView('inquiry');
  };

  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth <= 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (!currentUser) return <LoginPage onLogin={setCurrentUser} />;
  
  if (isLoading) return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: '#fff' }}>
      <div className="spinner" style={{ width: '40px', height: '40px', border: '4px solid #f3f3f3', borderTopColor: 'var(--primary)', borderRadius: '50%' }}></div>
      <p style={{ marginTop: '16px', color: '#222', fontWeight: '700' }}>好室多膜 雲端同步中...</p>
    </div>
  );

  const navItems = [
    { id: 'inquiry', name: '諮詢進件', icon: <UserPlus size={18} /> },
    { id: 'pending', name: '施工排程', icon: <Clock size={18} /> },
    { id: 'monitor', name: '施工監控', icon: <Hammer size={18} /> },
    { id: 'archive', name: '完工檔案', icon: <History size={18} /> },
    { id: 'inventory', name: '膜料庫存', icon: <Box size={18} /> },
    { id: 'finance', name: '收支流水', icon: <Wallet size={18} /> },
  ];

  return (
    <div className="app-container" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header className="app-header">
        <div className="brand" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ width: '32px', height: '32px', background: 'var(--primary)', borderRadius: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', fontWeight: '900' }}>C</div>
          <div>
            <h1 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800', letterSpacing: '-0.5px' }}>好室多膜</h1>
            <span style={{ fontSize: '0.7rem', color: 'var(--primary)', fontWeight: '800' }}>V.613.3 PRO <span style={{ display: 'inline-block', width: '6px', height: '6px', background: '#10b981', borderRadius: '50%' }}></span></span>
          </div>
        </div>

        {!isMobile ? (
          <nav style={{ display: 'flex', gap: '8px' }}>
            {navItems.map(item => (
              <button 
                key={item.id} 
                onClick={() => setView(item.id as any)}
                className="btn"
                style={{ 
                  background: view === item.id ? '#f7f7f7' : 'transparent',
                  color: view === item.id ? '#222' : '#717171',
                  border: 'none',
                  padding: '8px 16px'
                }}
              >
                {item.icon} {item.name}
              </button>
            ))}
          </nav>
        ) : (
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} style={{ background: 'none', border: 'none', padding: '8px' }}>
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        )}

        {!isMobile && (
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: '800' }}>{currentUser.name}</div>
              <div style={{ fontSize: '0.7rem', color: '#717171' }}>{currentUser.role.toUpperCase()}</div>
            </div>
            <button className="btn btn-outline" onClick={handleLogout} style={{ padding: '8px' }}><LogOut size={18} /></button>
          </div>
        )}
      </header>

      {isMobile && isMenuOpen && (
        <div style={{ position: 'fixed', top: '60px', left: 0, right: 0, bottom: 0, background: '#fff', zIndex: 1500, padding: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {navItems.map(item => (
            <button 
              key={item.id} 
              onClick={() => { setView(item.id as any); setIsMenuOpen(false); }}
              className="btn btn-outline"
              style={{ justifyContent: 'flex-start', padding: '16px', fontSize: '1.1rem' }}
            >
              {item.icon} {item.name}
            </button>
          ))}
          <div style={{ marginTop: 'auto', borderTop: '1px solid #ebebeb', paddingTop: '20px' }}>
             <div style={{ marginBottom: '16px', fontWeight: '800' }}>{currentUser.name} ({currentUser.role})</div>
             <button className="btn btn-primary" onClick={handleLogout} style={{ width: '100%' }}>登出系統</button>
          </div>
        </div>
      )}

      <main style={{ flex: 1, padding: isMobile ? '20px 10px' : '32px 40px' }}>
        {view === 'inquiry' && <InquiryPage customers={customers} onEditCustomer={handleEditCustomer} userRole={currentUser.role} onAddNew={() => setIsIntakeModalOpen(true)} />}
        {view === 'pending' && <PendingListPage customers={customers} onEditCustomer={handleEditCustomer} onUpdateCustomer={handleGenericUpdate} userRole={currentUser.role} onImportClick={() => setIsPendingImportModalOpen(true)} onAddNew={() => { setSelectedCustomer(null); setIsPendingEditModalOpen(true); }} />}
        {view === 'monitor' && <ActiveConstructionPage customers={customers} onEditCustomer={(c) => { setSelectedCustomer(c); setIsConstructionModalOpen(true); }} />}
        {view === 'archive' && <ArchivePage customers={customers} onBack={() => setView('pending')} onUpdate={handleUpdateCustomer} onEdit={(c) => { setSelectedCustomer(c); setIsArchiveEditModalOpen(true); }} onViewDetail={() => {}} userRole={currentUser.role} onImportClick={() => setIsImportModalOpen(true)} />}
        {view === 'inventory' && <InventoryPage inventory={inventory} inventoryLogs={inventoryLogs} purchaseRecords={purchaseRecords} userRole={currentUser.role} onAddInventory={handleAddInventory} onUpdateInventory={handleUpdateInventory} onRemoveInventory={handleRemoveInventory} onAddPurchaseRecord={handleAddPurchaseRecord} onBack={() => setView('pending')} />}
        {view === 'finance' && <FinancePage records={financeRecords} settlements={settlements} onAddRecord={handleAddFinanceRecord} onDeleteRecord={handleDeleteFinanceRecord} onSettle={handleSettleBook} />}
      </main>

      <Modal isOpen={isIntakeModalOpen} onClose={() => setIsIntakeModalOpen(false)} title="新增客戶資料表單">
        <IntakeForm onSuggestId={generateCustomerId()} vehicleMaster={vehicleMaster} onSubmit={handleAddOrUpdateCustomer} onCancel={() => setIsIntakeModalOpen(false)} />
      </Modal>

      <Modal isOpen={isPendingEditModalOpen} onClose={() => setIsPendingEditModalOpen(false)} title={selectedCustomer ? "修改待施工案件" : "新增客戶 / 預約單"}>
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
