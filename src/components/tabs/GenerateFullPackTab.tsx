import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Package, Play, CheckCircle } from 'lucide-react';
import { STM32_COLORS } from '@/styles/stm32-theme';

const GenerateFullPackTab: React.FC = () => {
  const [selectedSeries, setSelectedSeries] = useState('');
  const [packName, setPackName] = useState('');
  const [includeAllApps, setIncludeAllApps] = useState(true);
  const [includeDocumentation, setIncludeDocumentation] = useState(true);
  const [includeExamples, setIncludeExamples] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleGenerate = async () => {
    if (!selectedSeries || !packName) {
      (window as any).addConsoleLog?.('error', 'Please fill in all required fields');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    (window as any).addConsoleLog?.('info', `Starting full pack generation for ${packName}...`);

    const steps = [
      'Initializing pack generation...',
      'Loading all application templates...',
      'Generating ThreadX applications...',
      'Generating FileX applications...',
      'Generating NetX Duo applications...',
      'Generating USBX applications...',
      'Creating documentation...',
      'Building pack structure...',
      'Finalizing full pack...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1500));
      setProgress(((i + 1) / steps.length) * 100);
      (window as any).addConsoleLog?.('info', steps[i]);
    }

    (window as any).addConsoleLog?.('success', `Full pack ${packName} generated successfully`);
    (window as any).addConsoleLog?.('info', `Pack includes all applications and documentation for STM32${selectedSeries.toUpperCase()} series`);
    setIsGenerating(false);
  };

  const packFeatures = [
    'All Azure RTOS middleware applications',
    'Complete STM32CubeMX configurations',
    'Ready-to-use project templates',
    'Comprehensive documentation',
    'Example applications and demos',
    'Board-specific configurations'
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5" style={{ color: STM32_COLORS.success }} />
            <CardTitle>Full Pack Generation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="full-pack-name">Full Pack Name *</Label>
                <Input
                  id="full-pack-name"
                  placeholder="Enter full pack name"
                  value={packName}
                  onChange={(e) => setPackName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="series-select-full">STM32 Series *</Label>
                <Select value={selectedSeries} onValueChange={setSelectedSeries}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select STM32 series" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="f4">STM32F4 Series</SelectItem>
                    <SelectItem value="f7">STM32F7 Series</SelectItem>
                    <SelectItem value="h7">STM32H7 Series</SelectItem>
                    <SelectItem value="l4">STM32L4 Series</SelectItem>
                    <SelectItem value="g4">STM32G4 Series</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <Label>Pack Options</Label>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-all-apps"
                    checked={includeAllApps}
                    onCheckedChange={(checked) => setIncludeAllApps(checked === true)}
                  />
                  <label htmlFor="include-all-apps" className="text-sm font-medium">
                    Include all applications
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-docs"
                    checked={includeDocumentation}
                    onCheckedChange={(checked) => setIncludeDocumentation(checked === true)}
                  />
                  <label htmlFor="include-docs" className="text-sm font-medium">
                    Include documentation
                  </label>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="include-examples"
                    checked={includeExamples}
                    onCheckedChange={(checked) => setIncludeExamples(checked === true)}
                  />
                  <label htmlFor="include-examples" className="text-sm font-medium">
                    Include example projects
                  </label>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <Card className="bg-green-50">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm">Pack Contents</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {packFeatures.map((feature, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <CheckCircle className="w-4 h-4" style={{ color: STM32_COLORS.success }} />
                        {feature}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {selectedSeries && (
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h4 className="font-medium text-sm mb-3" style={{ color: STM32_COLORS.primary }}>
                    Estimated Pack Size:
                  </h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Applications:</span>
                      <Badge variant="secondary">~25 projects</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Documentation:</span>
                      <Badge variant="secondary">~50 MB</Badge>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span>Total Size:</span>
                      <Badge variant="secondary">~200 MB</Badge>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Generating full pack...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedSeries || !packName}
              className="flex items-center gap-2"
              style={{ backgroundColor: STM32_COLORS.success }}
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
        </CardContent>
      </Card>
    </div>
  );
};

export default GenerateFullPackTab;
