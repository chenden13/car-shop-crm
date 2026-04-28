import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, Calendar, Tag, Search, History, Save, ChevronRight } from 'lucide-react';
import type { FinanceRecord } from '../types';

interface FinancePageProps {
  records: FinanceRecord[];
  settlements?: any[];
  onAddRecord: (record: FinanceRecord) => void;
  onDeleteRecord: (id: string) => void;
  onSettle: (settlement: any, recordIds: string[]) => void;
}

export const FinancePage: React.FC<FinancePageProps> = ({ 
  records, settlements = [], onAddRecord, onDeleteRecord, onSettle 
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState<'current' | 'history'>('current');
  const [selectedSettlement, setSelectedSettlement] = useState<any | null>(null);
  
  const [newRecord, setNewRecord] = useState<Partial<FinanceRecord>>({
    date: new Date().toISOString().split('T')[0],
    type: 'income',
    category: '施工收入',
    description: '',
    amount: 0,
    operator: 'Admin'
  });
  const [customCategory, setCustomCategory] = useState('');

  const categories = {
    income: ['施工收入', '訂金收入', '配件加裝', '維修收入', '其他收入', '其他'],
    expense: ['膜料進貨', '店租稅務', '水電雜支', '行銷廣告', '薪資獎金', '耗材採購', '其他支出', '其他']
  };

  // --- 即時帳本 (未結算) ---
  const currentRecords = records.filter(r => !r.settlementId);

  const filteredRecords = currentRecords
    .filter(r => filterType === 'all' || r.type === filterType)
    .filter(r => (r.description || '').includes(searchTerm) || (r.category || '').includes(searchTerm))
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalIncome = currentRecords.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = currentRecords.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const balance = totalIncome - totalExpense;

  // --- 歷史紀錄詳細 ---
  const detailsRecords = selectedSettlement ? records.filter(r => r.settlementId === selectedSettlement.id) : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.amount || !newRecord.description) return;
    
    onAddRecord({
      ...newRecord as FinanceRecord,
      category: newRecord.category === '其他' ? (customCategory || '其他') : (newRecord.category || '其他'),
      id: `FIN-${Date.now()}`
    });
    
    setNewRecord({
      date: new Date().toISOString().split('T')[0],
      type: 'income',
      category: '施工收入',
      description: '',
      amount: 0,
      operator: 'Admin'
    });
    setCustomCategory('');
    setIsAdding(false);
  };

  const handleSettle = () => {
    if (currentRecords.length === 0) {
      alert('目前沒有待結算的記錄');
      return;
    }

    // 尋找最後一次結算的結束日期作為本次開始日期
    const lastSettlement = settlements.length > 0 ? settlements[0] : null; 
    const defaultStart = lastSettlement ? lastSettlement.end_date : (currentRecords.length > 0 ? currentRecords[currentRecords.length-1].date : new Date().toISOString().split('T')[0]);
    const defaultEnd = new Date().toISOString().split('T')[0];

    const startDate = window.prompt('請確認本次結算開始日期', defaultStart) || defaultStart;
    const endDate = window.prompt('請確認本次結算結束日期', defaultEnd) || defaultEnd;

    if (window.confirm(`確定要結算此區間的帳本嗎？\n區間: ${startDate} ~ ${endDate}\n目前待結算項目將被封存。\n累計盈餘: $${balance.toLocaleString()}`)) {
      const notes = window.prompt('請輸入結算備註 (選填)', `${startDate} 至 ${endDate} 帳本結算`);
      const settleId = `SETTLE-${Date.now()}`;
      
      onSettle({
        id: settleId,
        start_date: startDate,
        end_date: endDate,
        settlement_date: new Date().toISOString().split('T')[0],
        total_income: totalIncome,
        total_expense: totalExpense,
        balance: balance,
        notes: notes || ''
      }, currentRecords.map(r => r.id));
      
      setActiveTab('history');
    }
  };

  return (
    <div style={{ padding: '0 20px 40px', maxWidth: '1400px', margin: '0 auto' }}>
      <header style={{ marginBottom: '25px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: '800', color: '#1e293b', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wallet color="var(--primary)" size={24} /> 財務記帳管理系統
          </h2>
          <p style={{ color: '#64748b', fontSize: '0.9rem' }}>追蹤店內收支狀況與損益統計</p>
        </div>
        
        <div style={{ display: 'flex', gap: '10px' }}>
          <div style={{ background: '#f1f5f9', padding: '4px', borderRadius: '10px', display: 'flex', gap: '4px' }}>
            <button 
              className="btn" 
              onClick={() => { setActiveTab('current'); setSelectedSettlement(null); }}
              style={{ background: activeTab === 'current' ? '#fff' : 'transparent', color: activeTab === 'current' ? 'var(--primary)' : '#64748b', border: 'none', padding: '6px 12px', fontSize: '0.85rem' }}
            >
              即時帳本
            </button>
            <button 
              className="btn" 
              onClick={() => setActiveTab('history')}
              style={{ background: activeTab === 'history' ? '#fff' : 'transparent', color: activeTab === 'history' ? 'var(--primary)' : '#64748b', border: 'none', padding: '6px 12px', fontSize: '0.85rem' }}
            >
              歷史結算 ({settlements.length})
            </button>
          </div>
          {activeTab === 'current' && (
            <>
              <button className="btn btn-outline" onClick={handleSettle} style={{ background: '#f8fafc', color: '#1e40af', border: '1px solid #bfdbfe' }}>
                <Save size={18} /> 執行帳本結算
              </button>
              <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
                <Plus size={18} /> 新增收支記錄
              </button>
            </>
          )}
        </div>
      </header>

      {activeTab === 'history' ? (
        <div className="glass-panel" style={{ padding: '30px', borderRadius: '16px' }}>
           {selectedSettlement ? (
             <div>
               <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                 <button onClick={() => setSelectedSettlement(null)} className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                   ← 返回紀錄列表
                 </button>
                 <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>結算區間詳細內容: {selectedSettlement.start_date} ~ {selectedSettlement.end_date}</h3>
                 <div style={{ padding: '5px 15px', background: '#dbeafe', color: '#1e40af', borderRadius: '15px', fontWeight: 'bold' }}>區間淨盈餘: ${selectedSettlement.balance?.toLocaleString()}</div>
               </div>
               
               <div style={{ maxHeight: '500px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '12px' }}>
                <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead style={{ position: 'sticky', top: 0, background: '#f8fafc' }}>
                      <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0', color: '#64748b', fontSize: '0.85rem' }}>
                        <th style={{ padding: '12px 20px' }}>日期</th>
                        <th style={{ padding: '12px 20px' }}>類型</th>
                        <th style={{ padding: '12px 20px' }}>類別</th>
                        <th style={{ padding: '12px 20px' }}>項目備註</th>
                        <th style={{ padding: '12px 20px', textAlign: 'right' }}>金額</th>
                      </tr>
                    </thead>
                    <tbody>
                      {detailsRecords.length > 0 ? detailsRecords.map(r => (
                        <tr key={r.id} style={{ borderBottom: '1px solid #f1f5f9', fontSize: '0.9rem' }}>
                          <td style={{ padding: '12px 20px' }}>{r.date}</td>
                          <td style={{ padding: '12px 20px' }}><span style={{ color: r.type === 'income' ? '#059669' : '#dc2626', fontWeight: 'bold' }}>{r.type === 'income' ? '收入' : '支出'}</span></td>
                          <td style={{ padding: '12px 20px' }}>{r.category}</td>
                          <td style={{ padding: '12px 20px' }}>{r.description}</td>
                          <td style={{ padding: '12px 20px', textAlign: 'right', fontWeight: 'bold' }}>${r.amount.toLocaleString()}</td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={5} style={{ padding: '40px', textAlign: 'center', color: '#94a3b8' }}>在此區間查無詳細交易資料</td>
                        </tr>
                      )}
                    </tbody>
                </table>
               </div>
             </div>
           ) : (
             <>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
               <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                 <History size={20} /> 歷史結算存檔區
               </h3>
               <p style={{ color: '#64748b', fontSize: '0.85rem' }}>這裡保存了您每一次結算時的統計快照與詳細帳目</p>
             </div>
             
             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '20px' }}>
               {settlements.length === 0 && <div style={{ gridColumn: '1/-1', padding: '60px', textAlign: 'center', color: '#94a3b8' }}>尚無結算紀錄</div>}
               {settlements.map(item => (
                 <div 
                  key={item.id} 
                  onClick={() => setSelectedSettlement(item)}
                  style={{ background: '#f8fafc', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', cursor: 'pointer', transition: 'all 0.2s', position: 'relative' }}
                  onMouseOver={(e) => { e.currentTarget.style.borderColor = 'var(--primary)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseOut={(e) => { e.currentTarget.style.borderColor = '#e2e8f0'; e.currentTarget.style.transform = 'translateY(0)'; }}
                 >
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px', alignItems: 'flex-start' }}>
                      <div>
                        <div style={{ fontSize: '0.8rem', color: '#64748b', marginBottom: '2px' }}>結算區間</div>
                        <div style={{ fontWeight: '800', color: '#1e293b', fontSize: '0.95rem' }}>{item.start_date} <ChevronRight size={14} style={{ verticalAlign: 'middle', margin: '0 2px' }} /> {item.end_date}</div>
                      </div>
                      <span style={{ fontSize: '0.7rem', padding: '4px 10px', background: '#dcfce7', color: '#166534', borderRadius: '12px', fontWeight: 'bold' }}>已封存</span>
                    </div>
                    
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#fff', padding: '12px', borderRadius: '12px', marginBottom: '12px', border: '1px solid #f1f5f9' }}>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>期間總收入</div>
                        <div style={{ color: '#059669', fontWeight: '700' }}>${item.total_income?.toLocaleString()}</div>
                      </div>
                      <div>
                        <div style={{ fontSize: '0.7rem', color: '#94a3b8' }}>期間總支出</div>
                        <div style={{ color: '#dc2626', fontWeight: '700' }}>${item.total_expense?.toLocaleString()}</div>
                      </div>
                    </div>
                    
                    <div style={{ padding: '0 5px' }}>
                      <div style={{ fontSize: '0.75rem', color: '#64748b' }}>結算日盈餘</div>
                      <div style={{ fontSize: '1.2rem', fontWeight: '900', color: '#1e40af' }}>${item.balance?.toLocaleString()}</div>
                    </div>
                    
                    <div style={{ marginTop: '10px', textAlign: 'right', fontSize: '0.75rem', color: 'var(--primary)', fontWeight: 'bold' }}>
                      點擊查看明細 →
                    </div>
                 </div>
               ))}
             </div>
             </>
           )}
        </div>
      ) : (
        <>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #10b981' }}>
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingUp size={16} color="#10b981" /> 即時累計收入
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#065f46' }}>${totalIncome.toLocaleString()}</div>
          </div>
          
          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #ef4444' }}>
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <TrendingDown size={16} color="#ef4444" /> 即時累計支出
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#991b1b' }}>${totalExpense.toLocaleString()}</div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid var(--primary)' }}>
            <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Wallet size={16} color="var(--primary)" /> 待處理結餘
            </div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900', color: balance >= 0 ? '#1e40af' : '#ef4444' }}>
              ${balance.toLocaleString()}
            </div>
          </div>

          <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', background: 'var(--primary)', color: '#fff' }}>
            <div style={{ fontSize: '0.85rem', marginBottom: '8px', opacity: 0.8 }}>未結算筆數</div>
            <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>{currentRecords.length} 筆</div>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: isAdding ? '1fr 350px' : '1fr', gap: '25px', transition: 'all 0.3s' }}>
          {/* Main List */}
          <div className="glass-panel" style={{ borderRadius: '16px', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8fafc' }}>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  onClick={() => setFilterType('all')} 
                  style={{ padding: '6px 16px', borderRadius: '8px', border: 'none', background: filterType === 'all' ? 'var(--primary)' : 'transparent', color: filterType === 'all' ? '#fff' : '#64748b', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                >全部</button>
                <button 
                  onClick={() => setFilterType('income')} 
                  style={{ padding: '6px 16px', borderRadius: '8px', border: 'none', background: filterType === 'income' ? '#10b981' : 'transparent', color: filterType === 'income' ? '#fff' : '#64748b', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                >收入</button>
                <button 
                  onClick={() => setFilterType('expense')} 
                  style={{ padding: '6px 16px', borderRadius: '8px', border: 'none', background: filterType === 'expense' ? '#ef4444' : 'transparent', color: filterType === 'expense' ? '#fff' : '#64748b', cursor: 'pointer', fontSize: '0.85rem', fontWeight: '600' }}
                >支出</button>
              </div>
              
              <div style={{ position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
                <input 
                  type="text" 
                  placeholder="搜尋備註或類別..." 
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  style={{ padding: '8px 12px 8px 32px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', width: '250px', outline: 'none' }}
                />
              </div>
            </div>

            <div style={{ maxHeight: '600px', overflowY: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ position: 'sticky', top: 0, background: '#f8fafc', zIndex: 1 }}>
                  <tr style={{ textAlign: 'left', borderBottom: '1px solid #e2e8f0' }}>
                    <th style={{ padding: '15px 20px', fontSize: '0.85rem', color: '#475569' }}>日期</th>
                    <th style={{ padding: '15px 20px', fontSize: '0.85rem', color: '#475569' }}>類型</th>
                    <th style={{ padding: '15px 20px', fontSize: '0.85rem', color: '#475569' }}>類別</th>
                    <th style={{ padding: '15px 20px', fontSize: '0.85rem', color: '#475569' }}>項目/來源備註</th>
                    <th style={{ padding: '15px 20px', fontSize: '0.85rem', color: '#475569', textAlign: 'right' }}>金額</th>
                    <th style={{ padding: '15px 20px', fontSize: '0.85rem', color: '#475569', textAlign: 'center' }}>操作</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length > 0 ? filteredRecords.map((record) => (
                    <tr key={record.id} style={{ borderBottom: '1px solid #f1f5f9' }} className="hover-row">
                      <td style={{ padding: '15px 20px', fontSize: '0.9rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <Calendar size={14} color="#94a3b8" /> {record.date}
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px' }}>
                        <span style={{ 
                          padding: '4px 10px', 
                          borderRadius: '6px', 
                          fontSize: '0.75rem', 
                          fontWeight: 'bold',
                          background: record.type === 'income' ? '#ecfdf5' : '#fef2f2',
                          color: record.type === 'income' ? '#059669' : '#dc2626'
                        }}>
                          {record.type === 'income' ? '收入' : '支出'}
                        </span>
                      </td>
                      <td style={{ padding: '15px 20px', fontSize: '0.9rem', color: '#475569' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Tag size={14} color="#94a3b8" /> {record.category}
                        </div>
                      </td>
                      <td style={{ padding: '15px 20px', fontSize: '0.9rem', fontWeight: '500' }}>
                         {record.description}
                      </td>
                      <td style={{ padding: '15px 20px', fontSize: '1rem', fontWeight: '800', textAlign: 'right', color: record.type === 'income' ? '#059669' : '#dc2626' }}>
                        {record.type === 'income' ? '+' : '-'}${record.amount.toLocaleString()}
                      </td>
                      <td style={{ padding: '15px 20px', textAlign: 'center' }}>
                        <button 
                          onClick={() => onDeleteRecord(record.id)}
                          style={{ padding: '6px', border: 'none', background: 'none', color: '#94a3b8', cursor: 'pointer' }}
                          onMouseOver={(e) => e.currentTarget.style.color = '#ef4444'}
                          onMouseOut={(e) => e.currentTarget.style.color = '#94a3b8'}
                        >
                          <Trash2 size={16} />
                        </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>尚無待處理記錄</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Sidebar Form */}
          {isAdding && (
            <div className="glass-panel" style={{ padding: '24px', borderRadius: '16px', height: 'fit-content', position: 'sticky', top: '20px', border: '1px solid var(--primary-soft)' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: '800', marginBottom: '20px' }}>新增記錄</h3>
              <form onSubmit={handleSubmit}>
                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '600' }}>日期</label>
                  <input 
                    type="date" 
                    className="form-control"
                    value={newRecord.date}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, date: e.target.value }))}
                  />
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '600' }}>類型</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <button 
                      type="button"
                      onClick={() => setNewRecord(prev => ({ ...prev, type: 'income', category: categories.income[0] }))}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid', borderColor: newRecord.type === 'income' ? '#10b981' : '#e2e8f0', background: newRecord.type === 'income' ? '#ecfdf5' : '#fff', color: newRecord.type === 'income' ? '#059669' : '#64748b', fontWeight: '700', cursor: 'pointer' }}
                    >收入</button>
                    <button 
                      type="button"
                      onClick={() => setNewRecord(prev => ({ ...prev, type: 'expense', category: categories.expense[0] }))}
                      style={{ flex: 1, padding: '10px', borderRadius: '8px', border: '2px solid', borderColor: newRecord.type === 'expense' ? '#ef4444' : '#e2e8f0', background: newRecord.type === 'expense' ? '#fef2f2' : '#fff', color: newRecord.type === 'expense' ? '#dc2626' : '#64748b', fontWeight: '700', cursor: 'pointer' }}
                    >支出</button>
                  </div>
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '600' }}>類別</label>
                  <select 
                    className="form-control"
                    value={newRecord.category}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {newRecord.type === 'income' 
                      ? categories.income.map(c => <option key={c} value={c}>{c}</option>)
                      : categories.expense.map(c => <option key={c} value={c}>{c}</option>)
                    }
                  </select>
                  
                  {newRecord.category === '其他' && (
                    <input 
                      type="text" 
                      className="form-control" 
                      placeholder="請輸入自定義類別" 
                      style={{ marginTop: '8px' }}
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                    />
                  )}
                </div>

                <div style={{ marginBottom: '16px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '600' }}>金額來源/支出用途 (備註)</label>
                  <textarea 
                    className="form-control" 
                    rows={2} 
                    placeholder="例如：王小明結案尾款、進貨 3M 膜料..."
                    value={newRecord.description}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, description: e.target.value }))}
                  ></textarea>
                </div>

                <div style={{ marginBottom: '24px' }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', marginBottom: '6px', fontWeight: '600' }}>金額 ($)</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    style={{ fontSize: '1.2rem', fontWeight: '800', color: newRecord.type === 'income' ? '#059669' : '#dc2626' }}
                    value={newRecord.amount || ''}
                    onChange={(e) => setNewRecord(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  />
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <button type="button" className="btn btn-outline" style={{ flex: 1 }} onClick={() => setIsAdding(false)}>取消</button>
                  <button type="submit" className="btn btn-primary" style={{ flex: 2 }}>儲存記錄</button>
                </div>
              </form>
            </div>
          )}
        </div>

        <style>{`
          .hover-row:hover { background: #f8fafc !important; }
        `}</style>
        </>
      )}
    </div>
  );
};
