
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileText, Plus, Edit, Eye, Trash2, Search, AlertTriangle } from 'lucide-react';
import { STM32_COLORS } from '@/styles/stm32-theme';

interface TemplateManagerTabProps {
  projectData?: any;
}

const TemplateManagerTab: React.FC<TemplateManagerTabProps> = ({ projectData }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);
  const [templates, setTemplates] = useState<any[]>([]);

  // Mock templates data
  useEffect(() => {
    // Replace this with actual data fetching logic
    const mockTemplates = [
      { name: 'main.c', type: 'C Source File', size: '2 KB', modified: '2024-01-20' },
      { name: 'freertos.c', type: 'C Source File', size: '3 KB', modified: '2024-01-15' },
      { name: 'startup.s', type: 'Assembly File', size: '1 KB', modified: '2024-01-10' },
    ];
    setTemplates(mockTemplates);
  }, []);

  const filteredTemplates = templates.filter(template =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    template.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleTemplateAction = (action: string, templateName: string) => {
    (window as any).addConsoleLog?.('info', `${action} template: ${templateName}`);
    
    if (action === 'View') {
      setSelectedTemplate(templateName);
    }
  };

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
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" style={{ color: STM32_COLORS.warning }} />
          <h2 className="text-lg font-semibold">Template Manager</h2>
          <Badge variant="outline" style={{ borderColor: STM32_COLORS.success, color: STM32_COLORS.success }}>
            {templates.length} Templates
          </Badge>
        </div>
        <Button className="flex items-center gap-2" style={{ backgroundColor: STM32_COLORS.primary }}>
          <Plus className="w-4 h-4" />
          Add Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Project Templates</CardTitle>
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search templates..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-64"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {filteredTemplates.map((template, index) => (
                <div
                  key={index}
                  className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                    selectedTemplate === template.name ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                  }`}
                  onClick={() => setSelectedTemplate(template.name)}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="w-5 h-5 text-gray-400" />
                    <div>
                      <div className="font-medium">{template.name}</div>
                      <div className="text-sm text-gray-500">
                        {template.type} • Modified: {template.modified}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateAction('View', template.name);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Eye className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateAction('Edit', template.name);
                        }}
                        className="h-8 w-8 p-0"
                      >
                        <Edit className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleTemplateAction('Delete', template.name);
                        }}
                        className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>

      {selectedTemplate && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Template Preview: {selectedTemplate}</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="p-4 bg-gray-900 text-green-400 rounded-lg font-mono text-sm"
              style={{ backgroundColor: STM32_COLORS.codeBackground, color: STM32_COLORS.codeText }}
            >
              <pre>{`// Mock content for ${selectedTemplate}
#include <stdio.h>

int main() {
  printf("Hello from ${selectedTemplate}!");
  return 0;
}`}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplateManagerTab;
