import React from 'react';

export default function PlaceholderComponent({title}){
  return (
    <div style={{padding:20}}>
      <h3>{title || 'Removed Feature'}</h3>
      <p>This feature was removed for the presentation. Placeholder to avoid UI errors.</p>
    </div>
  );
}
