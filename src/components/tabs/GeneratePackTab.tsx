
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Zap, 
  Package, 
  Settings, 
  AlertTriangle, 
  CheckCircle, 
  FileText,
  Download,
  Play,
  Layers
} from 'lucide-react';
import { STM32_COLORS } from '@/styles/stm32-theme';
import { 
  getBoardsForSeries, 
  getMiddlewareForBoard, 
  getApplicationsForMiddleware,
  parseProjectData
} from '@/utils/projectParser';

interface GeneratePackTabProps {
  projectData?: any;
}

const GeneratePackTab: React.FC<GeneratePackTabProps> = ({ projectData }) => {
  const [selectedSeries, setSelectedSeries] = useState('');
  const [selectedBoards, setSelectedBoards] = useState<string[]>([]);
  const [selectedMiddleware, setSelectedMiddleware] = useState<string[]>([]);
  const [packVersion, setPackVersion] = useState('1.0.0');
  const [packName, setPackName] = useState('STM32_AzureRTOS_Pack');
  const [includeExamples, setIncludeExamples] = useState(true);
  const [includeDocumentation, setIncludeDocumentation] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  
  const [availableSeries, setAvailableSeries] = useState<string[]>([]);
  const [availableBoards, setAvailableBoards] = useState<string[]>([]);
  const [availableMiddleware, setAvailableMiddleware] = useState<string[]>([]);

  // Initialize data from project
  useEffect(() => {
    if (projectData) {
      const parsedData = parseProjectData(projectData);
      setAvailableSeries(parsedData.series);
      setAvailableMiddleware(['ThreadX', 'NetXDuo', 'FileX', 'USBX']);
      (window as any).addConsoleLog?.('info', 'Pack Generator initialized with project data');
    }
  }, [projectData]);

  // Update boards when series changes
  useEffect(() => {
    if (selectedSeries && projectData) {
      const boards = getBoardsForSeries(selectedSeries, projectData);
      setAvailableBoards(boards);
      setSelectedBoards([]);
    }
  }, [selectedSeries, projectData]);

  const handleBoardToggle = (board: string) => {
    setSelectedBoards(prev => 
      prev.includes(board) 
        ? prev.filter(b => b !== board)
        : [...prev, board]
    );
  };

  const handleMiddlewareToggle = (middleware: string) => {
    setSelectedMiddleware(prev => 
      prev.includes(middleware) 
        ? prev.filter(m => m !== middleware)
        : [...prev, middleware]
    );
  };

  const handleGenerate = async () => {
    if (!selectedSeries || selectedBoards.length === 0 || selectedMiddleware.length === 0) {
      (window as any).addConsoleLog?.('error', 'Please select series, boards, and middleware components');
      return;
    }

    setIsGenerating(true);
    setGenerationStatus('idle');
    
    try {
      (window as any).addConsoleLog?.('info', `Generating pack for ${selectedSeries} with ${selectedBoards.length} boards and ${selectedMiddleware.length} middleware components`);
      
      // Simulate generation process
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      setGenerationStatus('success');
      (window as any).addConsoleLog?.('success', `Pack ${packName} v${packVersion} generated successfully`);
    } catch (error) {
      setGenerationStatus('error');
      (window as any).addConsoleLog?.('error', 'Failed to generate pack');
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
            Please upload the PACK_AZRTOS_AutoGen project first to generate pack files.
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
                <Package className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">STM32 Pack Generator</h1>
                <p className="text-blue-200 mt-1">Professional CMSIS Pack Generation for Azure RTOS</p>
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
        {/* Pack Configuration */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6" />
              <CardTitle className="text-xl">Pack Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  Pack Name
                </label>
                <Input
                  value={packName}
                  onChange={(e) => setPackName(e.target.value)}
                  placeholder="Enter pack name"
                  className="h-12 border-2 border-blue-200 focus:border-blue-500 bg-white"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                  Pack Version
                </label>
                <Input
                  value={packVersion}
                  onChange={(e) => setPackVersion(e.target.value)}
                  placeholder="1.0.0"
                  className="h-12 border-2 border-purple-200 focus:border-purple-500 bg-white"
                />
              </div>

              <div className="space-y-3">
                <label className="text-sm font-bold text-gray-700 flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  STM32 Series
                </label>
                <Select value={selectedSeries} onValueChange={setSelectedSeries}>
                  <SelectTrigger className="h-12 border-2 border-green-200 focus:border-green-500 bg-white">
                    <SelectValue placeholder="Select series" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-2 border-green-200">
                    {availableSeries.map((series) => (
                      <SelectItem key={series} value={series}>
                        <span className="font-medium">STM32{series.toUpperCase()}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Board Selection */}
        {availableBoards.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
            <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
              <CardTitle className="text-xl flex items-center gap-3">
                <Layers className="w-6 h-6" />
                Development Boards ({selectedSeries.toUpperCase()})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {availableBoards.map((board) => (
                  <div
                    key={board}
                    className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                      selectedBoards.includes(board)
                        ? 'bg-gradient-to-r from-green-100 to-teal-100 border-green-300 shadow-md'
                        : 'bg-white border-gray-200 hover:border-green-300 hover:shadow-sm'
                    }`}
                    onClick={() => handleBoardToggle(board)}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900">{board}</h4>
                        <p className="text-sm text-gray-500 mt-1">
                          STM32{selectedSeries.toUpperCase()} Development Board
                        </p>
                      </div>
                      {selectedBoards.includes(board) && (
                        <CheckCircle className="w-5 h-5 text-green-600" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Middleware Selection */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-3">
              <Package className="w-6 h-6" />
              Azure RTOS Middleware Components
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {availableMiddleware.map((middleware) => (
                <div
                  key={middleware}
                  className={`p-4 rounded-xl border-2 cursor-pointer transition-all duration-200 ${
                    selectedMiddleware.includes(middleware)
                      ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-purple-300 shadow-md'
                      : 'bg-white border-gray-200 hover:border-purple-300 hover:shadow-sm'
                  }`}
                  onClick={() => handleMiddlewareToggle(middleware)}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{middleware}</h4>
                      <p className="text-sm text-gray-500 mt-1">
                        Azure RTOS Component
                      </p>
                    </div>
                    {selectedMiddleware.includes(middleware) && (
                      <CheckCircle className="w-5 h-5 text-purple-600" />
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pack Options */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-3">
              <FileText className="w-6 h-6" />
              Pack Generation Options
            </CardTitle>
          </CardHeader>
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="includeExamples"
                      checked={includeExamples}
                      onCheckedChange={(checked) => setIncludeExamples(checked as boolean)}
                      className="w-5 h-5"
                    />
                    <label htmlFor="includeExamples" className="text-sm font-medium text-gray-700">
                      Include Example Projects
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 ml-8">
                    Add ready-to-use example projects for each selected middleware component
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <Checkbox
                      id="includeDocumentation"
                      checked={includeDocumentation}
                      onCheckedChange={(checked) => setIncludeDocumentation(checked as boolean)}
                      className="w-5 h-5"
                    />
                    <label htmlFor="includeDocumentation" className="text-sm font-medium text-gray-700">
                      Include Documentation
                    </label>
                  </div>
                  <p className="text-sm text-gray-500 ml-8">
                    Add comprehensive documentation and API references
                  </p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="space-y-2">
                    <h4 className="font-medium text-gray-900">Pack Summary</h4>
                    <div className="flex flex-wrap gap-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        Series: STM32{selectedSeries.toUpperCase()}
                      </Badge>
                      <Badge className="bg-green-100 text-green-800">
                        Boards: {selectedBoards.length}
                      </Badge>
                      <Badge className="bg-purple-100 text-purple-800">
                        Middleware: {selectedMiddleware.length}
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button
                      onClick={handleGenerate}
                      disabled={isGenerating || !selectedSeries || selectedBoards.length === 0 || selectedMiddleware.length === 0}
                      className="bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700 text-white px-8 py-3 h-12"
                    >
                      {isGenerating ? (
                        <>
                          <div className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full mr-2" />
                          Generating Pack...
                        </>
                      ) : (
                        <>
                          <Play className="w-5 h-5 mr-2" />
                          Generate Pack
                        </>
                      )}
                    </Button>
                    
                    {generationStatus === 'success' && (
                      <Button variant="outline" className="flex items-center gap-2">
                        <Download className="w-4 h-4" />
                        Download Pack
                      </Button>
                    )}
                  </div>
                </div>

                {generationStatus === 'success' && (
                  <div className="flex items-center gap-2 text-green-600 mt-4">
                    <CheckCircle className="w-5 h-5" />
                    <span className="font-medium">Pack generation completed successfully!</span>
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

export default GeneratePackTab;
