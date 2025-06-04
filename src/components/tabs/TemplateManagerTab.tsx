
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
  Plus, 
  Edit, 
  Eye, 
  Trash2, 
  Search, 
  AlertTriangle, 
  Save, 
  RotateCcw,
  Code,
  Copy,
  FolderOpen
} from 'lucide-react';
import { STM32_COLORS } from '@/styles/stm32-theme';
import { STM32TemplateParser, type UserCodeSection } from '@/utils/templateManager';
import { parseProjectData, getBoardsForSeries, getMiddlewareForBoard, getApplicationsForMiddleware } from '@/utils/projectParser';

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
      const parsed = parseProjectData(projectData);
      setAvailableSeries(parsed.series);
      loadDefaultTemplate();
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
    }
  }, [selectedSeries, projectData]);

  // Update middleware when board changes
  useEffect(() => {
    if (selectedBoard && projectData) {
      const middleware = getMiddlewareForBoard(selectedBoard, projectData);
      setAvailableMiddleware(middleware);
      setSelectedMiddleware('');
      setSelectedApplication('');
    }
  }, [selectedBoard, projectData]);

  // Update applications when middleware changes
  useEffect(() => {
    if (selectedBoard && selectedMiddleware && projectData) {
      const applications = getApplicationsForMiddleware(selectedBoard, selectedMiddleware, projectData);
      setAvailableApplications(applications);
      setSelectedApplication('');
      loadTemplateFiles();
    }
  }, [selectedBoard, selectedMiddleware, projectData]);

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
    setSelectedTemplate('default_template.j2');
    updatePreview();
  };

  const loadTemplateFiles = () => {
    // Mock template files - in real implementation, this would load from the project
    const mockTemplates = [
      'app_azure_rtos.c.j2',
      'app_threadx.c.j2',
      'main.c.j2',
      'stm32_hal_msp.c.j2'
    ];
    setTemplates(mockTemplates);
  };

  const handleTemplateSelect = (templateName: string) => {
    setSelectedTemplate(templateName);
    setSelectedSection(null);
    setSectionContent('');
    
    // Load template content (mock)
    loadDefaultTemplate();
    (window as any).addConsoleLog?.('info', `Template loaded: ${templateName}`);
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
        // Mark as saved
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
    <div className="space-y-6">
      {/* Configuration Panel */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="w-5 h-5" style={{ color: STM32_COLORS.warning }} />
            <CardTitle>Template Configuration</CardTitle>
            <Badge variant="outline" style={{ borderColor: STM32_COLORS.success, color: STM32_COLORS.success }}>
              Project Loaded
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Series</label>
              <Select value={selectedSeries} onValueChange={setSelectedSeries}>
                <SelectTrigger>
                  <SelectValue placeholder="Select series" />
                </SelectTrigger>
                <SelectContent>
                  {availableSeries.map((series) => (
                    <SelectItem key={series} value={series}>
                      STM32{series.toUpperCase()}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Board</label>
              <Select value={selectedBoard} onValueChange={setSelectedBoard}>
                <SelectTrigger>
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

            <div>
              <label className="text-sm font-medium">Middleware</label>
              <Select value={selectedMiddleware} onValueChange={setSelectedMiddleware}>
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
              <label className="text-sm font-medium">Application</label>
              <Select value={selectedApplication} onValueChange={setSelectedApplication}>
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
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Template Editor */}
      <div className="grid grid-cols-12 gap-6">
        {/* Template Files Panel */}
        <div className="col-span-3">
          <Card className="h-[600px]">
            <CardHeader>
              <CardTitle className="text-sm">Template Files</CardTitle>
              <div className="flex items-center gap-2">
                <Search className="w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search templates..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="text-sm"
                />
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="p-4 space-y-2">
                  {filteredTemplates.map((template) => (
                    <div
                      key={template}
                      className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:bg-gray-100 ${
                        selectedTemplate === template ? 'bg-blue-50 border border-blue-200' : ''
                      }`}
                      onClick={() => handleTemplateSelect(template)}
                    >
                      <FileText className="w-4 h-4 text-gray-500" />
                      <span className="text-sm">{template}</span>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Sections Panel */}
        <div className="col-span-3">
          <Card className="h-[600px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">Template Sections</CardTitle>
                <label className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={showOnlyUserCode}
                    onChange={(e) => setShowOnlyUserCode(e.target.checked)}
                  />
                  User Code Only
                </label>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="p-4">
                  {Object.entries(getSectionsByType()).map(([category, sectionIds]) => {
                    if (sectionIds.length === 0) return null;
                    
                    return (
                      <div key={category} className="mb-4">
                        <h4 className="text-xs font-semibold text-gray-600 mb-2">{category}</h4>
                        <div className="space-y-1">
                          {sectionIds.map((sectionId) => {
                            const section = sections.get(sectionId) || nonUserSections.find(s => s.sectionId === sectionId);
                            const isReadOnly = section?.readOnly || false;
                            const isModified = section && !section.readOnly && section.modified;
                            
                            return (
                              <div
                                key={sectionId}
                                className={`flex items-center justify-between p-2 rounded cursor-pointer text-xs ${
                                  selectedSection === sectionId ? 'bg-blue-50 border border-blue-200' : 'hover:bg-gray-50'
                                } ${isReadOnly ? 'bg-red-50' : 'bg-green-50'}`}
                                onClick={() => handleSectionSelect(sectionId)}
                              >
                                <span className="truncate">{sectionId}</span>
                                <div className="flex items-center gap-1">
                                  {isModified && <div className="w-2 h-2 bg-yellow-500 rounded-full" />}
                                  <Badge variant={isReadOnly ? "destructive" : "default"} className="text-xs">
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
          <Card className="h-[600px]">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm">
                  {selectedSection ? `Editing: ${selectedSection}` : 'Code Editor'}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={resetCurrentSection}
                    disabled={!selectedSection}
                  >
                    <RotateCcw className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    onClick={saveCurrentSection}
                    disabled={!selectedSection}
                    style={{ backgroundColor: STM32_COLORS.primary }}
                  >
                    <Save className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Textarea
                value={sectionContent}
                onChange={(e) => handleSectionContentChange(e.target.value)}
                placeholder={selectedSection ? "Edit your code here..." : "Select a section to edit"}
                className="h-[400px] font-mono text-sm"
                disabled={!selectedSection || sections.get(selectedSection || '')?.readOnly}
              />
              <div className="flex items-center justify-between mt-4">
                <div className="text-xs text-gray-500">
                  {selectedSection && sections.get(selectedSection)?.readOnly && "This section is read-only"}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={updatePreview}
                  >
                    <Code className="w-4 h-4 mr-1" />
                    Update Preview
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={copyToClipboard}
                  >
                    <Copy className="w-4 h-4 mr-1" />
                    Copy
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Preview Panel */}
      <Card>
        <CardHeader>
          <CardTitle>Generated Code Preview</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-50 p-4 rounded text-sm overflow-auto max-h-96 font-mono">
            {previewContent || 'No preview available. Select a template and generate code.'}
          </pre>
        </CardContent>
      </Card>
    </div>
  );
};

export default TemplateManagerTab;
