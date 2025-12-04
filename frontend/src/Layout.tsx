import React from "react";

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="min-h-screen bg-black text-gray-100 flex flex-col items-center">
      {children}
    </div>
  );
};

export default Layout;
