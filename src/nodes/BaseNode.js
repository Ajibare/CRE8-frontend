// BaseNode.js
// Base abstraction for all node types

import { Handle, Position } from 'reactflow';

export const BaseNode = ({ 
  id, 
  data, 
  title, 
  children, 
  handles = [],
  style = {},
  className = ''
}) => {
  const defaultStyle = {
    ...style
  };

  return (
    <div 
      style={{
        ...defaultStyle,
        width: '200px',
        minHeight: '80px',
        border: '1px solid #e5e7eb',
        borderRadius: '8px',
        padding: '12px',
        backgroundColor: '#fff',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        transition: 'box-shadow 0.2s'
      }}
      className={className}
      onMouseEnter={(e) => {
        e.target.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.1)';
      }}
      onMouseLeave={(e) => {
        e.target.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1)';
      }}
    >
      {/* Render handles */}
      {handles.map((handle, index) => (
        <Handle
          key={index}
          type={handle.type}
          position={handle.position}
          id={handle.id || `${id}-${handle.type}-${index}`}
          style={{
            ...handle.style,
            width: '12px',
            height: '12px',
            background: '#9ca3af',
            border: '2px solid white'
          }}
        />
      ))}
      
      {/* Node title */}
      {title && (
        <div style={{ 
          fontWeight: 'bold', 
          fontSize: '14px', 
          color: '#1f2937',
          marginBottom: '8px'
        }}>
          {title}
        </div>
      )}
      
      {/* Node content */}
      <div>
        {children}
      </div>
    </div>
  );
};
