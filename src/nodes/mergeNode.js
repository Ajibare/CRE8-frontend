// mergeNode.js
// A node for merging multiple inputs

import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const MergeNode = ({ id, data }) => {
  const handles = [
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-input1`,
      style: { top: '25%' }
    },
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-input2`,
      style: { top: '50%' }
    },
    {
      type: 'target',
      position: Position.Left,
      id: `${id}-input3`,
      style: { top: '75%' }
    },
    {
      type: 'source',
      position: Position.Right,
      id: `${id}-output`
    }
  ];

  return (
    <BaseNode 
      id={id} 
      data={data} 
      title="Merge"
      handles={handles}
    >
      <div style={{ fontSize: '12px', color: '#4b5563' }}>
        Merges 3 inputs into 1 output
      </div>
    </BaseNode>
  );
}
