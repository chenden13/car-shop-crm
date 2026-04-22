const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function resetData() {
  console.log('--- 開始清除舊資料 (保留施工完成) ---');
  
  // 1. 刪除所有不是 completed 的客戶
  const { error: delError } = await supabase
    .from('customers')
    .delete()
    .neq('status', 'completed');
    
  if (delError) {
    console.error('刪除失敗:', delError);
    return;
  }
  console.log('✅ 已清除施工中心與待施工資料');

  // 2. 插入新範例
  const examples = [
    {
      id: 'NEW-001',
      name: '張三範例',
      phone: '0912-345-678',
      plate_number: 'ABC-1234',
      brand: 'Porsche',
      model: '911 GT3',
      status: 'new',
      total_amount: 120000,
      data: {
        notes: '這是新進件範例：客戶在意細節，喜歡電話聯絡。',
        expectedStartDate: '2026-05-01'
      }
    },
    {
      id: 'DEP-002',
      name: '李四範例',
      phone: '0922-000-111',
      plate_number: 'BMW-8888',
      brand: 'BMW',
      model: 'M4 Competition',
      status: 'deposit',
      total_amount: 155000,
      data: {
        notes: '這是已收訂範例：已支付定金 $20,000，膜料叫貨中。',
        expectedStartDate: '2026-04-28',
        materialOrdered: true
      }
    },
    {
      id: 'SCH-003',
      name: '王五範例',
      phone: '0933-999-999',
      plate_number: 'TES-9999',
      brand: 'Tesla',
      model: 'Model S Plaid',
      status: 'scheduled',
      total_amount: 98000,
      data: {
        notes: '這是已預約範例：預計下週一進場。',
        expectedStartDate: '2026-04-25',
        inCalendar: true,
        materialOrdered: true
      }
    },
    {
      id: 'CON-004',
      name: '趙六 (高階示範)',
      phone: '0988-777-666',
      plate_number: 'FER-8888',
      brand: 'Ferrari',
      model: 'SF90 Stradale',
      status: 'construction',
      total_amount: 350000,
      data: {
        notes: '這是全功能示範範例：包含所有施工細項與贈品。',
        expectedStartDate: '2026-04-20',
        constructionTime: '09:00 AM',
        expectedEndDate: '2026-04-25',
        expectedDeliveryTime: '04:30 PM',
        mainService: '全車包膜 (XPEL Ultimate Plus)',
        selectedFilms: ['XPEL LUX PLUS', 'XPEL STEALTH'],
        windowTint: 'V-KOOL IQue 系列',
        windowTintBrand: 'V-KOOL',
        digitalMirror: 'Polaroid 寶麗萊 P9',
        electricMod: '電動尾門改裝',
        customAccessories: [
          { id: 'ACC-1', name: '碳纖維側裙' },
          { id: 'ACC-2', name: '鈦合金排氣管' }
        ],
        giftItems: ['大燈', '玻璃鍍膜(三項)', '握把']
      }
    }
  ];

  for (const ex of examples) {
    const { error: insError } = await supabase.from('customers').insert(ex);
    if (insError) console.error(`插入 ${ex.id} 失敗:`, insError);
    else console.log(`✅ 已插入範例: ${ex.name}`);
  }

  console.log('--- 重設完成 ---');
}

resetData();
