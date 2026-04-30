import { createClient } from '@supabase/supabase-js';
import type { Customer, FilmInventory, InventoryLog } from '../types';

const supabaseUrl = 'https://emqtgyntrpounnmssxcf.supabase.co';
const supabaseKey = 'sb_publishable_4nQj5X6GRrTi3Xs0G31hAA_jfGTmCoo';

export const supabase = createClient(supabaseUrl, supabaseKey);

export const api = {
  // --- 客戶資料 ---
  getCustomers: async () => {
    const { data, error } = await supabase.from('customers').select('*');
    if (error) throw error;
    return (data || []).map(item => {
      const extraData = (typeof item.data === 'object' && item.data !== null) ? item.data : {};
      return {
        ...extraData,
        id: item.id,
        name: item.name,
        phone: item.phone,
        plateNumber: item.plate_number,
        brand: item.brand,
        model: item.model,
        status: item.status,
        totalAmount: item.total_amount,
        cost: item.cost,
        revenue: item.revenue,
        updatedAt: item.updated_at
      };
    });
  },

  upsertCustomer: async (customer: Customer) => {
    const { id, name, phone, plateNumber, brand, model, status, totalAmount, cost, revenue, ...rest } = customer;
    const { error } = await supabase.from('customers').upsert({
      id,
      name,
      phone,
      plate_number: plateNumber,
      brand,
      model,
      status,
      total_amount: totalAmount || 0,
      cost: cost || 0,
      revenue: revenue || 0,
      data: rest
    });
    if (error) {
      console.error('Supabase DB Error Details:', error);
      throw error;
    }
  },

  // --- 庫存 ---
  getInventory: async () => {
    const { data, error } = await supabase.from('inventory').select('*');
    if (error) {
      console.error('Supabase getInventory Error:', error);
      throw error;
    }
    return (data || []).map(item => {
      const loc = item.location || {};
      return {
        ...item,
        lastUpdated: item.last_updated || item.lastUpdated,
        currentMeters: Number(loc.currentMeters || item.current_meters || 0),
        location: {
          zone: loc.zone || item.zone || 'A',
          section: Number(loc.section || item.section || 1),
          slot: Number(loc.slot || item.slot || 1)
        }
      };
    });
  },

  updateInventory: async (item: FilmInventory) => {
    const { id, lastUpdated, currentMeters, location, ...rest } = item;
    
    // 將 currentMeters 存入 location JSON 物件中，避免資料庫欄位缺失報錯
    const updateData: any = {
      ...rest,
      id,
      last_updated: lastUpdated || new Date().toISOString().split('T')[0],
      location: {
        ...location,
        currentMeters: Number(currentMeters || 0)
      }
    };

    const { error } = await supabase.from('inventory').upsert(updateData);
    
    if (error) {
      console.error('庫存更新失敗:', error);
      window.alert(`庫存儲存失敗！\n訊息: ${error.message}\n請確保資料庫 inventory 表格具備 id, brand, color, size, location, last_updated 欄位。`);
      throw error;
    }
  },

  deleteInventory: async (id: string) => {
    const { error } = await supabase.from('inventory').delete().eq('id', id);
    if (error) throw error;
  },

  getInventoryLogs: async () => {
    const { data, error } = await supabase.from('inventory_logs').select('*');
    if (error) throw error;
    return (data || []).map(item => item as InventoryLog);
  },

  addInventoryLog: async (log: InventoryLog) => {
    const { error } = await supabase.from('inventory_logs').insert({
      id: log.id,
      item_id: log.itemId,
      action: log.action,
      details: log.details,
      operator: log.operator
    });
    if (error) throw error;
  },

  // --- 叫貨紀錄 ---
  getPurchaseRecords: async () => {
    try {
      const { data, error } = await supabase.from('purchase_records').select('*').order('order_date', { ascending: false });
      
      let finalData: any[] = [];
      if (!error && data) {
        finalData = data.map(item => ({
          id: item.id || `PUR-${Math.random()}`,
          orderDate: item.order_date || '2026-01-01',
          itemName: item.item_name || '未命名項目',
          quantity: item.quantity || '0',
          price: Number(item.price || 0),
          status: item.status || 'ordered',
          notes: item.notes || '',
          operator: item.operator || '未設定'
        }));
      }

      console.log('Final Purchase Data Size:', finalData.length);
      return finalData;
    } catch (err) {
      console.warn('無法讀取叫貨紀錄表:', err);
      return [];
    }
  },

  addPurchaseRecord: async (record: any) => {
    const { error } = await supabase.from('purchase_records').insert({
      id: record.id,
      order_date: record.orderDate,
      item_name: record.itemName,
      quantity: record.quantity,
      price: record.price || 0,
      status: record.status,
      notes: record.notes,
      operator: record.operator
    });
    
    if (error) {
      // 如果表格不存在，我們僅在 Console 警告，不拋出錯誤，讓前端能繼續在本地端暫存
      if (error.code === 'PGRST116' || error.message.includes('not found') || error.message.includes('schema cache')) {
        console.warn('雲端叫貨紀錄表不存在，本次紀錄僅暫存於本地端 (重整後會消失):', error.message);
        return; 
      }
      console.error('叫貨紀錄儲存失敗:', error);
      throw error;
    }
  },

  uploadPhoto: async (file: File, path: string) => {
    try {
      // 移除路徑中的特殊字元與空格，避免 Supabase 報 Invalid key 錯誤
      const safePath = path.replace(/[^\x00-\x7F]/g, '_').replace(/\s+/g, '_');
      const { data, error } = await supabase.storage.from('photos').upload(safePath, file);
      if (error) {
        console.error('Supabase Storage Upload Error:', error);
        throw error;
      }
      const { data: publicUrl } = supabase.storage.from('photos').getPublicUrl(data.path);
      return publicUrl.publicUrl;
    } catch (err: any) {
      console.error('Storage API Exception:', err.message);
      if (err.message.includes('Bucket not found')) {
        alert('錯誤：找不到儲存空間 "photos"。請確保專案中已建立該 Bucket。');
      }
      throw err;
    }
  },

  // --- 財務收支 ---
  getFinanceRecords: async () => {
    try {
      const { data, error } = await supabase.from('finance_records').select('*').order('date', { ascending: false });
      if (error) throw error;
      return (data || []).map(item => ({
        id: item.id,
        date: item.date,
        type: item.type,
        category: item.category,
        amount: Number(item.amount),
        description: item.description,
        operator: item.operator
      }));
    } catch (err) {
      console.warn('財務紀錄讀取失敗或表格不存在:', err);
      return [];
    }
  },

  addFinanceRecord: async (record: any) => {
    const { error } = await supabase.from('finance_records').insert(record);
    if (error) {
      console.warn('雲端財務存檔失敗，僅儲存於本地:', error.message);
      // 本地存檔邏輯交由 App.tsx 處理，這裡僅靜默失敗以避免中斷程式
    }
  },

  deleteFinanceRecord: async (id: string) => {
    const { error } = await supabase.from('finance_records').delete().eq('id', id);
    if (error) console.warn('雲端刪除財務紀錄失敗:', error.message);
  },

  // --- 車型母檔 ---
  getVehicleMaster: async () => {
    try {
      const { data, error } = await supabase.from('vehicle_master').select('*');
      if (error) throw error;
      return data || [];
    } catch (err) {
      console.warn('車型母檔讀取失敗:', err);
      return [];
    }
  },

  upsertVehicleMaster: async (vehicles: any[]) => {
    const { error } = await supabase.from('vehicle_master').upsert(vehicles);
    if (error) throw error;
  },

  // --- 財務結算 ---
  getFinanceSettlements: async () => {
    const { data, error } = await supabase.from('finance_settlements').select('*').order('settlement_date', { ascending: false });
    if (error) { console.warn('結算紀錄讀取失敗:', error); return []; }
    return data || [];
  },

  addFinanceSettlement: async (settlement: any) => {
    const { error } = await supabase.from('finance_settlements').insert(settlement);
    if (error) throw error;
  },

  updateFinanceRecordsSettlement: async (ids: string[], settlementId: string) => {
    const { error } = await supabase
      .from('finance_records')
      .update({ settlement_id: settlementId })
      .in('id', ids);
    if (error) throw error;
  }
};
