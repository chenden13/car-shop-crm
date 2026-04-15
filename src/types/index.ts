export type StatusType = 'new' | 'deposit' | 'construction' | 'completed';

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
  expectedStartDate?: string;
  expectedEndDate?: string;
  materialOrdered?: boolean;
  
  windowTint?: string;
  windowTintBrand?: string;
  digitalMirror?: string;
  digitalMirrorBrand?: string;
  electricMod?: string;
  electricModBrand?: string;
  
  customAccessories?: Accessory[];
  
  // 施工中
  constructionChecklist?: ChecklistItem[];
  damagePhotos?: string[]; // QNAP URL
  progressPhotos?: string[]; // QNAP URL
  
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
