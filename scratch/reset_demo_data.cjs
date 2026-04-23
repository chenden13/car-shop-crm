const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';
const supabase = createClient(supabaseUrl, supabaseKey);

async function resetData() {
  console.log('--- 正在執行資料庫全面重置 ---');
  
  // 1. 刪除所有客戶資料
  const { error: delError } = await supabase
    .from('customers')
    .delete()
    .neq('status', 'ignore_me_just_delete_all');
    
  if (delError) {
    console.error('❌ 清除舊資料失敗:', delError);
    return;
  }
  console.log('✅ 已清除所有舊客戶資料');

  // 2. 準備 9 筆模擬資料 (3諮詢, 3待施工, 3施工中)
  const examples = [
    // --- 諮詢進件區 (status: new) ---
    {
      id: 'NEW-001', name: '林立中', phone: '0912-888-777', plate_number: 'ABC-5566', brand: 'Tesla', model: 'Model Y', status: 'new',
      data: {
        consultationDate: '2026-04-20',
        interestedAccessories: '後視鏡殼、霧燈框、碳纖維尾翼',
        personality: 'extrovert', detailOriented: true, location: '台北市',
        mainService: '全車犀牛皮', filmColor: '透明亮面',
        notes: '客戶是一位創業家，對品質非常有要求，喜歡聽專業建議。'
      }
    },
    {
      id: 'NEW-002', name: '王淑芬', phone: '0933-123-456', plate_number: 'CAR-1122', brand: 'Lexus', model: 'NX 200', status: 'new',
      data: {
        consultationDate: '2026-04-22',
        interestedAccessories: '卡鉗改色(紅)、迎賓踏板',
        personality: 'introvert', easyGoing: true, location: '桃園市',
        mainService: '全車改色膜', filmColor: '消光軍綠',
        notes: '王小姐是附近診所的醫師，性格溫和，主要是想換個顏色心情好。'
      }
    },
    {
      id: 'NEW-003', name: 'James Wilson', phone: '0955-999-000', plate_number: 'EXP-8888', brand: 'Porsche', model: 'Taycan 4S', status: 'new',
      data: {
        consultationDate: '2026-04-23',
        interestedAccessories: '內裝碳纖維、PDLS+大燈貼膜',
        personality: 'extrovert', wealthLevel: 'high', location: '台中市',
        mainService: '全車犀牛皮', filmColor: '消光透明',
        notes: '外籍商務人士，英文接洽，預算較高，重視耐用度。'
      }
    },

    // --- 待施工排程 (status: scheduled / deposit) ---
    {
      id: 'SCH-004', name: '陳建宏', phone: '0922-333-444', plate_number: 'BMW-330I', brand: 'BMW', model: '3-Series 330i', status: 'deposit',
      total_amount: 145000, revenue: 137750,
      data: {
        expectedStartDate: '2026-05-05', constructionTime: '10:00',
        expectedEndDate: '2026-05-10', expectedDeliveryTime: '17:00',
        mainService: '全車改色', mainServiceBrand: '3M', filmColor: '2080 消光黑',
        inCalendar: true, materialOrdered: true,
        notes: '已支付 2 萬元訂金，膜料已寄達倉庫，客戶會等完工再取車。'
      }
    },
    {
      id: 'SCH-005', name: '郭子毅', phone: '0988-111-222', plate_number: 'EV-8888', brand: 'Hyundai', model: 'Ioniq 5', status: 'scheduled',
      total_amount: 88000, revenue: 83600,
      data: {
        expectedStartDate: '2026-05-12', constructionTime: '13:30',
        expectedEndDate: '2026-05-14', expectedDeliveryTime: '16:00',
        mainService: '迎風面犀牛皮', mainServiceBrand: 'Atarap', filmColor: '透明亮面',
        inCalendar: true, materialOrdered: false,
        notes: '新車剛交車，希望能做基礎防護，預計下週一來訂料。'
      }
    },
    {
      id: 'SCH-006', name: '佐藤健', phone: '0966-222-333', plate_number: 'GR-0086', brand: 'Toyota', model: 'GR86', status: 'deposit',
      total_amount: 168000, revenue: 159600,
      data: {
        expectedStartDate: '2026-05-20', constructionTime: '09:00',
        expectedEndDate: '2026-05-26', expectedDeliveryTime: '12:00',
        mainService: '全車改色', mainServiceBrand: 'TeckWrap', filmColor: '液態金屬銀',
        inCalendar: true, materialOrdered: true,
        notes: '知名博主，會來拍攝，細節處須特別加強收邊。'
      }
    },

    // --- 現場施工監控 (status: construction) ---
    {
      id: 'CON-007', name: '李威廷', phone: '0977-444-555', plate_number: 'AMG-6363', brand: 'Mercedes-Benz', model: 'C63s AMG', status: 'construction',
      total_amount: 180000,
      data: {
        expectedStartDate: '2026-04-20', expectedEndDate: '2026-04-27',
        mainService: '全車犀牛皮', filmColor: '消光面',
        windowTint: '極黑 90', electricMod: '電動吸門', digitalMirror: 'P9',
        giftItems: ['大燈', 'ABC柱', '前踏板'],
        notes: '目前正在進行側裙部分的貼合，門碗處已完成。'
      }
    },
    {
      id: 'CON-008', name: '許志安', phone: '0911-555-666', plate_number: 'DEF-1100', brand: 'Land Rover', model: 'Defender 110', status: 'construction',
      total_amount: 210000,
      data: {
        expectedStartDate: '2026-04-21', expectedEndDate: '2026-05-01',
        mainService: '全車改色(軍綠) + 黑頂', filmColor: '雙色噴砂綠',
        customAccessories: [{id: 'acc1', name: '側爬梯', price: 15000}, {id: 'acc2', name: '備胎蓋', price: 5000}],
        notes: '車體巨大，目前已完成左右車門與黑頂改色。'
      }
    },
    {
      id: 'CON-009', name: '廖曉喬', phone: '0944-000-111', plate_number: 'QUE-9999', brand: 'Bentley', model: 'Bentayga', status: 'construction',
      total_amount: 250000,
      data: {
        expectedStartDate: '2026-04-22', expectedEndDate: '2026-05-05',
        mainService: '全車頂級犀牛皮', filmColor: '珍珠白',
        notes: '貴賓車輛，施工區需保持無塵環境，目前已完成車頭引擎蓋。'
      }
    }
  ];

  for (const ex of examples) {
    const { error: insError } = await supabase.from('customers').insert({
      id: ex.id,
      name: ex.name,
      phone: ex.phone,
      plate_number: ex.plate_number,
      brand: ex.brand,
      model: ex.model,
      status: ex.status,
      total_amount: ex.total_amount || 0,
      revenue: ex.revenue || 0,
      data: ex.data
    });
    if (insError) console.error(`❌ 插入 ${ex.id} 失敗:`, insError);
    else console.log(`✅ 已插入模擬資料: ${ex.id} (${ex.name})`);
  }

  console.log('--- ✨ 資料庫模擬環境重置完成 ✨ ---');
}

resetData();
