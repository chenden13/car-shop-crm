import React, { useState } from 'react';
import './App.css';
import { initialCustomers } from './data/mockData';
import { CustomerCard } from './components/CustomerCard';
import type { Customer, StatusType } from './types';
import { Plus } from 'lucide-react';
import { Modal } from './components/Modal';
import { NewCustomerForm } from './components/NewCustomerForm';
import { QuoteForm } from './components/QuoteForm';
import { ConstructionForm } from './components/ConstructionForm';
import { CompletedForm } from './components/CompletedForm';
import { CustomerDetail } from './components/CustomerDetail';

function App() {
  const [customers, setCustomers] = useState<Customer[]>(initialCustomers);
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [isConstructionModalOpen, setIsConstructionModalOpen] = useState(false);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState(false);
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
    } else if (customer.status === 'construction') {
      setIsConstructionModalOpen(true);
    } else if (customer.status === 'completed') {
      setIsCompletedModalOpen(true);
    }
  };

  const generateCustomerId = () => {
    return `C-${String(customers.length + 1).padStart(3, '0')}`;
  };

  const handleAddOrUpdateCustomer = (customerData: Partial<Customer>, moveToDeposit?: boolean) => {
    const updatedStatus = moveToDeposit ? 'deposit' : 'new';
    
    if (selectedCustomer) {
      setCustomers(prev => prev.map(c => c.id === selectedCustomer.id ? { ...c, ...customerData, status: updatedStatus as StatusType } as Customer : c));
    } else {
      const newCustomer = {
        ...customerData,
        status: updatedStatus,
      } as Customer;
      setCustomers(prev => [...prev, newCustomer]);
    }
    
    setIsNewModalOpen(false);
    setIsEditModalOpen(false);
    setIsPreviewModalOpen(false);
    setSelectedCustomer(null);
  };

  const handleGenericUpdate = (updatedCustomer: Customer) => {
    setCustomers(prev => prev.map(c => c.id === updatedCustomer.id ? updatedCustomer : c));
    setIsQuoteModalOpen(false);
    setIsConstructionModalOpen(false);
    setIsCompletedModalOpen(false);
    setSelectedCustomer(null);
  };

  const columns: { id: StatusType; title: string }[] = [
    { id: 'new', title: '新增客人 (進件區)' },
    { id: 'deposit', title: '等待收訂 (施工報價)' },
    { id: 'construction', title: '施工中 (進度檢核)' },
    { id: 'completed', title: '施工完成 (結案關懷)' },
  ];

  return (
    <div className="app-container">
      <header className="app-header glass-panel">
        <div className="brand">
          <div style={{ width: '30px', height: '30px', background: 'var(--primary-color)', borderRadius: '8px' }}></div>
          <h1>CarShop CRM PRO</h1>
        </div>
        <div className="header-actions">
          <button className="btn btn-primary" onClick={() => { setSelectedCustomer(null); setIsNewModalOpen(true); }}>
            <Plus size={18} /> 新增客戶資料
          </button>
        </div>
      </header>

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
    </div>
  );
}

export default App;
