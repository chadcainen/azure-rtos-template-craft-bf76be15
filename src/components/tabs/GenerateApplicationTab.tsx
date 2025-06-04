
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Atom, Play, AlertTriangle, Cpu, FolderOpen, Eye } from 'lucide-react';
import { STM32_COLORS } from '@/styles/stm32-theme';
import { parseProjectData, getBoardsForSeries, getMiddlewareForBoard, getApplicationsForMiddleware } from '@/utils/projectParser';

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
      setSelectedBoard('');
      setSelectedMiddleware('');
      setSelectedApplication('');
    }
  }, [selectedSeries, projectData]);

  useEffect(() => {
    if (selectedBoard) {
      const middleware = getMiddlewareForBoard(selectedBoard, projectData);
      setAvailableMiddleware(middleware);
      setSelectedMiddleware('');
      setSelectedApplication('');
    }
  }, [selectedBoard, projectData]);

  useEffect(() => {
    if (selectedBoard && selectedMiddleware) {
      const applications = getApplicationsForMiddleware(selectedBoard, selectedMiddleware, projectData);
      setAvailableApplications(applications);
      setSelectedApplication('');
    }
  }, [selectedBoard, selectedMiddleware, projectData]);

  const handleGenerate = async () => {
    if (!selectedApplication || !selectedBoard || !outputDirectory) {
      (window as any).addConsoleLog?.('error', 'Please select all required fields');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    (window as any).addConsoleLog?.('info', `Generating application: ${selectedApplication} for board: ${selectedBoard}...`);

    const steps = [
      'Validating board configuration...',
      'Loading application templates...',
      'Configuring middleware...',
      'Generating project files...',
      'Setting up toolchain files...',
      'Finalizing application...'
    ];

    try {
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        setProgress(((i + 1) / steps.length) * 100);
        (window as any).addConsoleLog?.('info', steps[i]);
      }

      (window as any).addConsoleLog?.('success', `Application ${selectedApplication} generated successfully`);
      (window as any).addConsoleLog?.('info', `Target: ${selectedBoard} with ${selectedMiddleware} middleware`);
      (window as any).addConsoleLog?.('info', `Toolchain: ${selectedToolchain}`);
      (window as any).addConsoleLog?.('info', `Output: ${outputDirectory}`);
    } catch (error) {
      (window as any).addConsoleLog?.('error', `Generation failed: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const viewApplicationDetails = () => {
    if (!selectedApplication) return;
    
    (window as any).addConsoleLog?.('info', `Application: ${selectedApplication}`);
    (window as any).addConsoleLog?.('info', `Board: ${selectedBoard}`);
    (window as any).addConsoleLog?.('info', `Middleware: ${selectedMiddleware}`);
    (window as any).addConsoleLog?.('info', `Description: Demonstrates ${selectedMiddleware} functionality on ${selectedBoard}`);
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
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="series-select">STM32 Series *</Label>
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

              <div>
                <Label htmlFor="application-select">Application *</Label>
                <div className="flex gap-2">
                  <Select value={selectedApplication} onValueChange={setSelectedApplication} disabled={!selectedMiddleware}>
                    <SelectTrigger>
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
                  <Button 
                    variant="outline" 
                    onClick={viewApplicationDetails}
                    disabled={!selectedApplication}
                    className="flex items-center gap-2"
                  >
                    <Eye className="w-4 h-4" />
                    Details
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-4">
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

              <div>
                <Label htmlFor="output-dir">Output Directory *</Label>
                <div className="flex gap-2">
                  <Input
                    id="output-dir"
                    placeholder="Select output directory"
                    value={outputDirectory}
                    onChange={(e) => setOutputDirectory(e.target.value)}
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

              {selectedApplication && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2" style={{ color: STM32_COLORS.success }}>
                    Generation Summary
                  </h4>
                  <div className="text-xs space-y-1">
                    <div>Application: {selectedApplication}</div>
                    <div>Board: {selectedBoard}</div>
                    <div>Middleware: {selectedMiddleware}</div>
                    <div>Toolchain: {selectedToolchain}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Generating application...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedApplication || !selectedBoard || !outputDirectory}
              className="flex items-center gap-2"
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
        </CardContent>
      </Card>
    </div>
  );
};

export default GenerateApplicationTab;
