import React, { useState, useMemo } from 'react';
import { 
  ChevronLeft, ChevronRight, Plus, Calendar as CalendarIcon, 
  X, User, Phone, Car, Tag, Clock, Settings, Edit, Trash2, 
  Briefcase, CheckCircle
} from 'lucide-react';
import type { Customer, Role } from '../types';

interface CalendarPageProps {
  customers: Customer[];
  onEditCustomer: (customer: Customer) => void;
  onUpdateCustomer: (updatedCustomer: Customer) => Promise<void>;
  onDeleteCustomer: (id: string) => void;
  userRole?: Role;
}

export const CalendarPage: React.FC<CalendarPageProps> = ({ 
  customers, onEditCustomer, onUpdateCustomer, onDeleteCustomer, userRole 
}) => {
  const [currentDate, setCurrentDate] = useState<Date>(new Date()); // Default to current system date
  const [viewMode, setViewMode] = useState<'day' | 'week' | 'month'>('week');
  const [selectedEvent, setSelectedEvent] = useState<Customer | null>(null);
  
  // Custom event modal state
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventForm, setEventForm] = useState({
    title: '',
    startDate: '',
    constructionTime: '',
    notes: ''
  });

  // Filter customers for calendar (scheduled, deposit, construction status)
  // Also include custom events (id starts with EVENT-)
  const calendarItems = useMemo(() => {
    return customers.filter(c => {
      // Must have a start date
      if (!c.expectedStartDate) return false;
      
      const isCustomEvent = c.id.startsWith('EVENT-');
      if (isCustomEvent) return true;

      // Filter statuses: deposit, scheduled, construction
      return ['deposit', 'scheduled', 'construction'].includes(c.status);
    });
  }, [customers]);

  const getItemColors = (item: Customer) => {
    if (item.id.startsWith('EVENT-')) {
      return {
        bg: '#f8f6f0', // Fresh light cream/sand
        stayBorder: '#f2efe5',
        border: '#dacfbe',
        text: '#5c523e',
        constructionBg: '#ede7d7',
        badge: '局部施工'
      };
    }

    const service = item.mainService || '';
    if (service.includes('改色犀牛皮')) {
      return {
        bg: '#fcf3f8', // Fresh light magenta/pink-purple
        stayBorder: '#f8e4f1',
        border: '#e7b6d7',
        text: '#6b3558',
        constructionBg: '#f4d5ea',
        badge: '改色犀牛皮'
      };
    } else if (service.includes('迎風面')) {
      return {
        bg: '#f1f6fc', // Fresh light Sky Blue
        stayBorder: '#e2edf9',
        border: '#b3cff1',
        text: '#354e6b',
        constructionBg: '#d7e6f8',
        badge: '迎風面'
      };
    } else if (service.includes('犀牛皮')) {
      return {
        bg: '#f0f7f0', // Fresh light Sage Green
        stayBorder: '#e0efe1',
        border: '#b6dcb9',
        text: '#3b5a3e',
        constructionBg: '#d5ebd6',
        badge: '犀牛皮'
      };
    } else if (service.includes('改色')) {
      return {
        bg: '#fbf3f3', // Fresh light Rose/Coral
        stayBorder: '#f5e5e5',
        border: '#e8bcbc',
        text: '#6b4343',
        constructionBg: '#f3dbdb',
        badge: '改色膜'
      };
    } else if (service.includes('美容') || service.includes('汽車美容')) {
      return {
        bg: '#fdf4ff', // Soft purple
        stayBorder: '#fae8ff',
        border: '#f0abfc',
        text: '#701a75',
        constructionBg: '#f5d0fe',
        badge: '汽車美容'
      };
    } else if (service.includes('鍍膜')) {
      return {
        bg: '#f0fdf4', // Soft cyan/emerald
        stayBorder: '#dcfce7',
        border: '#86efac',
        text: '#14532d',
        constructionBg: '#bbf7d0',
        badge: '鍍膜'
      };
    } else if (service.includes('局部')) {
      return {
        bg: '#f8f6f0', // Fresh light cream/sand
        stayBorder: '#f2efe5',
        border: '#dacfbe',
        text: '#5c523e',
        constructionBg: '#ede7d7',
        badge: '局部'
      };
    } else {
      return {
        bg: '#f6f2f9', // Fresh light Lavender
        stayBorder: '#f0e7f5',
        border: '#d7bee5',
        text: '#593c6b',
        constructionBg: '#ebdcf5',
        badge: '其他'
      };
    }
  };

  const getDayColors = (item: Customer) => {
    const service = item.mainService || '';
    const isCustom = item.id.startsWith('EVENT-');
    if (isCustom) {
      return {
        bg: '#f6f5f0', // Very light warm sand/cream
        border: '#dedbd3',
        text: '#4e493e',
        badge: '局部施工'
      };
    }
    if (service.includes('迎風面')) {
      return {
        bg: '#ecf3f7', // Very light pastel sky blue
        border: '#c3d5e5',
        text: '#25384a',
        badge: '迎風面'
      };
    } else if (service.includes('犀牛皮')) {
      return {
        bg: '#edf6ee', // Very light pastel sage green
        border: '#c2dec4',
        text: '#2e3d2f',
        badge: '犀牛皮'
      };
    } else if (service.includes('改色')) {
      return {
        bg: '#faf0f0', // Very light pastel rose
        border: '#e8caca',
        text: '#5c3d3d',
        badge: '改色膜'
      };
    } else if (service.includes('美容') || service.includes('汽車美容')) {
      return {
        bg: '#fdf4ff',
        border: '#f0abfc',
        text: '#701a75',
        badge: '汽車美容'
      };
    } else if (service.includes('鍍膜')) {
      return {
        bg: '#f0fdf4',
        border: '#86efac',
        text: '#14532d',
        badge: '鍍膜'
      };
    } else if (service.includes('局部')) {
      return {
        bg: '#f6f5f0', // Very light warm sand/cream
        border: '#dedbd3',
        text: '#4e493e',
        badge: '局部'
      };
    } else {
      return {
        bg: '#f6effa', // Very light pastel lavender
        border: '#debde8',
        text: '#442d52',
        badge: '其他'
      };
    }
  };

  const getDayConstructionColors = (item: Customer) => {
    const service = item.mainService || '';
    const isCustom = item.id.startsWith('EVENT-');
    if (isCustom) {
      return {
        bg: '#eae6db', // Soft light warm sand/cream
        border: '#cebfac',
        text: '#3c3527'
      };
    }
    if (service.includes('迎風面')) {
      return {
        bg: '#dae6f2', // Soft light pastel sky blue
        border: '#b1c8df',
        text: '#1c2f42'
      };
    } else if (service.includes('犀牛皮')) {
      return {
        bg: '#dceddd', // Soft light pastel sage green
        border: '#aac7ad',
        text: '#203323'
      };
    } else if (service.includes('改色')) {
      return {
        bg: '#f4dede', // Soft light pastel rose
        border: '#dfb8b8',
        text: '#522b2b'
      };
    } else if (service.includes('局部')) {
      return {
        bg: '#eae6db', // Soft light warm sand/cream
        border: '#cebfac',
        text: '#3c3527'
      };
    } else {
      return {
        bg: '#ebddf2', // Soft light pastel lavender
        border: '#ccb6dc',
        text: '#362145'
      };
    }
  };

  // Helper: Normalize date string to YYYY-MM-DD
  const formatDateString = (date: Date) => {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  };

  // Navigate dates
  const handlePrev = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(currentDate.getDate() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() - 7);
    } else {
      newDate.setMonth(currentDate.getMonth() - 1);
    }
    setCurrentDate(newDate);
  };

  const handleNext = () => {
    const newDate = new Date(currentDate);
    if (viewMode === 'day') {
      newDate.setDate(currentDate.getDate() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(currentDate.getDate() + 7);
    } else {
      newDate.setMonth(currentDate.getMonth() + 1);
    }
    setCurrentDate(newDate);
  };

  const handleToday = () => {
    setCurrentDate(new Date()); // Dynamic current date
  };

  // Open custom event modal
  const openCustomEventModal = (dateStr?: string) => {
    setEventForm({
      title: '',
      startDate: dateStr || formatDateString(currentDate),
      constructionTime: '',
      notes: ''
    });
    setIsEventModalOpen(true);
  };

  // Submit custom event (saves in customers table)
  const handleSaveCustomEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!eventForm.title || !eventForm.startDate) return;

    const newEvent: Customer = {
      id: `EVENT-${Date.now()}`,
      name: eventForm.title,
      phone: '',
      plateNumber: '',
      status: 'scheduled',
      mainService: '局部施工',
      expectedStartDate: eventForm.startDate,
      expectedEndDate: eventForm.startDate,
      constructionTime: eventForm.constructionTime,
      notes: eventForm.notes,
      inCalendar: true
    };

    try {
      await onUpdateCustomer(newEvent);
      setIsEventModalOpen(false);
    } catch (err) {
      console.error('Failed to save event:', err);
    }
  };

  const handleDeleteEvent = async (id: string) => {
    try {
      await onDeleteCustomer(id);
      if (selectedEvent?.id === id) {
        setSelectedEvent(null);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // --- Week View Grid Math ---
  const weekDays = useMemo(() => {
    const startOfWeek = new Date(currentDate);
    const day = startOfWeek.getDay();
    startOfWeek.setDate(currentDate.getDate() - day); // Sunday of current week
    
    const days: Date[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(startOfWeek);
      d.setDate(startOfWeek.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  const weekRangeText = useMemo(() => {
    const first = weekDays[0];
    const last = weekDays[6];
    return `${first.getFullYear()}年${first.getMonth() + 1}月${first.getDate()}日 — ${last.getMonth() + 1}月${last.getDate()}日`;
  }, [weekDays]);

  // Pack events into non-overlapping rows for the current week
  const weekEventLayouts = useMemo(() => {
    const startOfWeekStr = formatDateString(weekDays[0]);
    const endOfWeekStr = formatDateString(weekDays[6]);

    // Filter events overlapping this week
    const weekItems = calendarItems.filter(item => {
      const start = item.expectedStartDate || '';
      const end = item.expectedEndDate || start;
      return start <= endOfWeekStr && end >= startOfWeekStr;
    });

    const todayStr = formatDateString(currentDate);

    // Sort by:
    // 1. Is constructing on the currently selected day (todayStr) -> score 2
    // 2. Is drop-off or delivery on the currently selected day -> score 1
    // 3. Others -> score 0
    // Then duration desc, then expectedStartDate asc
    const sorted = [...weekItems].sort((a, b) => {
      const isCustomA = a.id.startsWith('EVENT-');
      const isCustomB = b.id.startsWith('EVENT-');

      const isA_constructing = isCustomA 
        ? (a.expectedStartDate === todayStr)
        : !!(a.constructionStartDate && a.constructionStartDate <= todayStr && (a.constructionEndDate || a.constructionStartDate) >= todayStr);
      const isB_constructing = isCustomB 
        ? (b.expectedStartDate === todayStr)
        : !!(b.constructionStartDate && b.constructionStartDate <= todayStr && (b.constructionEndDate || b.constructionStartDate) >= todayStr);

      const isA_todayEvent = !isCustomA && (a.expectedStartDate === todayStr || a.expectedEndDate === todayStr);
      const isB_todayEvent = !isCustomB && (b.expectedStartDate === todayStr || b.expectedEndDate === todayStr);

      const scoreA = isA_constructing ? 2 : (isA_todayEvent ? 1 : 0);
      const scoreB = isB_constructing ? 2 : (isB_todayEvent ? 1 : 0);

      if (scoreB !== scoreA) {
        return scoreB - scoreA; // Higher score (constructing today) comes first
      }

      // Sort by duration desc, then start date asc
      const durationA = new Date(a.expectedEndDate || a.expectedStartDate || '').getTime() - new Date(a.expectedStartDate || '').getTime();
      const durationB = new Date(b.expectedEndDate || b.expectedStartDate || '').getTime() - new Date(b.expectedStartDate || '').getTime();
      if (durationB !== durationA) return durationB - durationA;
      return (a.expectedStartDate || '').localeCompare(b.expectedStartDate || '');
    });

    // Simple row packing algorithm
    const rows: Customer[][] = [];
    const layouts = sorted.map(item => {
      const startStr = item.expectedStartDate || '';
      const endStr = item.expectedEndDate || startStr;

      // Find start column index (0-6)
      let startIdx = weekDays.findIndex(d => formatDateString(d) === startStr);
      if (startIdx === -1) {
        // Starts before this week
        startIdx = startStr < startOfWeekStr ? 0 : 6;
      }

      // Find end column index (0-6)
      let endIdx = weekDays.findIndex(d => formatDateString(d) === endStr);
      if (endIdx === -1) {
        // Ends after this week
        endIdx = endStr > endOfWeekStr ? 6 : 0;
      }

      // Find row index
      let rowIndex = 0;
      while (true) {
        if (!rows[rowIndex]) {
          rows[rowIndex] = [];
        }
        // Check collision in this row
        const collides = rows[rowIndex].some(placed => {
          const pStart = placed.expectedStartDate || '';
          const pEnd = placed.expectedEndDate || pStart;
          return pStart <= endStr && pEnd >= startStr;
        });
        if (!collides) {
          rows[rowIndex].push(item);
          break;
        }
        rowIndex++;
      }

      return {
        item,
        startIdx,
        endIdx,
        rowIndex
      };
    });

    return { layouts, maxRows: rows.length };
  }, [weekDays, calendarItems, currentDate]);


  // --- Month View Grid Math ---
  const monthDays = useMemo(() => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // First day of current month
    const firstDay = new Date(year, month, 1);
    // Day of the week of first day (0-6)
    const startDayOfWeek = firstDay.getDay();
    
    // Calendar start date (may be in previous month)
    const calStart = new Date(firstDay);
    calStart.setDate(1 - startDayOfWeek);

    const days: Date[] = [];
    // 6 weeks * 7 days = 42 days grid
    for (let i = 0; i < 42; i++) {
      const d = new Date(calStart);
      d.setDate(calStart.getDate() + i);
      days.push(d);
    }
    return days;
  }, [currentDate]);

  // Pack month events week-by-week
  const monthEventLayouts = useMemo(() => {
    const weeks: Array<{
      startStr: string;
      endStr: string;
      days: Date[];
      layouts: Array<{ item: Customer; startIdx: number; endIdx: number; rowIndex: number }>;
      maxRows: number;
    }> = [];

    for (let w = 0; w < 6; w++) {
      const weekDaysSlice = monthDays.slice(w * 7, (w + 1) * 7);
      const startStr = formatDateString(weekDaysSlice[0]);
      const endStr = formatDateString(weekDaysSlice[6]);

      // Filter events overlapping this week
      const weekItems = calendarItems.filter(item => {
        const start = item.expectedStartDate || '';
        const end = item.expectedEndDate || start;
        return start <= endStr && end >= startStr;
      });

      // Sort
      const sorted = [...weekItems].sort((a, b) => {
        const durationA = new Date(a.expectedEndDate || a.expectedStartDate || '').getTime() - new Date(a.expectedStartDate || '').getTime();
        const durationB = new Date(b.expectedEndDate || b.expectedStartDate || '').getTime() - new Date(b.expectedStartDate || '').getTime();
        if (durationB !== durationA) return durationB - durationA;
        return (a.expectedStartDate || '').localeCompare(b.expectedStartDate || '');
      });

      const rows: Customer[][] = [];
      const layouts = sorted.map(item => {
        const start = item.expectedStartDate || '';
        const end = item.expectedEndDate || start;

        let startIdx = weekDaysSlice.findIndex(d => formatDateString(d) === start);
        if (startIdx === -1) {
          startIdx = start < startStr ? 0 : 6;
        }
        let endIdx = weekDaysSlice.findIndex(d => formatDateString(d) === end);
        if (endIdx === -1) {
          endIdx = end > endStr ? 6 : 0;
        }

        let rowIndex = 0;
        while (true) {
          if (!rows[rowIndex]) {
            rows[rowIndex] = [];
          }
          const collides = rows[rowIndex].some(placed => {
            const pStart = placed.expectedStartDate || '';
            const pEnd = placed.expectedEndDate || pStart;
            return pStart <= end && pEnd >= start;
          });
          if (!collides) {
            rows[rowIndex].push(item);
            break;
          }
          rowIndex++;
        }

        return { item, startIdx, endIdx, rowIndex };
      });

      weeks.push({
        startStr,
        endStr,
        days: weekDaysSlice,
        layouts,
        maxRows: Math.max(rows.length, 3) // Make at least 3 rows high for clean styling
      });
    }

    return weeks;
  }, [monthDays, calendarItems]);

  const inShopCustomers = useMemo(() => {
    const todayStr = formatDateString(currentDate);
    return calendarItems.filter(item => {
      if (item.id.startsWith('EVENT-')) return false;
      const start = item.expectedStartDate || '';
      const end = item.expectedEndDate || start;
      return start <= todayStr && end >= todayStr;
    });
  }, [currentDate, calendarItems]);

  const constructingCustomers = useMemo(() => {
    const todayStr = formatDateString(currentDate);
    return calendarItems.filter(item => {
      if (item.id.startsWith('EVENT-')) {
        return item.expectedStartDate === todayStr;
      }
      const start = item.constructionStartDate || '';
      const end = item.constructionEndDate || start;
      if (item.constructionStartDate) {
        return start <= todayStr && end >= todayStr;
      }
      return false;
    });
  }, [currentDate, calendarItems]);

  const todayDropOffCustomers = useMemo(() => {
    const todayStr = formatDateString(currentDate);
    return calendarItems.filter(item => {
      if (item.id.startsWith('EVENT-')) return false;
      return item.expectedStartDate === todayStr;
    });
  }, [currentDate, calendarItems]);

  const todayDeliveryCustomers = useMemo(() => {
    const todayStr = formatDateString(currentDate);
    return calendarItems.filter(item => {
      if (item.id.startsWith('EVENT-')) return false;
      return item.expectedEndDate === todayStr;
    });
  }, [currentDate, calendarItems]);

  // Today marker check
  const isToday = (date: Date) => {
    const today = new Date(); // Dynamic current date
    return date.getFullYear() === today.getFullYear() &&
           date.getMonth() === today.getMonth() &&
           date.getDate() === today.getDate();
  };

  return (
    <div style={{ display: 'flex', gap: '20px', height: 'calc(100vh - 120px)', padding: '10px 20px', overflow: 'hidden' }}>
      
      {/* Calendar Grid Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', background: 'rgba(255,255,255,0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.5)', borderRadius: '20px', padding: '20px', overflow: 'hidden', boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.05)' }}>
        
        {/* Navigation & Controls */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: '900', color: 'var(--primary)', margin: 0 }}>
              {viewMode === 'day' 
                ? `${currentDate.getFullYear()}年${currentDate.getMonth() + 1}月${currentDate.getDate()}日 (當日排程)`
                : viewMode === 'week' ? weekRangeText : `${currentDate.getFullYear()}年 ${currentDate.getMonth() + 1}月`}
            </h2>
            <div style={{ display: 'flex', gap: '4px', background: '#f1f5f9', padding: '4px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
              <button 
                onClick={() => setViewMode('month')} 
                style={{ border: 'none', background: viewMode === 'month' ? '#fff' : 'transparent', color: viewMode === 'month' ? 'var(--primary)' : '#64748b', fontWeight: 'bold', fontSize: '0.8rem', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', boxShadow: viewMode === 'month' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
              >
                月
              </button>
              <button 
                onClick={() => setViewMode('week')} 
                style={{ border: 'none', background: viewMode === 'week' ? '#fff' : 'transparent', color: viewMode === 'week' ? 'var(--primary)' : '#64748b', fontWeight: 'bold', fontSize: '0.8rem', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', boxShadow: viewMode === 'week' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
              >
                週
              </button>
              <button 
                onClick={() => setViewMode('day')} 
                style={{ border: 'none', background: viewMode === 'day' ? '#fff' : 'transparent', color: viewMode === 'day' ? 'var(--primary)' : '#64748b', fontWeight: 'bold', fontSize: '0.8rem', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', boxShadow: viewMode === 'day' ? '0 2px 4px rgba(0,0,0,0.05)' : 'none', transition: 'all 0.2s' }}
              >
                天
              </button>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button onClick={handleToday} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>今天</button>
            <div style={{ display: 'flex', gap: '2px', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '10px', overflow: 'hidden' }}>
              <button onClick={handlePrev} style={{ border: 'none', background: 'transparent', padding: '8px', cursor: 'pointer', color: '#64748b' }}>
                <ChevronLeft size={16} />
              </button>
              <button onClick={handleNext} style={{ border: 'none', background: 'transparent', padding: '8px', cursor: 'pointer', color: '#64748b' }}>
                <ChevronRight size={16} />
              </button>
            </div>
            <button 
              onClick={() => openCustomEventModal()}
              className="btn btn-primary" 
              style={{ padding: '8px 16px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <Plus size={16} /> 新增局部施工
            </button>
          </div>
        </div>

        {/* View Grid rendering */}
        <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column' }}>
          {viewMode === 'day' ? (
            /* --- DAY VIEW GRID --- */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', height: '100%', minHeight: '400px', overflow: 'hidden' }}>
              
              {/* Left Column: 現場留車車輛 */}
              <div style={{ display: 'flex', flexDirection: 'column', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', overflow: 'hidden' }}>
                <h3 style={{ margin: '0 0 16px 0', fontSize: '1.05rem', fontWeight: '900', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ display: 'inline-block', width: '8px', height: '18px', background: '#3b82f6', borderRadius: '4px' }}></span>
                  🚗 現場留車車輛 ({inShopCustomers.length} 輛)
                </h3>
                <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '14px', paddingRight: '4px' }}>
                  {inShopCustomers.length > 0 ? (
                    inShopCustomers.map(item => {
                      const colors = getDayColors(item);
                      const isSelected = selectedEvent?.id === item.id;
                      return (
                        <div
                          key={item.id}
                          onClick={() => setSelectedEvent(item)}
                          style={{
                            background: colors.bg,
                            border: `1px solid ${isSelected ? 'var(--primary)' : colors.border}`,
                            borderRadius: '10px',
                            padding: '12px 14px',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            boxShadow: isSelected ? '0 4px 10px rgba(79,70,229,0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}
                        >
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <div style={{ fontWeight: '800', fontSize: '0.98rem', color: colors.text, display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span>{item.name}</span>
                              <span style={{ fontSize: '0.72rem', padding: '1px 5px', background: '#fff', color: colors.text, borderRadius: '4px', border: `1px solid ${colors.border}` }}>
                                {colors.badge}
                              </span>
                            </div>
                            <div style={{ fontSize: '0.82rem', color: colors.text, opacity: 0.85 }}>
                              {item.brand} {item.model} | {item.plateNumber}
                            </div>
                          </div>

                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', flexWrap: 'wrap', gap: '4px' }}>
                            {/* Left: Film & Tint */}
                            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                              {item.filmColor && <span style={{ background: 'rgba(255,255,255,0.7)', padding: '1px 4px', borderRadius: '3px', fontSize: '0.78rem', color: colors.text, border: `1px solid ${colors.border}` }}>🎨 {item.filmColor}</span>}
                              {item.windowTint && <span style={{ background: 'rgba(255,255,255,0.7)', padding: '1px 4px', borderRadius: '3px', fontSize: '0.78rem', color: colors.text, border: `1px solid ${colors.border}` }}>☀️ 隔熱</span>}
                            </div>
                            {/* Right: Delivery Time */}
                            <div style={{ fontSize: '0.82rem', color: '#b45309', fontWeight: 'bold' }}>
                              🏁 交車: {item.expectedEndDate ? item.expectedEndDate.substring(5) : '未定'} {item.expectedDeliveryTime || ''}
                            </div>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '0.85rem' }}>
                      當日無現場留車車輛
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column: 今日施工車輛 + 今日進出安排 */}
              <div style={{ display: 'flex', flexDirection: 'column', background: '#f8fafc', borderRadius: '16px', border: '1px solid #e2e8f0', padding: '16px', overflow: 'hidden', gap: '18px' }}>
                
                {/* Top block: 今日施工進度 */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', fontWeight: '900', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '18px', background: '#5a6e5d', borderRadius: '4px' }}></span>
                    🛠️ 今日施工進度 ({constructingCustomers.length} 輛)
                  </h3>
                  <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '12px', paddingRight: '4px' }}>
                    {constructingCustomers.length > 0 ? (
                      constructingCustomers.map(item => {
                        const colors = getDayConstructionColors(item);
                        const isSelected = selectedEvent?.id === item.id;
                        const isCustom = item.id.startsWith('EVENT-');
                        
                        const isSpanningTwoDays = !isCustom && 
                          item.constructionStartDate && 
                          item.constructionEndDate && 
                          item.constructionStartDate !== item.constructionEndDate;

                        return (
                          <div
                            key={item.id}
                            onClick={() => setSelectedEvent(item)}
                            style={{
                              background: colors.bg,
                              border: `1px solid ${isSelected ? 'var(--primary)' : colors.border}`,
                              borderRadius: '10px',
                              padding: '12px 14px',
                              cursor: 'pointer',
                              transition: 'all 0.2s',
                              boxShadow: isSelected ? '0 4px 10px rgba(79,70,229,0.12)' : '0 1px 3px rgba(0,0,0,0.02)',
                              display: 'flex',
                              flexDirection: 'column',
                              gap: '6px'
                            }}
                          >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div style={{ fontWeight: '800', fontSize: '0.98rem', color: colors.text, display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                                <span>{item.name}</span>
                                <span style={{ fontSize: '0.72rem', padding: '1px 5px', background: '#fff', color: colors.text, borderRadius: '4px', border: `1px solid ${colors.border}` }}>
                                  {isCustom ? '局部施工' : colors.badge}
                                </span>
                                {isSpanningTwoDays ? (
                                  <span style={{ fontSize: '0.72rem', padding: '1px 4px', background: '#fbf3f3', color: '#6b4343', borderRadius: '4px', border: '1px solid #e8bcbc', fontWeight: 'bold' }}>
                                    半台
                                  </span>
                                ) : !isCustom ? (
                                  <span style={{ fontSize: '0.72rem', padding: '1px 4px', background: '#f0f7f0', color: '#3b5a3e', borderRadius: '4px', border: '1px solid #b6dcb9', fontWeight: 'bold' }}>
                                    全台
                                  </span>
                                ) : null}
                              </div>
                              {!isCustom && (
                                <div style={{ fontSize: '0.82rem', color: colors.text, opacity: 0.85 }}>
                                  {item.brand} {item.model} | {item.plateNumber}
                                </div>
                              )}
                            </div>

                            {!isCustom ? (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px', flexWrap: 'wrap', gap: '4px' }}>
                                {/* Left: Film & Tint */}
                                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                                  {item.filmColor && <span style={{ background: 'rgba(255,255,255,0.7)', padding: '1px 4px', borderRadius: '3px', fontSize: '0.78rem', color: colors.text, border: `1px solid ${colors.border}` }}>🎨 {item.filmColor}</span>}
                                  {item.windowTint && <span style={{ background: 'rgba(255,255,255,0.7)', padding: '1px 4px', borderRadius: '3px', fontSize: '0.78rem', color: colors.text, border: `1px solid ${colors.border}` }}>☀️ 隔熱</span>}
                                </div>
                                {/* Right: Delivery Time */}
                                <div style={{ fontSize: '0.82rem', color: '#b45309', fontWeight: 'bold' }}>
                                  🏁 交車: {item.expectedEndDate ? item.expectedEndDate.substring(5) : '未定'} {item.expectedDeliveryTime || ''}
                                </div>
                              </div>
                            ) : (
                              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '2px' }}>
                                <div style={{ fontSize: '0.82rem', color: colors.text, opacity: 0.9, whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', maxWidth: '70%' }}>
                                  {item.notes || '無備註'}
                                </div>
                                {item.constructionTime && (
                                  <div style={{ fontSize: '0.82rem', color: colors.text, fontWeight: 'bold' }}>
                                    ⏰ {item.constructionTime}
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        );
                      })
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#94a3b8', fontSize: '0.85rem' }}>
                        當日無施工車輛
                      </div>
                    )}
                  </div>
                </div>

                {/* Bottom block: 今日進出安排 */}
                <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden', borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                  <h3 style={{ margin: '0 0 12px 0', fontSize: '1.05rem', fontWeight: '900', color: '#1e293b', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ display: 'inline-block', width: '8px', height: '18px', background: '#566573', borderRadius: '4px' }}></span>
                    🔄 今日進出安排 (留車與交車)
                  </h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px', flex: 1, overflow: 'hidden' }}>
                    {/* Left sub-column: 今日須留車 */}
                    <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9', padding: '12px', overflow: 'hidden' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#2e4053', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📥 今日須留車 ({todayDropOffCustomers.length})
                      </h4>
                      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {todayDropOffCustomers.length > 0 ? (
                          todayDropOffCustomers.map(item => {
                            const colors = getDayColors(item);
                            const isSelected = selectedEvent?.id === item.id;
                            return (
                              <div
                                key={item.id}
                                onClick={() => setSelectedEvent(item)}
                                style={{
                                  padding: '10px 12px',
                                  background: colors.bg,
                                  border: `1px solid ${isSelected ? 'var(--primary)' : colors.border}`,
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  color: colors.text
                                }}
                              >
                                <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '0.9rem' }}>{item.name}</span>
                                  <span style={{ fontSize: '0.68rem', padding: '1px 4px', background: '#fff', color: colors.text, borderRadius: '4px', border: `1px solid ${colors.border}` }}>{colors.badge}</span>
                                </div>
                                <div style={{ opacity: 0.9, fontSize: '0.8rem', marginTop: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>{item.plateNumber} | {item.model}</span>
                                  {item.filmColor && <span style={{ background: 'rgba(255,255,255,0.7)', padding: '1px 4px', borderRadius: '3px', fontSize: '0.78rem', border: `1px solid ${colors.border}` }}>🎨 {item.filmColor}</span>}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1', fontSize: '0.8rem' }}>無今日須留車</div>
                        )}
                      </div>
                    </div>

                    {/* Right sub-column: 今日須交車 */}
                    <div style={{ display: 'flex', flexDirection: 'column', background: '#fff', borderRadius: '12px', border: '1px solid #f1f5f9', padding: '12px', overflow: 'hidden' }}>
                      <h4 style={{ margin: '0 0 10px 0', fontSize: '0.85rem', fontWeight: 'bold', color: '#8c6b6b', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📤 今日須交車 ({todayDeliveryCustomers.length})
                      </h4>
                      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        {todayDeliveryCustomers.length > 0 ? (
                          todayDeliveryCustomers.map(item => {
                            const colors = getDayColors(item);
                            const isSelected = selectedEvent?.id === item.id;
                            return (
                              <div
                                key={item.id}
                                onClick={() => setSelectedEvent(item)}
                                style={{
                                  padding: '10px 12px',
                                  background: colors.bg,
                                  border: `1px solid ${isSelected ? 'var(--primary)' : colors.border}`,
                                  borderRadius: '8px',
                                  cursor: 'pointer',
                                  fontSize: '0.85rem',
                                  color: colors.text
                                }}
                              >
                                <div style={{ fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
                                  <span style={{ fontSize: '0.9rem' }}>{item.name}</span>
                                  <span style={{ fontSize: '0.68rem', padding: '1px 4px', background: '#fff', color: colors.text, borderRadius: '4px', border: `1px solid ${colors.border}` }}>{colors.badge}</span>
                                </div>
                                <div style={{ opacity: 0.9, fontSize: '0.8rem', marginTop: '2px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <span>{item.plateNumber} | {item.model}</span>
                                  {item.filmColor && <span style={{ background: 'rgba(255,255,255,0.7)', padding: '1px 4px', borderRadius: '3px', fontSize: '0.78rem', border: `1px solid ${colors.border}` }}>🎨 {item.filmColor}</span>}
                                </div>
                              </div>
                            );
                          })
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#cbd5e1', fontSize: '0.8rem' }}>無今日須交車</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          ) : viewMode === 'week' ? (
            /* --- WEEK VIEW GRID --- */
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', minHeight: '400px' }}>
              {/* Header Days */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: '2px solid #e2e8f0', paddingBottom: '10px', textAlign: 'center' }}>
                {weekDays.map((d, idx) => {
                  const active = isToday(d);
                  const labels = ['週日', '週一', '週二', '週三', '週四', '週五', '週六'];
                  return (
                    <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                      <span style={{ fontSize: '0.8rem', color: active ? 'var(--primary)' : '#64748b', fontWeight: 'bold' }}>
                        {labels[idx]}
                      </span>
                      <span style={{ 
                        width: '32px', 
                        height: '32px', 
                        display: 'flex', 
                        alignItems: 'center', 
                        justifyContent: 'center', 
                        borderRadius: '50%', 
                        background: active ? 'var(--primary)' : 'transparent', 
                        color: active ? '#fff' : '#0f172a', 
                        fontWeight: '800',
                        fontSize: '1rem'
                      }}>
                        {d.getDate()}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Weekly Timeline Tracks */}
              <div style={{ position: 'relative', flex: 1, minHeight: '300px', marginTop: '10px', background: 'linear-gradient(90deg, #e2e8f0 1px, transparent 1px)', backgroundSize: 'calc(100% / 7) 100%' }}>
                
                {/* Horizontal Spanning Bars */}
                <div style={{ position: 'relative', height: `${(weekEventLayouts.maxRows || 2) * 50 + 20}px` }}>
                  {weekEventLayouts.layouts.map(({ item, startIdx, endIdx, rowIndex }) => {
                    const colors = getItemColors(item);
                    const isSelected = selectedEvent?.id === item.id;
                    const duration = endIdx - startIdx + 1;

                    // Compute actual construction dates and subsegment if they are defined
                    let hasConstructionOverlay = false;
                    let constructionLeft = '0%';
                    let constructionWidth = '0%';
                    
                    if (item.constructionStartDate && item.expectedStartDate && item.expectedEndDate) {
                      const cStart = item.constructionStartDate;
                      const cEnd = item.constructionEndDate || cStart;
                      const visibleStartStr = formatDateString(weekDays[startIdx]);
                      const visibleEndStr = formatDateString(weekDays[endIdx]);

                      // Check if construction overlaps with the visible week portion
                      if (cEnd >= visibleStartStr && cStart <= visibleEndStr) {
                        const startStr = cStart < visibleStartStr ? visibleStartStr : cStart;
                        const endStr = cEnd > visibleEndStr ? visibleEndStr : cEnd;

                        const diffStartMs = new Date(startStr).getTime() - new Date(visibleStartStr).getTime();
                        const diffStartDays = Math.round(diffStartMs / 86400000);

                        const diffDurationMs = new Date(endStr).getTime() - new Date(startStr).getTime();
                        const diffDurationDays = Math.round(diffDurationMs / 86400000) + 1;

                        const leftPct = (diffStartDays / duration) * 100;
                        const widthPct = (diffDurationDays / duration) * 100;

                        constructionLeft = `${Math.max(0, Math.min(100, leftPct))}%`;
                        constructionWidth = `${Math.max(1, Math.min(100, widthPct))}%`;
                        hasConstructionOverlay = true;
                      }
                    }

                    return (
                      <div
                        key={item.id}
                        onClick={() => setSelectedEvent(item)}
                        style={{
                          position: 'absolute',
                          left: `calc((100% / 7) * ${startIdx} + 4px)`,
                          width: `calc((100% / 7) * ${duration} - 8px)`,
                          top: `${rowIndex * 46 + 10}px`,
                          height: '38px',
                          background: colors.bg,
                          border: `1px solid ${isSelected ? 'var(--primary)' : colors.stayBorder}`,
                          boxShadow: isSelected ? '0 0 0 2px rgba(79, 70, 229, 0.3)' : '0 2px 4px rgba(0,0,0,0.02)',
                          borderRadius: '8px',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '0 8px',
                          overflow: 'hidden',
                          transition: 'all 0.15s',
                          fontSize: '0.82rem',
                          fontWeight: '800',
                          color: colors.text,
                          userSelect: 'none'
                        }}
                      >
                        {/* Spanned active construction segment overlay */}
                        {hasConstructionOverlay && (
                          <div
                            title={`正式施工期間: ${item.constructionStartDate} 至 ${item.constructionEndDate}`}
                            style={{
                              position: 'absolute',
                              left: constructionLeft,
                              width: constructionWidth,
                              height: '100%',
                              background: colors.constructionBg,
                              borderLeft: `1px solid ${colors.border}`,
                              borderRight: `1px solid ${colors.border}`,
                              top: 0,
                              zIndex: 1,
                              opacity: 0.95
                            }}
                          />
                        )}

                        <div style={{ zIndex: 2, display: 'flex', alignItems: 'center', gap: '6px', width: '100%', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden' }}>
                          <span style={{ fontSize: '0.7rem', padding: '2px 6px', background: '#fff', borderRadius: '4px', border: `1px solid ${colors.border}` }}>
                            {colors.badge}
                          </span>
                          <span>
                            {item.id.startsWith('EVENT-') 
                              ? item.name 
                              : `${item.id}. ${item.model || '車主'} ${item.filmColor || ''}`}
                          </span>
                          {item.status === 'construction' && (
                            <span style={{ background: '#f59e0b', color: '#fff', fontSize: '0.65rem', padding: '1px 4px', borderRadius: '3px' }}>施工中</span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            /* --- MONTH VIEW GRID --- */
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', border: '1px solid #e2e8f0', borderRadius: '12px', overflow: 'hidden' }}>
              {/* Header Columns */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '8px 0', textAlign: 'center', fontWeight: 'bold', fontSize: '0.8rem', color: '#64748b' }}>
                <div>週日</div>
                <div>週一</div>
                <div>週二</div>
                <div>週三</div>
                <div>週四</div>
                <div>週五</div>
                <div>週六</div>
              </div>

              {/* Calendar Grid 6 weeks */}
              <div style={{ flex: 1, display: 'grid', gridTemplateRows: 'repeat(6, 1fr)', minHeight: '500px' }}>
                {monthEventLayouts.map((week, weekIdx) => (
                  <div key={weekIdx} style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', borderBottom: weekIdx < 5 ? '1px solid #e2e8f0' : 'none', position: 'relative' }}>
                    
                    {/* Day background cells */}
                    {week.days.map((day, dIdx) => {
                      const isCurrentMonth = day.getMonth() === currentDate.getMonth();
                      const todayCheck = isToday(day);
                      return (
                        <div
                          key={dIdx}
                          onDoubleClick={() => openCustomEventModal(formatDateString(day))}
                          style={{
                            borderRight: dIdx < 6 ? '1px solid #e2e8f0' : 'none',
                            padding: '4px 6px',
                            background: todayCheck ? '#f0fdf4' : isCurrentMonth ? '#fff' : '#f8fafc',
                            minHeight: '80px',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'flex-end'
                          }}
                        >
                          <span style={{
                            fontSize: '0.75rem',
                            fontWeight: 'bold',
                            color: todayCheck ? 'var(--primary)' : isCurrentMonth ? '#0f172a' : '#cbd5e1',
                            padding: '3px',
                            borderRadius: '4px',
                            background: todayCheck ? '#d1fae5' : 'transparent'
                          }}>
                            {day.getDate()}
                          </span>
                        </div>
                      );
                    })}

                    {/* Overlay Event Lines for this week */}
                    <div style={{ position: 'absolute', top: '24px', left: 0, right: 0, bottom: 0, overflow: 'hidden', pointerEvents: 'none' }}>
                      {week.layouts.map(({ item, startIdx, endIdx, rowIndex }) => {
                        // Limit vertical expansion
                        if (rowIndex > 3) return null;
                        const colors = getItemColors(item);
                        const isSelected = selectedEvent?.id === item.id;
                        const duration = endIdx - startIdx + 1;

                        return (
                          <div
                            key={item.id}
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedEvent(item);
                            }}
                            style={{
                              position: 'absolute',
                              left: `calc((100% / 7) * ${startIdx} + 2px)`,
                              width: `calc((100% / 7) * ${duration} - 4px)`,
                              top: `${rowIndex * 22}px`,
                              height: '18px',
                              background: colors.bg,
                              border: `1px solid ${isSelected ? 'var(--primary)' : colors.border}`,
                              borderRadius: '4px',
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              padding: '0 4px',
                              fontSize: '0.7rem',
                              fontWeight: 'bold',
                              color: colors.text,
                              textOverflow: 'ellipsis',
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              pointerEvents: 'auto',
                              userSelect: 'none',
                              zIndex: isSelected ? 10 : 2
                            }}
                          >
                            <span style={{ fontSize: '0.6rem', padding: '0 2px', background: '#fff', borderRadius: '2px', border: `1px solid ${colors.border}`, marginRight: '3px', display: 'inline-block' }}>
                              {colors.badge[0]}
                            </span>
                            {item.id.startsWith('EVENT-') ? item.name : `${item.id}.${item.model || ''}`}
                          </div>
                        );
                      })}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Right Details Panel Drawer */}
      <div style={{ 
        width: '320px', 
        background: '#ffffff', 
        border: '1px solid #e2e8f0', 
        borderRadius: '20px', 
        boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
        display: 'flex', 
        flexDirection: 'column', 
        overflow: 'hidden',
        transition: 'transform 0.3s'
      }}>
        {selectedEvent ? (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            
            {/* Drawer Header */}
            <div style={{ padding: '20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, color: '#0f172a', fontWeight: '900', fontSize: '1.1rem' }}>活動詳情</h3>
              <button 
                onClick={() => setSelectedEvent(null)}
                style={{ border: 'none', background: 'transparent', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}
              >
                <X size={20} />
              </button>
            </div>

            {/* Content Body */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              
              {/* Event Identifier Header */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <span style={{ alignSelf: 'flex-start', fontSize: '0.72rem', fontWeight: 'bold', padding: '3px 8px', borderRadius: '6px', background: getItemColors(selectedEvent).bg, color: getItemColors(selectedEvent).text }}>
                  {getItemColors(selectedEvent).badge}
                </span>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '1.25rem', 
                  fontWeight: '900', 
                  color: getItemColors(selectedEvent).text,
                  lineHeight: '1.4'
                }}>
                  {selectedEvent.id.startsWith('EVENT-') 
                    ? selectedEvent.name 
                    : `${selectedEvent.id}. ${selectedEvent.name} / ${selectedEvent.model || '未設車型'}`}
                </h2>
              </div>

              {/* Date Spans */}
              <div style={{ background: '#f8fafc', padding: '16px', borderRadius: '12px', border: '1px solid #f1f5f9', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                
                <div style={{ display: 'flex', gap: '10px' }}>
                  <Clock size={16} color="var(--primary)" style={{ marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold' }}>留車進場日期</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b' }}>
                      {selectedEvent.expectedStartDate} {selectedEvent.constructionTime || ''}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '10px' }}>
                  <CheckCircle size={16} color="#ef4444" style={{ marginTop: '2px' }} />
                  <div>
                    <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold' }}>預計交車日期</div>
                    <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#1e293b' }}>
                      {selectedEvent.expectedEndDate || '未定'} {selectedEvent.expectedDeliveryTime || ''}
                    </div>
                  </div>
                </div>

                {/* Construction Dates Display */}
                {!selectedEvent.id.startsWith('EVENT-') && (selectedEvent.constructionStartDate || selectedEvent.constructionEndDate) && (
                  <div style={{ display: 'flex', gap: '10px', borderTop: '1px dashed #cbd5e1', paddingTop: '10px', marginTop: '4px' }}>
                    <Briefcase size={16} color="#10b981" style={{ marginTop: '2px' }} />
                    <div>
                      <div style={{ fontSize: '0.7rem', color: '#94a3b8', fontWeight: 'bold' }}>🛠️ 正式施工時間</div>
                      <div style={{ fontSize: '0.82rem', fontWeight: 'bold', color: '#065f46' }}>
                        {selectedEvent.constructionStartDate || '—'} 至 {selectedEvent.constructionEndDate || '—'}
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Customer Specific Information */}
              {!selectedEvent.id.startsWith('EVENT-') ? (
                <>
                  {/* Contact Info */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <User size={16} color="#64748b" />
                      <span style={{ fontSize: '0.85rem', color: '#475569' }}>{selectedEvent.phone || '無電話資料'}</span>
                      {selectedEvent.phone && (
                        <a href={`tel:${selectedEvent.phone}`} style={{ fontSize: '0.7rem', textDecoration: 'none', background: 'var(--primary-soft)', color: 'var(--primary)', padding: '2px 6px', borderRadius: '4px', fontWeight: 'bold' }}>撥打</a>
                      )}
                    </div>
                    {selectedEvent.plateNumber && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <Car size={16} color="#64748b" />
                        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', background: '#f1f5f9', padding: '2px 8px', borderRadius: '4px' }}>
                          {selectedEvent.plateNumber}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Detailing Details */}
                  <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8' }}>施工細項</div>
                    <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                      <strong>品牌：</strong>{selectedEvent.mainServiceBrand || '無'}
                    </div>
                    {selectedEvent.filmColor && (
                      <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                        <strong>膜料顏色：</strong>
                        <span style={{ color: '#e11d48', fontWeight: 'bold' }}>{selectedEvent.filmColor}</span>
                      </div>
                    )}
                    {selectedEvent.windowTint && (
                      <div style={{ fontSize: '0.85rem', color: '#334155' }}>
                        <strong>隔熱紙：</strong>{selectedEvent.windowTint}
                      </div>
                    )}
                  </div>

                  {/* Custom Accessories */}
                  {selectedEvent.customAccessories && selectedEvent.customAccessories.length > 0 && (
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8' }}>加購配件</div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {selectedEvent.customAccessories.map((acc, index) => (
                          <div key={index} style={{ fontSize: '0.8rem', color: '#475569', padding: '4px 8px', background: '#f8fafc', borderRadius: '4px', border: '1px solid #f1f5f9' }}>
                            {acc.name} (${acc.price})
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Notes */}
                  {selectedEvent.notes && (
                    <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '16px' }}>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', marginBottom: '6px' }}>施工備註</div>
                      <div style={{ fontSize: '0.8rem', color: '#475569', whiteSpace: 'pre-wrap', background: '#fffbeb', border: '1px solid #fef3c7', padding: '10px', borderRadius: '8px' }}>
                        {selectedEvent.notes}
                      </div>
                    </div>
                  )}
                </>
              ) : (
                /* Custom Shop Notes / Off day */
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
                  {selectedEvent.constructionTime && (
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', marginBottom: '4px' }}>留車時間</div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#0369a1' }}>
                        {selectedEvent.constructionTime}
                      </div>
                    </div>
                  )}
                  {selectedEvent.notes && (
                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#94a3b8', marginBottom: '4px' }}>局部施工說明</div>
                      <div style={{ fontSize: '0.85rem', color: '#475569', whiteSpace: 'pre-wrap', background: '#f8fafc', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}>
                        {selectedEvent.notes}
                      </div>
                    </div>
                  )}
                  <button 
                    onClick={() => handleDeleteEvent(selectedEvent.id)}
                    className="btn btn-outline" 
                    style={{ color: '#ef4444', borderColor: '#fca5a5', width: '100%', fontSize: '0.8rem', padding: '8px' }}
                  >
                    <Trash2 size={14} /> 刪除此項目
                  </button>
                </div>
              )}

            </div>

            {/* Quick Actions Drawer Footer */}
            {!selectedEvent.id.startsWith('EVENT-') && (
              <div style={{ padding: '20px', borderTop: '1px solid #e2e8f0', display: 'flex', gap: '10px' }}>
                <button 
                  onClick={() => onEditCustomer(selectedEvent)}
                  className="btn btn-primary" 
                  style={{ flex: 1, fontSize: '0.85rem', padding: '10px' }}
                >
                  <Edit size={14} /> 編輯檔案
                </button>
              </div>
            )}

          </div>
        ) : (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: '#94a3b8', padding: '20px', textAlign: 'center' }}>
            <CalendarIcon size={40} style={{ marginBottom: '12px', opacity: 0.6 }} />
            <p style={{ margin: 0, fontSize: '0.9rem', fontWeight: 'bold' }}>請點擊排程項目</p>
            <p style={{ margin: '4px 0 0 0', fontSize: '0.75rem' }}>可於右側查看車輛詳細細節、顏色與加購配件項目</p>
          </div>
        )}
      </div>

      {/* --- ADD CUSTOM EVENT MODAL --- */}
      {isEventModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(15,23,42,0.4)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: '#fff', width: '400px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', overflow: 'hidden' }}>
            <div style={{ padding: '16px 20px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>新增局部施工</h3>
              <button onClick={() => setIsEventModalOpen(false)} style={{ border: 'none', background: 'transparent', color: '#64748b', cursor: 'pointer' }}>
                <X size={18} />
              </button>
            </div>
            
            <form onSubmit={handleSaveCustomEvent} style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>車型 / 項目名稱*</label>
                <input 
                  type="text" 
                  required 
                  placeholder="例如: 特斯拉 Model Y 引擎蓋貼膜" 
                  value={eventForm.title} 
                  onChange={(e) => setEventForm(prev => ({ ...prev, title: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>施工日期*</label>
                  <input 
                    type="date" 
                    required 
                    value={eventForm.startDate} 
                    onChange={(e) => setEventForm(prev => ({ ...prev, startDate: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                </div>
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>留車時間 (幾點留車)</label>
                  <input 
                    type="text" 
                    placeholder="例如: 14:00" 
                    value={eventForm.constructionTime} 
                    onChange={(e) => setEventForm(prev => ({ ...prev, constructionTime: e.target.value }))}
                    style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px' }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <label style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#64748b' }}>詳細備註</label>
                <textarea 
                  rows={3} 
                  placeholder="請填寫局部施工細節..." 
                  value={eventForm.notes} 
                  onChange={(e) => setEventForm(prev => ({ ...prev, notes: e.target.value }))}
                  style={{ width: '100%', padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontFamily: 'inherit', resize: 'none' }}
                />
              </div>

              <div style={{ display: 'flex', gap: '10px', marginTop: '10px', justifyContent: 'flex-end' }}>
                <button type="button" onClick={() => setIsEventModalOpen(false)} className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>取消</button>
                <button type="submit" className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>保存</button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};
