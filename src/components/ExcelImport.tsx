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

  const handleDownloadTemplate = () => {
    const wb = XLSX.utils.book_new();
    const data = [[
      '編號', '車主姓名', '電話', '車牌', '品牌', '型號', '施工內容', '施工膜料廠牌', '細項(顏色)',
      '預計施工日期', '施工日期', '交車日期', '總金額', '成本', 
      '活動折扣', '貨號', '是否已叫貨', '是否已開報價單', 
      '大禮包發送', '表單發送', '兩週關懷', '登移行事曆', '備註'
    ], [
      'C-001', '王小明', '0912345678', 'ABC-1234', 'Tesla', 'Model 3', '全車改色膜', '3M', '磨砂陶瓷黑',
      '2024-05-01', '2024-05-02', '2024-05-05', '65000', '25000', 
      '生日優惠', 'TM-332', 'O', 'O', 'O', 'O', 'O', 'O', '範例備註'
    ]];

    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, '匯入範例');
    XLSX.writeFile(wb, 'CRM_匯入範本_全功能版.xlsx');
  };

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
        // 輔助函式：判斷是否為 'O'
        const isChecked = (val: any) => String(val || '').trim().toUpperCase() === 'O';

        // 輔助函式：處理 Excel 五位數日期
        const parseDate = (val: any) => {
          if (!val) return '';
          if (typeof val === 'number') {
            const date = new Date(Math.round((val - 25569) * 86400 * 1000));
            return date.toISOString().split('T')[0];
          }
          return String(val).replace(/\//g, '-').trim();
        };

        return {
          id: row['編號'] ? String(row['編號']) : '無編號',
          name: String(row['車主姓名'] || ''),
          phone: String(row['電話'] || ''),
          plateNumber: String(row['車牌'] || ''),
          brand: String(row['品牌'] || ''),
          model: String(row['型號'] || ''),
          status: 'completed',
          
          mainService: row['施工內容'],
          mainServiceBrand: row['施工膜料廠牌'],
          filmColor: row['細項(顏色)'],
          materialCode: row['貨號'],
          promotion: row['活動折扣'],
          
          giftGiven: isChecked(row['大禮包發送']),
          formSent: isChecked(row['表單發送']),
          followUp2Weeks: isChecked(row['兩週關懷']),
          inCalendar: isChecked(row['登移行事曆']),
          materialOrdered: isChecked(row['是否已叫貨']),
          quoteCreated: isChecked(row['是否已開報價單']),
          
          expectedStartDate: parseDate(row['預計施工日期']),
          deliveryDate: parseDate(row['交車日期']),
          notes: row['備註'],
          
          totalAmount: Number(row['總金額']) || 0,
          cost: Number(row['成本']) || 0,
          revenue: (Number(row['總金額']) || 0) - (Number(row['成本']) || 0),
        } as Customer;
      });



      onImport(importedCustomers);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div style={{ padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>請點擊下載下方範本，填寫後再上傳檔案</p>
        <button 
          className="btn btn-outline" 
          style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#1e293b' }}
          onClick={handleDownloadTemplate}
        >
          <FileSpreadsheet size={18} /> 下載 Excel 匯入範本
        </button>
      </div>

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
        
        <div style={{ maxWidth: '500px', margin: '0 auto', textAlign: 'left', background: '#fff', padding: '16px', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#475569', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <CheckCircle2 size={14} color="#10b981" /> 專業新版欄位支援：
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.75rem', color: '#64748b' }}>
            <div>• 大禮包/表單/關懷實體紀錄</div>
            <div>• 施工/交車/預計施工日期</div>
            <div>• 叫貨狀態與報價單追蹤</div>
            <div>• 行事曆登入狀態與折扣</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px', display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
        <button className="btn btn-outline" onClick={onCancel}>取消</button>
      </div>
    </div>
  );
};

