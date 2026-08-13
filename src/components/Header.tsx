import React from 'react';
import { 
  ShieldAlert, 
  Search, 
  PlusCircle, 
  UserCheck, 
  BookOpen, 
  CheckSquare, 
  FileText, 
  Shield, 
  BarChart3,
  Building2
} from 'lucide-react';

interface HeaderProps {
  activeTab: 'dashboard' | 'directory' | 'simulator' | 'catalog' | 'approvals' | 'audit';
  setActiveTab: (tab: 'dashboard' | 'directory' | 'simulator' | 'catalog' | 'approvals' | 'audit') => void;
  onOpenNewModal: () => void;
  pendingApprovalsCount: number;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenNewModal,
  pendingApprovalsCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 text-slate-900 sticky top-0 z-40 shadow-xs">
      {/* Top enterprise bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="bg-blue-700 text-white p-2.5 rounded-xl shadow-xs flex items-center justify-center">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                Control Corporativo de Elegibilidad
              </h1>
              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                Motor v2.4 Activo
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Registro Centralizado de Inhabilitación y Restricciones Comerciales
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setActiveTab('simulator')}
            className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl border border-slate-200 transition cursor-pointer"
          >
            <Search className="w-4 h-4 text-blue-700" />
            <span>Consultar Elegibilidad</span>
          </button>

          <button
            onClick={onOpenNewModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-xs transition transform active:scale-95 cursor-pointer"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Nueva Restricción</span>
          </button>

          <div className="hidden lg:flex items-center pl-3 border-l border-slate-200 space-x-2 text-xs text-slate-500">
            <div className="w-8 h-8 rounded-full bg-blue-50 border border-blue-200 flex items-center justify-center font-bold text-blue-700">
              CR
            </div>
            <div>
              <div className="font-semibold text-slate-800">Comité de Riesgo</div>
              <div className="text-[10px] text-slate-400">Riesgos & Cumplimiento</div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Sub-bar */}
      <div className="bg-slate-50/80 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center space-x-1 overflow-x-auto py-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'dashboard'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className={`w-4 h-4 ${activeTab === 'dashboard' ? 'text-blue-700' : 'text-slate-500'}`} />
            <span>Panel General</span>
          </button>

          <button
            onClick={() => setActiveTab('directory')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'directory'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <Shield className={`w-4 h-4 ${activeTab === 'directory' ? 'text-blue-700' : 'text-slate-500'}`} />
            <span>Registro de Restricciones</span>
          </button>

          <button
            onClick={() => setActiveTab('simulator')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'simulator'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <UserCheck className={`w-4 h-4 ${activeTab === 'simulator' ? 'text-blue-700' : 'text-slate-500'}`} />
            <span>Motor de Elegibilidad</span>
          </button>

          <button
            onClick={() => setActiveTab('catalog')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'catalog'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <BookOpen className={`w-4 h-4 ${activeTab === 'catalog' ? 'text-blue-700' : 'text-slate-500'}`} />
            <span>Catálogo de Motivos</span>
          </button>

          <button
            onClick={() => setActiveTab('approvals')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg transition whitespace-nowrap relative cursor-pointer ${
              activeTab === 'approvals'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <CheckSquare className={`w-4 h-4 ${activeTab === 'approvals' ? 'text-blue-700' : 'text-slate-500'}`} />
            <span>Aprobaciones Especiales</span>
            {pendingApprovalsCount > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-[10px] font-bold bg-blue-700 text-white rounded-full">
                {pendingApprovalsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('audit')}
            className={`flex items-center space-x-2 px-3.5 py-2 text-xs font-medium rounded-lg transition whitespace-nowrap cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-white text-blue-700 shadow-xs border border-slate-200 font-bold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
            }`}
          >
            <FileText className={`w-4 h-4 ${activeTab === 'audit' ? 'text-blue-700' : 'text-slate-500'}`} />
            <span>Auditoría de Consultas</span>
          </button>
        </div>
      </div>
    </header>
  );
};
