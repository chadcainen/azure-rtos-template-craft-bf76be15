
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Settings, File, Edit, Eye, Trash2, Plus, Search, AlertTriangle } from 'lucide-react';
import { STM32_COLORS } from '@/styles/stm32-theme';

interface ConfigurationManagerTabProps {
  projectData?: any;
}

const ConfigurationManagerTab: React.FC<ConfigurationManagerTabProps> = ({ projectData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [configFiles, setConfigFiles] = useState<any[]>([]);

  useEffect(() => {
    if (projectData?.apps?.json) {
      const jsonFiles = projectData.apps.json.map((file: any) => ({
        name: file.name,
        path: file.path,
        type: getFileType(file.name),
        size: formatFileSize(file.file?.size || 0),
        modified: new Date().toISOString().split('T')[0], // Mock date
        file: file.file
      }));
      setConfigFiles(jsonFiles);
    }
  }, [projectData]);

  const getFileType = (fileName: string) => {
    if (fileName.includes('STM32') && fileName.includes('Nucleo')) return 'Board';
    if (fileName.includes('STM32') && (fileName.includes('EVAL') || fileName.includes('Discovery'))) return 'Board';
    if (['f4.json', 'f7.json', 'h7.json', 'l4.json', 'g4.json'].includes(fileName)) return 'Series';
    return 'Middleware';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const filteredFiles = configFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileAction = (action: string, fileName: string) => {
    (window as any).addConsoleLog?.('info', `${action} file: ${fileName} from project`);
    
    if (action === 'View') {
      setSelectedFile(fileName);
    }
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

  if (!projectData) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please upload the PACK_AZRTOS_AutoGen project first to manage configuration files.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Settings className="w-5 h-5" style={{ color: STM32_COLORS.warning }} />
          <h2 className="text-lg font-semibold">Configuration Manager</h2>
          <Badge variant="outline" style={{ borderColor: STM32_COLORS.success, color: STM32_COLORS.success }}>
            {configFiles.length} JSON files loaded
          </Badge>
        </div>
        <Button className="flex items-center gap-2" style={{ backgroundColor: STM32_COLORS.primary }}>
          <Plus className="w-4 h-4" />
          New Configuration
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Project JSON Configuration Files</CardTitle>
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
                        {file.size} • Path: {file.path}
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
  },
  "path": "Loaded from project: ${configFiles.find(f => f.name === selectedFile)?.path || ''}"
}`}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default ConfigurationManagerTab;
