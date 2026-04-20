import { createClient } from '@supabase/supabase-js';
import type { Customer, FilmInventory, InventoryLog } from '../types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);


export const api = {
  // --- 客戶資料 ---
  async getCustomers() {
    if (!supabase) return []; // 沒設定就回傳空，觸發離線模式
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.warn('資料表可能尚未建立:', error.message);
        return [];
      }
      
      return (data || []).map(item => ({
        ...(item.data || {}),
        id: item.id,
        name: item.name,
        phone: item.phone,
        plateNumber: item.plate_number,
        brand: item.brand,
        model: item.model,
        status: item.status,
        totalAmount: item.total_amount,
        cost: item.cost,
        revenue: item.revenue
      })) as Customer[];
    } catch (e) {
      return [];
    }
  },



  async upsertCustomer(customer: Customer) {
    if (!supabase) return customer;
    // 提取核心欄位與其餘 JSONB 欄位
    const { id, name, phone, plateNumber, brand, model, status, totalAmount, cost, revenue, ...rest } = customer;
    
    try {
      const { data, error } = await supabase
        .from('customers')
        .upsert({
          id, name, phone, 
          plate_number: plateNumber, 
          brand, model, status, 
          total_amount: totalAmount, 
          cost, revenue,
          data: rest // 剩餘資料存入 JSONB
        })
        .select();
      if (error) throw error;
      return data[0];
    } catch (e) {
      console.error('upsert 失敗:', e);
      return customer;
    }
  },

  // --- 膜料庫存 ---
  async getInventory() {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('inventory')
        .select('*');
      if (error) return [];
      return data as FilmInventory[];
    } catch (e) {
      return [];
    }
  },

  async updateInventory(item: FilmInventory) {
    if (!supabase) return;
    try {
      await supabase.from('inventory').upsert(item);
    } catch (e) {}
  },

  // --- 異動紀錄 ---
  async getInventoryLogs() {
    if (!supabase) return [];
    try {
      const { data, error } = await supabase
        .from('inventory_logs')
        .select('*')
        .order('timestamp', { ascending: false });
      if (error) return [];
      return data as InventoryLog[];
    } catch (e) {
      return [];
    }
  },

  async addInventoryLog(log: InventoryLog) {
    if (!supabase) return;
    try {
      await supabase.from('inventory_logs').insert(log);
    } catch (e) {}
  },

  // --- 圖片上傳 (雲端儲存) ---
  async uploadPhoto(file: File, path: string) {
    if (!supabase) return URL.createObjectURL(file);
    try {
      const { data, error } = await supabase.storage
        .from('photos')
        .upload(path, file);
      if (error) throw error;

      const { data: publicUrl } = supabase.storage
        .from('photos')
        .getPublicUrl(data.path);
      
      return publicUrl.publicUrl;
    } catch (e) {
      return URL.createObjectURL(file);
    }
  }
};
