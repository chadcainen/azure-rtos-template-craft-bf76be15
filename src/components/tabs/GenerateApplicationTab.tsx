
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  Atom, 
  Play, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  Download,
  Code,
  Info
} from 'lucide-react';
import { STM32_COLORS } from '@/styles/stm32-theme';
import { 
  getBoardsForSeries, 
  getMiddlewareForBoard, 
  getApplicationsForMiddleware,
  getApplicationDetails,
  parseProjectData
} from '@/utils/projectParser';

interface GenerateApplicationTabProps {
  projectData?: any;
}

const GenerateApplicationTab: React.FC<GenerateApplicationTabProps> = ({ projectData }) => {
  const [selectedSeries, setSelectedSeries] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedMiddleware, setSelectedMiddleware] = useState('');
  const [selectedApplication, setSelectedApplication] = useState('');
  const [projectName, setProjectName] = useState('STM32_Application');
  const [projectDescription, setProjectDescription] = useState('');
  const [outputPath, setOutputPath] = useState('./output');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [availableSeries, setAvailableSeries] = useState<string[]>([]);
  const [availableBoards, setAvailableBoards] = useState<string[]>([]);
  const [availableMiddleware, setAvailableMiddleware] = useState<string[]>([]);
  const [availableApplications, setAvailableApplications] = useState<string[]>([]);
  const [applicationDetails, setApplicationDetails] = useState<any>(null);

  // Initialize data from project
  useEffect(() => {
    if (projectData) {
      const parsedData = parseProjectData(projectData);
      setAvailableSeries(parsedData.series);
      (window as any).addConsoleLog?.('info', 'Application Generator initialized with project data');
    }
  }, [projectData]);

  // Update boards when series changes
  useEffect(() => {
    if (selectedSeries && projectData) {
      const boards = getBoardsForSeries(selectedSeries, projectData);
      setAvailableBoards(boards);
      setSelectedBoard('');
      setSelectedMiddleware('');
      setSelectedApplication('');
    }
  }, [selectedSeries, projectData]);

  // Update middleware when board changes
  useEffect(() => {
    if (selectedBoard && projectData) {
      const middleware = getMiddlewareForBoard(selectedBoard, projectData);
      setAvailableMiddleware(middleware);
      setSelectedMiddleware('');
      setSelectedApplication('');
    }
  }, [selectedBoard, projectData]);

  // Update applications when middleware changes
  useEffect(() => {
    if (selectedBoard && selectedMiddleware && projectData) {
      const applications = getApplicationsForMiddleware(selectedBoard, selectedMiddleware, projectData);
      setAvailableApplications(applications);
      setSelectedApplication('');
    }
  }, [selectedBoard, selectedMiddleware, projectData]);

  // Update application details when application changes
  useEffect(() => {
    if (selectedBoard && selectedApplication && projectData) {
      const details = getApplicationDetails(selectedBoard, selectedApplication, projectData);
      setApplicationDetails(details);
      setProjectDescription(details.description || '');
    }
  }, [selectedBoard, selectedApplication, projectData]);

  const handleGenerate = async () => {
    if (!selectedSeries || !selectedBoard || !selectedApplication) {
      (window as any).addConsoleLog?.('error', 'Please select series, board, and application');
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('idle');
    
    try {
      (window as any).addConsoleLog?.('info', `Generating application ${selectedApplication} for ${selectedBoard}`);
      
      // Simulate generation process
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      setGenerationStatus('success');
      (window as any).addConsoleLog?.('success', `Application ${projectName} generated successfully`);
    } catch (error) {
      setGenerationStatus('error');
      (window as any).addConsoleLog?.('error', 'Failed to generate application');
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
            Please upload the PACK_AZRTOS_AutoGen project first to generate applications.
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
                <Atom className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Application Generator</h1>
                <p className="text-blue-200 mt-1">Professional STM32 Application Development with Azure RTOS</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
                <Code className="w-4 h-4 mr-1" />
                Ready to Generate
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Project Configuration */}
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
                    <SelectValue placeholder="Select series" />
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
                  Middleware
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
                  Application
                </label>
                <Select value={selectedApplication} onValueChange={setSelectedApplication} disabled={!selectedMiddleware}>
                  <SelectTrigger className="h-12 border-2 border-orange-200 focus:border-orange-500 bg-white">
                    <SelectValue placeholder="Select application" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-orange-200">
                    {availableApplications.map((app) => (
                      <SelectItem key={app} value={app}>
                        {app}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Application Details */}
        {applicationDetails && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="text-xl flex items-center gap-3">
                <Info className="w-6 h-6" />
                Application Details: {selectedApplication}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Description</h4>
                    <p className="text-gray-700 text-sm leading-relaxed">
                      {applicationDetails.description}
                    </p>
                  </div>
                  
                  {applicationDetails.features && applicationDetails.features.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Key Features</h4>
                      <div className="space-y-2">
                        {applicationDetails.features.map((feature: string, index: number) => (
                          <div key={index} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600" />
                            <span className="text-sm text-gray-700">{feature}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  {applicationDetails.requirements && applicationDetails.requirements.length > 0 && (
                    <div>
                      <h4 className="font-semibold text-gray-900 mb-2">Requirements</h4>
                      <div className="flex flex-wrap gap-2">
                        {applicationDetails.requirements.map((req: string, index: number) => (
                          <Badge key={index} className="bg-blue-100 text-blue-800">
                            {req}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  <div>
                    <h4 className="font-semibold text-gray-900 mb-2">Configuration</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-gray-500">Middleware:</span>
                        <p className="font-medium">{selectedMiddleware}</p>
                      </div>
                      <div>
                        <span className="text-gray-500">Target Board:</span>
                        <p className="font-medium">{selectedBoard}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Project Settings */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-3">
              <FileText className="w-6 h-6" />
              Project Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700">Project Name</label>
                  <Input
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                    placeholder="Enter project name"
                    className="h-12 border-2 border-purple-200 focus:border-purple-500 bg-white"
                  />
                </div>

                <div className="space-y-3">
                  <label className="text-sm font-bold text-gray-700">Output Directory</label>
                  <Input
                    value={outputPath}
                    onChange={(e) => setOutputPath(e.target.value)}
                    placeholder="./output"
                    className="h-12 border-2 border-pink-200 focus:border-pink-500 bg-white"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700">Project Description</label>
                <Textarea
                  value={projectDescription}
                  onChange={(e) => setProjectDescription(e.target.value)}
                  placeholder="Enter project description..."
                  className="h-32 border-2 border-purple-200 focus:border-purple-500 bg-white resize-none"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generation Controls */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-3">
              <Code className="w-6 h-6" />
              Generate Application
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <h4 className="font-medium text-gray-900">Generation Summary</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSeries && (
                    <Badge className="bg-blue-100 text-blue-800">
                      STM32{selectedSeries.toUpperCase()}
                    </Badge>
                  )}
                  {selectedBoard && (
                    <Badge className="bg-purple-100 text-purple-800">
                      {selectedBoard}
                    </Badge>
                  )}
                  {selectedMiddleware && (
                    <Badge className="bg-green-100 text-green-800">
                      {selectedMiddleware}
                    </Badge>
                  )}
                  {selectedApplication && (
                    <Badge className="bg-orange-100 text-orange-800">
                      {selectedApplication}
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-4">
                <Button
                  onClick={handleGenerate}
                  disabled={isGenerating || !selectedSeries || !selectedBoard || !selectedApplication}
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
                      Generate Application
                    </>
                  )}
                </Button>
                
                {generationStatus === 'success' && (
                  <Button variant="outline" className="flex items-center gap-2">
                    <Download className="w-4 h-4" />
                    Download Project
                  </Button>
                )}
              </div>
            </div>

            {generationStatus === 'success' && (
              <div className="flex items-center gap-2 text-green-600 mt-6 pt-6 border-t border-gray-200">
                <CheckCircle className="w-5 h-5" />
                <span className="font-medium">Application generated successfully!</span>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GenerateApplicationTab;
