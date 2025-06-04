
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { 
  Settings, 
  File, 
  Edit, 
  Eye, 
  Trash2, 
  Plus, 
  Search, 
  AlertTriangle,
  Save,
  Download,
  Upload,
  Database,
  Cpu,
  Layers
} from 'lucide-react';
import { STM32_COLORS } from '@/styles/stm32-theme';

interface ConfigurationManagerTabProps {
  projectData?: any;
}

interface ConfigFile {
  name: string;
  path: string;
  type: 'Board' | 'Series' | 'Middleware' | 'Application';
  size: string;
  modified: string;
  file?: File;
  content?: any;
}

const ConfigurationManagerTab: React.FC<ConfigurationManagerTabProps> = ({ projectData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [selectedFileContent, setSelectedFileContent] = useState<string>('');
  const [configFiles, setConfigFiles] = useState<ConfigFile[]>([]);
  const [editMode, setEditMode] = useState(false);

  useEffect(() => {
    if (projectData?.apps?.json) {
      const jsonFiles: ConfigFile[] = projectData.apps.json.map((file: any) => {
        const fileName = file.name;
        const fileType = getFileType(fileName);
        
        return {
          name: fileName,
          path: file.path || `apps/json/${fileName}`,
          type: fileType,
          size: formatFileSize(file.file?.size || 0),
          modified: new Date().toISOString().split('T')[0],
          file: file.file,
          content: generateMockContent(fileName, fileType)
        };
      });
      
      setConfigFiles(jsonFiles);
      (window as any).addConsoleLog?.('info', `Loaded ${jsonFiles.length} configuration files from project`);
    }
  }, [projectData]);

  const getFileType = (fileName: string): 'Board' | 'Series' | 'Middleware' | 'Application' => {
    // Series files: f4.json, h7.json, etc.
    if (/^[a-z]+\d*\.json$/.test(fileName)) return 'Series';
    
    // Board files contain board names
    if (fileName.includes('STM32') || fileName.includes('NUCLEO') || fileName.includes('Discovery')) return 'Board';
    
    // Middleware files
    if (['ThreadX.json', 'FileX.json', 'NetXDuo.json', 'USBX.json'].includes(fileName)) return 'Middleware';
    
    return 'Application';
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  const generateMockContent = (fileName: string, type: string) => {
    const baseName = fileName.replace('.json', '');
    
    if (type === 'Board') {
      return {
        name: baseName,
        type: "board",
        version: "1.0.0",
        description: `Configuration for ${baseName} development board`,
        board: [{
          name: baseName,
          apps: [
            "Tx_Thread_Creation",
            "Nx_TCP_Echo_Client", 
            "Ux_Host_MSC",
            "Fx_File_Edit_Standalone"
          ],
          apps_details: [
            {
              name: "Tx_Thread_Creation",
              description: "This application demonstrates basic ThreadX thread creation and management.",
              features: ["Thread creation", "Thread scheduling", "Basic synchronization"],
              requirements: [baseName, "ThreadX middleware"]
            }
          ],
          middleware: ["ThreadX", "NetXDuo", "USBX", "FileX"],
          specs: {
            mcu: baseName.includes('F4') ? 'STM32F429ZI' : 'STM32H723ZG',
            frequency: "180MHz",
            flash: "2MB",
            ram: "256KB"
          }
        }]
      };
    } else if (type === 'Series') {
      return {
        name: `STM32${baseName.toUpperCase()}`,
        type: "series",
        version: "1.0.0",
        description: `STM32 ${baseName.toUpperCase()} series configuration`,
        supported_boards: [
          `STM32${baseName.toUpperCase()}-Discovery`,
          `NUCLEO-${baseName.toUpperCase()}`
        ],
        features: [
          "Azure RTOS support",
          "Real-time capabilities",
          "Low power modes"
        ]
      };
    } else if (type === 'Middleware') {
      return {
        name: baseName,
        type: "middleware",
        version: "6.2.0",
        description: `${baseName} middleware configuration for Azure RTOS`,
        components: [
          {
            name: `${baseName}_core`,
            version: "6.2.0",
            enabled: true
          }
        ],
        config: {
          stack_size: baseName === 'ThreadX' ? 1024 : 2048,
          priority_levels: baseName === 'ThreadX' ? 32 : 16
        }
      };
    }
    
    return {
      name: baseName,
      type: "application",
      version: "1.0.0",
      description: `${baseName} application configuration`
    };
  };

  const filteredFiles = configFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    file.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleFileSelect = (fileName: string) => {
    const file = configFiles.find(f => f.name === fileName);
    if (file) {
      setSelectedFile(fileName);
      setSelectedFileContent(JSON.stringify(file.content, null, 2));
      setEditMode(false);
      (window as any).addConsoleLog?.('info', `Opened configuration file: ${fileName}`);
    }
  };

  const handleSaveFile = () => {
    if (selectedFile) {
      try {
        JSON.parse(selectedFileContent); // Validate JSON
        const fileIndex = configFiles.findIndex(f => f.name === selectedFile);
        if (fileIndex !== -1) {
          const updatedFiles = [...configFiles];
          updatedFiles[fileIndex].content = JSON.parse(selectedFileContent);
          updatedFiles[fileIndex].modified = new Date().toISOString().split('T')[0];
          setConfigFiles(updatedFiles);
          setEditMode(false);
          (window as any).addConsoleLog?.('success', `Configuration file ${selectedFile} saved successfully`);
        }
      } catch (error) {
        (window as any).addConsoleLog?.('error', 'Invalid JSON format. Please check your syntax.');
      }
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Board':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'Series':
        return 'bg-green-100 text-green-800 border-green-300';
      case 'Middleware':
        return 'bg-purple-100 text-purple-800 border-purple-300';
      case 'Application':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Board':
        return <Cpu className="w-4 h-4" />;
      case 'Series':
        return <Database className="w-4 h-4" />;
      case 'Middleware':
        return <Layers className="w-4 h-4" />;
      case 'Application':
        return <Settings className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-green-900 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <Database className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Configuration Manager</h1>
                <p className="text-blue-200 mt-1">Manage STM32 project configuration files</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
                <Database className="w-4 h-4 mr-1" />
                {configFiles.length} Files Loaded
              </Badge>
              <Button 
                className="bg-white/20 hover:bg-white/30 text-white border border-white/30"
                size="sm"
              >
                <Plus className="w-4 h-4 mr-2" />
                New Config
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* Files List */}
          <div className="col-span-5">
            <Card className="h-[800px] bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-green-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl flex items-center gap-2">
                    <File className="w-6 h-6" />
                    Configuration Files
                  </CardTitle>
                  <Badge className="bg-white/20 text-white">
                    {filteredFiles.length} files
                  </Badge>
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <Search className="w-4 h-4 text-green-100" />
                  <Input
                    placeholder="Search configurations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-green-100"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[680px]">
                  <div className="p-4 space-y-3">
                    {filteredFiles.map((file, index) => (
                      <div
                        key={index}
                        className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                          selectedFile === file.name
                            ? 'bg-gradient-to-r from-blue-50 to-green-50 border-blue-300 shadow-lg transform scale-[1.02]'
                            : 'bg-white hover:bg-gray-50 border-gray-200 hover:border-gray-300 hover:shadow-md'
                        }`}
                        onClick={() => handleFileSelect(file.name)}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`p-2 rounded-lg ${getTypeColor(file.type)}`}>
                              {getTypeIcon(file.type)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="font-semibold text-gray-900 truncate">
                                {file.name}
                              </div>
                              <div className="text-sm text-gray-600 mt-1">
                                Size: {file.size} • Modified: {file.modified}
                              </div>
                              <div className="text-xs text-gray-500 mt-1 truncate">
                                Path: {file.path}
                              </div>
                            </div>
                          </div>
                          
                          <div className="flex flex-col items-end gap-2">
                            <Badge className={`${getTypeColor(file.type)} text-xs`}>
                              {file.type}
                            </Badge>
                            
                            <div className="flex items-center gap-1">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFileSelect(file.name);
                                }}
                                className="h-8 w-8 p-0 hover:bg-blue-100"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleFileSelect(file.name);
                                  setEditMode(true);
                                }}
                                className="h-8 w-8 p-0 hover:bg-green-100"
                              >
                                <Edit className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* File Viewer/Editor */}
          <div className="col-span-7">
            <Card className="h-[800px] bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-xl">
                    {selectedFile ? `${editMode ? 'Editing' : 'Viewing'}: ${selectedFile}` : 'Configuration Viewer'}
                  </CardTitle>
                  {selectedFile && (
                    <div className="flex items-center gap-2">
                      {editMode ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditMode(false)}
                            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                          >
                            Cancel
                          </Button>
                          <Button
                            size="sm"
                            onClick={handleSaveFile}
                            className="bg-white text-green-600 hover:bg-white/90"
                          >
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </Button>
                        </>
                      ) : (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setEditMode(true)}
                            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                          >
                            <Edit className="w-4 h-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                          >
                            <Download className="w-4 h-4 mr-1" />
                            Export
                          </Button>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {selectedFile ? (
                  <div className="h-[680px] flex flex-col">
                    {editMode ? (
                      <Textarea
                        value={selectedFileContent}
                        onChange={(e) => setSelectedFileContent(e.target.value)}
                        className="flex-1 font-mono text-sm bg-gray-50 border-2 border-gray-200 focus:border-green-500"
                        placeholder="Edit JSON configuration..."
                      />
                    ) : (
                      <pre className="flex-1 bg-gray-900 text-green-400 p-6 rounded-lg text-sm overflow-auto font-mono border-2 border-gray-700">
                        {selectedFileContent}
                      </pre>
                    )}
                    
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <h4 className="font-semibold text-blue-900 mb-2">File Information</h4>
                      <div className="grid grid-cols-3 gap-4 text-sm">
                        <div>
                          <span className="font-medium text-blue-700">Type:</span>
                          <div className="text-blue-600">{configFiles.find(f => f.name === selectedFile)?.type}</div>
                        </div>
                        <div>
                          <span className="font-medium text-blue-700">Size:</span>
                          <div className="text-blue-600">{configFiles.find(f => f.name === selectedFile)?.size}</div>
                        </div>
                        <div>
                          <span className="font-medium text-blue-700">Modified:</span>
                          <div className="text-blue-600">{configFiles.find(f => f.name === selectedFile)?.modified}</div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="h-[680px] flex items-center justify-center">
                    <div className="text-center">
                      <File className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-600 mb-2">No File Selected</h3>
                      <p className="text-gray-500">Select a configuration file from the list to view or edit its contents.</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfigurationManagerTab;
