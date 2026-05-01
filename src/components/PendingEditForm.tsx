import React, { useState } from 'react';
import type { Customer, Accessory, StatusType } from '../types';
import { 
  Plus, Trash2, Calendar, FileText, Settings, Gift, Package, 
  CalendarCheck, User, Star, ChevronDown, ChevronUp, Clock,
  Camera, Car, Loader2, AlertCircle
} from 'lucide-react';
import { VehicleAutocomplete } from './VehicleAutocomplete';
import { taiwanCounties } from '../data/counties';
import { api } from '../lib/api';
import { getYouTubeEmbedUrl } from '../lib/utils';

const TINT_PRICE_TABLE: Record<string, { m3: number; m3_sunroof: number; my: number; my_sunroof: number }> = {
  "極黑": { m3: 26500, m3_sunroof: 29500, my: 24500, my_sunroof: 32500 },
  "極透": { m3: 32500, m3_sunroof: 36500, my: 30500, my_sunroof: 40500 },
  "方案1: 前(透)後(黑)": { m3: 30500, m3_sunroof: 33500, my: 28500, my_sunroof: 36500 },
  "方案2: 前、天(透) 身(黑)": { m3: 30500, m3_sunroof: 34500, my: 28500, my_sunroof: 38500 },
  "XC MAX": { m3: 28500, m3_sunroof: 36500, my: 26500, my_sunroof: 34500 },
  "Smart": { m3: 34500, m3_sunroof: 42500, my: 32500, my_sunroof: 40500 },
  "方案3: 前(Smart)身、天(XC)": { m3: 32500, m3_sunroof: 40500, my: 28500, my_sunroof: 36500 },
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

const GIFT_OPTIONS = [
  '大燈', '日行燈', 'ABC柱', '握把',
  '前踏板', '後踏板', '充電蓋',
  '尾燈(三項)', '玻璃鍍膜(三項)', '彩繪(視範圍)',
  '浮雕(視範圍)', '鋼琴烤漆(視範圍)'
];

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
  vehicleMaster?: any[];
  onSubmit: (updatedCustomer: Customer, moveToConstruction: boolean) => void;
  onCancel: () => void;
}

export const PendingEditForm: React.FC<PendingEditFormProps> = ({ 
  customer, onSuggestId, vehicleMaster = [], onSubmit, onCancel 
}) => {
  const [formData, setFormData] = useState<Partial<Customer>>(() => {
    if (customer) return { ...customer, customAccessories: customer.customAccessories || [] };
    return { id: onSuggestId, status: 'scheduled', customAccessories: [] };
  });
  
  const [showConsultation, setShowConsultation] = useState(false);
  const [selectedPart, setSelectedPart] = useState<string>('前保桿');
  const [tintCategory, setTintCategory] = useState<string>(() => {
    // 試圖從現有規格反推分類
    const currentSpec = customer?.windowTintBrand || '';
    const found = Object.entries(TINT_GROUPS).find(([_, specs]) => specs.includes(currentSpec));
    return found ? found[0] : '';
  });
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isUploading, setIsUploading] = useState(false);

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
    cost: customer?.cost || 0,
    manualTotalPrice: customer?.totalAmount || 0,
    useManualTotal: false
  });

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

  let subtotal = (prices.mainServicePrice || 0) + (prices.windowTintPrice || 0) + (prices.digitalMirrorPrice || 0) + (prices.electricModPrice || 0);
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

  const toggleGift = (gift: string) => {
    const current = formData.giftItems || [];
    const next = current.includes(gift) ? current.filter(g => g !== gift) : [...current, gift];
    setFormData(prev => ({ ...prev, giftItems: next }));
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

    return {
      ...(formData as Customer),
      notes: finalNotes,
      status,
      totalAmount: totalPrice,
      revenue: profit,
      appliedDiscountName: appliedNames.join(', '),
      discountAmount: discountAmount,
      digitalMirrorPrice: prices.digitalMirrorPrice,
      electricModPrice: prices.electricModPrice,
      cost: prices.cost
    };
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const status = (formData.status === 'new') ? 'scheduled' : (formData.status as StatusType);
    onSubmit(prepareSubmitData(status), false);
  };

  const handleMoveToConstruction = (e: React.FormEvent) => {
    e.preventDefault();
    const isConfirm = window.confirm('確定要轉入「現場施工」嗎？此案件將從排程區消失，進入施工站！');
    if (!isConfirm) return;

    // 初始化簡化版標準檢核清單
    const simplifiedChecklist = [
      { id: 'ck_std_1', name: '前置清潔 (預洗與表面深層清潔)', checked: false },
      { id: 'ck_std_2', name: `膜料施工: ${formData.mainService || ''} (${formData.mainServiceBrand || ''} - ${formData.filmColor || ''})`, checked: false },
      { id: 'ck_std_3', name: '贈送配件施工', checked: false },
      { id: 'ck_std_4', name: '完工自主檢查 (收邊、氣泡、完整度)', checked: false },
      { id: 'ck_std_5', name: '交車前清潔與環境整理', checked: false }
    ];

    // 動態加入加購項目
    if (formData.windowTint) {
      simplifiedChecklist.splice(2, 0, { id: 'ck_tint', name: `隔熱紙施工: ${formData.windowTint}`, checked: false });
    }
    if (formData.digitalMirror) {
      simplifiedChecklist.splice(3, 0, { id: 'ck_mirror', name: `電子後視鏡安裝: ${formData.digitalMirror}`, checked: false });
    }
    if (formData.electricMod) {
      simplifiedChecklist.splice(4, 0, { id: 'ck_electric', name: `電動改裝項目: ${formData.electricMod}`, checked: false });
    }

    const updatedData = prepareSubmitData('construction');
    if (!updatedData.constructionChecklist || updatedData.constructionChecklist.length === 0) {
      updatedData.constructionChecklist = simplifiedChecklist;
    }

    onSubmit(updatedData, true);
  };

  const handleConvert = () => {
    const isConfirm = window.confirm('確定要將此諮詢案件轉為「正式下定」嗎？轉入後將可以填寫報價與排程時間。');
    if (!isConfirm) return;
    onSubmit(prepareSubmitData('scheduled'), false);
  };

  const handleRevertToInquiry = () => {
    const isConfirm = window.confirm('確定要將此案件「退回諮詢進件區」嗎？狀態將變回新案件，並從排程名單中移除。');
    if (!isConfirm) return;
    onSubmit(prepareSubmitData('new'), false);
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
        <input required type="text" name="id" className="form-control" value={formData.id || ''} onChange={handleChange} disabled={!!customer} />
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
        vehicleMaster={vehicleMaster || []}
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
            <label className="form-label" style={{ color: '#166534', fontWeight: 'bold' }}>2. 預計施工(開工)日期</label>
            <input required type="date" name="constructionStartDate" className="form-control" value={formData.constructionStartDate || ''} onChange={handleChange} style={{ borderColor: '#22c55e' }} />
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
              <option value="全車改色膜">全車改色膜</option>
              <option value="全車犀牛皮">全車犀牛皮</option>
              <option value="局部保護/改色">局部保護/改色</option>
            </select>
          </div>
          <div className="form-group col-span-2">
            <label className="form-label">品牌</label>
            <select name="mainServiceBrand" className="form-control" value={formData.mainServiceBrand || ''} onChange={handleChange}>
              <option value="">選擇品牌</option>
              {((formData.mainService || '').includes('改色') 
                ? ['AX', '3M', 'CYS', 'TeckWrap'] 
                : ['3M', 'Michelin', 'Atarap', 'Stek']
              ).map(brand => <option key={brand} value={brand}>{brand}</option>)}
            </select>
          </div>
          <div className="form-group col-span-2">
            <label className="form-label">膜料顏色</label>
            <input type="text" name="filmColor" className="form-control" placeholder="顏色細項" value={formData.filmColor || ''} onChange={handleChange} />
          </div>
          <div className="form-group col-span-4">
            <label className="form-label">施工價格 ($)</label>
            <input type="number" name="mainServicePrice" className="form-control" value={prices.mainServicePrice || ''} onChange={handlePriceChange} placeholder="0" />
          </div>

          {/* 隔熱紙項目 (優化後) */}
          <React.Fragment>
            <div className="col-span-12" style={{ borderLeft: '4px solid #3b82f6', background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '8px', marginTop: '16px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px', alignItems: 'end' }}>
                <div className="col-span-4">
                  <label className="form-label" style={{ fontWeight: 'bold', color: '#1e3a8a' }}>隔熱紙 - 品牌類別</label>
                  <select 
                    className="form-control" 
                    value={tintCategory} 
                    onChange={(e) => {
                      setTintCategory(e.target.value);
                      setFormData(prev => ({ ...prev, windowTintBrand: '' }));
                    }}
                  >
                    <option value="">請選擇品牌</option>
                    {Object.keys(TINT_GROUPS).map(cat => <option key={cat} value={cat}>{cat}</option>)}
                  </select>
                </div>
                <div className="col-span-5">
                  <label className="form-label" style={{ fontWeight: 'bold' }}>具體規格/型號</label>
                  <select name="windowTintBrand" className="form-control" value={formData.windowTintBrand || ''} onChange={handleChange}>
                    <option value="">選擇規格 (點選自動報價)</option>
                    {(TINT_GROUPS[tintCategory] || []).map(b => <option key={b} value={b}>{b}</option>)}
                  </select>
                </div>
                <div className="col-span-3" style={{ paddingBottom: '10px' }}>
                  <label style={{ fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px', color: '#0369a1', cursor: 'pointer', fontWeight: '600' }}>
                    <input type="checkbox" name="hasSunroof" checked={formData.hasSunroof || false} onChange={handleChange} /> 
                    包含天窗施工
                  </label>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', marginTop: '12px', alignItems: 'center' }}>
                <div style={{ flex: '0 0 140px' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>施工金額</label>
                  <input type="number" name="windowTintPrice" className="form-control" value={prices.windowTintPrice || ''} onChange={handlePriceChange} placeholder="$" />
                </div>
                <div style={{ flex: '0 0 160px' }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>預計進場日期</label>
                  <input type="date" name="windowTintDate" className="form-control" value={formData.windowTintDate || ''} onChange={handleChange} />
                </div>
                <div style={{ flex: 1 }}>
                  <label className="form-label" style={{ fontSize: '0.75rem', marginBottom: '2px' }}>備註時段/詳細</label>
                  <input type="text" name="windowTintScheduledTime" className="form-control" value={formData.windowTintScheduledTime || ''} onChange={handleChange} placeholder="e.g. 13:30 前擋+身" />
                </div>
              </div>
            </div>
          </React.Fragment>

          {/* 其他配件項目 (同步優化) */}
          {[
            { label: '電子後視鏡', field: 'digitalMirror', brandField: 'digitalMirrorBrand', priceField: 'digitalMirrorPrice', scheduleField: 'digitalMirrorScheduledTime', dateField: 'digitalMirrorDate', color: '#8b5cf6' },
            { label: '電動改裝', field: 'electricMod', brandField: 'electricModBrand', priceField: 'electricModPrice', scheduleField: 'electricModScheduledTime', dateField: 'electricModDate', color: '#ec4899' }
          ].map(row => (
            <div key={row.field} className="col-span-12" style={{ borderLeft: `4px solid ${row.color}`, background: '#f8fafc', padding: '12px 16px', borderRadius: '8px', marginBottom: '8px' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(12, 1fr)', gap: '16px' }}>
                <div className="col-span-4">
                  <label className="form-label" style={{ fontWeight: 'bold', color: row.color }}>{row.label} - 項目</label>
                  <input type="text" name={row.field} className="form-control" value={formData[row.field as keyof Customer] as string || ''} onChange={handleChange} placeholder="輸入項目名稱" />
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
                   <input type="number" name={row.priceField} className="form-control" value={(prices as any)[row.priceField] || ''} onChange={handlePriceChange} placeholder="$" />
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

          {/* ── 贈送項目 ── */}
          <h3 className="section-title col-span-12" style={{ borderBottom: '2px solid #e2e8f0', paddingBottom: '8px', marginTop: '20px', color: '#f59e0b' }}>
            <Gift size={18} /> 贈送清單 (不計費)
          </h3>
          <div className="col-span-12">
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', padding: '14px', background: '#fffbeb', borderRadius: '12px', border: '1px solid #fde68a' }}>
              {GIFT_OPTIONS.map(gift => {
                const selected = (formData.giftItems || []).includes(gift);
                return (
                  <button
                    key={gift}
                    type="button"
                    onClick={() => toggleGift(gift)}
                    style={{ padding: '5px 12px', borderRadius: '20px', border: `1.5px solid ${selected ? '#f59e0b' : '#e2e8f0'}`, background: selected ? '#fef3c7' : '#fff', color: selected ? '#92400e' : '#64748b', fontSize: '0.8rem', fontWeight: selected ? '700' : '500', cursor: 'pointer', transition: 'all 0.15s' }}
                  >
                    {selected ? '✓ ' : ''}{gift}
                  </button>
                );
              })}
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
      <div className="col-span-12 form-actions" style={{ position: 'sticky', bottom: '-10px', padding: '16px 0', background: 'rgba(255,255,255,0.95)', borderTop: '1px solid #e2e8f0', marginTop: '16px', display: 'flex', gap: '12px' }}>
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

        {formData.status !== 'new' && customer && (
          <button type="button" className="btn" onClick={handleMoveToConstruction} style={{ background: '#10b981', color: '#fff', fontSize: '0.95rem', fontWeight: 'bold', padding: '10px 24px' }} disabled={isUploading}>確認並轉入現場施工 →</button>
        )}
      </div>

    </form>
  );
};
