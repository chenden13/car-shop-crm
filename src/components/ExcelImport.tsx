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
      '編號', '姓名', '電話', '車牌', '車種', '施工項目', '品牌', '膜料細項', '是否叫貨', '是否建立報價單', 
      '備註', '金額', '成本', '收益', '施工時間', '交車時間', '預計施工時間', '健檢時間', 
      'POS系統編號', '大禮包發送', '表單發送', '兩周關心', '是否加入行事曆', '照片是否傳送'
    ], [
      'C-001', '王小明', '0912345678', 'ABC-1234', 'Tesla Model 3', '全車改色膜', '3M', '磨砂陶瓷黑', 'O', 'O',
      '範例備註', '65000', '25000', '40000', '2026-05-01', '2026-05-05', '2026-05-03', '2026-06-05',
      'POS-888', 'O', 'O', 'O', 'O', 'O'
    ]];

    const ws = XLSX.utils.aoa_to_sheet(data);
    XLSX.utils.book_append_sheet(wb, ws, '正式匯入範例');
    XLSX.writeFile(wb, 'HouseWrapper_正式匯入範本.xlsx');
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
        const isChecked = (val: any) => {
          const s = String(val || '').trim().toUpperCase();
          return s === 'O' || s === 'TRUE' || s === '是' || s === '1';
        };

        const parseDate = (val: any) => {
          if (!val) return '';
          if (typeof val === 'number') {
            const date = new Date(Math.round((val - 25569) * 86400 * 1000));
            return date.toISOString().split('T')[0];
          }
          let s = String(val).replace(/\//g, '-').trim();
          if (s.includes(' ')) s = s.split(' ')[0];
          return s;
        };

        return {
          id: row['編號'] ? String(row['編號']) : `無編號-${Date.now()}-${index}`,
          name: String(row['姓名'] || ''),
          phone: String(row['電話'] || ''),
          plateNumber: String(row['車牌'] || ''),
          model: String(row['車種'] || ''),
          status: 'completed',
          
          mainService: String(row['施工項目'] || ''),
          mainServiceBrand: String(row['品牌'] || ''),
          filmColor: String(row['膜料細項'] || ''),
          notes: String(row['備註'] || ''),
          
          materialOrdered: isChecked(row['是否叫貨']),
          quoteCreated: isChecked(row['是否建立報價單']),
          giftGiven: isChecked(row['大禮包發送']),
          formSent: isChecked(row['表單發送']),
          followUp2Weeks: isChecked(row['兩周關心']),
          inCalendar: isChecked(row['是否加入行事曆']),
          photosSent: isChecked(row['照片是否傳送']),
          
          totalAmount: Number(row['金額']) || 0,
          cost: Number(row['成本']) || 0,
          revenue: Number(row['收益']) || (Number(row['金額']) || 0) - (Number(row['成本']) || 0),
          
          expectedStartDate: parseDate(row['施工時間']),
          deliveryDate: parseDate(row['交車時間']),
          expectedEndDate: parseDate(row['預計施工時間']),
          checkupDate: parseDate(row['健檢時間']),
          
          posId: String(row['POS系統編號'] || ''),
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

