import React from 'react';

const TestPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">Test Page</h1>
        <p className="text-gray-300">Routing is working correctly!</p>
      </div>
    </div>
  );
};

export default TestPage;