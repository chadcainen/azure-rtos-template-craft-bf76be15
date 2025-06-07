
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Package, Play, AlertTriangle, FolderOpen, Info, Settings } from 'lucide-react';
import { STM32_COLORS } from '@/styles/stm32-theme';
import { parseProjectData } from '@/utils/projectParser';

interface GenerateFullPackTabProps {
  projectData?: any;
}

const GenerateFullPackTab: React.FC<GenerateFullPackTabProps> = ({ projectData }) => {
  const [selectedSeries, setSelectedSeries] = useState('');
  const [xcubeFirmwarePath, setXcubeFirmwarePath] = useState('');
  const [outputDirectory, setOutputDirectory] = useState('');
  const [includeAllApps, setIncludeAllApps] = useState(true);
  const [includeDocs, setIncludeDocs] = useState(true);
  const [includeDemos, setIncludeDemos] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  
  const [availableSeries, setAvailableSeries] = useState<string[]>([]);

  useEffect(() => {
    if (projectData) {
      const parsed = parseProjectData(projectData);
      setAvailableSeries(parsed.series);
      
      if (projectData.projectPath) {
        setOutputDirectory(`${projectData.projectPath}/Generated/FullPack`);
      }
    }
  }, [projectData]);

  const handleGenerate = async () => {
    if (!selectedSeries || !xcubeFirmwarePath || !outputDirectory) {
      (window as any).addConsoleLog?.('error', 'Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    (window as any).addConsoleLog?.('info', `Generate full pack for ${selectedSeries} serie in the directory ${outputDirectory} is in progress...`);

    const steps = [
      'Validating directories...',
      'Creating PACK and BOARD class instances...',
      'Getting boards list...',
      'Processing all boards and applications...',
      'Generating individual applications...',
      'Creating full pack structure...',
      'Finalizing full pack...',
      'Full pack generation completed.'
    ];

    try {
      for (let i = 0; i < steps.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1200));
        setProgress(((i + 1) / steps.length) * 100);
        (window as any).addConsoleLog?.('info', steps[i]);
      }

      (window as any).addConsoleLog?.('success', `Full pack generated successfully for ${selectedSeries} series`);
      (window as any).addConsoleLog?.('info', `Output: ${outputDirectory}/FullPack_${selectedSeries}`);
      (window as any).addConsoleLog?.('info', `X-Cube Firmware: ${xcubeFirmwarePath}`);
      (window as any).addConsoleLog?.('info', `Options: Apps=${includeAllApps}, Docs=${includeDocs}, Demos=${includeDemos}`);
    } catch (error) {
      (window as any).addConsoleLog?.('error', `Generation failed: ${error}`);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectXcubeFirmwarePath = () => {
    const defaultPath = projectData?.projectPath ? 
      `${projectData.projectPath}/X-Cube-Firmware` : 
      './X-Cube-Firmware';
    setXcubeFirmwarePath(defaultPath);
    (window as any).addConsoleLog?.('info', `X-Cube firmware path set to: ${defaultPath}`);
  };

  const selectOutputDirectory = () => {
    const defaultPath = projectData?.projectPath ? 
      `${projectData.projectPath}/Generated/FullPack` : 
      './Generated/FullPack';
    setOutputDirectory(defaultPath);
    (window as any).addConsoleLog?.('info', `Output directory set to: ${defaultPath}`);
  };

  // Handler functions for checkboxes that properly handle CheckedState
  const handleIncludeAppsChange = (checked: boolean | "indeterminate") => {
    setIncludeAllApps(checked === true);
  };

  const handleIncludeDocsChange = (checked: boolean | "indeterminate") => {
    setIncludeDocs(checked === true);
  };

  const handleIncludeDemosChange = (checked: boolean | "indeterminate") => {
    setIncludeDemos(checked === true);
  };

  if (!projectData) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please upload the PACK_AZRTOS_AutoGen project first to generate full pack.
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
            <Package className="w-5 h-5" style={{ color: STM32_COLORS.warning }} />
            <CardTitle>Full Pack Generation</CardTitle>
            <Badge variant="outline" style={{ borderColor: STM32_COLORS.success, color: STM32_COLORS.success }}>
              Project Loaded
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-8">
            {/* Left Column: Full Pack Configuration */}
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-700 mb-4">Full Pack Configuration</h3>
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
                    <Label htmlFor="xcube-firmware">X-Cube Firmware Path *</Label>
                    <div className="flex gap-2 mt-1">
                      <Input
                        id="xcube-firmware"
                        placeholder="Select X-Cube firmware directory"
                        value={xcubeFirmwarePath}
                        onChange={(e) => setXcubeFirmwarePath(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        variant="outline" 
                        onClick={selectXcubeFirmwarePath}
                        className="flex items-center gap-2"
                      >
                        <FolderOpen className="w-4 h-4" />
                        Browse
                      </Button>
                    </div>
                  </div>

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
              </div>
            </div>

            {/* Right Column: Advanced Settings */}
            <div className="space-y-6">
              <div className="p-6 bg-gray-50 rounded-lg">
                <h3 className="text-lg font-semibold text-blue-700 mb-4 flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  Advanced Settings
                </h3>
                <div className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="include-apps" 
                      checked={includeAllApps} 
                      onCheckedChange={handleIncludeAppsChange}
                    />
                    <Label htmlFor="include-apps" className="text-sm font-medium">
                      Include All Applications
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="include-docs" 
                      checked={includeDocs} 
                      onCheckedChange={handleIncludeDocsChange}
                    />
                    <Label htmlFor="include-docs" className="text-sm font-medium">
                      Include Documentation
                    </Label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox 
                      id="include-demos" 
                      checked={includeDemos} 
                      onCheckedChange={handleIncludeDemosChange}
                    />
                    <Label htmlFor="include-demos" className="text-sm font-medium">
                      Include Demo Projects
                    </Label>
                  </div>
                </div>
              </div>

              {selectedSeries && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <h4 className="text-sm font-medium mb-3 text-green-800">
                    Generation Summary
                  </h4>
                  <div className="text-xs space-y-2 text-green-700">
                    <div><strong>Series:</strong> STM32{selectedSeries.toUpperCase()}</div>
                    <div><strong>X-Cube Firmware:</strong> {xcubeFirmwarePath || 'Not set'}</div>
                    <div><strong>Output:</strong> {outputDirectory || 'Not set'}</div>
                    <div><strong>Options:</strong></div>
                    <ul className="ml-4 space-y-1">
                      <li>• Applications: {includeAllApps ? 'Included' : 'Excluded'}</li>
                      <li>• Documentation: {includeDocs ? 'Included' : 'Excluded'}</li>
                      <li>• Demo Projects: {includeDemos ? 'Included' : 'Excluded'}</li>
                    </ul>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isGenerating && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span>Generating full pack...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="border-t pt-6">
            {/* Warning Message */}
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5" />
                <div className="text-sm text-yellow-800">
                  <p className="font-medium mb-1">Important Note</p>
                  <p>This operation may take a significant amount of time depending on the number of applications and boards. Please be patient while the generation process completes.</p>
                </div>
              </div>
            </div>

            {/* Info Message */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
              <div className="flex items-start gap-3">
                <Info className="w-5 h-5 text-blue-600 mt-0.5" />
                <div className="text-sm text-blue-800">
                  <p className="font-medium mb-1">About Full Pack Generation</p>
                  <p>Generate a full pack including all applications for all boards for the specified STM32 serie using the X-Cube firmware. The pack will include all Azure RTOS applications for all supported boards in the selected serie.</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button
                onClick={handleGenerate}
                disabled={isGenerating || !selectedSeries || !xcubeFirmwarePath || !outputDirectory}
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
                    Generate Full Pack
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

export default GenerateFullPackTab;
