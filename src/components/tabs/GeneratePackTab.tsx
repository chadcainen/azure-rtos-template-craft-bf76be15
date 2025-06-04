
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Zap, Play, Package, AlertTriangle } from 'lucide-react';
import { STM32_COLORS } from '@/styles/stm32-theme';

interface GeneratePackTabProps {
  projectData?: any;
}

const GeneratePackTab: React.FC<GeneratePackTabProps> = ({ projectData }) => {
  const [selectedSeries, setSelectedSeries] = useState('');
  const [packName, setPackName] = useState('');
  const [packVersion, setPackVersion] = useState('1.0.0');
  const [selectedMiddleware, setSelectedMiddleware] = useState<string[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [progress, setProgress] = useState(0);

  const middleware = [
    { id: 'threadx', name: 'ThreadX', description: 'Real-time operating system' },
    { id: 'filex', name: 'FileX', description: 'Embedded file system' },
    { id: 'netxduo', name: 'NetX Duo', description: 'TCP/IP network stack' },
    { id: 'usbx', name: 'USBX', description: 'USB host and device stack' },
    { id: 'levelx', name: 'LevelX', description: 'NAND flash wear leveling' },
  ];

  const handleMiddlewareChange = (middlewareId: string, checked: boolean) => {
    if (checked) {
      setSelectedMiddleware([...selectedMiddleware, middlewareId]);
    } else {
      setSelectedMiddleware(selectedMiddleware.filter(id => id !== middlewareId));
    }
  };

  const handleGenerate = async () => {
    if (!selectedSeries || !packName || selectedMiddleware.length === 0) {
      (window as any).addConsoleLog?.('error', 'Please fill in all required fields and select middleware');
      return;
    }

    setIsGenerating(true);
    setProgress(0);

    (window as any).addConsoleLog?.('info', `Starting pack generation for ${packName}...`);

    const steps = [
      'Validating pack configuration...',
      'Loading middleware templates...',
      'Generating pack descriptor...',
      'Creating middleware configurations...',
      'Building pack structure...',
      'Generating documentation...',
      'Finalizing pack...'
    ];

    for (let i = 0; i < steps.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setProgress(((i + 1) / steps.length) * 100);
      (window as any).addConsoleLog?.('info', steps[i]);
    }

    (window as any).addConsoleLog?.('success', `Pack ${packName} v${packVersion} generated successfully`);
    setIsGenerating(false);
  };

  if (!projectData) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please upload the PACK_AZRTOS_AutoGen project first to generate pack files.
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
            <Zap className="w-5 h-5" style={{ color: STM32_COLORS.secondary }} />
            <CardTitle>Firmware Pack Generation</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="pack-name">Pack Name *</Label>
                <Input
                  id="pack-name"
                  placeholder="Enter pack name"
                  value={packName}
                  onChange={(e) => setPackName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="pack-version">Pack Version</Label>
                <Input
                  id="pack-version"
                  placeholder="1.0.0"
                  value={packVersion}
                  onChange={(e) => setPackVersion(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="series-select">Target STM32 Series *</Label>
                <Select value={selectedSeries} onValueChange={setSelectedSeries}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select target series" />
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
            </div>

            <div className="space-y-4">
              <div>
                <Label>Azure RTOS Middleware *</Label>
                <div className="mt-2 space-y-3">
                  {middleware.map((mw) => (
                    <div key={mw.id} className="flex items-start gap-3">
                      <Checkbox
                        id={mw.id}
                        checked={selectedMiddleware.includes(mw.id)}
                        onCheckedChange={(checked) => handleMiddlewareChange(mw.id, checked as boolean)}
                      />
                      <div>
                        <label htmlFor={mw.id} className="text-sm font-medium cursor-pointer">
                          {mw.name}
                        </label>
                        <p className="text-xs text-gray-500">{mw.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {selectedMiddleware.length > 0 && (
                <div className="p-3 bg-green-50 rounded-lg">
                  <h4 className="text-sm font-medium mb-2" style={{ color: STM32_COLORS.success }}>
                    Selected Components ({selectedMiddleware.length})
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {selectedMiddleware.map((mwId) => {
                      const mw = middleware.find(m => m.id === mwId);
                      return (
                        <Badge key={mwId} variant="secondary" className="text-xs">
                          {mw?.name}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>

          {isGenerating && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Generating firmware pack...</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleGenerate}
              disabled={isGenerating || !selectedSeries || !packName || selectedMiddleware.length === 0}
              className="flex items-center gap-2"
              style={{ backgroundColor: STM32_COLORS.secondary }}
            >
              {isGenerating ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Generating...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Generate Pack
                </>
              )}
            </Button>

            <Button variant="outline" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              View Pack Structure
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GeneratePackTab;
