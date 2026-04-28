import React, { useState } from 'react';
import { Plus, Trash2, TrendingUp, TrendingDown, Wallet, Calendar, Tag, FileText, Filter, Search, Download } from 'lucide-react';
import type { FinanceRecord } from '../types';

interface FinancePageProps {
  records: FinanceRecord[];
  onAddRecord: (record: FinanceRecord) => void;
  onDeleteRecord: (id: string) => void;
}

export const FinancePage: React.FC<FinancePageProps> = ({ records, onAddRecord, onDeleteRecord }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  
  const [newRecord, setNewRecord] = useState<Partial<FinanceRecord>>({
    date: new Date().toISOString().split('T')[0],
    type: 'income',
    category: '施工收入',
    description: '',
    amount: 0,
    operator: 'Admin'
  });

  const categories = {
    income: ['施工收入', '訂金收入', '配件加裝', '維修收入', '其他收入'],
    expense: ['膜料進貨', '店租稅務', '水電雜支', '行銷廣告', '薪資獎金', '耗材採購', '其他支出']
  };

  const filteredRecords = records
    .filter(r => filterType === 'all' || r.type === filterType)
    .filter(r => r.description.includes(searchTerm) || r.category.includes(searchTerm))
    .sort((a, b) => b.date.localeCompare(a.date));

  const totalIncome = records.filter(r => r.type === 'income').reduce((sum, r) => sum + r.amount, 0);
  const totalExpense = records.filter(r => r.type === 'expense').reduce((sum, r) => sum + r.amount, 0);
  const balance = totalIncome - totalExpense;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRecord.amount || !newRecord.description) return;
    
    onAddRecord({
      ...newRecord as FinanceRecord,
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
    setIsAdding(false);
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
          <button className="btn btn-primary" onClick={() => setIsAdding(true)}>
            <Plus size={18} /> 新增收支記錄
          </button>
        </div>
      </header>

      {/* Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '20px', marginBottom: '30px' }}>
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #10b981' }}>
          <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingUp size={16} color="#10b981" /> 累計總收入
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#065f46' }}>${totalIncome.toLocaleString()}</div>
        </div>
        
        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid #ef4444' }}>
          <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <TrendingDown size={16} color="#ef4444" /> 累計總支出
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: '#991b1b' }}>${totalExpense.toLocaleString()}</div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', borderLeft: '4px solid var(--primary)' }}>
          <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Wallet size={16} color="var(--primary)" /> 目前結餘 (盈餘)
          </div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900', color: balance >= 0 ? '#1e40af' : '#ef4444' }}>
            ${balance.toLocaleString()}
          </div>
        </div>

        <div className="glass-panel" style={{ padding: '20px', borderRadius: '16px', background: 'var(--primary)', color: '#fff' }}>
          <div style={{ fontSize: '0.85rem', marginBottom: '8px', opacity: 0.8 }}>統計筆數</div>
          <div style={{ fontSize: '1.5rem', fontWeight: '900' }}>{records.length} 筆</div>
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
                    <td colSpan={6} style={{ padding: '60px', textAlign: 'center', color: '#94a3b8' }}>尚無财务記錄</td>
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
    </div>
  );
};
