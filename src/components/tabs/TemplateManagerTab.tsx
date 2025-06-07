
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { 
  FileText, 
  Edit, 
  Eye, 
  Search, 
  AlertTriangle, 
  Save, 
  RotateCcw,
  Code,
  Copy,
  FolderOpen,
  Settings,
  Palette,
  Zap
} from 'lucide-react';
import { STM32_COLORS } from '@/styles/stm32-theme';
import { STM32TemplateParser, type UserCodeSection } from '@/utils/templateManager';
import { 
  getBoardsForSeries, 
  getMiddlewareForBoard, 
  getApplicationsForMiddleware,
  getTemplateFiles,
  getFileContent,
  parseProjectData
} from '@/utils/projectParser';

interface TemplateManagerTabProps {
  projectData?: any;
}

const TemplateManagerTab: React.FC<TemplateManagerTabProps> = ({ projectData }) => {
  const [selectedSeries, setSelectedSeries] = useState('');
  const [selectedBoard, setSelectedBoard] = useState('');
  const [selectedMiddleware, setSelectedMiddleware] = useState('');
  const [selectedApplication, setSelectedApplication] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [selectedSection, setSelectedSection] = useState<string | null>(null);
  const [sectionContent, setSectionContent] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [showOnlyUserCode, setShowOnlyUserCode] = useState(false);
  
  const [parser] = useState(() => new STM32TemplateParser());
  const [sections, setSections] = useState<Map<string, UserCodeSection>>(new Map());
  const [nonUserSections, setNonUserSections] = useState<UserCodeSection[]>([]);
  const [templates, setTemplates] = useState<string[]>([]);
  const [previewContent, setPreviewContent] = useState('');
  
  const [availableSeries, setAvailableSeries] = useState<string[]>([]);
  const [availableBoards, setAvailableBoards] = useState<string[]>([]);
  const [availableMiddleware, setAvailableMiddleware] = useState<string[]>([]);
  const [availableApplications, setAvailableApplications] = useState<string[]>([]);

  // Initialize data from project
  useEffect(() => {
    if (projectData) {
      const parsedData = parseProjectData(projectData);
      setAvailableSeries(parsedData.series);
      (window as any).addConsoleLog?.('info', 'Template Manager initialized with project data');
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
      setTemplates([]);
      if (boards.length > 0) {
        setSelectedBoard(boards[0]);
      }
    }
  }, [selectedSeries, projectData]);

  // Update middleware when board changes
  useEffect(() => {
    if (selectedBoard && projectData) {
      const middleware = getMiddlewareForBoard(selectedBoard, projectData);
      setAvailableMiddleware(middleware);
      setSelectedMiddleware('');
      setSelectedApplication('');
      setTemplates([]);
      if (middleware.length > 0) {
        setSelectedMiddleware(middleware[0]);
      }
    }
  }, [selectedBoard, projectData]);

  // Update applications when middleware changes
  useEffect(() => {
    if (selectedBoard && selectedMiddleware && projectData) {
      const applications = getApplicationsForMiddleware(selectedBoard, selectedMiddleware, projectData);
      setAvailableApplications(applications);
      setSelectedApplication('');
      setTemplates([]);
      if (applications.length > 0) {
        setSelectedApplication(applications[0]);
      }
    }
  }, [selectedBoard, selectedMiddleware, projectData]);

  // Load template files when application changes
  useEffect(() => {
    if (selectedApplication && selectedMiddleware && projectData) {
      const templateFiles = getTemplateFiles(selectedMiddleware, selectedApplication, projectData);
      setTemplates(templateFiles);
      (window as any).addConsoleLog?.('info', `Loaded ${templateFiles.length} template files for ${selectedApplication}`);
    }
  }, [selectedApplication, selectedMiddleware, projectData]);

  const handleTemplateSelect = async (templateName: string) => {
    setSelectedTemplate(templateName);
    setSelectedSection(null);
    setSectionContent('');
    
    try {
      // Load template content from project
      const content = await getFileContent(templateName, projectData);
      if (content) {
        const parsedSections = parser.parseTemplate(content);
        setSections(new Map(parsedSections));
        setNonUserSections(parser.getNonUserSections());
        updatePreview();
        (window as any).addConsoleLog?.('info', `Template loaded: ${templateName}`);
      } else {
        // Load default template if file not found
        loadDefaultTemplate();
      }
    } catch (error) {
      (window as any).addConsoleLog?.('error', `Failed to load template: ${templateName}`);
      console.error('Error loading template:', error);
      loadDefaultTemplate();
    }
  };

  const loadDefaultTemplate = () => {
    const defaultTemplate = `/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file    app_azure_rtos.c
  * @author  MCD Application Team
  * @brief   Azure RTOS application for {{ app_name }}
  ******************************************************************************
  */
/* USER CODE END Header */

/* Includes ------------------------------------------------------------------*/
#include "app_azure_rtos.h"
#include "{{ series }}_hal.h"

/* USER CODE BEGIN Includes */

/* USER CODE END Includes */

/* USER CODE BEGIN PTD */

/* USER CODE END PTD */

/* USER CODE BEGIN PD */

/* USER CODE END PD */

/* USER CODE BEGIN PM */

/* USER CODE END PM */

/* USER CODE BEGIN PV */

/* USER CODE END PV */

/* USER CODE BEGIN PFP */

/* USER CODE END PFP */

/* USER CODE BEGIN 0 */

/* USER CODE END 0 */

/**
  * @brief  Initialize Azure RTOS for {{ board }}
  * @param  None
  * @retval None
  */
void MX_AZURE_RTOS_Init(void)
{
  /* USER CODE BEGIN Init */

  /* USER CODE END Init */
}

/* USER CODE BEGIN 1 */

/* USER CODE END 1 */`;

    const parsedSections = parser.parseTemplate(defaultTemplate);
    setSections(new Map(parsedSections));
    setNonUserSections(parser.getNonUserSections());
    updatePreview();
  };

  const handleSectionSelect = (sectionId: string) => {
    setSelectedSection(sectionId);
    const section = sections.get(sectionId);
    if (section && !section.readOnly) {
      setSectionContent(section.content);
    } else {
      const nonUserSection = nonUserSections.find(s => s.sectionId === sectionId);
      if (nonUserSection) {
        setSectionContent(nonUserSection.content);
      }
    }
  };

  const handleSectionContentChange = (content: string) => {
    setSectionContent(content);
    if (selectedSection) {
      parser.updateSection(selectedSection, content);
      const updatedSections = parser.getSections();
      setSections(new Map(updatedSections));
      updatePreview();
    }
  };

  const saveCurrentSection = () => {
    if (selectedSection && selectedTemplate) {
      const section = sections.get(selectedSection);
      if (section && !section.readOnly) {
        section.modified = false;
        setSections(new Map(sections));
        (window as any).addConsoleLog?.('success', `Section ${selectedSection} saved successfully`);
      }
    }
  };

  const resetCurrentSection = () => {
    if (selectedSection) {
      parser.resetSection(selectedSection);
      const section = sections.get(selectedSection);
      if (section) {
        setSectionContent(section.content);
        setSections(new Map(parser.getSections()));
        updatePreview();
        (window as any).addConsoleLog?.('info', `Section ${selectedSection} reset to original`);
      }
    }
  };

  const updatePreview = () => {
    try {
      const generatedCode = parser.generateCode();
      
      // Simple template rendering
      let rendered = generatedCode
        .replace(/\{\{\s*app_name\s*\}\}/g, selectedApplication || 'DefaultApp')
        .replace(/\{\{\s*board\s*\}\}/g, selectedBoard || 'DefaultBoard')
        .replace(/\{\{\s*series\s*\}\}/g, selectedSeries || 'DefaultSeries')
        .replace(/\{\{\s*middleware\s*\}\}/g, selectedMiddleware || 'DefaultMiddleware');
      
      setPreviewContent(rendered);
    } catch (error) {
      console.error('Error updating preview:', error);
      setPreviewContent('Error generating preview');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(previewContent).then(() => {
      (window as any).addConsoleLog?.('success', 'Generated code copied to clipboard');
    }).catch(() => {
      (window as any).addConsoleLog?.('error', 'Failed to copy to clipboard');
    });
  };

  const getSectionsByType = () => {
    const categorized = {
      'Header': [] as string[],
      'Includes': [] as string[],
      'Private Definitions': [] as string[],
      'Private Variables': [] as string[],
      'Application Code': [] as string[],
      'Template Code': [] as string[],
      'Other': [] as string[]
    };

    sections.forEach((section, sectionId) => {
      if (showOnlyUserCode && section.readOnly) return;
      
      if (sectionId.includes('Header')) {
        categorized['Header'].push(sectionId);
      } else if (sectionId.includes('Includes')) {
        categorized['Includes'].push(sectionId);
      } else if (sectionId.includes('PTD') || sectionId.includes('PD') || sectionId.includes('PM')) {
        categorized['Private Definitions'].push(sectionId);
      } else if (sectionId.includes('PV') || sectionId.includes('PFP')) {
        categorized['Private Variables'].push(sectionId);
      } else if (sectionId.includes('Init') || /\d+/.test(sectionId)) {
        categorized['Application Code'].push(sectionId);
      } else {
        categorized['Other'].push(sectionId);
      }
    });

    if (!showOnlyUserCode) {
      nonUserSections.forEach(section => {
        categorized['Template Code'].push(section.sectionId);
      });
    }

    return categorized;
  };

  const filteredTemplates = templates.filter(template =>
    template.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (!projectData) {
    return (
      <div className="space-y-6">
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Please upload the PACK_AZRTOS_AutoGen project first to manage templates.
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
                <Palette className="w-8 h-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-white">Template Manager</h1>
                <p className="text-blue-200 mt-1">Professional STM32 Template Editor with Azure RTOS</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Badge className="bg-green-500/20 text-green-100 border-green-400/30">
                <Zap className="w-4 h-4 mr-1" />
                Project Loaded
              </Badge>
              <Badge className="bg-blue-500/20 text-blue-100 border-blue-400/30">
                {sections.size} Sections
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Configuration Panel */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-t-lg">
            <div className="flex items-center gap-3">
              <Settings className="w-6 h-6" />
              <CardTitle className="text-xl">Project Configuration</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Series</label>
                <Select value={selectedSeries} onValueChange={setSelectedSeries}>
                  <SelectTrigger className="h-12 border-2 border-blue-200 focus:border-blue-500">
                    <SelectValue placeholder="Select series" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableSeries.map((series) => (
                      <SelectItem key={series} value={series}>
                        <span className="font-medium">STM32{series.toUpperCase()}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Board</label>
                <Select value={selectedBoard} onValueChange={setSelectedBoard}>
                  <SelectTrigger className="h-12 border-2 border-purple-200 focus:border-purple-500">
                    <SelectValue placeholder="Select board" />
                  </SelectTrigger>
                  <SelectContent>
                    {availableBoards.map((board) => (
                      <SelectItem key={board} value={board}>
                        {board}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Middleware</label>
                <Select value={selectedMiddleware} onValueChange={setSelectedMiddleware}>
                  <SelectTrigger className="h-12 border-2 border-green-200 focus:border-green-500">
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

              <div className="space-y-2">
                <label className="text-sm font-semibold text-gray-700">Application</label>
                <Select value={selectedApplication} onValueChange={setSelectedApplication}>
                  <SelectTrigger className="h-12 border-2 border-orange-200 focus:border-orange-500">
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
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Template Editor */}
        <div className="grid grid-cols-12 gap-8">
          {/* Template Files Panel */}
          <div className="col-span-3">
            <Card className="h-[700px] bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-green-600 to-teal-600 text-white rounded-t-lg">
                <CardTitle className="text-lg flex items-center gap-2">
                  <FolderOpen className="w-5 h-5" />
                  Template Files
                </CardTitle>
                <div className="flex items-center gap-2 mt-3">
                  <Search className="w-4 h-4 text-green-100" />
                  <Input
                    placeholder="Search templates..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="bg-white/20 border-white/30 text-white placeholder:text-green-100"
                  />
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="p-4 space-y-2">
                    {filteredTemplates.length > 0 ? filteredTemplates.map((template) => (
                      <div
                        key={template}
                        className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                          selectedTemplate === template 
                            ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300 shadow-md' 
                            : 'hover:bg-gray-50 hover:shadow-sm border border-gray-200'
                        }`}
                        onClick={() => handleTemplateSelect(template)}
                      >
                        <FileText className={`w-5 h-5 ${selectedTemplate === template ? 'text-blue-600' : 'text-gray-500'}`} />
                        <div className="flex-1 min-w-0">
                          <span className={`text-sm font-medium block truncate ${selectedTemplate === template ? 'text-blue-900' : 'text-gray-700'}`}>
                            {template.split('/').pop()}
                          </span>
                          <span className="text-xs text-gray-500 block truncate">
                            {template.split('/').slice(0, -1).join('/')}
                          </span>
                        </div>
                      </div>
                    )) : (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500 text-sm">
                          {selectedApplication ? 'No templates found' : 'Select an application to see templates'}
                        </p>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Sections Panel */}
          <div className="col-span-3">
            <Card className="h-[700px] bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Code className="w-5 h-5" />
                    Template Sections
                  </CardTitle>
                  <label className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={showOnlyUserCode}
                      onChange={(e) => setShowOnlyUserCode(e.target.checked)}
                      className="rounded"
                    />
                    User Code Only
                  </label>
                </div>
              </CardHeader>
              <CardContent className="p-0">
                <ScrollArea className="h-[600px]">
                  <div className="p-4">
                    {Object.entries(getSectionsByType()).map(([category, sectionIds]) => {
                      if (sectionIds.length === 0) return null;
                      
                      return (
                        <div key={category} className="mb-6">
                          <h4 className="text-sm font-bold text-gray-700 mb-3 flex items-center gap-2">
                            <div className={`w-3 h-3 rounded-full ${
                              category === 'Header' ? 'bg-blue-500' :
                              category === 'Includes' ? 'bg-green-500' :
                              category === 'Private Definitions' ? 'bg-yellow-500' :
                              category === 'Private Variables' ? 'bg-purple-500' :
                              category === 'Application Code' ? 'bg-red-500' :
                              'bg-gray-500'
                            }`} />
                            {category}
                          </h4>
                          <div className="space-y-2">
                            {sectionIds.map((sectionId) => {
                              const section = sections.get(sectionId) || nonUserSections.find(s => s.sectionId === sectionId);
                              const isReadOnly = section?.readOnly || false;
                              const isModified = section && !section.readOnly && section.modified;
                              
                              return (
                                <div
                                  key={sectionId}
                                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all duration-200 ${
                                    selectedSection === sectionId 
                                      ? 'bg-gradient-to-r from-blue-100 to-purple-100 border-2 border-blue-300' 
                                      : 'hover:bg-gray-50 border border-gray-200'
                                  } ${isReadOnly ? 'bg-red-50 border-red-200' : 'bg-green-50 border-green-200'}`}
                                  onClick={() => handleSectionSelect(sectionId)}
                                >
                                  <span className="text-sm font-medium truncate flex-1">{sectionId}</span>
                                  <div className="flex items-center gap-2">
                                    {isModified && <div className="w-2 h-2 bg-amber-500 rounded-full" />}
                                    <Badge 
                                      variant={isReadOnly ? "destructive" : "default"} 
                                      className="text-xs px-2 py-1"
                                    >
                                      {isReadOnly ? "RO" : "RW"}
                                    </Badge>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>

          {/* Editor Panel */}
          <div className="col-span-6">
            <Card className="h-[700px] bg-white/70 backdrop-blur-sm border-0 shadow-xl">
              <CardHeader className="bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-t-lg">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg">
                    {selectedSection ? `Editing: ${selectedSection}` : 'Code Editor'}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={resetCurrentSection}
                      disabled={!selectedSection}
                      className="bg-white/20 border-white/30 text-white hover:bg-white/30"
                    >
                      <RotateCcw className="w-4 h-4" />
                    </Button>
                    <Button
                      size="sm"
                      onClick={saveCurrentSection}
                      disabled={!selectedSection}
                      className="bg-white text-orange-600 hover:bg-white/90"
                    >
                      <Save className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <Textarea
                  value={sectionContent}
                  onChange={(e) => handleSectionContentChange(e.target.value)}
                  placeholder={selectedSection ? "Edit your code here..." : "Select a section to edit"}
                  className="h-[480px] font-mono text-sm bg-gray-50 border-2 border-gray-200 focus:border-orange-500"
                  disabled={!selectedSection || sections.get(selectedSection || '')?.readOnly}
                />
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-gray-500">
                    {selectedSection && sections.get(selectedSection)?.readOnly && (
                      <span className="text-red-600 font-medium">This section is read-only</span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={updatePreview}
                      className="flex items-center gap-2"
                    >
                      <Eye className="w-4 h-4" />
                      Update Preview
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={copyToClipboard}
                      className="flex items-center gap-2"
                    >
                      <Copy className="w-4 h-4" />
                      Copy All
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Preview Panel */}
        <Card className="bg-white/70 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader className="bg-gradient-to-r from-teal-600 to-blue-600 text-white rounded-t-lg">
            <CardTitle className="text-xl flex items-center gap-2">
              <Eye className="w-6 h-6" />
              Generated Code Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <pre className="bg-gray-900 text-green-400 p-6 rounded-lg text-sm overflow-auto max-h-96 font-mono border-2 border-gray-700">
              {previewContent || 'No preview available. Select a template and generate code.'}
            </pre>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TemplateManagerTab;
