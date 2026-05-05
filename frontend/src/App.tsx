import { useState, useEffect } from 'react';
import { DynamicForm } from './components/DynamicForm';
import { DynamicTable } from './components/DynamicTable';
import { ConfigEditor } from './components/ConfigEditor';
import { Auth } from './components/Auth';
import { DynamicErrorBoundary } from './components/DynamicErrorBoundary';
import type { AppConfig, Entity } from './shared/schema';
import { dynamicApi, configApi, featureApi } from './services/api';
import { Layout, Database, FileJson, Bell, Upload, Code, Globe, CheckCircle, LogOut } from 'lucide-react';

const SAMPLE_CONFIG: AppConfig = {
  appName: "AgriYield Manager",
  theme: { primaryColor: "#10b981", darkMode: false },
  entities: [
    {
      name: "Crop",
      label: "Crops",
      fields: [
        { name: "name", label: "Crop Name", type: "text", required: true, placeholder: "e.g. Wheat" },
        { name: "variety", label: "Variety", type: "text", required: false },
        { name: "type", label: "Type", type: "select", required: false, options: ["Cereal", "Pulse", "Oilseed", "Vegetable"] },
        { name: "plantingDate", label: "Planting Date", type: "date", required: false },
      ],
      features: { csvImport: true, notifications: true }
    },
    {
      name: "Farmer",
      label: "Farmers",
      fields: [
        { name: "name", label: "Full Name", type: "text", required: true },
        { name: "email", label: "Email Address", type: "email", required: false },
        { name: "verified", label: "Is Verified", type: "boolean", required: false },
      ],
      features: { csvImport: false, notifications: false }
    }
  ],
  i18n: {
    en: { "submit": "Submit Data", "import": "Import CSV", "export": "Export to GitHub", "logout": "Sign Out" },
    es: { "submit": "Enviar Datos", "import": "Importar CSV", "export": "Exportar a GitHub", "logout": "Cerrar Sesión" }
  }
};

function App() {
  const [user, setUser] = useState<any>(null);
  const [config, setConfig] = useState<AppConfig>(SAMPLE_CONFIG);
  const [selectedEntity, setSelectedEntity] = useState<Entity>(SAMPLE_CONFIG.entities[0]);
  const [data, setData] = useState<any[]>([]);
  const [view, setView] = useState<'table' | 'form' | 'config'>('table');
  const [lang, setLang] = useState('en');
  const [notification, setNotification] = useState<{title: string, msg: string} | null>(null);
  const [loading, setLoading] = useState(false);

  // Dynamic Theme Effect
  useEffect(() => {
    document.documentElement.style.setProperty('--primary-color', config.theme.primaryColor);
    if (config.theme.darkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [config.theme]);

  // Translation Helper
  const t = (key: string) => {
    const translations = config.i18n as Record<string, Record<string, string>> | undefined;
    return translations?.[lang]?.[key] || key;
  };

  useEffect(() => {
    if (user) {
      const initApp = async () => {
        try {
          await configApi.saveConfig(config);
          await fetchData();
        } catch (err) {
          console.error("Initialization failed", err);
        }
      };
      initApp();
    }
  }, [user]);

  useEffect(() => {
    if (user && view === 'table') {
      fetchData();
    }
  }, [selectedEntity, view, config]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await dynamicApi.getAll(selectedEntity.name);
      setData(response.data);
    } catch (err) {
      console.error("Fetch failed", err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData: any, token: string) => {
    localStorage.setItem('token', token);
    setUser(userData);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const handleCreate = async (newItem: any) => {
    try {
      await dynamicApi.create(selectedEntity.name, newItem);
      showNotification("Record Created", `New ${selectedEntity.name} has been added.`);
      setView('table');
    } catch (err) {
      showNotification("Error", "Failed to create record.");
    }
  };

  const handleConfigSave = async (newConfig: AppConfig) => {
    try {
      await configApi.saveConfig(newConfig);
      setConfig(newConfig);
      setSelectedEntity(newConfig.entities[0]);
      setView('table');
      showNotification("Config Updated", "Application structure has been refreshed.");
    } catch (err) {
      showNotification("Config Error", "Invalid configuration schema.");
    }
  };

  const handleCsvImport = async () => {
    const mockCsv = "name,variety,type\nCorn,Sweet,Cereal\nSoybean,Roundup,Oilseed";
    try {
      await featureApi.importCsv({ 
        csvContent: mockCsv, 
        entityName: selectedEntity.name,
        configId: 'current' 
      });
      await fetchData();
      showNotification("CSV Imported", "Successfully imported records from CSV.");
    } catch (err) {
      showNotification("Import Failed", "Could not process CSV.");
    }
  };

  const handleGithubExport = async () => {
    showNotification("Exporting...", "Generating project structure and pushing to GitHub.");
    try {
      await featureApi.exportGithub({ repoName: config.appName, config });
      showNotification("Export Successful", "Your project is now available on GitHub!");
    } catch (err) {
      showNotification("Export Failed", "Check your GitHub token configuration.");
    }
  };

  const showNotification = (title: string, msg: string) => {
    setNotification({ title, msg });
    setTimeout(() => setNotification(null), 5000);
  };

  if (!user) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans text-slate-900 dark:text-slate-100 transition-colors duration-300">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-6 right-6 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 border-l-4 border-[var(--primary-color)] shadow-2xl rounded-lg p-4 flex items-start gap-4 min-w-[300px]">
            <CheckCircle className="text-[var(--primary-color)] mt-1" size={20} />
            <div>
              <p className="font-bold text-gray-900 dark:text-white">{notification.title}</p>
              <p className="text-sm text-gray-600 dark:text-gray-400">{notification.msg}</p>
            </div>
          </div>
        </div>
      )}

      {/* Sidebar */}
      <aside className="w-72 bg-white dark:bg-slate-900 border-r dark:border-slate-800 flex flex-col shadow-sm">
        <div className="p-6 border-b dark:border-slate-800 flex items-center gap-3">
          <div className="p-2 bg-[var(--primary-color)] rounded-lg text-white shadow-lg shadow-[var(--primary-color)]/20">
            <Layout size={24} />
          </div>
          <h1 className="font-bold text-xl tracking-tight text-gray-800 dark:text-white">{config.appName}</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 px-2">Entities</p>
          {config.entities.map(entity => (
            <button
              key={entity.name}
              onClick={() => {
                setSelectedEntity(entity);
                setView('table');
              }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                selectedEntity.name === entity.name && view !== 'config'
                ? 'bg-[var(--primary-color)]/10 text-[var(--primary-color)] font-semibold' 
                : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800 hover:text-gray-800 dark:hover:text-white'
              }`}
            >
              <Database size={18} />
              {entity.label}
            </button>
          ))}

          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mt-8 mb-3 px-2">Management</p>
          <button 
            onClick={() => setView('config')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
              view === 'config' 
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 font-semibold' 
              : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-slate-800'
            }`}
          >
            <FileJson size={18} />
            Editor Config
          </button>
          <div className="px-4 py-3 flex items-center gap-3 text-gray-500">
            <Globe size={18} />
            <select 
              value={lang} 
              onChange={(e) => setLang(e.target.value)}
              className="bg-transparent text-sm focus:outline-none cursor-pointer"
            >
              <option value="en">English</option>
              <option value="es">Español</option>
            </select>
          </div>
        </nav>

        <div className="p-4 border-t dark:border-slate-800 bg-gray-50/50 dark:bg-slate-900/50">
          <div className="flex items-center justify-between px-2">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-[var(--primary-color)] flex items-center justify-center text-white text-xs font-bold shadow-sm">
                {user.name?.substring(0, 2).toUpperCase() || 'US'}
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700 dark:text-gray-200">{user.name || 'User'}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">Admin</p>
              </div>
            </div>
            <button 
              onClick={handleLogout}
              className="p-2 text-gray-400 hover:text-red-500 transition-colors"
              title={t('logout')}
            >
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 bg-white dark:bg-slate-900 border-b dark:border-slate-800 flex items-center justify-between px-8 shadow-sm z-10">
          <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400 text-sm">
            <span>Dashboard</span>
            <span>/</span>
            <span className="font-medium text-gray-900 dark:text-white">{view === 'config' ? 'Config Editor' : selectedEntity.label}</span>
          </div>
          <div className="flex items-center gap-4">
            <button className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-slate-900"></span>
            </button>
            <button 
              onClick={handleGithubExport}
              className="flex items-center gap-2 bg-slate-900 dark:bg-white text-white dark:text-slate-900 px-4 py-2 rounded-lg text-sm font-bold transition-all shadow-md active:scale-95"
            >
              <Code size={18} />
              {t('export')}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8 space-y-6 flex-1 overflow-y-auto">
          {view !== 'config' ? (
            <>
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">{selectedEntity.label} Management</h2>
                  <p className="text-gray-500 dark:text-gray-400 mt-1">Manage and view your dynamic {selectedEntity.name.toLowerCase()} records.</p>
                </div>
                <div className="flex gap-3">
                  {selectedEntity.features.csvImport && (
                    <button 
                      onClick={handleCsvImport}
                      className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 px-4 py-2 rounded-lg text-sm font-semibold transition-all shadow-sm"
                    >
                      <Upload size={18} />
                      {t('import')}
                    </button>
                  )}
                  {view === 'table' ? (
                    <button 
                      onClick={() => setView('form')}
                      className="bg-[var(--primary-color)] hover:brightness-110 text-white px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-lg active:scale-95"
                    >
                      + Add {selectedEntity.name}
                    </button>
                  ) : (
                    <button 
                      onClick={() => setView('table')}
                      className="bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700 px-6 py-2 rounded-lg text-sm font-bold transition-all shadow-sm"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>

              <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-xl border border-gray-100 dark:border-slate-800 p-1 min-h-[400px]">
                <DynamicErrorBoundary>
                  {view === 'table' ? (
                    <DynamicTable entity={selectedEntity} data={data} isLoading={loading} />
                  ) : (
                    <div className="p-8 max-w-4xl mx-auto">
                      <DynamicForm entity={selectedEntity} onSubmit={handleCreate} />
                    </div>
                  )}
                </DynamicErrorBoundary>
              </div>
            </>
          ) : (
            <div className="h-full flex flex-col gap-6">
              <div>
                <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">Application Configuration</h2>
                <p className="text-gray-500 dark:text-gray-400 mt-1 text-lg">Edit the underlying JSON to dynamically update the UI, theme, and API behavior.</p>
              </div>
              <div className="flex-1 min-h-[500px]">
                <DynamicErrorBoundary>
                  <ConfigEditor config={config} onSave={handleConfigSave} />
                </DynamicErrorBoundary>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default App;
