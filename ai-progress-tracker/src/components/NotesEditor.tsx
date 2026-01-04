'use client';

import React, { useState, useRef } from 'react';
import { Image as ImageIcon, Link, FileText, X, Upload, ExternalLink } from 'lucide-react';
import { Button } from './ui/Button';
import { Input } from './ui/Input';
import { Modal } from './ui/Modal';
import { Attachment } from '@/types';

interface NotesEditorProps {
  notes: string;
  attachments: Attachment[];
  onNotesChange: (notes: string) => void;
  onUploadFile: (file: File) => void;
  onAddLink: (url: string, name: string) => void;
  onRemoveAttachment: (id: string) => void;
}

export function NotesEditor({
  notes,
  attachments,
  onNotesChange,
  onUploadFile,
  onAddLink,
  onRemoveAttachment,
}: NotesEditorProps) {
  const [showLinkModal, setShowLinkModal] = useState(false);
  const [linkUrl, setLinkUrl] = useState('');
  const [linkName, setLinkName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onUploadFile(file);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleAddLink = () => {
    if (linkUrl) {
      onAddLink(linkUrl, linkName || linkUrl);
      setLinkUrl('');
      setLinkName('');
      setShowLinkModal(false);
    }
  };

  const getAttachmentIcon = (type: Attachment['type']) => {
    switch (type) {
      case 'image':
        return <ImageIcon className="w-4 h-4" />;
      case 'link':
        return <ExternalLink className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
          Notes
        </label>
        <textarea
          value={notes}
          onChange={(e) => onNotesChange(e.target.value)}
          placeholder="Write your notes here... What did you learn? What challenges did you face?"
          className="w-full h-40 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-y transition-colors"
        />
      </div>

      <div className="flex flex-wrap gap-2">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileSelect}
          className="hidden"
          accept="image/*,.pdf,.doc,.docx,.txt,.md"
        />
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="w-4 h-4 mr-1" />
          Upload File
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => setShowLinkModal(true)}
        >
          <Link className="w-4 h-4 mr-1" />
          Add Link
        </Button>
      </div>

      {attachments.length > 0 && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Attachments ({attachments.length})
          </label>
          <div className="flex flex-wrap gap-2">
            {attachments.map((attachment) => (
              <div
                key={attachment.id}
                className="flex items-center gap-2 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-lg"
              >
                {attachment.type === 'image' && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={attachment.url}
                    alt={attachment.name}
                    className="w-8 h-8 object-cover rounded"
                  />
                )}
                {attachment.type !== 'image' && getAttachmentIcon(attachment.type)}
                
                {attachment.type === 'link' ? (
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-blue-600 dark:text-blue-400 hover:underline max-w-[150px] truncate"
                  >
                    {attachment.name}
                  </a>
                ) : (
                  <a
                    href={attachment.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm text-gray-700 dark:text-gray-300 hover:underline max-w-[150px] truncate"
                  >
                    {attachment.name}
                  </a>
                )}
                
                <button
                  onClick={() => onRemoveAttachment(attachment.id)}
                  className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded transition-colors"
                >
                  <X className="w-3 h-3 text-gray-500" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <Modal
        isOpen={showLinkModal}
        onClose={() => setShowLinkModal(false)}
        title="Add Link"
        size="sm"
      >
        <div className="space-y-4">
          <Input
            label="URL"
            type="url"
            value={linkUrl}
            onChange={(e) => setLinkUrl(e.target.value)}
            placeholder="https://..."
          />
          <Input
            label="Name (optional)"
            value={linkName}
            onChange={(e) => setLinkName(e.target.value)}
            placeholder="Link description"
          />
          <div className="flex justify-end gap-2">
            <Button variant="secondary" onClick={() => setShowLinkModal(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddLink}>Add Link</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
