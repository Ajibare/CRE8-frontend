// databaseNode.js
// A node for database operations

import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const DatabaseNode = ({ id, data }) => {
  const [operation, setOperation] = useState(data?.operation || 'query');
  const [tableName, setTableName] = useState(data?.tableName || '');

  const handles = [
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-query`
    },
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-result`
    }
  ];

  return (
    <BaseNode 
      id={id} 
      data={data} 
      title="Database"
      handles={handles}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '12px', color: '#4b5563' }}>Operation:</span>
          <select 
            value={operation} 
            onChange={(e) => setOperation(e.target.value)}
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px' }}
          >
            <option value="query">Query</option>
            <option value="insert">Insert</option>
            <option value="update">Update</option>
            <option value="delete">Delete</option>
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '12px', color: '#4b5563' }}>Table Name:</span>
          <input 
            type="text" 
            value={tableName} 
            onChange={(e) => setTableName(e.target.value)}
            placeholder="table_name"
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px' }}
          />
        </label>
      </div>
    </BaseNode>
  );
}
