import type { Customer } from '../types';

const getNextDay = (dateStr: string): string => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  date.setDate(date.getDate() + 1);
  return date.toISOString().split('T')[0];
};

const getDaysDiff = (startStr: string, endStr: string): number => {
  const start = new Date(startStr);
  const end = new Date(endStr);
  if (isNaN(start.getTime()) || isNaN(end.getTime())) return 0;
  if (end.getTime() < start.getTime()) return 1;
  const diffTime = end.getTime() - start.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24)) + 1;
  return diffDays;
};

const getDatesRange = (startStr: string, totalDays: number): string[] => {
  const dates: string[] = [];
  const start = new Date(startStr);
  for (let i = 0; i < totalDays; i++) {
    const current = new Date(start);
    current.setDate(start.getDate() + i);
    dates.push(current.toISOString().split('T')[0]);
  }
  return dates;
};


const isValidDateStr = (dateStr: string): boolean => {
  if (!dateStr) return false;
  const date = new Date(dateStr);
  return !isNaN(date.getTime());
};

const ensureEndDateAfterStart = (start: string, end: string): string => {
  if (!start || !end) return '';
  const startDate = new Date(start);
  const endDate = new Date(end);
  if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return '';
  if (endDate.getTime() <= startDate.getTime()) {
    return getNextDay(start);
  }
  return end;
};

export const triggerWebhook = async (action: 'upsert' | 'delete', customer: Customer) => {
  const webhookUrl = localStorage.getItem('crm_webhook_url');
  if (!webhookUrl) return;

  // For delete action, send a single delete request
  if (action === 'delete') {
    try {
      await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: customer.id,
          action,
          customer,
          timestamp: new Date().toISOString()
        })
      });
    } catch (err) {
      console.error('Webhook delete request failed:', err);
    }
    return;
  }

  const model = customer.model || '未定車型';
  const filmColor = customer.filmColor || '未定色膜';
  const ownerName = customer.name || '無名車主';
  const isCustom = customer.id.startsWith('EVENT-');

  const servicePart = (() => {
    const s = customer.mainService || '';
    if (s.includes('改色犀牛皮')) return '改色犀牛皮';
    if (s.includes('改色')) return '改色';
    if (s.includes('迎風面')) return '迎風面';
    if (s.includes('犀牛皮')) return '犀牛皮';
    if (s.includes('美容')) return '汽車美容';
    if (s.includes('鍍膜')) return '鍍膜';
    return s || '未定項目';
  })();

  const eventsToSend: { title: string; startDate: string; endDate: string; type: '留車' | '交車' | '施工' }[] = [];

  if (isCustom) {
    if (customer.expectedStartDate && isValidDateStr(customer.expectedStartDate)) {
      const nextDay = getNextDay(customer.expectedStartDate);
      if (nextDay) {
        eventsToSend.push({
          title: `${ownerName}(局部施工)`,
          startDate: customer.expectedStartDate,
          endDate: ensureEndDateAfterStart(customer.expectedStartDate, nextDay),
          type: '施工'
        });
      }
    }
  } else {
    // 1. 今日留車 (單日活動：留車當天)
    if (customer.expectedStartDate && isValidDateStr(customer.expectedStartDate)) {
      const nextDay = getNextDay(customer.expectedStartDate);
      if (nextDay) {
        eventsToSend.push({
          title: `${ownerName}(${servicePart})-${model}-${filmColor}-今日留車`,
          startDate: customer.expectedStartDate,
          endDate: ensureEndDateAfterStart(customer.expectedStartDate, nextDay),
          type: '留車'
        });
      }
    }

    // 2. 今日交車 (單日活動：交車當天)
    const delDate = customer.expectedEndDate || customer.deliveryDate;
    if (delDate && isValidDateStr(delDate)) {
      const nextDay = getNextDay(delDate);
      if (nextDay) {
        eventsToSend.push({
          title: `${ownerName}(${servicePart})-${model}-${filmColor}-今日交車`,
          startDate: delDate,
          endDate: ensureEndDateAfterStart(delDate, nextDay),
          type: '交車'
        });
      }
    }

    // 3. 施工行程 (多日活動：施工開始日 至 施工結束日)
    if (customer.constructionStartDate && isValidDateStr(customer.constructionStartDate)) {
      const constEnd = customer.constructionEndDate || customer.constructionStartDate;
      if (isValidDateStr(constEnd)) {
        const totalDays = getDaysDiff(customer.constructionStartDate, constEnd);
        if (totalDays >= 3) {
          const dates = getDatesRange(customer.constructionStartDate, totalDays);
          dates.forEach((date, index) => {
            const nextDay = getNextDay(date);
            if (nextDay) {
              eventsToSend.push({
                title: `${ownerName}(${servicePart})-${model}-${filmColor}-施工進度 (${index + 1}/${totalDays})`,
                startDate: date,
                endDate: ensureEndDateAfterStart(date, nextDay),
                type: '施工'
              });
            }
          });
        } else {
          const start = customer.constructionStartDate;
          const end = getNextDay(constEnd);
          if (end) {
            const isSpanningTwoDays = customer.constructionStartDate && 
                                      customer.constructionEndDate && 
                                      customer.constructionStartDate !== customer.constructionEndDate;
            eventsToSend.push({
              title: `${ownerName}(${servicePart})-${model}-${filmColor}-今天要完成${isSpanningTwoDays ? '半台' : '全台'}`,
              startDate: start,
              endDate: ensureEndDateAfterStart(start, end),
              type: '施工'
            });
          }
        }
      }
    }
  }

  // 依序發送請求，防止 Google Calendar API 寫入衝突與限制
  for (const ev of eventsToSend) {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: customer.id,
          type: ev.type,
          action: 'upsert',
          title: ev.title,
          startDate: ev.startDate,
          endDate: ev.endDate,
          customer,
          timestamp: new Date().toISOString()
        })
      });
      if (!response.ok) {
        console.error('Webhook returned error status:', response.status);
      }
      // 稍微延遲以確保順序與穩定度
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (err) {
      console.error('Webhook execution failed:', err);
    }
  }
};
