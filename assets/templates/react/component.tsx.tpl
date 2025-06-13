// templates/react/component.tsx.tpl

import React from 'react';
import './{{componentName}}.css';

interface {{componentName}}Props {
  // TODO: Add component props here
  children?: React.ReactNode;
}

/**
 * {{componentName}} Component
 * * @description A brief description of what this component does.
 */
const {{componentName}}: React.FC<{{componentName}}Props> = ({ children }) => {
  return (
    <div className="{{cssClassName}}">
      <h1>{{componentName}}</h1>
      {children}
    </div>
  );
};

export default {{componentName}};