import React, { useState, useRef } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, FolderOpen, CheckCircle, AlertTriangle, File } from 'lucide-react';
import { STM32_COLORS } from '@/styles/stm32-theme';
import { readFileContent } from '@/utils/projectParser';

interface ProjectUploadProps {
  onProjectLoaded: (projectStructure: any) => void;
}

const ProjectUpload: React.FC<ProjectUploadProps> = ({ onProjectLoaded }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [projectInfo, setProjectInfo] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateProjectStructure = (files: FileList) => {
    const fileNames = Array.from(files).map(file => file.webkitRelativePath || file.name);
    
    // Check for required directories and files
    const requiredPaths = [
      'apps/FileX',
      'apps/NetXDuo', 
      'apps/ThreadX',
      'apps/USBX',
      'apps/json',
      'apps/templates',
      'pack',
      'azrtos_pg.py'
    ];

    const missingPaths = requiredPaths.filter(path => 
      !fileNames.some(file => file.includes(path))
    );

    return {
      isValid: missingPaths.length === 0,
      missingPaths,
      totalFiles: files.length,
      structure: analyzeProjectStructure(files)
    };
  };

  const analyzeProjectStructure = async (files: FileList) => {
    const structure: any = {
      apps: {
        FileX: [],
        NetXDuo: [],
        ThreadX: [],
        USBX: [],
        json: [],
        templates: []
      },
      pack: [],
      mainScript: null,
      projectPath: ''
    };

    // Extract project path from first file
    const firstFile = files[0];
    if (firstFile?.webkitRelativePath) {
      const pathParts = firstFile.webkitRelativePath.split('/');
      structure.projectPath = pathParts[0];
    }

    const filePromises = Array.from(files).map(async (file) => {
      const path = file.webkitRelativePath || file.name;
      const fileInfo = { name: file.name, path: path, file: file };
      
      // Read JSON files content immediately
      if (file.name.endsWith('.json')) {
        try {
          fileInfo.content = await readFileContent(file);
        } catch (error) {
          console.error(`Error reading ${file.name}:`, error);
        }
      }
      
      if (path.includes('apps/FileX')) {
        structure.apps.FileX.push(fileInfo);
      } else if (path.includes('apps/NetXDuo')) {
        structure.apps.NetXDuo.push(fileInfo);
      } else if (path.includes('apps/ThreadX')) {
        structure.apps.ThreadX.push(fileInfo);
      } else if (path.includes('apps/USBX')) {
        structure.apps.USBX.push(fileInfo);
      } else if (path.includes('apps/json')) {
        structure.apps.json.push(fileInfo);
      } else if (path.includes('apps/templates')) {
        structure.apps.templates.push(fileInfo);
      } else if (path.includes('pack/')) {
        structure.pack.push(fileInfo);
      } else if (file.name === 'azrtos_pg.py') {
        structure.mainScript = fileInfo;
      }
    });

    await Promise.all(filePromises);
    return structure;
  };

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploadStatus('processing');
    
    try {
      const validation = validateProjectStructure(files);
      
      if (!validation.isValid) {
        setUploadStatus('error');
        console.error('Invalid project structure. Missing:', validation.missingPaths);
        return;
      }

      const structure = await analyzeProjectStructure(files);

      setProjectInfo({
        name: 'PACK_AZRTOS_AutoGen',
        totalFiles: validation.totalFiles,
        structure: structure
      });

      // Store project files globally for access in tabs
      (window as any).projectFiles = structure;
      
      setUploadStatus('success');
      
      // Notify parent component
      setTimeout(() => {
        onProjectLoaded(structure);
      }, 1000);

    } catch (error) {
      setUploadStatus('error');
      console.error('Error processing project:', error);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const getStatusColor = () => {
    switch (uploadStatus) {
      case 'success': return STM32_COLORS.success;
      case 'error': return STM32_COLORS.error;
      case 'processing': return STM32_COLORS.warning;
      default: return STM32_COLORS.primary;
    }
  };

  if (uploadStatus === 'success' && projectInfo) {
    return (
      <div className="space-y-6">
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <div className="flex items-center gap-3">
              <CheckCircle className="w-6 h-6 text-green-600" />
              <CardTitle className="text-green-800">Project Loaded Successfully</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-green-800">Project Name:</p>
                  <p className="text-green-700">{projectInfo.name}</p>
                </div>
                <div>
                  <p className="font-medium text-green-800">Total Files:</p>
                  <p className="text-green-700">{projectInfo.totalFiles}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <Badge className="bg-blue-100 text-blue-800">
                  FileX: {projectInfo.structure.apps.FileX.length} files
                </Badge>
                <Badge className="bg-purple-100 text-purple-800">
                  NetXDuo: {projectInfo.structure.apps.NetXDuo.length} files
                </Badge>
                <Badge className="bg-orange-100 text-orange-800">
                  ThreadX: {projectInfo.structure.apps.ThreadX.length} files
                </Badge>
                <Badge className="bg-green-100 text-green-800">
                  USBX: {projectInfo.structure.apps.USBX.length} files
                </Badge>
                <Badge className="bg-indigo-100 text-indigo-800">
                  JSON: {projectInfo.structure.apps.json.length} files
                </Badge>
                <Badge className="bg-red-100 text-red-800">
                  Templates: {projectInfo.structure.apps.templates.length} files
                </Badge>
              </div>

              <Button 
                onClick={() => onProjectLoaded(projectInfo.structure)}
                className="w-full"
                style={{ backgroundColor: STM32_COLORS.success }}
              >
                Continue to Main Interface
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderOpen className="w-5 h-5" style={{ color: STM32_COLORS.primary }} />
            Upload PACK_AZRTOS_AutoGen Project
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Please upload the complete PACK_AZRTOS_AutoGen project folder before proceeding. 
              The project must contain the apps, pack directories and azrtos_pg.py file.
            </AlertDescription>
          </Alert>

          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-blue-400 bg-blue-50' 
                : uploadStatus === 'error'
                ? 'border-red-300 bg-red-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
            onDragEnter={() => setIsDragging(true)}
            onDragLeave={() => setIsDragging(false)}
          >
            <div className="space-y-4">
              <Upload 
                className="mx-auto w-12 h-12" 
                style={{ color: getStatusColor() }}
              />
              
              {uploadStatus === 'processing' ? (
                <div>
                  <p className="text-lg font-medium" style={{ color: STM32_COLORS.warning }}>
                    Processing project files...
                  </p>
                  <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full animate-pulse w-3/4"></div>
                  </div>
                </div>
              ) : uploadStatus === 'error' ? (
                <div>
                  <p className="text-lg font-medium text-red-600">
                    Invalid project structure
                  </p>
                  <p className="text-sm text-red-500">
                    Please ensure you upload the complete PACK_AZRTOS_AutoGen folder
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-medium" style={{ color: STM32_COLORS.textPrimary }}>
                    Drag and drop project folder here
                  </p>
                  <p className="text-sm" style={{ color: STM32_COLORS.textSecondary }}>
                    or click to browse
                  </p>
                </div>
              )}

              <Button
                variant="outline"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadStatus === 'processing'}
                style={{ borderColor: STM32_COLORS.primary, color: STM32_COLORS.primary }}
              >
                <File className="w-4 h-4 mr-2" />
                Select Project Folder
              </Button>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              // @ts-ignore - webkitdirectory is not in the type definition but works in browsers
              webkitdirectory=""
              className="hidden"
              onChange={(e) => handleFileSelect(e.target.files)}
            />
          </div>

          <div className="text-xs text-gray-500 space-y-1">
            <p><strong>Required structure:</strong></p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>apps/ (containing FileX, NetXDuo, ThreadX, USBX, json, templates folders)</li>
              <li>pack/ (containing pack configuration files)</li>
              <li>azrtos_pg.py (main Python script)</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProjectUpload;
