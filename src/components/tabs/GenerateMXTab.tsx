
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Cog, Play, AlertTriangle, FolderOpen } from 'lucide-react';
import { STM32_COLORS } from '@/styles/stm32-theme';
import { parseProjectData } from '@/utils/projectParser';
import { backendInterface } from '@/utils/backendInterface';

interface GenerateMXTabProps {
  projectData?: any;
}

const GenerateMXTab: React.FC<GenerateMXTabProps> = ({ projectData }) => {
  const [selectedSeries, setSelectedSeries] = useState('');
  const [outputDirectory, setOutputDirectory] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);
  const [availableSeries, setAvailableSeries] = useState<string[]>([]);

  useEffect(() => {
    if (projectData) {
      const parsed = parseProjectData(projectData);
      setAvailableSeries(parsed.series);
      
      // Set default output directory from project
      if (projectData.projectPath) {
        setOutputDirectory(`${projectData.projectPath}/Generated/MX_Files`);
      }
    }
  }, [projectData]);

  const handleGenerate = async () => {
    if (!selectedSeries || !outputDirectory) {
      (window as any).addConsoleLog?.('error', 'Please select STM32 series and output directory');
      return;
    }

    if (!projectData) {
      (window as any).addConsoleLog?.('error', 'No project loaded. Please upload PACK_AZRTOS_AutoGen project first.');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    try {
      // Simulate progress updates
      const progressInterval = setInterval(() => {
        setProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 15;
        });
      }, 1000);

      const result = await backendInterface.generateMXFiles({
        series: selectedSeries,
        outputDirectory: outputDirectory
      });

      clearInterval(progressInterval);
      setProgress(100);

      if (result.success) {
        (window as any).addConsoleLog?.('success', result.message);
        if (result.outputPath) {
          (window as any).addConsoleLog?.('info', `Files saved to: ${result.outputPath}`);
        }
      } else {
        (window as any).addConsoleLog?.('error', result.message);
        if (result.error) {
          (window as any).addConsoleLog?.('error', `Error details: ${result.error}`);
        }
      }
    } catch (error) {
      (window as any).addConsoleLog?.('error', `Generation failed: ${error}`);
    } finally {
      setIsGenerating(false);
      setTimeout(() => setProgress(0), 2000);
    }
  };

  const selectOutputDirectory = () => {
    // In a real implementation, this would open a directory picker
    const defaultPath = projectData?.projectPath ? 
      `${projectData.projectPath}/Generated/MX_Files` : 
      './Generated/MX_Files';
    setOutputDirectory(defaultPath);
    (window as any).addConsoleLog?.('info', `Output directory set to: ${defaultPath}`);
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
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cog className="w-5 h-5" style={{ color: STM32_COLORS.primary }} />
            <CardTitle>MX File Generation</CardTitle>
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
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="text-sm font-medium mb-2" style={{ color: STM32_COLORS.primary }}>
                  Project Information
                </h4>
                <div className="text-xs space-y-1">
                  <div>Project: PACK_AZRTOS_AutoGen</div>
                  <div>Available Series: {availableSeries.length} found</div>
                  {projectData.projectPath && (
                    <div>Path: {projectData.projectPath}</div>
                  )}
                </div>
              </div>

              {selectedSeries && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2" style={{ color: STM32_COLORS.success }}>
                    Generation Target
                  </h4>
                  <div className="text-xs">
                    <div>Series: STM32{selectedSeries.toUpperCase()}</div>
                    <div>Output: {outputDirectory || 'Not selected'}</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Generating MX files...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedSeries || !outputDirectory}
              className="flex items-center gap-2"
              style={{ backgroundColor: STM32_COLORS.primary }}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Generate MX Files
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenerateMXTab;
