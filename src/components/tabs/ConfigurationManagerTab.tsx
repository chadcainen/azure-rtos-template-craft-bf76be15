
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { 
  FileJson, 
  Edit, 
  Save, 
  RotateCcw, 
  AlertTriangle, 
  CheckCircle, 
  Search,
  Settings,
  Database,
  Layers
} from 'lucide-react';
import { STM32_COLORS } from '@/styles/stm32-theme';
import { readFileContent } from '@/utils/projectParser';

interface ConfigurationManagerTabProps {
  projectData?: any;
}

interface JsonFile {
  name: string;
  path: string;
  content: string;
  originalContent: string;
  modified: boolean;
  parsed?: any;
}

const ConfigurationManagerTab: React.FC<ConfigurationManagerTabProps> = ({ projectData }) => {
  const [jsonFiles, setJsonFiles] = useState<JsonFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentContent, setCurrentContent] = useState('');
  const [loading, setLoading] = useState(false);

  // Load JSON files from project
  useEffect(() => {
    if (projectData?.apps?.json) {
      loadJsonFiles();
    }
  }, [projectData]);

  const loadJsonFiles = async () => {
    setLoading(true);
    const files: JsonFile[] = [];
    
    for (const file of projectData.apps.json) {
      try {
        let content = '';
        if (file.content) {
          content = file.content;
        } else if (file.file) {
          content = await readFileContent(file.file);
        }
        
        let parsed = null;
        try {
          parsed = JSON.parse(content);
        } catch (e) {
          console.warn(`Could not parse ${file.name} as JSON`);
        }

        files.push({
          name: file.name,
          path: file.path || file.name,
          content,
          originalContent: content,
          modified: false,
          parsed
        });
      } catch (error) {
        console.error(`Error loading ${file.name}:`, error);
      }
    }
    
    setJsonFiles(files);
    setLoading(false);
    (window as any).addConsoleLog?.('info', `Loaded ${files.length} JSON configuration files`);
  };

  const handleFileSelect = (fileName: string) => {
    const file = jsonFiles.find(f => f.name === fileName);
    if (file) {
      setSelectedFile(fileName);
      setCurrentContent(file.content);
      setEditMode(false);
    }
  };

  const handleContentChange = (content: string) => {
    setCurrentContent(content);
    if (selectedFile) {
      setJsonFiles(prev => 
        prev.map(file => 
          file.name === selectedFile 
            ? { ...file, content, modified: content !== file.originalContent }
            : file
        )
      );
    }
  };

  const saveCurrentFile = () => {
    if (!selectedFile) return;
    
    try {
      JSON.parse(currentContent); // Validate JSON
      
      setJsonFiles(prev => 
        prev.map(file => 
          file.name === selectedFile 
            ? { ...file, originalContent: file.content, modified: false }
            : file
        )
      );
      
      setEditMode(false);
      (window as any).addConsoleLog?.('success', `Configuration saved: ${selectedFile}`);
    } catch (error) {
      (window as any).addConsoleLog?.('error', 'Invalid JSON format. Please fix syntax errors.');
    }
  };

  const resetCurrentFile = () => {
    if (!selectedFile) return;
    
    const file = jsonFiles.find(f => f.name === selectedFile);
    if (file) {
      setCurrentContent(file.originalContent);
      handleContentChange(file.originalContent);
      setEditMode(false);
      (window as any).addConsoleLog?.('info', `Configuration reset: ${selectedFile}`);
    }
  };

  const getFileType = (fileName: string) => {
    if (fileName.match(/^[a-z]+\d*\.json$/)) return 'Series Configuration';
    if (fileName.includes('board') || !fileName.match(/^[a-z]+\d*\.json$/)) return 'Board Configuration';
    return 'Configuration File';
  };

  const getFileIcon = (fileName: string) => {
    const type = getFileType(fileName);
    if (type === 'Series Configuration') return <Layers className="w-5 h-5 text-blue-600" />;
    if (type === 'Board Configuration') return <Database className="w-5 h-5 text-green-600" />;
    return <FileJson className="w-5 h-5 text-purple-600" />;
  };

  const filteredFiles = jsonFiles.filter(file =>
    file.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const selectedFileData = selectedFile ? jsonFiles.find(f => f.name === selectedFile) : null;

  if (!projectData) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please upload the PACK_AZRTOS_AutoGen project first to manage configurations.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-900 via-blue-800 to-purple-900 shadow-xl">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-3">
                <Settings className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Configuration Manager</h1>
                <p className="text-blue-200 mt-1">Professional JSON Configuration Editor for STM32 Projects</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
                {jsonFiles.length} Config Files
              </Badge>
              <Badge className="bg-orange-500/20 text-orange-100 border-orange-400/30">
                {jsonFiles.filter(f => f.modified).length} Modified
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-12 gap-8">
          {/* File Browser */}
          <div className="col-span-4">
            <Card className="h-[700px] bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FileJson className="w-5 h-5" />
                  Configuration Files
                </CardTitle>
                <div className="flex items-center gap-2 mt-3">
                  <Search className="w-4 h-4 text-blue-100" />
                  <Input
                    placeholder="Search configurations..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-blue-100"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="p-4 space-y-2">
                    {loading ? (
                      <div className="text-center py-8">
                        <div className="animate-spin w-8 h-8 border-2 border-blue-600/30 border-t-blue-600 rounded-full mx-auto" />
                        <p className="text-gray-500 mt-2">Loading configurations...</p>
                      </div>
                    ) : (
                      filteredFiles.map((file) => (
                        <div
                          key={file.name}
                          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                            selectedFile === file.name 
                              ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 shadow-md' 
                              : 'hover:bg-gray-50 hover:shadow-sm border border-gray-200'
                          }`}
                          onClick={() => handleFileSelect(file.name)}
                        >
                          {getFileIcon(file.name)}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium truncate ${selectedFile === file.name ? 'text-blue-900' : 'text-gray-700'}`}>
                                {file.name}
                              </span>
                              {file.modified && (
                                <div className="w-2 h-2 bg-orange-500 rounded-full" />
                              )}
                            </div>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge variant="secondary" className="text-xs">
                                {getFileType(file.name)}
                              </Badge>
                              {file.parsed && (
                                <span className="text-xs text-green-600">Valid JSON</span>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Editor */}
          <div className="col-span-8">
            <Card className="h-[700px] bg-white/80 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {selectedFile ? `Editing: ${selectedFile}` : 'JSON Configuration Editor'}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setEditMode(!editMode)}
                      disabled={!selectedFile}
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={resetCurrentFile}
                      disabled={!selectedFile || !selectedFileData?.modified}
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveCurrentFile}
                      disabled={!selectedFile || !editMode || !selectedFileData?.modified}
                      className="bg-white text-green-600 hover:bg-white/90"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                {selectedFile ? (
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <Badge className="bg-blue-100 text-blue-800">
                          {getFileType(selectedFile)}
                        </Badge>
                        {selectedFileData?.modified && (
                          <Badge className="bg-orange-100 text-orange-800">
                            <div className="w-2 h-2 bg-orange-600 rounded-full mr-1" />
                            Modified
                          </Badge>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {editMode ? 'Edit Mode' : 'Read Only'}
                      </div>
                    </div>
                    
                    <Textarea
                      value={currentContent}
                      onChange={(e) => handleContentChange(e.target.value)}
                      className="h-[520px] font-mono text-sm bg-gray-50 border-2 border-gray-200 focus:border-green-500"
                      readOnly={!editMode}
                      placeholder="JSON configuration content..."
                    />
                  </div>
                ) : (
                  <div className="h-[580px] flex items-center justify-center">
                    <div className="text-center">
                      <FileJson className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-gray-700 mb-2">No File Selected</h3>
                      <p className="text-gray-500">Select a configuration file to view and edit its contents</p>
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
