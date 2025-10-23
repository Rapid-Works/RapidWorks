import React from 'react';

const FilePreview = ({ file }) => {
  if (!file) return null;

  if (file.type.startsWith('image/')) {
    return (
      <div className="mt-2">
        <img
          src={URL.createObjectURL(file)}
          alt="Preview"
          className="max-h-32 rounded-lg"
        />
      </div>
    );
  }

  return (
    <div className="mt-2 flex items-center text-sm text-gray-500">
      <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
        <path d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" />
      </svg>
      {file.name}
    </div>
  );
};

export default FilePreview; 