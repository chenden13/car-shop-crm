import React, { useState, useEffect } from 'react';
import type { Customer, Accessory, StatusType } from '../types';
import { 
  Plus, Trash2, Calendar, FileText, Settings, Package, 
  CalendarCheck, User, Star, ChevronDown, ChevronUp,
  Camera, Loader2, AlertCircle
} from 'lucide-react';
import { VehicleAutocomplete } from './VehicleAutocomplete';
import { taiwanCounties } from '../data/counties';
import { api } from '../lib/api';
import { getYouTubeEmbedUrl } from '../lib/utils';
import { WindowTintSection } from './WindowTintSection';
import { migrateLegacyTintData } from '../data/tintConfig';

const TINT_PRICE_TABLE: Record<string, { m3: number; m3_sunroof: number; my: number; my_sunroof: number }> = {
  "極黑": { m3: 26500, m3_sunroof: 29500, my: 24500, my_sunroof: 32500 },
  "極透": { m3: 32500, m3_sunroof: 36500, my: 30500, my_sunroof: 40500 },
  "方案1: 前(透)後(黑)": { m3: 30500, m3_sunroof: 33500, my: 28500, my_sunroof: 36500 },
  "方案2: 前、天(透) 身(黑)": { m3: 30500, m3_sunroof: 34500, my: 28500, my_sunroof: 38500 },
  "XC MAX": { m3: 28500, m3_sunroof: 36500, my: 26500, my_sunroof: 34500 },
  "Smart": { m3: 34500, m3_sunroof: 42500, my: 32500, my_sunroof: 40500 },
  "方案3: 前(Smart)身、天(XC)": { m3: 28500, m3_sunroof: 36500, my: 26500, my_sunroof: 34500 },
  "Vega": { m3: 22500, m3_sunroof: 25500, my: 20500, my_sunroof: 26500 },
  "T4": { m3: 26500, m3_sunroof: 30500, my: 24500, my_sunroof: 31500 },
  "方案4: 前(T4)身、天(Vega)": { m3: 24500, m3_sunroof: 27500, my: 22500, my_sunroof: 28500 },
  "方案5: 前、天(T4) 身(Vega)": { m3: 24500, m3_sunroof: 28500, my: 22500, my_sunroof: 29500 },
  "FSK 冰鑽 KT": { m3: 37500, m3_sunroof: 42500, my: 28500, my_sunroof: 40500 },
  "舒熱佳 XE": { m3: 37500, m3_sunroof: 42500, my: 28500, my_sunroof: 40500 },
  "量子膜 ZX": { m3: 35500, m3_sunroof: 42500, my: 28500, my_sunroof: 40500 },
  "皇家 Supreme": { m3: 27500, m3_sunroof: 32500, my: 22500, my_sunroof: 32500 },
  "Xpel-X2 Plus": { m3: 30500, m3_sunroof: 35500, my: 26500, my_sunroof: 37500 },
};

const TINT_GROUPS: Record<string, string[]> = {
  "3M": ["極黑", "極透", "方案1: 前(透)後(黑)", "方案2: 前、天(透) 身(黑)"],
  "桑馬克": ["XC MAX", "Smart", "方案3: 前(Smart)身、天(XC)"],
  "T4 / Vega": ["Vega", "T4", "方案4: 前(T4)身、天(Vega)", "方案5: 前、天(T4) 身(Vega)"],
  "FSK": ["FSK 冰鑽 KT"],
  "舒熱佳": ["舒熱佳 XE"],
  "量子膜": ["量子膜 ZX"],
  "皇家": ["皇家 Supreme"],
  "Xpel": ["Xpel-X2 Plus"]
};

const COLOR_WRAP_SERIES: Record<string, Record<string, number>> = {
  'AX': {
    'E系列': 60000,
    'V系列': 63000,
    'G系列': 65000,
    'T系列': 68000,
  },
  '3M': {
    'G/M/S系列': 70000,
    'GP/SP系列': 75000,
    'HG系列': 80000,
  }
};

const PPF_PRICING: Record<string, Record<string, number>> = {
  'AX': {
    '亮面': 90000,
    '消光': 100000
  },
  'Pixel8bot': {
    '亮面': 100000,
    '消光': 110000
  },
  '3M': {
    '100g (亮面)': 110000,
    '150g (亮面)': 125000,
    '200g (亮面)': 135000,
    '200m (消光)': 145000
  },
  'Stek': {
    'Lite (亮面)': 130000,
    'Matte (消光)': 140000
  }
};

const FRONT_PPF_PRICING: Record<string, number> = {
  'Pixel8bit': 35000,
  '3M 150g': 45000,
  '3M 200g': 55000
};

// 迎風面犀牛皮價格 (XS~L 基本價，XL+5000，2XL+10000)
const WIND_PPF_PRICING: Record<string, number> = {
  'Pixel8bit': 35000,
  '3M 150g': 45000,
  '3M 200g': 55000
};

const REAR_COATING_PRICING: Record<string, number> = {
  'Servfaces (一年期)': 12000,
  'CarPro (兩年期)': 18000
};

const MIRROR_REC_LIST: Record<string, number> = {
  '大邁 M996': 12800,
  '快譯通 S95B': 14000,
  '快譯通 S95A': 14000,
  '快譯通 S86': 12000,
  'DOD T-one plus': 20000
};

const DASHCAM_REC_LIST: Record<string, number> = {
  '快譯通 V92GH': 11500
};

const SIZE_OFFSET: Record<string, number> = {
  'XS': -5000,
  'S': 0,
  'M': 5000,
  'L': 10000,
  'XL': 15000,
  '2XL': 20000,
};



const PROMOTIONS = [
  { id: 'none', label: '無優惠', type: 'none', val: 0 },
  { id: '520-1', label: '520活動-1 (98折)', type: 'discount', val: 0.98 },
  { id: '520-2', label: '520活動-2 (95折)', type: 'discount', val: 0.95 },
  { id: '520-3', label: '520活動-3 (9折)', type: 'discount', val: 0.90 },
  { id: '0520', label: '0520限定 (85折)', type: 'discount', val: 0.85 },
  { id: 'front-wind', label: '迎風面方案 (贈玻璃/迎風鍍膜)', type: 'none', val: 0, note: '贈送迎風面鍍膜 玻璃鍍膜' },
  { id: '3m', label: '3M限定 (-3000)', type: 'minus', val: 3000 },
  { id: 'new-car', label: '新車優惠 (-2000)', type: 'minus', val: 2000 },
  { id: 'sx-rhino', label: 'S/X限定 犀牛皮 (-10000)', type: 'minus', val: 10000 },
  { id: 'sx-color', label: 'S/X限定 改色 (送迎風面)', type: 'none', val: 0, note: '送迎風面' },
  { id: 'cross-month', label: '跨月施工 (贈兩項配件)', type: 'none', val: 0, note: '贈送兩項配件' },
  { id: 'gift-pack', label: '萬元大禮包 (贈五項配件)', type: 'none', val: 0, note: '贈送五項配件' },
  { id: 'unlock-car', label: '解鎖車種 前兩台 (95折)', type: 'discount', val: 0.95 },
  { id: 'group-2-3', label: '團購-2~3人 (95折)', type: 'discount', val: 0.95 },
  { id: 'group-4+', label: '團購-4人以上 (9折)', type: 'discount', val: 0.90 },
  { id: 'other', label: '其他 (手動輸入)', type: 'custom', val: 0 },
];

interface PendingEditFormProps {
  customer?: Customer; 
  onSuggestId?: string;
  userRole?: Role;
  defaultStatus?: 'new' | 'scheduled'; // 新增: 決定新增客戶時的預設狀態
  onSubmit: (updatedCustomer: Customer, moveToConstruction: boolean, originalId?: string) => void;
  onCancel: () => void;
  hideActions?: boolean;
  onFormDataChange?: (data: Partial<Customer>) => void;
}

export const PendingEditForm: React.FC<PendingEditFormProps> = ({ 
  customer, onSuggestId, defaultStatus, onSubmit, onCancel, hideActions, onFormDataChange 
}) => {
  const [formData, setFormData] = useState<Partial<Customer>>(() => {
    if (customer) {
      // 修正過往可能導致交車日期被清空的遷移邏輯
      // 確保 expectedEndDate (預計交車日期) 不會被 deliveryDate (通常施工中為空) 覆蓋
      return migrateLegacyTintData({ 
        ...customer, 
        constructionStartDate: customer.constructionStartDate || '',
        expectedEndDate: customer.expectedEndDate || '',
        customAccessories: customer.customAccessories || [] 
      });
    }
    // defaultStatus 由呼叫端決定：待施工區新增用 'scheduled'，諮詢區新增用 'new'
    return { id: onSuggestId, status: defaultStatus || 'scheduled', customAccessories: [] };
  });
  const [originalId] = useState(customer?.id);
  
  const [showConsultation, setShowConsultation] = useState(false);
  const [selectedPart, setSelectedPart] = useState<string>('前保桿');
  const [tintCategory, setTintCategory] = useState<string>(() => {
    // 試圖從現有規格反推分類
    const currentSpec = customer?.windowTintBrand || '';
    const found = Object.entries(TINT_GROUPS).find(([, specs]) => specs.includes(currentSpec));
    if (found) return found[0];
    if (currentSpec || customer?.windowTint) return '其他 (手動自訂)';
    return '';
  });
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    if (onFormDataChange) {
      onFormDataChange(formData);
    }
  }, [formData, onFormDataChange]);

  const CAR_PARTS = ['前保桿', '引擎蓋', '車頂', '左前葉', '右前葉', '左前門', '右前門', '左後門', '右後門', '左後葉', '右後葉', '尾箱上', '尾箱下', '後保桿', '鋼琴烤漆', '其他'];
  
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'damage' | 'progress') => {
    if (e.target.files && e.target.files.length > 0 && formData.id) {
      setIsUploading(true);
      const filesArray = Array.from(e.target.files);
      
      try {
        const uploadPromises = filesArray.map(async (file) => {
          const timestamp = Date.now();
          const fileName = `${formData.id}_${type}_${selectedPart}_${timestamp}_${file.name}`;
          const path = `${formData.id}/${type}/${fileName}`;
          const url = await api.uploadPhoto(file, path);
          return { category: selectedPart, url };
        });

        const uploadedPhotos = await Promise.all(uploadPromises);

        if (type === 'damage') {
          setFormData(prev => ({ ...prev, damagePhotos: [...(prev.damagePhotos || []), ...uploadedPhotos] }));
        } else {
          setFormData(prev => ({ ...prev, progressPhotos: [...(prev.progressPhotos || []), ...uploadedPhotos] }));
        }
      } catch (err) {
        console.error('上傳失敗:', err);
        alert('照片上傳失敗: ' + (err.message || '請重新檢查儲存空間分頁'));
      } finally {
        setIsUploading(false);
      }
    }
  };

  const removePhoto = (url: string, type: 'damage' | 'progress') => {
    if (type === 'damage') {
      setFormData(prev => ({ ...prev, damagePhotos: prev.damagePhotos?.filter(p => p.url !== url) }));
    } else {
      setFormData(prev => ({ ...prev, progressPhotos: prev.progressPhotos?.filter(p => p.url !== url) }));
    }
  };
  
  const [prices, setPrices] = useState({
    mainServicePrice: customer?.mainServicePrice || 0,
    windowTintPrice: customer?.windowTintPrice || 0,
    digitalMirrorPrice: customer?.digitalMirrorPrice || 0,
    electricModPrice: customer?.electricModPrice || 0,
    rearCoatingPrice: customer?.rearCoatingPrice || 0,
    hoodPpfPrice: customer?.hoodPpfPrice || 0,
    cost: customer?.cost || 0,
    manualTotalPrice: customer?.totalAmount || 0,
    useManualTotal: false
  });

  const handleWindowTintChange = (updates: Partial<Customer>) => {
    setFormData(prev => ({ ...prev, ...updates }));
    if (updates.windowTintPrice !== undefined) {
      setPrices(prev => ({ ...prev, windowTintPrice: updates.windowTintPrice || 0 }));
    }
  };

  const getInitialDiscounts = (): string[] => {
     if (!customer?.appliedDiscountName) return [];
     const names = customer.appliedDiscountName.split(', ');
     const ids: string[] = [];
     names.forEach(name => {
       const matched = PROMOTIONS.find(p => p.label === name);
       if (matched) {
         ids.push(matched.id);
       } else {
         if (name) ids.push('other');
       }
     });
     return ids;
  };
  const [discountTypes, setDiscountTypes] = useState<string[]>(getInitialDiscounts());
  const [customDiscountName, setCustomDiscountName] = useState(
    getInitialDiscounts().includes('other') ? customer?.appliedDiscountName?.split(', ').find(n => !PROMOTIONS.find(p => p.label === n)) || '' : ''
  );
  const [customDiscountAmount, setCustomDiscountAmount] = useState(
    getInitialDiscounts().includes('other') ? customer?.discountAmount || 0 : 0
  );

  const toggleDiscount = (id: string) => {
    setDiscountTypes(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  React.useEffect(() => {
    // 隔熱紙對應價格邏輯 (針對 Tesla Model 3 / Y)
    const model = (formData.model || '').toLowerCase();
    const brand = formData.windowTintBrand || '';
    
    if ((model.includes('model 3') || model.includes('model y')) && TINT_PRICE_TABLE[brand]) {
       const isM3 = model.includes('model 3');
       const hasSunroof = formData.hasSunroof;
       let targetPrice = 0;
       
       const entry = TINT_PRICE_TABLE[brand];
       if (isM3) {
         targetPrice = hasSunroof ? entry.m3_sunroof : entry.m3;
       } else {
         targetPrice = hasSunroof ? entry.my_sunroof : entry.my;
       }
       
       if (targetPrice > 0) {
         setPrices(prev => ({ ...prev, windowTintPrice: targetPrice }));
       }
    }
  }, [formData.model, formData.windowTintBrand, formData.hasSunroof]);

  // 主施工項目 (改色/犀牛皮) 對應價格邏輯
  React.useEffect(() => {
    const service = formData.mainService || '';
    const brand = formData.mainServiceBrand || '';
    const series = formData.mainServiceSeries || '';
    const size = formData.vehicleSize || '';
    
    if ((service === '改色' || service === '全車改色膜') && (brand === 'AX' || brand === '3M') && series) {
      const basePrices = COLOR_WRAP_SERIES[brand];
      if (basePrices && basePrices[series]) {
        const basePrice = basePrices[series];
        const offset = SIZE_OFFSET[size] || 0;
        const targetPrice = basePrice + offset;
        
        if (targetPrice > 0 && prices.mainServicePrice !== targetPrice) {
          setPrices(prev => ({ ...prev, mainServicePrice: targetPrice }));
        }
      }
    } else if ((service === '犀牛皮' || service === '全車犀牛皮') && brand && series) {
      const basePrices = PPF_PRICING[brand];
      if (basePrices && basePrices[series]) {
        const basePrice = basePrices[series];
        const offset = SIZE_OFFSET[size] || 0;
        const targetPrice = basePrice + offset;
        
        if (targetPrice > 0 && prices.mainServicePrice !== targetPrice) {
          setPrices(prev => ({ ...prev, mainServicePrice: targetPrice }));
        }
      }
    } else if (service === '局部保護/改色' && brand && FRONT_PPF_PRICING[brand]) {
      const base = FRONT_PPF_PRICING[brand];
      let targetPrice = base;
      if (size === 'XL') targetPrice += 5000;
      else if (size === '2XL') targetPrice += 10000;
      
      if (targetPrice > 0 && prices.mainServicePrice !== targetPrice) {
        setPrices(prev => ({ ...prev, mainServicePrice: targetPrice }));
      }
    } else if ((service === '迎風面' || service === '迎風面犀牛皮') && brand && WIND_PPF_PRICING[brand]) {
      const base = WIND_PPF_PRICING[brand];
      let targetPrice = base;
      if (size === 'XL') targetPrice += 5000;
      else if (size === '2XL') targetPrice += 10000;
      
      if (targetPrice > 0 && prices.mainServicePrice !== targetPrice) {
        setPrices(prev => ({ ...prev, mainServicePrice: targetPrice }));
      }
    }
  }, [formData.mainService, formData.mainServiceBrand, formData.mainServiceSeries, formData.vehicleSize]);

  // 後半車鍍膜價格邏輯
  React.useEffect(() => {
    const rearCoating = formData.rearCoating || '';
    const size = formData.vehicleSize || '';
    
    if (rearCoating && REAR_COATING_PRICING[rearCoating]) {
      const base = REAR_COATING_PRICING[rearCoating];
      let targetPrice = base;
      if (size === 'L') targetPrice += 1000;
      else if (size === 'XL') targetPrice += 2000;
      else if (size === '2XL') targetPrice += 3000;
      
      if (targetPrice > 0 && prices.rearCoatingPrice !== targetPrice) {
        setPrices(prev => ({ ...prev, rearCoatingPrice: targetPrice }));
      }
    } else if (!rearCoating && prices.rearCoatingPrice !== 0) {
      setPrices(prev => ({ ...prev, rearCoatingPrice: 0 }));
    }
  }, [formData.rearCoating, formData.vehicleSize]);

  // 改色加購引擎蓋犀牛皮邏輯
  React.useEffect(() => {
    const hasHoodPpf = formData.hasHoodPpf;
    const service = formData.mainService || '';
    
    if ((service === '改色' || service === '全車改色膜') && hasHoodPpf) {
      if (prices.hoodPpfPrice !== 18000) {
        setPrices(prev => ({ ...prev, hoodPpfPrice: 18000 }));
      }
    } else if (prices.hoodPpfPrice !== 0) {
      setPrices(prev => ({ ...prev, hoodPpfPrice: 0 }));
    }
  }, [formData.hasHoodPpf, formData.mainService]);

  // 犀牛皮自動將規格/系列填入膜料顏色 (迎風面犀牛皮、汽車美容、鍍膜則清空顏色)
  React.useEffect(() => {
    if (formData.mainService === '犀牛皮' || formData.mainService === '全車犀牛皮') {
      const spec = formData.mainServiceSeries || '';
      if (formData.filmColor !== spec) {
        setFormData(prev => ({ ...prev, filmColor: spec }));
      }
    } else if (formData.mainService === '迎風面' || formData.mainService === '迎風面犀牛皮' || formData.mainService === '汽車美容' || formData.mainService === '鍍膜') {
      // 迎風面犀牛皮、汽車美容、鍍膜無顏色，清空 filmColor
      if (formData.filmColor) {
        setFormData(prev => ({ ...prev, filmColor: '' }));
      }
    }
  }, [formData.mainService, formData.mainServiceSeries]);

  // 電子後視鏡價格邏輯
  React.useEffect(() => {
    const mirror = formData.digitalMirror || '';
    if (mirror && MIRROR_REC_LIST[mirror]) {
      const targetPrice = MIRROR_REC_LIST[mirror];
      if (prices.digitalMirrorPrice !== targetPrice) {
        setPrices(prev => ({ ...prev, digitalMirrorPrice: targetPrice }));
      }
    }
  }, [formData.digitalMirror]);

  // 行車記錄器價格邏輯 (若電動改裝或其他欄位有用到)
  React.useEffect(() => {
    const mod = formData.electricMod || '';
    if (mod && DASHCAM_REC_LIST[mod]) {
      const targetPrice = DASHCAM_REC_LIST[mod];
      if (prices.electricModPrice !== targetPrice) {
        setPrices(prev => ({ ...prev, electricModPrice: targetPrice }));
      }
    }
  }, [formData.electricMod]);

  let subtotal = (prices.mainServicePrice || 0) + (prices.windowTintPrice || 0) + (prices.digitalMirrorPrice || 0) + (prices.electricModPrice || 0) + (prices.rearCoatingPrice || 0) + (prices.hoodPpfPrice || 0);
  formData.customAccessories?.forEach(acc => {
    subtotal += Number(acc.price) || 0;
  });

  let discountAmount = 0;
  let currentSubtotal = subtotal;

  // 1. First apply multipliers
  discountTypes.forEach(id => {
    const promo = PROMOTIONS.find(p => p.id === id);
    if (promo && promo.type === 'discount') {
      const reduction = Math.round(currentSubtotal * (1 - promo.val));
      discountAmount += reduction;
      currentSubtotal -= reduction;
    }
  });

  // 2. Then apply fixed minus amounts
  discountTypes.forEach(id => {
    const promo = PROMOTIONS.find(p => p.id === id);
    if (promo && promo.type === 'minus') {
      discountAmount += promo.val;
    } else if (promo && promo.type === 'custom') {
      discountAmount += customDiscountAmount;
    }
  });
  
  const calculatedTotalPrice = subtotal - discountAmount;
  const totalPrice = prices.useManualTotal ? prices.manualTotalPrice : calculatedTotalPrice;
  const profit = totalPrice - (prices.cost || 0);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPrices(prev => ({ ...prev, [name]: Number(value) }));
  };

  const handleToggleState = (field: 'inCalendar' | 'materialOrdered') => {
    setFormData(prev => ({ ...prev, [field]: !prev[field] }));
  };



  const addAccessory = () => {
    const newAcc: Accessory = { id: `acc_${Date.now()}`, name: '', price: 0 };
    setFormData(prev => ({ ...prev, customAccessories: [...(prev.customAccessories || []), newAcc] }));
  };

  const updateAccessory = (id: string, field: 'name' | 'price', value: string | number) => {
    setFormData(prev => ({
      ...prev,
      customAccessories: prev.customAccessories?.map(acc =>
        acc.id === id ? { ...acc, [field]: value } : acc
      )
    }));
  };

  const removeAccessory = (id: string) => {
    setFormData(prev => ({
      ...prev,
      customAccessories: prev.customAccessories?.filter(acc => acc.id !== id)
    }));
  };

  const prepareSubmitData = (status: StatusType): Customer => {
    const appliedNames: string[] = [];
    discountTypes.forEach(id => {
      const promo = PROMOTIONS.find(p => p.id === id);
      if (promo) {
        if (promo.type === 'custom' && customDiscountName) {
          appliedNames.push(customDiscountName);
        } else if (promo.type !== 'none' || promo.id === 'front-wind' || promo.id === 'sx-color' || promo.id === 'cross-month' || promo.id === 'gift-pack') {
          appliedNames.push(promo.label);
        }
      }
    });
    
    // Auto-append notes if exists
    let finalNotes = formData.notes || '';
    discountTypes.forEach(id => {
      const promo = PROMOTIONS.find(p => p.id === id);
      if (promo?.note && !finalNotes.includes(promo.note)) {
        finalNotes = finalNotes ? `${finalNotes}\n* 活動備註: ${promo.note}` : `* 活動備註: ${promo.note}`;
      }
    });

    const finalWindowTint = formData.windowTint || '';

    return {
      ...(formData as Customer),
      windowTint: finalWindowTint,
      notes: finalNotes,
      status,
      totalAmount: totalPrice,
      revenue: profit,
      appliedDiscountName: appliedNames.join(', '),
      discountAmount: discountAmount,
      mainServicePrice: prices.mainServicePrice,
      windowTintPrice: prices.windowTintPrice,
      digitalMirrorPrice: prices.digitalMirrorPrice,
      electricModPrice: prices.electricModPrice,
      rearCoatingPrice: prices.rearCoatingPrice,
      hoodPpfPrice: prices.hoodPpfPrice,
      cost: prices.cost
    };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    // 【重要】儲存諮詢內容時，保持原本的 status，不自動升級到 scheduled
    // 只有按「轉為正式下定」才會改變 status
    const status = (formData.status as StatusType) || 'new';
    onSubmit(prepareSubmitData(status), false, originalId);
  };



  const handleMoveToCompleted = (e: React.FormEvent) => {
    e.preventDefault();
    const isConfirm = window.confirm('確定要將此案件設為「已完工」嗎？此案件將進入已完工存檔區。');
    if (!isConfirm) return;

    const today = new Date().toISOString().split('T')[0];
    const checkup = new Date();
    checkup.setMonth(checkup.getMonth() + 1);

    const updatedData = {
      ...prepareSubmitData('completed'),
      deliveryDate: today,
      checkupDate: checkup.toISOString().split('T')[0]
    };

    onSubmit(updatedData, false, originalId);
  };

  const handleConvert = () => {
    const isConfirm = window.confirm('確定要將此諮詢案件轉為「正式下定」嗎？轉入後將可以填寫報價與排程時間。');
    if (!isConfirm) return;
    onSubmit(prepareSubmitData('scheduled'), false, originalId);
  };

  const handleRevertToInquiry = () => {
    const isConfirm = window.confirm('確定要將此案件「退回諮詢進件區」嗎？狀態將變回新案件，並從排程名單中移除。');
    if (!isConfirm) return;
    onSubmit(prepareSubmitData('new'), false, originalId);
  };

  return (
    <form className="form-grid" style={{ maxHeight: '85vh', overflowY: 'auto', paddingRight: '12px' }} onSubmit={(e) => e.preventDefault()}>
      
      {/* ── 諮詢與客戶特徵 (折疊區) ── */}
      <div className="col-span-12" style={{ border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden', marginTop: '10px' }}>
        <button 
          type="button"
          onClick={() => setShowConsultation(!showConsultation)}
          style={{ width: '100%', padding: '12px 16px', background: '#f8fafc', border: 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', color: '#475569', fontWeight: 'bold' }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star size={18} color="#ef4444" /> 
            <span>諮詢內容與客戶特徵 (視需要展開)</span>
          </div>
          {showConsultation ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
        </button>

        {showConsultation && (
          <div style={{ padding: '20px', display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '15px', background: '#fff' }}>
            {/* 諮詢意向 */}
            <h3 className="section-title col-span-12" style={{ color: '#ef4444', fontSize: '1rem', borderBottom: '1px dashed #fee2e2', paddingBottom: '4px' }}>
              諮詢進件重點
            </h3>
            <div className="form-group col-span-8">
              <label className="form-label" style={{ color: '#ef4444' }}>感興趣的配件與需求</label>
              <input type="text" name="interestedAccessories" className="form-control" placeholder="客戶諮詢時提到的配件需求..." value={formData.interestedAccessories || ''} onChange={handleChange} />
            </div>
            <div className="form-group col-span-4">
              <label className="form-label">諮詢日期</label>
              <input type="date" name="consultationDate" className="form-control" value={formData.consultationDate || ''} onChange={handleChange} />
            </div>

            {/* 客戶特徵 */}
            <h3 className="section-title col-span-12" style={{ borderBottom: '1px dashed #e2e8f0', paddingBottom: '4px', marginTop: '10px' }}>
              客戶特徵習性與細項紀錄
            </h3>
            <div className="form-group col-span-4">
              <label className="form-label">工作/地點</label>
              <select name="location" className="form-control" value={formData.location || ''} onChange={handleChange}>
                <option value="">請選擇</option>
                {taiwanCounties.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group col-span-4">
              <label className="form-label">告知管道</label>
              <input type="text" name="fromChannel" className="form-control" value={formData.fromChannel || ''} onChange={handleChange} />
            </div>
            <div className="form-group col-span-4">
              <label className="form-label">方便聯絡/留車</label>
              <select name="convenientTime" className="form-control" value={formData.convenientTime || ''} onChange={handleChange}>
                <option value="">請選擇</option>
                <option value="weekday">平日</option>
                <option value="weekend">假日</option>
              </select>
            </div>

            <div className="form-group col-span-3">
              <label className="form-label">同行狀態</label>
              <select name="companion" className="form-control" value={formData.companion || 'alone'} onChange={handleChange}>
                <option value="alone">一個人</option>
                <option value="with_child">帶小孩</option>
                <option value="with_family">帶家人</option>
                <option value="with_wife">帶老婆/伴侶</option>
              </select>
            </div>
            <div className="form-group col-span-3">
               <label className="form-label">體型/外觀</label>
               <select name="bodyType" className="form-control" value={formData.bodyType || ''} onChange={handleChange}>
                 <option value="">未記錄</option>
                 <option value="slim">瘦</option>
                 <option value="average">中等</option>
                 <option value="heavy">偏胖</option>
               </select>
            </div>
            <div className="form-group col-span-3">
               <label className="form-label">髮型</label>
               <select name="hairLength" className="form-control" value={formData.hairLength || ''} onChange={handleChange}>
                 <option value="">未記錄</option>
                 <option value="short">短髮</option>
                 <option value="medium">中長</option>
                 <option value="long">長髮</option>
               </select>
            </div>
            <div className="form-group col-span-3">
               <label className="form-label">經濟預算</label>
               <select name="wealthLevel" className="form-control" value={formData.wealthLevel || ''} onChange={handleChange}>
                 <option value="">未記錄</option>
                 <option value="high">預算高</option>
                 <option value="medium">一般</option>
                 <option value="normal">小資</option>
               </select>
            </div>
            
            <div className="form-group col-span-3">
               <label className="form-label">職業</label>
               <input type="text" name="occupation" className="form-control" placeholder="職業" value={formData.occupation || ''} onChange={handleChange} />
            </div>
            <div className="form-group col-span-3">
               <label className="form-label">興趣/愛好</label>
               <input type="text" name="hobbies" className="form-control" placeholder="例如: 高爾夫, 露營" value={formData.hobbies || ''} onChange={handleChange} />
            </div>
            <div className="form-group col-span-6">
               <label className="form-label">地址</label>
               <input type="text" name="address" className="form-control" value={formData.address || ''} onChange={handleChange} />
            </div>
            
            <div className="form-group col-span-12" style={{ display: 'flex', gap: '20px', flexWrap: 'wrap', background: '#f8fafc', padding: '12px', borderRadius: '8px' }}>
              <label className="checkbox-wrap"><input type="checkbox" name="detailOriented" checked={!!formData.detailOriented} onChange={handleChange} /> 在意細節</label>
              <label className="checkbox-wrap"><input type="checkbox" name="easyGoing" checked={!!formData.easyGoing} onChange={handleChange} /> 好相處</label>
              <label className="checkbox-wrap"><input type="checkbox" name="likesCalls" checked={!!formData.likesCalls} onChange={handleChange} /> 喜歡電話</label>
              <label className="checkbox-wrap"><input type="checkbox" name="wearsGlasses" checked={!!formData.wearsGlasses} onChange={handleChange} /> 戴眼鏡</label>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginLeft: '10px', borderLeft: '1px solid #cbd5e1', paddingLeft: '20px' }}>
                <span className="form-label" style={{ margin: 0 }}>性格性質:</span>
                <label className="checkbox-wrap"><input type="radio" name="personality" value="introvert" checked={formData.personality === 'introvert'} onChange={handleChange} /> 內向</label>
                <label className="checkbox-wrap"><input type="radio" name="personality" value="extrovert" checked={formData.personality === 'extrovert'} onChange={handleChange} /> 外向</label>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ── 基本資料 ── */}
      <h3 className="section-title col-span-12" style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginTop: '15px' }}>
        <User size={18} /> 客戶基本資料
      </h3>
      
      <div className="form-group col-span-3">
        <label className="form-label">客戶編號*</label>
        <input required type="text" name="id" className="form-control" value={formData.id || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">姓名*</label>
        <input required type="text" name="name" className="form-control" value={formData.name || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">電話*</label>
        <input required type="tel" name="phone" className="form-control" value={formData.phone || ''} onChange={handleChange} />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">生日</label>
        <input type="date" name="birthday" className="form-control" value={formData.birthday || ''} onChange={handleChange} />
      </div>

      {/* ── 車輛資訊 ── */}
      <h3 className="section-title col-span-12" style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginTop: '15px' }}>
        <Package size={18} /> 車輛硬體資訊
      </h3>
      <div className="form-group col-span-4">
        <label className="form-label">車牌號碼</label>
        <input type="text" name="plateNumber" className="form-control" placeholder="ABC-1234" value={formData.plateNumber || ''} onChange={handleChange} />
      </div>
      <VehicleAutocomplete 
        brand={formData.brand || ''}
        model={formData.model || ''}
        vehicleSize={formData.vehicleSize || ''}
        detailingSize={formData.detailingSize || ''}
        onSelect={(data) => setFormData(prev => ({ ...prev, ...data }))}
      />

      {/* ── 施工排程與備料 ── */}
      {formData.status !== 'new' && (
        <>
          <h3 className="section-title col-span-12" style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginTop: '20px' }}>
            <Calendar size={18} /> 施工排程與備料
          </h3>

          <div className="form-group col-span-3">
            <label className="form-label" style={{ color: '#0369a1', fontWeight: 'bold' }}>1. 留車/進場日期</label>
            <input required type="date" name="expectedStartDate" className="form-control" value={formData.expectedStartDate || ''} onChange={handleChange} style={{ borderColor: '#0ea5e9' }} />
          </div>
          <div className="form-group col-span-3">
            <label className="form-label" style={{ color: '#0369a1' }}>進場/留車時間</label>
            <input type="text" name="constructionTime" className="form-control" placeholder="e.g. 09:30" value={formData.constructionTime || ''} onChange={handleChange} />
          </div>

          <div className="form-group col-span-6">
            <label className="form-label" style={{ color: '#166534', fontWeight: 'bold' }}>2. 預計施工時間 (範圍)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input required type="date" name="constructionStartDate" className="form-control" value={formData.constructionStartDate || ''} onChange={handleChange} style={{ borderColor: '#22c55e' }} />
              <span style={{ color: '#94a3b8' }}>至</span>
              <input type="date" name="constructionEndDate" className="form-control" value={formData.constructionEndDate || ''} onChange={handleChange} style={{ borderColor: '#22c55e' }} />
            </div>
          </div>

          <div className="form-group col-span-6">
            <label className="form-label" style={{ color: '#be185d', fontWeight: 'bold' }}>3. 預計交車日期</label>
            <input required type="date" name="expectedEndDate" className="form-control" value={formData.expectedEndDate || ''} onChange={handleChange} style={{ borderColor: '#ec4899' }} />
          </div>
          <div className="form-group col-span-6">
            <label className="form-label" style={{ color: '#be185d' }}>具體交車時間</label>
            <input type="text" name="expectedDeliveryTime" className="form-control" placeholder="e.g. 17:00" value={formData.expectedDeliveryTime || ''} onChange={handleChange} />
          </div>

          <div className="col-span-12">
            <label className="form-label" style={{ marginBottom: '8px' }}>備料與行事曆狀態</label>
            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                type="button"
                onClick={() => handleToggleState('inCalendar')}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `2px solid ${formData.inCalendar ? '#10b981' : '#e2e8f0'}`, background: formData.inCalendar ? '#f0fdf4' : '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', color: formData.inCalendar ? '#166534' : '#64748b', transition: 'all 0.2s' }}
              >
                <CalendarCheck size={16} />
                {formData.inCalendar ? '✓ 已加入行事曆' : '加入行事曆'}
              </button>
              <button
                type="button"
                onClick={() => handleToggleState('materialOrdered')}
                style={{ flex: 1, padding: '12px', borderRadius: '12px', border: `2px solid ${formData.materialOrdered ? '#10b981' : '#e2e8f0'}`, background: formData.materialOrdered ? '#f0fdf4' : '#f8fafc', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: '700', color: formData.materialOrdered ? '#166534' : '#64748b', transition: 'all 0.2s' }}
              >
                <Package size={16} />
                {formData.materialOrdered ? '✓ 膜料已叫貨' : '膜料叫貨'}
              </button>
            </div>
          </div>

          {/* ── 施工報價項目 ── */}
          <h3 className="section-title col-span-12" style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginTop: '20px' }}>
            <FileText size={18} /> 施工報價明細
          </h3>

          {/* 主施工 */}
          <div className="form-group col-span-4">
            <label className="form-label">主施工項目</label>
            <select name="mainService" className="form-control" value={formData.mainService || ''} onChange={handleChange}>
              <option value="">請選擇</option>
              <option value="改色">改色</option>
              <option value="犀牛皮">犀牛皮</option>
              <option value="改色犀牛皮">改色犀牛皮</option>
              <option value="迎風面">迎風面</option>
              <option value="局部保護/改色">局部保護/改色</option>
              <option value="汽車美容">汽車美容</option>
              <option value="鍍膜">鍍膜</option>
            </select>
          </div>
          <div className="form-group col-span-2">
            <label className="form-label">品牌/項目</label>
            {(formData.mainService === '汽車美容' || formData.mainService === '鍍膜' || formData.mainService === '改色犀牛皮') ? (
              <input
                type="text"
                name="mainServiceBrand"
                className="form-control"
                placeholder="手動輸入項目/品牌"
                value={formData.mainServiceBrand || ''}
                onChange={handleChange}
              />
            ) : (
              <select name="mainServiceBrand" className="form-control" value={formData.mainServiceBrand || ''} onChange={(e) => {
                handleChange(e);
                setFormData(prev => ({ ...prev, mainServiceSeries: '' }));
              }}>
                <option value="">選擇品牌</option>
                {((formData.mainService || '').includes('改色') 
                  ? ['AX', '3M', 'CYS', 'TeckWrap'] 
                  : (formData.mainService === '犀牛皮' || formData.mainService === '全車犀牛皮')
                    ? ['AX', 'Pixel8bot', '3M', 'Stek']
                    : (formData.mainService === '迎風面' || formData.mainService === '迎風面犀牛皮')
                      ? ['Pixel8bit', '3M 150g', '3M 200g']
                      : (formData.mainService === '局部保護/改色')
                        ? ['Pixel8bit', '3M 150g', '3M 200g']
                        : ['3M', 'Michelin', 'Atarap', 'Stek']
                ).map(brand => <option key={brand} value={brand}>{brand}</option>)}
              </select>
            )}
          </div>

          {(formData.mainService === '改色' || formData.mainService === '全車改色膜') && (formData.mainServiceBrand === 'AX' || formData.mainServiceBrand === '3M') && (
            <div className="form-group col-span-2">
              <label className="form-label" style={{ color: '#2563eb', fontWeight: 'bold' }}>等級/系列</label>
              <select name="mainServiceSeries" className="form-control" value={formData.mainServiceSeries || ''} onChange={handleChange} style={{ borderColor: '#3b82f6', background: '#eff6ff' }}>
                <option value="">選擇系列</option>
                {Object.keys(COLOR_WRAP_SERIES[formData.mainServiceBrand] || {}).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          {(formData.mainService === '犀牛皮' || formData.mainService === '全車犀牛皮') && formData.mainServiceBrand && (
            <div className="form-group col-span-2">
              <label className="form-label" style={{ color: '#059669', fontWeight: 'bold' }}>規格/系列</label>
              <select name="mainServiceSeries" className="form-control" value={formData.mainServiceSeries || ''} onChange={handleChange} style={{ borderColor: '#10b981', background: '#f0fdf4' }}>
                <option value="">選擇規格</option>
                {Object.keys(PPF_PRICING[formData.mainServiceBrand] || {}).map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
          )}

          <div className="form-group col-span-2">
            <label className="form-label">膜料顏色</label>
            <input 
              type="text" 
              name="filmColor" 
              className="form-control" 
              placeholder={(formData.mainService === '犀牛皮' || formData.mainService === '全車犀牛皮' || formData.mainService === '迎風面' || formData.mainService === '迎風面犀牛皮' || formData.mainService === '汽車美容' || formData.mainService === '鍍膜') ? '無須填寫' : '顏色細項'} 
              value={formData.filmColor || ''} 
              onChange={handleChange} 
              disabled={formData.mainService === '犀牛皮' || formData.mainService === '全車犀牛皮' || formData.mainService === '迎風面' || formData.mainService === '迎風面犀牛皮' || formData.mainService === '汽車美容' || formData.mainService === '鍍膜'}
              style={(formData.mainService === '犀牛皮' || formData.mainService === '全車犀牛皮' || formData.mainService === '迎風面' || formData.mainService === '迎風面犀牛皮' || formData.mainService === '汽車美容' || formData.mainService === '鍍膜') ? { backgroundColor: '#f1f5f9', cursor: 'not-allowed' } : undefined}
            />
          </div>
          <div className={`form-group ${(formData.mainService === '改色' || formData.mainService === '全車改色膜') && (formData.mainServiceBrand === 'AX' || formData.mainServiceBrand === '3M') ? 'col-span-2' : 'col-span-4'}`}>
            <label className="form-label">施工價格 ($)</label>
            <input type="number" name="mainServicePrice" className="form-control" value={prices.mainServicePrice || ''} onChange={handlePriceChange} placeholder="0" />
          </div>

          {(formData.mainService === '改色' || formData.mainService === '全車改色膜') && (
            <div className="col-span-12" style={{ marginTop: '8px', background: '#f5f3ff', padding: '16px', borderRadius: '12px', border: '1px solid #ddd6fe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                <label className="checkbox-wrap" style={{ fontWeight: 'bold', color: '#5b21b6', fontSize: '1rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input type="checkbox" name="hasHoodPpf" checked={!!formData.hasHoodPpf} onChange={handleChange} style={{ width: '18px', height: '18px' }} /> 
                  加購：引擎蓋+前葉子板犀牛皮 (Pixel8bit)
                </label>
                <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '10px' }}>
                   <span style={{ fontSize: '0.8rem', color: '#7c3aed' }}>加購金額:</span>
                   <input type="number" name="hoodPpfPrice" className="form-control" style={{ width: '120px', borderColor: '#ddd6fe' }} value={prices.hoodPpfPrice || ''} onChange={handlePriceChange} placeholder="0" />
                </div>
              </div>
            </div>
          )}

          {formData.mainService === '局部保護/改色' && (
            <div className="col-span-12" style={{ marginTop: '8px', background: '#fffbeb', padding: '16px', borderRadius: '12px', border: '1px solid #fde68a' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px', alignItems: 'end' }}>
                <div className="col-span-6">
                  <label className="form-label" style={{ fontWeight: 'bold', color: '#92400e' }}>迎風面加購 - 後半車鍍膜</label>
                  <select name="rearCoating" className="form-control" value={formData.rearCoating || ''} onChange={handleChange} style={{ borderColor: '#fbbf24' }}>
                    <option value="">不需要加購</option>
                    {Object.keys(REAR_COATING_PRICING).map(opt => <option key={opt} value={opt}>{opt}</option>)}
                  </select>
                </div>
                <div className="col-span-6">
                  <label className="form-label">鍍膜加購價格 ($)</label>
                  <input type="number" name="rearCoatingPrice" className="form-control" value={prices.rearCoatingPrice || ''} onChange={handlePriceChange} placeholder="0" style={{ borderColor: '#fbbf24' }} />
                </div>
              </div>
            </div>
          )}

          {/* 隔熱紙項目 (全新獨立部位與快速選項) */}
          <div className="col-span-12" style={{ gridColumn: '1 / -1', width: '100%' }}>
            <WindowTintSection 
              formData={formData} 
              onChange={handleWindowTintChange} 
              carModel={formData.model} 
            />
          </div>

          {/* 其他配件項目 (同步優化) */}
          {[
            {label: '電子後視鏡', field: 'digitalMirror', brandField: 'digitalMirrorBrand', priceField: 'digitalMirrorPrice', scheduleField: 'digitalMirrorScheduledTime', dateField: 'digitalMirrorDate', color: '#8b5cf6', isMirror: true },
            {label: '行車記錄器/電動改裝', field: 'electricMod', brandField: 'electricModBrand', priceField: 'electricModPrice', scheduleField: 'electricModScheduledTime', dateField: 'electricModDate', color: '#ec4899', isMod: true }
          ].map(row => (
            <div key={row.field} className="col-span-12" style={{ borderLeft: `4px solid ${row.color}`, background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
                <div className="col-span-4">
                  <label className="form-label" style={{ fontWeight: 'bold', color: row.color }}>{row.label} - 項目</label>
                  {row.isMirror ? (
                    <select name={row.field} className="form-control" value={formData[row.field as keyof Customer] as string || ''} onChange={handleChange}>
                      <option value="">請選擇機型</option>
                      {Object.keys(MIRROR_REC_LIST).map(m => <option key={m} value={m}>{m}</option>)}
                      <option value="其他">其他 (手動輸入於規格)</option>
                    </select>
                  ) : row.isMod ? (
                    <select name={row.field} className="form-control" value={formData[row.field as keyof Customer] as string || ''} onChange={handleChange}>
                      <option value="">請選擇或輸入</option>
                      {Object.keys(DASHCAM_REC_LIST).map(m => <option key={m} value={m}>{m}</option>)}
                      <option value="電動尾門">電動尾門</option>
                      <option value="電動前開">電動前開</option>
                      <option value="電吸前箱">電吸前箱</option>
                      <option value="電動遮陽簾">電動遮陽簾</option>
                      <option value="旋轉螢幕">旋轉螢幕</option>
                      <option value="其他">其他 (手動輸入於規格)</option>
                    </select>
                  ) : (
                    <input type="text" name={row.field} className="form-control" value={formData[row.field as keyof Customer] as string || ''} onChange={handleChange} placeholder="輸入項目名稱" />
                  )}
                </div>
                <div className="col-span-8">
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'end' }}>
                    <div style={{ flex: 1 }}>
                      <label className="form-label" style={{ fontWeight: 'bold' }}>品牌/規格備註</label>
                      <input type="text" name={row.brandField} className="form-control" value={formData[row.brandField as keyof Customer] as string || ''} onChange={handleChange} placeholder="請輸入品牌或詳細規格" />
                    </div>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px', alignItems: 'center' }}>
                <div style={{ flex: '0 0 140px' }}>
                   <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>施工金額</label>
                   <input type="number" name={row.priceField} className="form-control" value={(prices as Record<string, number>)[row.priceField] || ''} onChange={handlePriceChange} placeholder="$" />
                </div>
                <div style={{ flex: '0 0 160px' }}>
                   <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>預計日期</label>
                   <input type="date" name={row.dateField} className="form-control" value={formData[row.dateField as keyof Customer] as string || ''} onChange={handleChange} />
                </div>
                <div style={{ flex: 1 }}>
                   <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>施工時段/說明</label>
                   <input type="text" name={row.scheduleField} className="form-control" value={formData[row.scheduleField as keyof Customer] as string || ''} onChange={handleChange} placeholder="預約時段或位置說明" />
                </div>
              </div>
            </div>
          ))}

          {/* 自訂配件 */}
          <div className="col-span-12" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '16px', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
            <h4 style={{ margin: 0, color: '#475569', fontSize: '0.95rem' }}><Settings size={16} /> 客製化配件加購</h4>
            <button type="button" className="btn btn-outline" style={{ padding: '4px 12px', fontSize: '0.8rem' }} onClick={addAccessory}>
              <Plus size={14} /> 新增配件
            </button>
          </div>

          <div className="col-span-12">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {formData.customAccessories?.map((acc) => (
                <div key={acc.id} style={{ display: 'flex', gap: '8px', alignItems: 'flex-end', background: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <div className="form-group" style={{ flex: 2 }}>
                    <label className="form-label">配件名稱</label>
                    <input type="text" className="form-control" value={acc.name} onChange={(e) => updateAccessory(acc.id, 'name', e.target.value)} placeholder="車牌框..." />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">價格 ($)</label>
                    <input type="number" className="form-control" value={acc.price || ''} onChange={(e) => updateAccessory(acc.id, 'price', Number(e.target.value))} placeholder="0" />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">預計施工</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      style={{ fontSize: '0.8rem' }}
                      value={(formData.accessoryScheduling || {})[acc.id] || ''} 
                      onChange={(e) => setFormData(prev => ({
                        ...prev,
                        accessoryScheduling: { ...(prev.accessoryScheduling || {}), [acc.id]: e.target.value }
                      }))} 
                      placeholder="時間" 
                    />
                  </div>
                  <button type="button" onClick={() => removeAccessory(acc.id)} style={{ padding: '10px', background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>



          {/* ── 價格總結區間 ── */}
            <div className="col-span-12" style={{ background: '#f8fafc', padding: '20px', borderRadius: '12px', border: '1px solid #e2e8f0', marginTop: '20px' }}>
              <div style={{ marginBottom: '16px' }}>
                <label className="form-label" style={{ marginBottom: '8px', display: 'block', color: '#1e3a8a', fontWeight: 'bold' }}>選擇適用活動 / 優惠 (可多選)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  {PROMOTIONS.filter(p => p.id !== 'none').map(p => {
                    const selected = discountTypes.includes(p.id);
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => toggleDiscount(p.id)}
                        style={{ 
                          padding: '6px 14px', borderRadius: '20px', 
                          border: `1.5px solid ${selected ? '#3b82f6' : '#cbd5e1'}`, 
                          background: selected ? '#eff6ff' : '#fff', 
                          color: selected ? '#1e40af' : '#475569', 
                          fontSize: '0.8rem', fontWeight: selected ? '700' : '500', 
                          cursor: 'pointer', transition: 'all 0.15s' 
                        }}
                      >
                        {selected ? '✓ ' : ''}{p.label}
                      </button>
                    )
                  })}
                </div>
              </div>
              
              {discountTypes.includes('other') && (
                <div style={{ display: 'flex', gap: '20px', marginBottom: '16px', background: '#fff', padding: '12px', borderRadius: '8px', border: '1px dashed #cbd5e1' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <label className="form-label" style={{ margin: 0, minWidth: '60px' }}>活動名稱</label>
                    <input 
                      type="text" 
                      className="form-control" 
                      value={customDiscountName} 
                      onChange={(e) => setCustomDiscountName(e.target.value)} 
                      placeholder="手動輸入活動名稱" 
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1 }}>
                    <label className="form-label" style={{ margin: 0, minWidth: '60px', color: '#be185d' }}>折抵金額</label>
                    <input 
                      type="number" 
                      className="form-control" 
                      style={{ borderColor: '#fca5a5' }}
                      value={customDiscountAmount || ''} 
                      onChange={(e) => setCustomDiscountAmount(Number(e.target.value))} 
                      placeholder="例如: 1500" 
                    />
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderTop: '1px dashed #cbd5e1', paddingTop: '16px' }}>
                <div>
                  <div style={{ color: '#64748b', fontSize: '0.85rem', marginBottom: '4px' }}>小計: ${subtotal.toLocaleString()}</div>
                  {discountAmount > 0 && <div style={{ color: '#ef4444', fontSize: '0.85rem', marginBottom: '4px' }}>折抵: -${discountAmount.toLocaleString()}</div>}
                  <div style={{ marginTop: '8px', padding: '4px 8px', background: profit >= 0 ? '#f0fdf4' : '#fef2f2', color: profit >= 0 ? '#166534' : '#ef4444', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 'bold', display: 'inline-block' }}>
                    預估利潤: ${profit.toLocaleString()}
                  </div>
                </div>
                
                <div style={{ textAlign: 'right' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'flex-end', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.75rem', color: '#64748b', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <input type="checkbox" checked={prices.useManualTotal} onChange={(e) => setPrices(prev => ({ ...prev, useManualTotal: e.target.checked }))} /> 手動調整總價
                    </label>
                  </div>
                  
                  {prices.useManualTotal ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)' }}>$</span>
                      <input 
                        type="number" 
                        className="form-control" 
                        style={{ fontSize: '1.5rem', fontWeight: '900', color: 'var(--primary)', width: '160px', textAlign: 'right' }} 
                        value={prices.manualTotalPrice || ''} 
                        onChange={(e) => setPrices(prev => ({ ...prev, manualTotalPrice: Number(e.target.value) }))} 
                      />
                    </div>
                  ) : (
                    <div style={{ fontSize: '2.4rem', fontWeight: '900', color: 'var(--primary)', letterSpacing: '-1.5px' }}>
                      ${totalPrice.toLocaleString()}
                    </div>
                  )}
                  <div style={{ color: '#94a3b8', fontSize: '0.75rem' }}>最終報價金額</div>
                </div>
              </div>
            </div>

        </>
      )}

      {/* ── 照片紀錄與售後待辦 ── */}
      <div className="col-span-12" style={{ marginTop: '24px', padding: '20px', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
        <h3 className="section-title" style={{ marginTop: 0, color: '#ef4444' }}><Camera size={18} /> 現場施工影像紀錄與巡車影片</h3>
        
        {/* 影片連結 */}
        <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px dashed #cbd5e1' }}>
          <label className="form-label" style={{ fontWeight: 'bold' }}>施工前巡車影片 (YouTube 不公開連結)</label>
          <input 
            type="text" 
            name="videoUrl" 
            className="form-control" 
            placeholder="貼上 YouTube 影片網址 (例如: https://youtu.be/...)" 
            value={formData.videoUrl || ''} 
            onChange={handleChange}
            style={{ marginBottom: '12px', border: '1px solid #fca5a5' }}
          />
          {getYouTubeEmbedUrl(formData.videoUrl) && (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              <iframe 
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }} 
                src={getYouTubeEmbedUrl(formData.videoUrl)!} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" 
                allowFullScreen
              ></iframe>
            </div>
          )}
        </div>

        {/* 部位選擇 */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '16px' }}>
          {CAR_PARTS.map(part => (
            <button key={part} type="button" onClick={() => setSelectedPart(part)} style={{ padding: '4px 12px', borderRadius: '20px', border: '1px solid', borderColor: selectedPart === part ? 'var(--primary)' : '#cbd5e1', background: selectedPart === part ? 'var(--primary)' : '#fff', color: selectedPart === part ? '#fff' : '#64748b', fontSize: '0.8rem', fontWeight: '600', cursor: 'pointer' }}>
              {part}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
          {/* 受損紀錄 */}
          <div style={{ padding: '16px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#b45309' }}>受損/原樣紀錄 ({selectedPart})</h4>
              <label style={{ cursor: 'pointer', color: '#b45309', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                <Plus size={14} /> 上傳
                <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'damage')} style={{ display: 'none' }} />
              </label>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {formData.damagePhotos?.filter(p => p.category === selectedPart).map((p, i) => (
                <div key={i} style={{ position: 'relative', width: '60px', height: '60px' }}>
                  <img src={p.url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                  <button type="button" onClick={() => removePhoto(p.url, 'damage')} style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', cursor: 'pointer' }}>×</button>
                </div>
              ))}
              {isUploading && <div style={{ width: '60px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}><Loader2 className="spinner" size={20} /></div>}
            </div>
          </div>

          {/* 施工/完工照 */}
          <div style={{ padding: '16px', background: '#eff6ff', borderRadius: '12px', border: '1px solid #bae6fd' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <h4 style={{ margin: 0, fontSize: '0.9rem', color: '#0369a1' }}>施工/完工美照 ({selectedPart})</h4>
              <label style={{ cursor: 'pointer', color: '#0369a1', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                <Plus size={14} /> 上傳
                <input type="file" multiple accept="image/*" onChange={(e) => handleFileUpload(e, 'progress')} style={{ display: 'none' }} />
              </label>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {formData.progressPhotos?.filter(p => p.category === selectedPart).map((p, i) => (
                <div key={i} style={{ position: 'relative', width: '60px', height: '60px' }}>
                  <img src={p.url} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '6px' }} />
                  <button type="button" onClick={() => removePhoto(p.url, 'progress')} style={{ position: 'absolute', top: '-4px', right: '-4px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '50%', width: '16px', height: '16px', fontSize: '10px', cursor: 'pointer' }}>×</button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {formData.status === 'completed' && (
          <div style={{ marginTop: '20px', paddingTop: '15px', borderTop: '1px dashed #cbd5e1' }}>
            <h4 style={{ margin: '0 0 8px 0', fontSize: '0.9rem', color: '#ef4444', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <AlertCircle size={16} /> 售後待處理事項 (完工後跟進)
            </h4>
            <textarea 
              name="pendingItems" 
              className="form-control" 
              rows={2} 
              placeholder="例如：隔熱紙一週後補貼、配件缺貨待補..." 
              value={formData.pendingItems || ''} 
              onChange={handleChange}
              style={{ border: '1px solid #fca5a5' }}
            ></textarea>
          </div>
        )}
      </div>

      {/* ── 諮詢細節與客戶特徵 ── */}
      <div className="form-group col-span-12">
        <h3 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#ec4899', marginTop: '20px', borderBottom: '2px solid #e2e8f0', paddingBottom: '8px' }}>
          <User size={18} /> 諮詢細節與客戶特徵紀錄
        </h3>
      </div>
      
      <div className="form-group col-span-3">
        <label className="form-label">得知管道</label>
        <input type="text" name="fromChannel" className="form-control" value={formData.fromChannel || ''} onChange={handleChange} placeholder="如：FB、介紹..." />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">性格屬性</label>
        <select name="personality" className="form-control" value={formData.personality || ''} onChange={handleChange}>
          <option value="">未記錄</option>
          <option value="乾脆清楚">乾脆清楚</option>
          <option value="細節控">細節控</option>
          <option value="謹慎重複確認">謹慎重複確認</option>
          <option value="預算先驅">預算先驅</option>
          <option value="愛車如命">愛車如命</option>
          <option value="阿莎力老闆型">阿莎力老闆型</option>
        </select>
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">溝通習性</label>
        <input type="text" name="communicationStyle" className="form-control" value={formData.communicationStyle || ''} onChange={handleChange} placeholder="如：喜歡傳訊息、電話聯繫..." />
      </div>
      <div className="form-group col-span-3">
        <label className="form-label">詢問工時 (天/時)</label>
        <input type="text" name="workHoursAsked" className="form-control" value={formData.workHoursAsked || ''} onChange={handleChange} placeholder="客戶詢問的預計工時" />
      </div>

      <div className="form-group col-span-6">
        <label className="form-label">主要特性標籤 (以逗號分隔)</label>
        <input type="text" name="characteristic" className="form-control" value={formData.characteristic || ''} onChange={handleChange} placeholder="如：回頭客, 很準時, 龜毛..." />
      </div>
      <div className="form-group col-span-6">
        <label className="form-label">職業或背景筆記</label>
        <input type="text" name="occupation" className="form-control" value={formData.occupation || ''} onChange={handleChange} placeholder="如：科技業、醫生、同行..." />
      </div>

      <div className="form-group col-span-12">
        <label className="form-label">施工細節特別要求 / 折點位置說明</label>
        <textarea 
          name="constructionDetails" 
          className="form-control" 
          rows={3} 
          value={formData.constructionDetails || ''} 
          onChange={handleChange}
          placeholder="詳述施工要點、收邊方式、摺點位置特別要求..."
        ></textarea>
      </div>

      <div className="form-group col-span-12">
        <label className="form-label">其他備註項目 / 客戶習慣觀察</label>
        <textarea name="notes" className="form-control" rows={3} value={formData.notes || ''} onChange={handleChange}></textarea>
      </div>

      {/* ── 底部操作按鈕 ── */}
      {!hideActions && (
        <div className="col-span-12 form-actions" style={{ position: 'sticky', bottom: '-10px', padding: '16px 0', background: 'rgba(255,255,255,0.95)', borderTop: '1px solid #e2e8f0', marginTop: '16px', display: 'flex', gap: '12px', zIndex: 10 }}>
          <button type="button" className="btn btn-outline" onClick={onCancel} style={{ padding: '10px 24px' }} disabled={isUploading}>取消</button>
          <div style={{ flex: 1 }}></div>
          
          {formData.status === 'new' ? (
            <>
              <button type="button" className="btn" onClick={handleSave} style={{ background: '#3b82f6', color: '#fff', fontSize: '0.95rem', fontWeight: 'bold', padding: '10px 24px' }} disabled={isUploading}>
                {isUploading ? <Loader2 className="spinner" size={18} /> : '儲存諮詢內容'}
              </button>
              <button type="button" className="btn" onClick={handleConvert} style={{ background: '#f59e0b', color: '#fff', fontSize: '0.95rem', fontWeight: 'bold', padding: '10px 24px' }} disabled={isUploading}>
                轉為正式下定 →
              </button>
            </>
          ) : (
            <button type="button" className="btn" onClick={handleSave} style={{ background: '#3b82f6', color: '#fff', fontSize: '0.95rem', fontWeight: 'bold', padding: '10px 24px' }} disabled={isUploading}>
              {isUploading ? <Loader2 className="spinner" size={18} /> : '儲存表單 (保持排程)'}
            </button>
          )}

          {formData.status !== 'new' && (
            <button type="button" className="btn" onClick={handleRevertToInquiry} style={{ background: '#64748b', color: '#fff', fontSize: '0.95rem', fontWeight: 'bold', padding: '10px 24px' }} disabled={isUploading}>
              退回諮詢區
            </button>
          )}

          {(formData.status === 'construction' || (formData.status !== 'new' && customer)) && (
            <button type="button" className="btn" onClick={handleMoveToCompleted} style={{ background: '#10b981', color: '#fff', fontSize: '0.95rem', fontWeight: 'bold', padding: '10px 24px' }} disabled={isUploading}>確認完工並移入完工存檔區 →</button>
          )}
        </div>
      )}

    </form>
  );
};
