
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Cog, Play, FileText, CheckCircle } from 'lucide-react';
import { STM32_COLORS } from '@/styles/stm32-theme';

const GenerateMXTab: React.FC = () => {
  const [selectedSeries, setSelectedSeries] = useState('');
  const [projectName, setProjectName] = useState('');
  const [outputPath, setOutputPath] = useState('./output');
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const stm32Series = [
    { value: 'f4', label: 'STM32F4 Series', description: 'High-performance ARM Cortex-M4' },
    { value: 'f7', label: 'STM32F7 Series', description: 'Very high-performance ARM Cortex-M7' },
    { value: 'h7', label: 'STM32H7 Series', description: 'High-performance dual core ARM Cortex-M7/M4' },
    { value: 'h7rs', label: 'STM32H7RS Series', description: 'High-performance with enhanced security' },
    { value: 'l4', label: 'STM32L4 Series', description: 'Ultra-low-power ARM Cortex-M4' },
    { value: 'l5', label: 'STM32L5 Series', description: 'Ultra-low-power with TrustZone' },
    { value: 'g4', label: 'STM32G4 Series', description: 'Mainstream mixed-signal MCUs' },
    { value: 'wb', label: 'STM32WB Series', description: 'Wireless dual core ARM Cortex-M4/M0+' },
    { value: 'wl', label: 'STM32WL Series', description: 'Wireless LoRa long range' },
  ];

  const handleGenerate = async () => {
    if (!selectedSeries || !projectName) {
      (window as any).addConsoleLog?.('error', 'Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    (window as any).addConsoleLog?.('info', `Starting MX file generation for ${projectName}...`);

    // Simulate generation process
    const steps = [
      'Validating configuration...',
      'Loading STM32 series templates...',
      'Generating IOC configuration...',
      'Creating project structure...',
      'Generating middleware configuration...',
      'Finalizing MX files...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setProgress(((i + 1) / steps.length) * 100);
      (window as any).addConsoleLog?.('info', steps[i]);
    }

    (window as any).addConsoleLog?.('success', `MX files generated successfully for ${projectName}`);
    (window as any).addConsoleLog?.('info', `Output saved to: ${outputPath}/${projectName}`);
    
    setIsGenerating(false);
  };

  return (
    <div className="space-y-6">
      {/* Configuration Card */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Cog className="w-5 h-5" style={{ color: STM32_COLORS.primary }} />
            <CardTitle>MX File Generation Configuration</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="project-name">Project Name *</Label>
                <Input
                  id="project-name"
                  placeholder="Enter project name"
                  value={projectName}
                  onChange={(e) => setProjectName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="stm32-series">STM32 Series *</Label>
                <Select value={selectedSeries} onValueChange={setSelectedSeries}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select STM32 series" />
                  </SelectTrigger>
                  <SelectContent>
                    {stm32Series.map((series) => (
                      <SelectItem key={series.value} value={series.value}>
                        <div>
                          <div className="font-medium">{series.label}</div>
                          <div className="text-xs text-gray-500">{series.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="output-path">Output Path</Label>
                <Input
                  id="output-path"
                  placeholder="./output"
                  value={outputPath}
                  onChange={(e) => setOutputPath(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-4">
              {selectedSeries && (
                <Card className="bg-gray-50">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm">Series Information</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span>Architecture:</span>
                        <Badge variant="secondary">ARM Cortex-M</Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Azure RTOS:</span>
                        <Badge variant="secondary" style={{ backgroundColor: STM32_COLORS.success, color: 'white' }}>
                          Supported
                        </Badge>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>Templates:</span>
                        <Badge variant="secondary">Available</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-sm mb-2" style={{ color: STM32_COLORS.primary }}>
                  What will be generated:
                </h4>
                <ul className="text-sm space-y-1" style={{ color: STM32_COLORS.textSecondary }}>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: STM32_COLORS.success }} />
                    STM32CubeMX .ioc configuration file
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: STM32_COLORS.success }} />
                    Azure RTOS middleware configuration
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4" style={{ color: STM32_COLORS.success }} />
                    Project structure and templates
                  </li>
                </ul>
              </div>
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
              disabled={isGenerating || !selectedSeries || !projectName}
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

            <Button variant="outline" className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              View Documentation
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GenerateMXTab;
