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
    if (error) throw error;
    return (data || []).map(item => ({
      ...item,
      location: item.location || { zone: 'A', section: '1', slot: '1' }
    }));
  },

  updateInventory: async (item: FilmInventory) => {
    const { error } = await supabase.from('inventory').upsert(item);
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

  uploadPhoto: async (file: File, path: string) => {
    const { data, error } = await supabase.storage.from('photos').upload(path, file);
    if (error) throw error;
    const { data: publicUrl } = supabase.storage.from('photos').getPublicUrl(data.path);
    return publicUrl.publicUrl;
  }
};
