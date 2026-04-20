import { createClient } from '@supabase/supabase-js';
import type { Customer, FilmInventory, InventoryLog } from '../types';

// 這裡填入您在 Supabase 申請到的連線資訊
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const api = {
  // --- 客戶資料 ---
  async getCustomers() {
    const { data, error } = await supabase
      .from('customers')
      .select('*')
      .order('created_at', { ascending: false });
    if (error) throw error;
    
    // 將資料庫欄位轉回 React 使用的 camelCase
    return data.map(item => ({
      ...item.data,
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
  },


  async upsertCustomer(customer: Customer) {
    // 提取核心欄位與其餘 JSONB 欄位
    const { id, name, phone, plateNumber, brand, model, status, totalAmount, cost, revenue, ...rest } = customer;
    
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
  },

  // --- 膜料庫存 ---
  async getInventory() {
    const { data, error } = await supabase
      .from('inventory')
      .select('*');
    if (error) throw error;
    return data as FilmInventory[];
  },

  async updateInventory(item: FilmInventory) {
    const { error } = await supabase
      .from('inventory')
      .upsert(item);
    if (error) throw error;
  },

  // --- 異動紀錄 ---
  async getInventoryLogs() {
    const { data, error } = await supabase
      .from('inventory_logs')
      .select('*')
      .order('timestamp', { ascending: false });
    if (error) throw error;
    return data as InventoryLog[];
  },

  async addInventoryLog(log: InventoryLog) {
    const { error } = await supabase
      .from('inventory_logs')
      .insert(log);
    if (error) throw error;
  },

  // --- 圖片上傳 (雲端儲存) ---
  async uploadPhoto(file: File, path: string) {
    const { data, error } = await supabase.storage
      .from('photos')
      .upload(path, file);
    if (error) throw error;

    const { data: publicUrl } = supabase.storage
      .from('photos')
      .getPublicUrl(data.path);
    
    return publicUrl.publicUrl;
  }
};

