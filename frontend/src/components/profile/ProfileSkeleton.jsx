import React from 'react';

const ProfileSkeleton = () => {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8 animate-pulse">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-3">
            {/* Sidebar Skeleton */}
            <div className="p-6 md:border-r border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex flex-col items-center">
              <div className="w-32 h-32 rounded-full bg-gray-200 dark:bg-gray-700 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-6"></div>
              
              <div className="w-full space-y-3">
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-full"></div>
              </div>
            </div>

            {/* Main Content Skeleton */}
            <div className="p-8 md:col-span-2 space-y-6">
              <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100 dark:border-gray-700">
                <div>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-2"></div>
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-64"></div>
                </div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded-lg w-32"></div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="bg-gray-50 dark:bg-gray-800/50 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-24 mb-3"></div>
                    <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                  </div>
                ))}
              </div>

              <div className="mt-8">
                <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-48 mb-4"></div>
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 dark:bg-gray-700 rounded-lg mr-4"></div>
                        <div>
                          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-32 mb-2"></div>
                          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-48"></div>
                        </div>
                      </div>
                      <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded-full w-16"></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileSkeleton;
