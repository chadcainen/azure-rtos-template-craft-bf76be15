import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Atom, Play, AlertTriangle } from 'lucide-react';
import { STM32_COLORS } from '@/styles/stm32-theme';

interface GenerateApplicationTabProps {
  projectData?: any;
}

const GenerateApplicationTab: React.FC<GenerateApplicationTabProps> = ({ projectData }) => {
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedApp, setSelectedApp] = useState('');
  const [appName, setAppName] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const boards = [
    { value: 'STM32F429ZI-Nucleo', label: 'NUCLEO-F429ZI', series: 'F4' },
    { value: 'STM32F767ZI-Nucleo', label: 'NUCLEO-F767ZI', series: 'F7' },
    { value: 'STM32H743I-EVAL', label: 'STM32H743I-EVAL', series: 'H7' },
    { value: 'STM32L4R5ZI-Nucleo', label: 'NUCLEO-L4R5ZI', series: 'L4' },
    { value: 'NUCLEO-G474RE', label: 'NUCLEO-G474RE', series: 'G4' },
    { value: 'STM32WB5MM-DK', label: 'STM32WB5MM-DK', series: 'WB' },
  ];

  const applications = [
    { value: 'Tx_Thread_Creation', label: 'ThreadX - Thread Creation', middleware: 'ThreadX' },
    { value: 'Fx_File_Edit_Standalone', label: 'FileX - File Edit Standalone', middleware: 'FileX' },
    { value: 'Nx_TCP_Echo_Server', label: 'NetX Duo - TCP Echo Server', middleware: 'NetX Duo' },
    { value: 'Ux_Device_HID', label: 'USBX - USB Device HID', middleware: 'USBX' },
    { value: 'Ux_Host_MSC', label: 'USBX - USB Host MSC', middleware: 'USBX' },
  ];

  if (!projectData) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please upload the PACK_AZRTOS_AutoGen project first to generate application files.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleGenerate = async () => {
    if (!selectedBoard || !selectedApp || !appName) {
      (window as any).addConsoleLog?.('error', 'Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    (window as any).addConsoleLog?.('info', `Starting application generation for ${appName}...`);

    const steps = [
      'Loading board configuration...',
      'Preparing application template...',
      'Generating source files...',
      'Configuring middleware...',
      'Creating project files...',
      'Finalizing application...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(((i + 1) / steps.length) * 100);
      (window as any).addConsoleLog?.('info', steps[i]);
    }

    (window as any).addConsoleLog?.('success', `Application ${appName} generated successfully`);
    setIsGenerating(false);
  };

  const selectedBoardInfo = boards.find(b => b.value === selectedBoard);
  const selectedAppInfo = applications.find(a => a.value === selectedApp);

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Atom className="w-5 h-5" style={{ color: STM32_COLORS.accent }} />
            <CardTitle>Application Generation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="app-name">Application Name *</Label>
                <Input
                  id="app-name"
                  placeholder="Enter application name"
                  value={appName}
                  onChange={(e) => setAppName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="board-select">Target Board *</Label>
                <Select value={selectedBoard} onValueChange={setSelectedBoard}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target board" />
                  </SelectTrigger>
                  <SelectContent>
                    {boards.map((board) => (
                      <SelectItem key={board.value} value={board.value}>
                        <div>
                          <div className="font-medium">{board.label}</div>
                          <div className="text-xs text-gray-500">STM32{board.series} Series</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="app-select">Application Template *</Label>
                <Select value={selectedApp} onValueChange={setSelectedApp}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select application template" />
                  </SelectTrigger>
                  <SelectContent>
                    {applications.map((app) => (
                      <SelectItem key={app.value} value={app.value}>
                        <div>
                          <div className="font-medium">{app.label}</div>
                          <div className="text-xs text-gray-500">{app.middleware}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-4">
              {selectedBoardInfo && (
                <Card className="bg-gray-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm flex items-center gap-2">
                      <Cpu className="w-4 h-4" />
                      Board Information
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Board:</span>
                        <Badge variant="secondary">{selectedBoardInfo.label}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Series:</span>
                        <Badge variant="secondary">STM32{selectedBoardInfo.series}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Status:</span>
                        <Badge variant="secondary" style={{ backgroundColor: STM32_COLORS.success, color: 'white' }}>
                          Supported
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {selectedAppInfo && (
                <Card className="bg-blue-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Application Details</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Middleware:</span>
                        <Badge variant="secondary">{selectedAppInfo.middleware}</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Template:</span>
                        <Badge variant="secondary">Available</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
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
              disabled={isGenerating || !selectedBoard || !selectedApp || !appName}
              className="flex items-center gap-2"
              style={{ backgroundColor: STM32_COLORS.accent }}
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
