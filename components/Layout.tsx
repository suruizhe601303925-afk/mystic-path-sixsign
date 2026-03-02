import React from 'react';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-stone-50 to-amber-50 flex flex-col">
      <div className="flex-1 flex flex-col max-w-md mx-auto w-full min-h-screen">
        {children}
      </div>
    </div>
  );
};

export default Layout;
