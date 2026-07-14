import React from 'react';
import { useRouter } from 'next/navigation';
import { ChevronRight, ArrowLeft, Save, Trash2, Loader2, X } from 'lucide-react';

interface Breadcrumb {
  label: string;
  href?: string;
}

interface EntityEditorPageProps {
  title: string;
  breadcrumbs: Breadcrumb[];
  onSave: () => void;
  onCancel?: () => void;
  onDelete?: () => void;
  isSaving?: boolean;
  isLoading?: boolean;
  isNew?: boolean;
  children: React.ReactNode;
}

export function EntityEditorPage({
  title,
  breadcrumbs,
  onSave,
  onCancel,
  onDelete,
  isSaving = false,
  isLoading = false,
  isNew = false,
  children
}: EntityEditorPageProps) {
  const router = useRouter();

  const handleCancel = () => {
    if (onCancel) onCancel();
    else router.back();
  };

  return (
    <div className="flex h-full flex-col bg-slate-50 overflow-y-auto custom-scrollbar">
      
      {/* HEADER & BREADCRUMBS */}
      <div className="flex items-center px-6 py-4 bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm justify-between">
        <div className="flex items-center gap-4">
          <button onClick={handleCancel} className="text-slate-400 hover:text-[#00B5B5] transition">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center text-sm text-slate-500 gap-2 flex-wrap">
            <span className="cursor-pointer hover:text-[#00B5B5]" onClick={() => router.push('/dashboard')}>Kokpit</span> 
            {breadcrumbs.map((crumb, idx) => (
              <React.Fragment key={idx}>
                <ChevronRight size={14} className="shrink-0" />
                {crumb.href ? (
                  <span className="cursor-pointer hover:text-[#00B5B5] shrink-0" onClick={() => router.push(crumb.href!)}>{crumb.label}</span>
                ) : (
                  <span className="font-bold text-[#00B5B5] border-b-2 border-[#00B5B5] pb-0.5 shrink-0">{crumb.label}</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>

        {/* TOP ACTIONS (Optional quick actions) */}
        <div className="flex items-center gap-2">
          {!isNew && onDelete && (
             <button onClick={onDelete} className="p-2 text-slate-400 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-lg transition" title="Usuń trwale">
               <Trash2 size={18} />
             </button>
          )}
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      <div className="p-6 max-w-5xl mx-auto w-full flex-1">
        
        <div className="mb-6 flex justify-between items-end">
          <h1 className="text-2xl font-black text-slate-800 tracking-tight">{title}</h1>
        </div>

        {isLoading ? (
          <div className="flex justify-center p-12 text-[#00B5B5]">
            <Loader2 className="animate-spin w-8 h-8" />
          </div>
        ) : (
          <div className="bg-white border border-slate-200 rounded-2xl shadow-sm p-6 space-y-6">
            {children}
          </div>
        )}

      </div>

      {/* BOTTOM ACTION BAR */}
      {!isLoading && (
        <div className="sticky bottom-0 bg-white border-t border-slate-200 p-4 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)] z-10">
          <div className="max-w-5xl mx-auto w-full flex justify-end gap-3">
            <button 
              onClick={handleCancel}
              className="px-6 py-2.5 rounded-lg text-sm font-bold text-slate-600 border border-slate-300 hover:bg-slate-50 transition"
            >
              Anuluj
            </button>
            <button 
              onClick={onSave}
              disabled={isSaving}
              className="flex items-center gap-2 px-8 py-2.5 rounded-lg text-sm font-bold text-white bg-[#00B5B5] hover:bg-teal-400 transition shadow-md disabled:opacity-50"
            >
              {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
              {isNew ? 'Utwórz' : 'Zapisz zmiany'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}