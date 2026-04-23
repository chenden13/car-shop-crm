const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';
const supabase = createClient(supabaseUrl, supabaseKey);

const completedDemos = [
  {
    id: 'C-COMP-001',
    name: '林完工',
    phone: '0911-222-333',
    plate_number: 'ABC-1234',
    brand: 'Tesla',
    model: 'Model Y',
    status: 'completed',
    total_amount: 85000,
    cost: 42000,
    revenue: 43000,
    data: {
      consultationDate: '2026-03-01',
      expectedStartDate: '2026-03-10',
      deliveryDate: '2026-03-15',
      mainService: '全車改色膜',
      mainServiceBrand: 'AX',
      filmColor: '冰川藍',
      materialCode: 'AX-8822',
      windowTint: '全車隔熱紙',
      windowTintBrand: '3M',
      giftGiven: true,
      formSent: true,
      formFilled: true,
      followUp3Days: true,
      followUp2Weeks: true,
      notes: '客人非常滿意邊角處理，建議之後可以多推廣 AX 系列。'
    }
  },
  {
    id: 'C-COMP-002',
    name: '王大同',
    phone: '0922-333-444',
    plate_number: 'BMW-8888',
    brand: 'BMW',
    model: 'X5',
    status: 'completed',
    total_amount: 120000,
    cost: 55000,
    revenue: 65000,
    data: {
      consultationDate: '2026-02-15',
      expectedStartDate: '2026-02-25',
      deliveryDate: '2026-03-02',
      mainService: '全車犀牛皮',
      mainServiceBrand: 'STEK',
      filmColor: '透明亮面',
      materialCode: 'STEK-PPF-01',
      digitalMirror: '前後雙錄電子後視鏡',
      giftGiven: true,
      formSent: true,
      followUp3Days: true,
      followUp2Weeks: true,
      followUp6Months: false,
      notes: '車主在意後視鏡安裝位置，已調整至最佳視角。'
    }
  },
  {
    id: 'C-COMP-003',
    name: '張美玲',
    phone: '0933-444-555',
    plate_number: 'POR-911',
    brand: 'Porsche',
    model: '911 Carrera',
    status: 'completed',
    total_amount: 98000,
    cost: 38000,
    revenue: 60000,
    data: {
      consultationDate: '2026-04-01',
      expectedStartDate: '2026-04-10',
      deliveryDate: '2026-04-15',
      mainService: '迎風面犀牛皮 + 大燈',
      mainServiceBrand: '3M',
      filmColor: '透明',
      materialCode: '3M-PPF-V3',
      electricMod: '電動尾門',
      giftGiven: false,
      formSent: true,
      formFilled: false,
      notes: '預約半年後回廠檢查，已標記提醒。'
    }
  }
];

async function addDemos() {
  console.log('正在新增完工案件模擬資料...');
  for (const demo of completedDemos) {
    const { error } = await supabase.from('customers').upsert(demo);
    if (error) {
      console.error(`新增 ${demo.name} 失敗:`, error);
    } else {
      console.log(`✅ 已新增: ${demo.name} (${demo.plate_number})`);
    }
  }
  console.log('模擬資料新增完畢！');
}

addDemos();
