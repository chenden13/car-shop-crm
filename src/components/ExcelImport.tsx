import React, { useRef } from 'react';
import * as XLSX from 'xlsx';
import type { Customer } from '../types';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2 } from 'lucide-react';

interface ExcelImportProps {
  onImport: (customers: Customer[]) => void;
  onCancel: () => void;
}

export const ExcelImport: React.FC<ExcelImportProps> = ({ onImport, onCancel }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      const wsname = wb.SheetNames[0];
      const ws = wb.Sheets[wsname];
      const data = XLSX.utils.sheet_to_json(ws);

      const importedCustomers: Customer[] = data.map((row: any, index) => {
        // Mapping logic based on user requirements
        return {
          id: row['編號'] || `IMP-${Date.now()}-${index}`,
          name: String(row['姓名'] || ''),
          phone: String(row['電話'] || ''),
          plateNumber: String(row['車牌'] || ''),
          brand: row['車種']?.split(' ')?.[0] || '',
          model: row['車種']?.split(' ')?.slice(1).join(' ') || '',
          status: 'completed', // Default to completed for archive import
          
          mainService: row['施工項目'],
          mainServiceBrand: row['品牌'],
          filmColor: row['細項'] || row['膜料顏色'],
          materialCode: row['膜料貨號'],
          
          giftGiven: row['大禮包已寄送'] === '是' || row['大禮包已寄送'] === true,
          formSent: row['表單已發送'] === '是' || row['表單已發送'] === true,
          followUp2Weeks: row['兩週關心'] === '是' || row['兩週關心'] === true,
          inCalendar: row['是否登記行事曆'] === '是' || row['是否登記行事曆'] === true,
          materialOrdered: row['是否叫貨'] === '是' || row['是否叫貨'] === true,
          quoteCreated: row['報價單是否建立'] === '是' || row['報價單是否建立'] === true,
          
          deliveryDate: row['施工時交車時間'],
          expectedStartDate: row['預計施工時間'],
          checkupDate: row['健檢時間'],
          notes: row['備註'],
          
          totalAmount: Number(row['金額']) || 0,
          cost: Number(row['成本']) || 0,
          revenue: Number(row['收益']) || 0,
        } as Customer;
      });

      onImport(importedCustomers);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ 
        border: '2px dashed #e2e8f0', 
        borderRadius: '16px', 
        padding: '40px 20px', 
        textAlign: 'center',
        background: '#f8fafc',
        cursor: 'pointer'
      }} onClick={() => fileInputRef.current?.click()}>
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileUpload} 
          style={{ display: 'none' }} 
          accept=".xlsx, .xls, .csv"
        />
        <div style={{ background: '#eff6ff', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
          <Upload color="#3b82f6" size={32} />
        </div>
        <h3 style={{ margin: '0 0 8px 0', fontSize: '1.2rem' }}>點擊或拖曳 Excel 檔案至此</h3>
        <p style={{ color: '#64748b', fontSize: '0.9rem', marginBottom: '24px' }}>
          支援 .xlsx, .xls 格式
        </p>
        
        <div style={{ maxWidth: '400px', margin: '0 auto', textAlign: 'left', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <AlertCircle size={14} /> 匯入欄位建議：
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', fontSize: '0.75rem', color: '#64748b' }}>
            <div>• 編號 / 姓名 / 電話</div>
            <div>• 車牌 / 車種 / 施工項目</div>
            <div>• 品牌 / 施工時交車時間</div>
            <div>• 金額 / 成本 / 收益</div>
            <div>• 大禮包已寄送 (是/否)</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={onCancel}>取消</button>
      </div>
    </div>
  );
};
