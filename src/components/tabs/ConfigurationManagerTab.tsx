
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Settings, File, Edit, Eye, Trash2, Plus, Search } from 'lucide-react';
import { STM32_COLORS } from '@/styles/stm32-theme';

const ConfigurationManagerTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);

  const configFiles = [
    { name: 'STM32F429ZI-Nucleo.json', type: 'Board', size: '12.3 KB', modified: '2024-01-15' },
    { name: 'STM32F767ZI-Nucleo.json', type: 'Board', size: '14.1 KB', modified: '2024-01-14' },
    { name: 'STM32H743I-EVAL.json', type: 'Board', size: '16.7 KB', modified: '2024-01-13' },
    { name: 'ThreadX.json', type: 'Middleware', size: '8.9 KB', modified: '2024-01-12' },
    { name: 'FileX.json', type: 'Middleware', size: '7.2 KB', modified: '2024-01-12' },
    { name: 'NetXDuo.json', type: 'Middleware', size: '11.5 KB', modified: '2024-01-11' },
    { name: 'USBX.json', type: 'Middleware', size: '9.8 KB', modified: '2024-01-11' },
    { name: 'f4.json', type: 'Series', size: '5.6 KB', modified: '2024-01-10' },
    { name: 'f7.json', type: 'Series', size: '6.1 KB', modified: '2024-01-10' },
    { name: 'h7.json', type: 'Series', size: '7.3 KB', modified: '2024-01-09' },
  ];

  const filteredFiles = configFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileAction = (action: string, fileName: string) => {
    (window as any).addConsoleLog?.('info', `${action} file: ${fileName}`);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Board':
        return STM32_COLORS.primary;
      case 'Middleware':
        return STM32_COLORS.secondary;
      case 'Series':
        return STM32_COLORS.accent;
      default:
        return STM32_COLORS.gray600;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5" style={{ color: STM32_COLORS.warning }} />
          <h2 className="text-lg font-semibold">Configuration Manager</h2>
        </div>
        <Button className="flex items-center gap-2" style={{ backgroundColor: STM32_COLORS.primary }}>
          <Plus className="w-4 h-4" />
          New Configuration
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>JSON Configuration Files</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search configurations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {filteredFiles.map((file, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedFile === file.name ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedFile(file.name)}
                >
                  <div className="flex items-center gap-3">
                    <File className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{file.name}</div>
                      <div className="text-sm text-gray-500">
                        {file.size} • Modified {file.modified}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <Badge 
                      variant="secondary" 
                      style={{ 
                        backgroundColor: `${getTypeColor(file.type)}15`,
                        color: getTypeColor(file.type)
                      }}
                    >
                      {file.type}
                    </Badge>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileAction('View', file.name);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileAction('Edit', file.name);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleFileAction('Delete', file.name);
                        }}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedFile && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">File Preview: {selectedFile}</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm"
              style={{ backgroundColor: STM32_COLORS.codeBackground, color: STM32_COLORS.codeText }}
            >
              <pre>{`{
  "name": "${selectedFile.replace('.json', '')}",
  "version": "1.0.0",
  "description": "Configuration file for STM32 development",
  "azure_rtos": {
    "threadx": {
      "enabled": true,
      "config": {
        "thread_stack_size": 1024,
        "priority_max": 32
      }
    }
  }
}`}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConfigurationManagerTab;
