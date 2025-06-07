
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Cog, 
  Play, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  Zap,
  Code,
  Download
} from 'lucide-react';
import { STM32_COLORS } from '@/styles/stm32-theme';
import { 
  getBoardsForSeries, 
  getMiddlewareForBoard, 
  getApplicationsForMiddleware,
  parseProjectData
} from '@/utils/projectParser';

interface GenerateMXTabProps {
  projectData?: any;
}

const GenerateMXTab: React.FC<GenerateMXTabProps> = ({ projectData }) => {
  const [selectedSeries, setSelectedSeries] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedMiddleware, setSelectedMiddleware] = useState('');
  const [selectedApplications, setSelectedApplications] = useState<string[]>([]);
  const [projectName, setProjectName] = useState('STM32_AzureRTOS_Project');
  const [outputPath, setOutputPath] = useState('./output');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [availableSeries, setAvailableSeries] = useState<string[]>([]);
  const [availableBoards, setAvailableBoards] = useState<string[]>([]);
  const [availableMiddleware, setAvailableMiddleware] = useState<string[]>([]);
  const [availableApplications, setAvailableApplications] = useState<string[]>([]);

  // Initialize data from project
  useEffect(() => {
    if (projectData) {
      const parsedData = parseProjectData(projectData);
      setAvailableSeries(parsedData.series);
      (window as any).addConsoleLog?.('info', 'MX Generator initialized with project data');
    }
  }, [projectData]);

  // Update boards when series changes
  useEffect(() => {
    if (selectedSeries && projectData) {
      const boards = getBoardsForSeries(selectedSeries, projectData);
      setAvailableBoards(boards);
      setSelectedBoard('');
      setSelectedMiddleware('');
      setSelectedApplications([]);
    }
  }, [selectedSeries, projectData]);

  // Update middleware when board changes
  useEffect(() => {
    if (selectedBoard && projectData) {
      const middleware = getMiddlewareForBoard(selectedBoard, projectData);
      setAvailableMiddleware(middleware);
      setSelectedMiddleware('');
      setSelectedApplications([]);
    }
  }, [selectedBoard, projectData]);

  // Update applications when middleware changes
  useEffect(() => {
    if (selectedBoard && selectedMiddleware && projectData) {
      const applications = getApplicationsForMiddleware(selectedBoard, selectedMiddleware, projectData);
      setAvailableApplications(applications);
      setSelectedApplications([]);
    }
  }, [selectedBoard, selectedMiddleware, projectData]);

  const handleApplicationToggle = (application: string) => {
    setSelectedApplications(prev => 
      prev.includes(application) 
        ? prev.filter(app => app !== application)
        : [...prev, application]
    );
  };

  const handleGenerate = async () => {
    if (!selectedSeries || !selectedBoard || selectedApplications.length === 0) {
      (window as any).addConsoleLog?.('error', 'Please select series, board, and at least one application');
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('idle');
    
    try {
      (window as any).addConsoleLog?.('info', `Generating MX files for ${selectedBoard} with applications: ${selectedApplications.join(', ')}`);
      
      // Simulate generation process
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setGenerationStatus('success');
      (window as any).addConsoleLog?.('success', `MX files generated successfully for project: ${projectName}`);
    } catch (error) {
      setGenerationStatus('error');
      (window as any).addConsoleLog?.('error', 'Failed to generate MX files');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!projectData) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please upload the PACK_AZRTOS_AutoGen project first to generate MX files.
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
                <Cog className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">STM32CubeMX Generator</h1>
                <p className="text-blue-200 mt-1">Professional STM32 Project Generation with Azure RTOS</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
                <Zap className="w-4 h-4 mr-1" />
                Ready to Generate
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Configuration Section */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6" />
              <CardTitle className="text-xl">Project Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  STM32 Series
                </label>
                <Select value={selectedSeries} onValueChange={setSelectedSeries}>
                  <SelectTrigger className="h-12 border-2 border-blue-200 focus:border-blue-500 bg-white">
                    <SelectValue placeholder="Select STM32 series" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-blue-200">
                    {availableSeries.map((series) => (
                      <SelectItem key={series} value={series}>
                        <span className="font-medium">STM32{series.toUpperCase()}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  Development Board
                </label>
                <Select value={selectedBoard} onValueChange={setSelectedBoard} disabled={!selectedSeries}>
                  <SelectTrigger className="h-12 border-2 border-purple-200 focus:border-purple-500 bg-white">
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-purple-200">
                    {availableBoards.map((board) => (
                      <SelectItem key={board} value={board}>
                        {board}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  Middleware Stack
                </label>
                <Select value={selectedMiddleware} onValueChange={setSelectedMiddleware} disabled={!selectedBoard}>
                  <SelectTrigger className="h-12 border-2 border-green-200 focus:border-green-500 bg-white">
                    <SelectValue placeholder="Select middleware" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-green-200">
                    {availableMiddleware.map((middleware) => (
                      <SelectItem key={middleware} value={middleware}>
                        {middleware}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                  Project Name
                </label>
                <Input
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                  placeholder="Enter project name"
                  className="h-12 border-2 border-orange-200 focus:border-orange-500 bg-white"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Applications Selection */}
        {availableApplications.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="text-xl flex items-center gap-3">
                <Code className="w-6 h-6" />
                Available Applications ({selectedMiddleware})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableApplications.map((app) => (
                  <div
                    key={app}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedApplications.includes(app)
                        ? 'bg-gradient-to-r from-green-100 to-teal-100 border-green-300 shadow-md'
                        : 'bg-white border-gray-200 hover:border-green-300 hover:shadow-sm'
                    }`}
                    onClick={() => handleApplicationToggle(app)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{app}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          {selectedMiddleware} Application
                        </p>
                      </div>
                      {selectedApplications.includes(app) && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Generation Controls */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-3">
              <FileText className="w-6 h-6" />
              Generate STM32CubeMX Files
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700">Output Directory</label>
                  <Input
                    value={outputPath}
                    onChange={(e) => setOutputPath(e.target.value)}
                    placeholder="./output"
                    className="h-12 border-2 border-gray-200 focus:border-orange-500 bg-white"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700">Selected Applications</label>
                  <div className="flex flex-wrap gap-2">
                    {selectedApplications.map((app) => (
                      <Badge key={app} className="bg-green-100 text-green-800 px-3 py-1">
                        {app}
                      </Badge>
                    ))}
                    {selectedApplications.length === 0 && (
                      <span className="text-gray-500 text-sm">No applications selected</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between pt-6 border-t border-gray-200">
                <div className="flex items-center gap-4">
                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !selectedSeries || !selectedBoard || selectedApplications.length === 0}
                    className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 h-12"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Play className="w-5 h-5 mr-2" />
                        Generate MX Files
                      </>
                    )}
                  </Button>
                  
                  {generationStatus === 'success' && (
                    <Button variant="outline" className="flex items-center gap-2">
                      <Download className="w-4 h-4" />
                      Download Files
                    </Button>
                  )}
                </div>

                {generationStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Generation completed successfully!</span>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenerateMXTab;
