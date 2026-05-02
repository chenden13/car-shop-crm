import React, { useState, useEffect } from 'react';

interface VehicleAutocompleteProps {
  brand: string;
  model: string;
  vehicleSize: string;
  vehicleMaster: any[];
  onSelect: (data: { brand: string; model: string; vehicleSize: string }) => void;
}

const BUILTIN_VEHICLES = [
  { brand: 'Toyota', model: 'bZ4X', size: 'XL' },
  { brand: 'Toyota', model: 'Corolla Cross', size: 'L' },
  { brand: 'Toyota', model: 'RAV4', size: 'XL' },
  { brand: 'Toyota', model: 'Land Cruiser', size: '2XL' },
  { brand: 'Toyota', model: 'GR86', size: 'S' },
  { brand: 'Toyota', model: '86', size: 'S' },
  { brand: 'Honda', model: 'HR-V', size: 'L' },
  { brand: 'Honda', model: 'CR-V', size: 'XL' },
  { brand: 'Honda', model: 'Pilot / 大七人座', size: '2XL' },
  { brand: 'Hyundai', model: 'i10', size: 'S' },
  { brand: 'Hyundai', model: 'i20', size: 'S' },
  { brand: 'Hyundai', model: 'Accent', size: 'M' },
  { brand: 'Hyundai', model: 'Venue', size: 'M' },
  { brand: 'Hyundai', model: 'Elantra (Avante)', size: 'M' },
  { brand: 'Hyundai', model: 'i30', size: 'M' },
  { brand: 'Hyundai', model: 'Veloster', size: 'M' },
  { brand: 'Hyundai', model: 'Ioniq (油電)', size: 'M' },
  { brand: 'Hyundai', model: 'Kona', size: 'M' },
  { brand: 'Hyundai', model: 'Kona Electric', size: 'M' },
  { brand: 'Hyundai', model: 'Tucson (舊款)', size: 'L' },
  { brand: 'Hyundai', model: 'Tucson L (新款)', size: 'XL' },
  { brand: 'Hyundai', model: 'Santa Fe', size: 'XL' },
  { brand: 'Hyundai', model: 'Palisade', size: '2XL' },
  { brand: 'Hyundai', model: 'Custin (庫斯汀)', size: 'XL' },
  { brand: 'Hyundai', model: 'Staria', size: '2XL' },
  { brand: 'Hyundai', model: 'Grand Starex / H1', size: '2XL' },
  { brand: 'Hyundai', model: 'Ioniq 5', size: 'XL' },
  { brand: 'Hyundai', model: 'Ioniq 6', size: 'L' },
  { brand: 'Hyundai', model: 'Ioniq 7 (未來)', size: '2XL' },
  { brand: 'Mazda', model: 'MX-5', size: 'XS' },
  { brand: 'Subaru', model: 'BRZ', size: 'S' },
  { brand: 'Porsche', model: 'Cayman', size: 'S' },
];

export const VehicleAutocomplete: React.FC<VehicleAutocompleteProps> = ({ 
  brand, model, vehicleSize, vehicleMaster, onSelect 
}) => {
  // 合併雲端母檔與內建清單
  const fullMaster = [...vehicleMaster, ...BUILTIN_VEHICLES];

  // 品牌清單 (去重)
  const brands = Array.from(new Set(fullMaster.map(v => v.brand))).sort();
  
  // 根據目前輸入的品牌，過濾出對應的車型清單
  const filteredModels = fullMaster.filter(v => 
    v.brand && brand && v.brand.toLowerCase() === brand.toLowerCase()
  );

  const handleBrandChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    onSelect({ brand: val, model: '', vehicleSize: '' });
  };

  const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    // 檢查是否選中了清單中的車型
    const match = filteredModels.find(v => v.model === val);
    if (match) {
      onSelect({ brand, model: val, vehicleSize: match.size });
    } else {
      onSelect({ brand, model: val, vehicleSize: '' });
    }
  };

  return (
    <>
      <div className="form-group col-span-4">
        <label className="form-label">汽車品牌</label>
        <input 
          type="text" 
          list="brand-list"
          className="form-control" 
          placeholder="輸入英文字母可快速選擇..." 
          value={brand} 
          onChange={handleBrandChange} 
        />
        <datalist id="brand-list">
          {brands.map(b => <option key={b} value={b} />)}
        </datalist>
      </div>

      <div className="form-group col-span-4">
        <label className="form-label">車種 (Model)</label>
        <input 
          type="text" 
          list="model-list"
          className="form-control" 
          placeholder="請先選擇品牌" 
          value={model} 
          onChange={handleModelChange} 
        />
        <datalist id="model-list">
          {filteredModels.map(m => (
            <option key={m.id} value={m.model}>
              {m.size ? `規格: ${m.size}` : ''}
            </option>
          ))}
        </datalist>
      </div>

      <div className="form-group col-span-4">
        <label className="form-label">車型大小 (尺寸)</label>
        <div 
          className="form-control" 
          style={{ background: '#f1f5f9', display: 'flex', alignItems: 'center', fontWeight: 'bold', color: '#1e293b' }}
        >
          {vehicleSize || '未設定'}
        </div>
      </div>
    </>
  );
};
