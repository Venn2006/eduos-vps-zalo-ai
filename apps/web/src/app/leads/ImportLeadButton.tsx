"use client";

import React, { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { toast } from "sonner";

export function ImportLeadButton() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    toast.info('Đang nhập dữ liệu...');

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/import/leads', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (res.ok) {
        toast.success(`Nhập thành công ${data.count}/${data.total} bản ghi!`);
        window.location.reload();
      } else {
        toast.error(data.error || 'Lỗi nhập dữ liệu');
      }
    } catch (err) {
      toast.error('Lỗi kết nối khi nhập file');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <input
        type="file"
        accept=".csv"
        ref={fileInputRef}
        onChange={handleFileUpload}
        className="hidden"
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isUploading}
        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-lg text-sm flex items-center gap-2 transition-colors disabled:opacity-50 shadow-sm"
      >
        <Upload className="w-4 h-4" />
        {isUploading ? 'Đang nhập...' : 'Nhập dữ liệu'}
      </button>
    </>
  );
}
