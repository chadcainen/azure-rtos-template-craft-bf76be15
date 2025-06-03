
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Cog, 
  Zap, 
  Atom, 
  Package, 
  Settings, 
  FileText,
  Home,
  Cpu,
  Menu,
  X
} from 'lucide-react';
import { STM32_COLORS, STM32_GRADIENTS } from '@/styles/stm32-theme';
import GenerateMXTab from './tabs/GenerateMXTab';
import GeneratePackTab from './tabs/GeneratePackTab';
import GenerateApplicationTab from './tabs/GenerateApplicationTab';
import GenerateFullPackTab from './tabs/GenerateFullPackTab';
import ConfigurationManagerTab from './tabs/ConfigurationManagerTab';
import TemplateManagerTab from './tabs/TemplateManagerTab';
import ConsoleOutput from './ConsoleOutput';

interface MainInterfaceProps {
  onBackToWelcome: () => void;
}

const MainInterface: React.FC<MainInterfaceProps> = ({ onBackToWelcome }) => {
  const [activeTab, setActiveTab] = useState('generate-mx');
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const tabs = [
    {
      id: 'generate-mx',
      label: 'Generate MX Files',
      icon: Cog,
      component: GenerateMXTab,
    },
    {
      id: 'generate-pack',
      label: 'Generate Pack',
      icon: Zap,
      component: GeneratePackTab,
    },
    {
      id: 'generate-app',
      label: 'Generate Application',
      icon: Atom,
      component: GenerateApplicationTab,
    },
    {
      id: 'generate-full-pack',
      label: 'Generate Full Pack',
      icon: Package,
      component: GenerateFullPackTab,
    },
    {
      id: 'config-manager',
      label: 'Configuration Manager',
      icon: Settings,
      component: ConfigurationManagerTab,
    },
    {
      id: 'template-manager',
      label: 'Template Manager',
      icon: FileText,
      component: TemplateManagerTab,
    },
  ];

  return (
    <div className="min-h-screen flex" style={{ backgroundColor: STM32_COLORS.background }}>
      {/* Sidebar */}
      <div 
        className={`${sidebarOpen ? 'w-64' : 'w-16'} transition-all duration-300 flex flex-col`}
        style={{ background: STM32_GRADIENTS.header }}
      >
        {/* Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            {sidebarOpen && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                  <Cpu className="w-5 h-5" style={{ color: STM32_COLORS.primary }} />
                </div>
                <div>
                  <h2 className="text-white font-bold text-sm">STM32Cube Builder</h2>
                  <p className="text-blue-200 text-xs">Azure RTOS</p>
                </div>
              </div>
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-white hover:bg-white/10"
            >
              {sidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </Button>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 p-2">
          <Button
            variant="ghost"
            onClick={onBackToWelcome}
            className={`w-full text-white hover:bg-white/10 mb-4 ${
              sidebarOpen ? 'justify-start' : 'justify-center'
            }`}
          >
            <Home className="w-4 h-4" />
            {sidebarOpen && <span className="ml-2">Home</span>}
          </Button>

          <div className="space-y-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <Button
                  key={tab.id}
                  variant="ghost"
                  onClick={() => setActiveTab(tab.id)}
                  className={`w-full text-white hover:bg-white/10 ${
                    sidebarOpen ? 'justify-start' : 'justify-center'
                  } ${isActive ? 'bg-white/20' : ''}`}
                >
                  <Icon className="w-4 h-4" />
                  {sidebarOpen && <span className="ml-2 text-sm">{tab.label}</span>}
                </Button>
              );
            })}
          </div>
        </div>

        {/* Version Info */}
        {sidebarOpen && (
          <div className="p-4 border-t border-white/10">
            <Badge variant="secondary" className="bg-white/20 text-white text-xs">
              v1.0.0 Professional
            </Badge>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top Bar */}
        <div className="bg-white border-b border-gray-200 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold" style={{ color: STM32_COLORS.textPrimary }}>
                {tabs.find(tab => tab.id === activeTab)?.label}
              </h1>
              <p className="text-sm" style={{ color: STM32_COLORS.textSecondary }}>
                STM32 Development Tool for Azure RTOS
              </p>
            </div>
            <Badge variant="outline" style={{ borderColor: STM32_COLORS.primary, color: STM32_COLORS.primary }}>
              Ready
            </Badge>
          </div>
        </div>

        {/* Tab Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 p-6 overflow-auto">
            {tabs.map((tab) => {
              const Component = tab.component;
              return (
                <div
                  key={tab.id}
                  className={activeTab === tab.id ? 'block' : 'hidden'}
                >
                  <Component />
                </div>
              );
            })}
          </div>

          {/* Console Output */}
          <ConsoleOutput />
        </div>
      </div>
    </div>
  );
};

export default MainInterface;
