
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Atom, Play, AlertTriangle, Cpu, FolderOpen, Eye, Info } from 'lucide-react';
import { STM32_COLORS } from '@/styles/stm32-theme';
import { 
  parseProjectData, 
  getBoardsForSeries, 
  getMiddlewareForBoard, 
  getApplicationsForMiddleware,
  getApplicationDetails
} from '@/utils/projectParser';

interface GenerateApplicationTabProps {
  projectData?: any;
}

const GenerateApplicationTab: React.FC<GenerateApplicationTabProps> = ({ projectData }) => {
  const [selectedSeries, setSelectedSeries] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedMiddleware, setSelectedMiddleware] = useState('');
  const [selectedApplication, setSelectedApplication] = useState('');
  const [selectedToolchain, setSelectedToolchain] = useState('all');
  const [outputDirectory, setOutputDirectory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [availableSeries, setAvailableSeries] = useState<string[]>([]);
  const [availableBoards, setAvailableBoards] = useState<string[]>([]);
  const [availableMiddleware, setAvailableMiddleware] = useState<string[]>([]);
  const [availableApplications, setAvailableApplications] = useState<string[]>([]);

  useEffect(() => {
    if (projectData) {
      const parsed = parseProjectData(projectData);
      setAvailableSeries(parsed.series);
      
      if (projectData.projectPath) {
        setOutputDirectory(`${projectData.projectPath}/Generated/Applications`);
      }
    }
  }, [projectData]);

  useEffect(() => {
    if (selectedSeries) {
      const boards = getBoardsForSeries(selectedSeries, projectData);
      setAvailableBoards(boards);
      setSelectedBoard(boards[0] || ''); // Auto-select first board
      setSelectedMiddleware('');
      setSelectedApplication('');
    }
  }, [selectedSeries, projectData]);

  useEffect(() => {
    if (selectedBoard) {
      const middleware = getMiddlewareForBoard(selectedBoard, projectData);
      setAvailableMiddleware(middleware);
      setSelectedMiddleware(middleware[0] || ''); // Auto-select first middleware
      setSelectedApplication('');
    }
  }, [selectedBoard, projectData]);

  useEffect(() => {
    if (selectedBoard && selectedMiddleware) {
      const applications = getApplicationsForMiddleware(selectedBoard, selectedMiddleware, projectData);
      setAvailableApplications(applications);
      setSelectedApplication(applications[0] || ''); // Auto-select first application
    }
  }, [selectedBoard, selectedMiddleware, projectData]);

  const handleGenerate = async () => {
    if (!selectedApplication || !selectedBoard || !outputDirectory) {
      (window as any).addConsoleLog?.('error', 'Please select all required fields');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    (window as any).addConsoleLog?.('info', `Generate application: ${selectedApplication} on the board: ${selectedBoard} in the directory: ${outputDirectory} for the toolchain: ${selectedToolchain} is in progress`);

    const steps = [
      'Validating input parameters...',
      'Generating application for ' + selectedBoard,
      'Processing application templates...',
      'Configuring for ' + selectedToolchain + ' toolchain...',
      'Writing application files...',
      'Generation completed.'
    ];

    try {
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 900));
        setProgress(((i + 1) / steps.length) * 100);
        (window as any).addConsoleLog?.('info', steps[i]);
      }

      (window as any).addConsoleLog?.('success', `Application ${selectedApplication} generated successfully for ${selectedBoard}`);
      (window as any).addConsoleLog?.('info', `Target: ${selectedBoard} with ${selectedMiddleware} middleware`);
      (window as any).addConsoleLog?.('info', `Toolchain: ${selectedToolchain}`);
      (window as any).addConsoleLog?.('info', `Output: ${outputDirectory}/${selectedBoard}/${selectedApplication}`);
    } catch (error) {
      (window as any).addConsoleLog?.('error', `Generation failed: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const ApplicationDetailsDialog = () => {
    if (!selectedApplication) return null;
    
    const appDetails = getApplicationDetails(selectedBoard, selectedApplication, projectData);
    
    return (
      <Dialog>
        <DialogTrigger asChild>
          <Button variant="outline" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            View Details
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Info className="w-5 h-5 text-blue-600" />
              {selectedApplication} Details
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <Label className="font-semibold text-blue-700">Board:</Label>
                <p className="text-gray-700">{selectedBoard}</p>
              </div>
              <div>
                <Label className="font-semibold text-blue-700">Middleware:</Label>
                <p className="text-gray-700">{selectedMiddleware}</p>
              </div>
            </div>
            
            <div>
              <Label className="font-semibold text-blue-700 text-lg">Description</Label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-700">{appDetails.description}</p>
              </div>
            </div>
            
            {appDetails.features && appDetails.features.length > 0 && (
              <div>
                <Label className="font-semibold text-blue-700 text-lg">Features</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <ul className="space-y-1">
                    {appDetails.features.map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-green-600 font-bold">•</span>
                        <span className="text-gray-700">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
            
            {appDetails.requirements && appDetails.requirements.length > 0 && (
              <div>
                <Label className="font-semibold text-blue-700 text-lg">Requirements</Label>
                <div className="mt-2 p-4 bg-gray-50 rounded-lg">
                  <ul className="space-y-1">
                    {appDetails.requirements.map((req: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <span className="text-blue-600 font-bold">•</span>
                        <span className="text-gray-700">{req}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  };

  const selectOutputDirectory = () => {
    const defaultPath = projectData?.projectPath ? 
      `${projectData.projectPath}/Generated/Applications/${selectedBoard}/${selectedApplication}` : 
      `./Generated/Applications/${selectedBoard}/${selectedApplication}`;
    setOutputDirectory(defaultPath);
    (window as any).addConsoleLog?.('info', `Output directory set to: ${defaultPath}`);
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Atom className="w-5 h-5" style={{ color: STM32_COLORS.warning }} />
            <CardTitle>Application Generation</CardTitle>
            <Badge variant="outline" style={{ borderColor: STM32_COLORS.success, color: STM32_COLORS.success }}>
              Project Loaded
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column: STM32 & Middleware Configuration */}
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-700 mb-4">STM32 Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="series-select">STM32 Serie *</Label>
                    <Select value={selectedSeries} onValueChange={setSelectedSeries}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select STM32 series" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSeries.map((series) => (
                          <SelectItem key={series} value={series}>
                            STM32{series.toUpperCase()} Series
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="board-select">STM32 Board *</Label>
                    <Select value={selectedBoard} onValueChange={setSelectedBoard} disabled={!selectedSeries}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select board" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableBoards.map((board) => (
                          <SelectItem key={board} value={board}>
                            <div className="flex items-center gap-2">
                              <Cpu className="w-4 h-4" />
                              {board}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-700 mb-4">Middleware Configuration</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="middleware-select">Azure RTOS Middleware *</Label>
                    <Select value={selectedMiddleware} onValueChange={setSelectedMiddleware} disabled={!selectedBoard}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select middleware" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableMiddleware.map((middleware) => (
                          <SelectItem key={middleware} value={middleware}>
                            {middleware}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-700 mb-4">Application Selection</h3>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="application-select">Application Name *</Label>
                    <div className="flex gap-2">
                      <Select value={selectedApplication} onValueChange={setSelectedApplication} disabled={!selectedMiddleware}>
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select application" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableApplications.map((app) => (
                            <SelectItem key={app} value={app}>
                              {app}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <ApplicationDetailsDialog />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column: Toolchain & Output */}
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-700 mb-4">Toolchain Selection</h3>
                <div>
                  <Label htmlFor="toolchain-select">Toolchain</Label>
                  <Select value={selectedToolchain} onValueChange={setSelectedToolchain}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select toolchain" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Toolchains</SelectItem>
                      <SelectItem value="EWARM">IAR EWARM</SelectItem>
                      <SelectItem value="STM32CubeIDE">STM32CubeIDE</SelectItem>
                      <SelectItem value="MDK-ARM">Keil MDK-ARM</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-700 mb-4">Output Configuration</h3>
                <div>
                  <Label htmlFor="output-dir">Output Directory *</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      id="output-dir"
                      placeholder="Select output directory"
                      value={outputDirectory}
                      onChange={(e) => setOutputDirectory(e.target.value)}
                      className="flex-1"
                    />
                    <Button 
                      variant="outline" 
                      onClick={selectOutputDirectory}
                      className="flex items-center gap-2"
                    >
                      <FolderOpen className="w-4 h-4" />
                      Browse
                    </Button>
                  </div>
                </div>
              </div>

              {selectedApplication && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-medium mb-3 text-green-800">
                    Generation Summary
                  </h4>
                  <div className="text-xs space-y-2 text-green-700">
                    <div><strong>Application:</strong> {selectedApplication}</div>
                    <div><strong>Board:</strong> {selectedBoard}</div>
                    <div><strong>Middleware:</strong> {selectedMiddleware}</div>
                    <div><strong>Toolchain:</strong> {selectedToolchain}</div>
                    {outputDirectory && (
                      <div><strong>Output:</strong> {outputDirectory}</div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Generating application...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="border-t pt-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">About Application Generation</p>
                  <p>Generate a complete application for the selected STM32 board with the specified middleware and toolchain. The application will be created in the selected output directory and can be imported into your preferred IDE based on the selected toolchain.</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !selectedApplication || !selectedBoard || !outputDirectory}
                className="flex items-center gap-2 px-8"
                style={{ backgroundColor: STM32_COLORS.warning }}
              >
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4" />
                    Generate Application
                  </>
                )}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenerateApplicationTab;
