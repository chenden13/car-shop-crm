import React from 'react';
import type { Customer } from '../types';
import { Car, User, Calendar, CheckSquare } from 'lucide-react';

interface CustomerCardProps {
  customer: Customer;
  onClick: (customer: Customer) => void;
}

export const CustomerCard: React.FC<CustomerCardProps> = ({ customer, onClick }) => {
  return (
    <div className="customer-card glass-panel" onClick={() => onClick(customer)}>
      <div className="card-header">
        <span className="car-plate">{customer.plateNumber}</span>
        <span className="customer-name">{customer.name}</span>
      </div>
      
      <div className="card-details">
        <div className="detail-row">
          <Car size={14} />
          <span>{customer.brand || '未填'} - {customer.model || '未填'}</span>
        </div>
        
        {customer.status === 'new' && (
          <div className="detail-row">
            <User size={14} />
            <span>特徵: {customer.wealthLevel === 'high' ? '高預算' : '一般預算'} | {customer.detailOriented ? '在意細節' : '隨和'}</span>
          </div>
        )}
        
        {customer.status === 'deposit' && (
          <div className="detail-row">
            <Calendar size={14} />
            <span>預計: {customer.expectedStartDate || '未定'}</span>
          </div>
        )}
        
        {customer.status === 'construction' && (
          <div className="detail-row">
            <CheckSquare size={14} />
            <span>進度: {customer.constructionChecklist?.filter(c => c.checked).length || 0} / {customer.constructionChecklist?.length || 0}</span>
          </div>
        )}
      </div>

      <div className="tag-container">
        {customer.mainService && <span className="tag highlight">{customer.mainService}</span>}
        {customer.status === 'completed' && <span className="tag">交車日期: {customer.deliveryDate}</span>}
      </div>
    </div>
  );
};
