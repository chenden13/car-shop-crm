import React, { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet, Loader2, CheckCircle, AlertTriangle } from 'lucide-react';
import { api } from '../lib/api';

interface VehicleMasterImportProps {
  onCancel: () => void;
  onSuccess: () => void;
}

export const VehicleMasterImport: React.FC<VehicleMasterImportProps> = ({ onCancel, onSuccess }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<{ count: number; error?: string } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async (evt) => {
      try {
        const bstr = evt.target?.result;
        const wb = XLSX.read(bstr, { type: 'binary' });
        const wsname = wb.SheetNames[0];
        const ws = wb.Sheets[wsname];
        
        // 讀取原始陣列，處理使用者提供的多列式 Excel 配置
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 }) as any[][];
        const vehicles: any[] = [];
        
        // 跳過第一行標題，從第二行開始
        for (let i = 1; i < rows.length; i++) {
          const row = rows[i];
          if (!row) continue;

          // 處理 A-B-C (0,1,2), E-F-G (4,5,6), I-J-K (8,9,10), M-N-O (12,13,14), Q-R-S (16,17,18)
          const columnGroups = [0, 4, 8, 12, 16];
          
          columnGroups.forEach(startIndex => {
            const brand = String(row[startIndex] || '').trim();
            const model = String(row[startIndex + 1] || '').trim();
            const size = String(row[startIndex + 2] || '').trim();

            if (brand && model && brand !== '廠牌') {
              vehicles.push({
                id: `${brand}_${model}`.replace(/\s+/g, '_'),
                brand,
                model,
                size
              });
            }
          });
        }

        if (vehicles.length === 0) {
          throw new Error('找不到有效的車種資料 (請確保包含「廠牌」與「車型」欄位)');
        }

        // 上傳至 Supabase
        await api.upsertVehicleMaster(vehicles);
        setResult({ count: vehicles.length });
        setTimeout(() => onSuccess(), 2000);
      } catch (err: any) {
        console.error('匯入車型母檔失敗:', err);
        setResult({ count: 0, error: err.message || '檔案解析或上傳失敗' });
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div style={{ padding: '20px' }}>
      <header style={{ marginBottom: '24px', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', color: '#1e293b', marginBottom: '8px' }}>
          匯入汽車品牌/車型母檔
        </h2>
        <p style={{ color: '#64748b', fontSize: '0.85rem' }}>
          建立通用的車種資料庫，可加速未來報價時的車型鍵入與車型大小自動帶入。
        </p>
      </header>

      {!result ? (
        <div 
          onClick={() => !isUploading && fileInputRef.current?.click()}
          style={{ 
            border: '2px dashed #cbd5e1', 
            borderRadius: '16px', 
            padding: '48px 20px', 
            textAlign: 'center',
            background: isUploading ? '#f1f5f9' : '#f8fafc',
            cursor: isUploading ? 'not-allowed' : 'pointer',
            transition: 'all 0.2s'
          }}
        >
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileUpload} 
            style={{ display: 'none' }} 
            accept=".xlsx, .xls"
            disabled={isUploading}
          />
          
          {isUploading ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Loader2 className="animate-spin" color="#3b82f6" size={40} />
              <p style={{ marginTop: '16px', color: '#3b82f6', fontWeight: '600' }}>正在處理與存網雲端...</p>
            </div>
          ) : (
            <>
              <div style={{ background: '#eff6ff', width: '64px', height: '64px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <FileSpreadsheet color="#3b82f6" size={32} />
              </div>
              <h3 style={{ margin: '0 0 8px 0', fontSize: '1.1rem', color: '#334155' }}>點擊上傳車型母檔</h3>
              <p style={{ color: '#94a3b8', fontSize: '0.85rem' }}>支援您截圖中的多列式 Excel 配置</p>
            </>
          )}
        </div>
      ) : (
        <div style={{ 
          padding: '40px 20px', 
          borderRadius: '16px', 
          textAlign: 'center',
          background: result.error ? '#fff1f2' : '#f0fdf4',
          border: `1px solid ${result.error ? '#fecaca' : '#bbf7d0'}`
        }}>
          {result.error ? (
            <>
              <AlertTriangle color="#ef4444" size={48} style={{ margin: '0 auto 16px' }} />
              <h3 style={{ color: '#991b1b', margin: '0 0 4px 0' }}>匯入失敗</h3>
              <p style={{ color: '#b91c1c', fontSize: '0.9rem' }}>{result.error}</p>
            </>
          ) : (
            <>
              <CheckCircle color="#10b981" size={48} style={{ margin: '0 auto 16px' }} />
              <h3 style={{ color: '#065f46', margin: '0 0 4px 0' }}>匯入成功</h3>
              <p style={{ color: '#065f46', fontSize: '0.9rem' }}>共成功載入 {result.count} 筆車種資料</p>
            </>
          )}
        </div>
      )}

      <div style={{ marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px' }}>
        <button onClick={onCancel} className="btn btn-outline">關閉</button>
      </div>
    </div>
  );
};
