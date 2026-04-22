export type Role = 'admin' | 'employee';

export interface User {
  username: string;
  role: Role;
  name: string;
}

export type StatusType = 'new' | 'deposit' | 'scheduled' | 'construction' | 'completed';


export interface Customer {
  id: string;
  name: string;
  phone: string;
  birthday?: string;
  address?: string;
  fromChannel?: string;
  
  // 車輛資訊
  plateNumber: string;
  brand?: string;
  model?: string;
  
  // 客戶特徵
  convenientTime?: 'weekday' | 'weekend';
  companion?: 'alone' | 'with_child' | 'with_family' | 'with_wife';
  childAge?: number;
  personality?: 'introvert' | 'extrovert';
  detailOriented?: boolean;
  easyGoing?: boolean;
  likesCalls?: boolean;
  
  location?: string;
  occupation?: string;
  hobbies?: string;
  
  // 外觀特徵
  bodyType?: 'slim' | 'average' | 'heavy';
  wearsGlasses?: boolean;
  hairLength?: 'short' | 'medium' | 'long';
  wealthLevel?: 'high' | 'medium' | 'normal'; // 有不有錢
  notes?: string;

  // 狀態與流程
  status: StatusType;
  
  // 報價與施工 (等待收訂階段)
  inCalendar?: boolean;
  mainService?: string;
  mainServiceBrand?: string;
  expectedStartDate?: string;    // 預計施工日期
  constructionTime?: string;     // 預計施工時間/進場時間
  expectedEndDate?: string;      // 預計交車日期
  expectedDeliveryTime?: string; // 預計交車時間
  materialOrdered?: boolean;
  
  windowTint?: string;
  windowTintBrand?: string;
  digitalMirror?: string;
  digitalMirrorBrand?: string;
  electricMod?: string;
  electricModBrand?: string;
  
  customAccessories?: Accessory[];
  giftItems?: string[];

  // 財務資訊
  materialCode?: string;       // 膜料貨號
  filmColor?: string;          // 細項/膜料顏色
  totalAmount?: number;        // 金額
  cost?: number;               // 成本
  revenue?: number;            // 收益
  quoteCreated?: boolean;      // 報價單是否建立
  appliedDiscountName?: string; // 套用的折扣名稱
  discountAmount?: number;     // 折扣金額


  
  // 施工中
  constructionChecklist?: ChecklistItem[];
  damagePhotos?: CategorizedPhoto[]; 
  progressPhotos?: CategorizedPhoto[]; 
  
  // 施工完成
  deliveryDate?: string;
  checkupDate?: string;
  giftGiven?: boolean;
  formSent?: boolean;
  formFilled?: boolean;
  
  followUp3Days?: boolean;
  followUp2Weeks?: boolean;
  followUp6Months?: boolean;
  followUp1Year?: boolean;
  
  photosRetaken?: boolean;
  photosSent?: boolean;
}

export interface CategorizedPhoto {
  category: string;
  url: string;
}


export interface Accessory {
  id: string;
  name: string;
  price: number;
}

export interface ChecklistItem {
  id: string;
  name: string;
  checked: boolean;
}

export interface StorageLocation {
  zone: 'A' | 'B' | 'C' | 'D' | 'E' | 'F';
  section: number;
  slot: number;
}

export interface FilmInventory {
  id: string;
  brand: string;
  color: string;
  size: string;
  location: StorageLocation;
  lastUpdated: string;
  notes?: string;
}

export interface InventoryLog {
  id: string;
  itemId: string;
  action: 'add' | 'update' | 'remove';
  details: string;
  timestamp: string;
  operator: string;
}


