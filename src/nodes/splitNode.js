// splitNode.js
// A node for splitting data into multiple outputs

import { useState } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const SplitNode = ({ id, data }) => {
  const [splitBy, setSplitBy] = useState(data?.splitBy || ',');

  const handles = [
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-input`
    },
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-output1`,
      style: { top: '30%' }
    },
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-output2`,
      style: { top: '70%' }
    }
  ];

  return (
    <BaseNode 
      id={id} 
      data={data} 
      title="Split"
      handles={handles}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <label style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '12px', color: '#4b5563' }}>Split By:</span>
          <input 
            type="text" 
            value={splitBy} 
            onChange={(e) => setSplitBy(e.target.value)}
            placeholder="Delimiter..."
            style={{ padding: '4px 8px', borderRadius: '4px', border: '1px solid #d1d5db', fontSize: '14px' }}
          />
        </label>
      </div>
    </BaseNode>
  );
}
