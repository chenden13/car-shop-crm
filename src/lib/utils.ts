export const getYouTubeEmbedUrl = (url?: string) => {
  if (!url) return null;
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
  const match = url.match(regExp);
  return (match && match[2].length === 11) ? `https://www.youtube.com/embed/${match[2]}` : null;
};
import type { Customer, ChecklistItem } from '../types';

export const generateChecklist = (formData: Partial<Customer>): ChecklistItem[] => {
  const expectedItems = [
    '前置清潔 (預洗與表面深層清潔)',
    formData.mainService ? `膜料施工: ${formData.mainService}` : null,
    formData.mainServiceBrand ? `膜料規格/顏色: ${formData.mainServiceBrand}` : null,
    formData.windowTint ? `隔熱紙施工: ${formData.windowTint}` : null,
    formData.windowTintBrand ? `隔熱紙品項: ${formData.windowTintBrand}` : null,
    formData.digitalMirror ? `電子後視鏡安裝: ${formData.digitalMirror}` : null,
    formData.electricMod ? `電動改裝項目: ${formData.electricMod}` : null,
    ...(formData.giftItems || []).map(g => `贈送配件: ${g}`),
    ...(formData.customAccessories || []).map(a => `自訂選配: ${a.name}`),
    '完工自主檢查 (收邊、氣泡、完整度)',
    '交車前清潔與環境整理'
  ].filter(Boolean) as string[];

  return expectedItems.map(name => {
    const existing = formData.constructionChecklist?.find(c => c.name === name);
    return { 
      id: existing?.id || `c_${encodeURIComponent(name)}`, 
      name, 
      checked: existing ? existing.checked : false 
    };
  });
};
