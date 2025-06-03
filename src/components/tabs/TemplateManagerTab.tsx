
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileText, File, Edit, Eye, Trash2, Plus, Search, Folder } from 'lucide-react';
import { STM32_COLORS } from '@/styles/stm32-theme';

const TemplateManagerTab: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<string | null>(null);

  const templates = [
    { name: 'main.c.j2', type: 'Core', category: 'Source', size: '3.2 KB', modified: '2024-01-15' },
    { name: 'main.h.j2', type: 'Core', category: 'Header', size: '1.8 KB', modified: '2024-01-15' },
    { name: 'app_threadx.c.j2', type: 'ThreadX', category: 'Source', size: '5.7 KB', modified: '2024-01-14' },
    { name: 'app_threadx.h.j2', type: 'ThreadX', category: 'Header', size: '2.1 KB', modified: '2024-01-14' },
    { name: 'app_filex.c.j2', type: 'FileX', category: 'Source', size: '4.9 KB', modified: '2024-01-13' },
    { name: 'app_filex.h.j2', type: 'FileX', category: 'Header', size: '1.9 KB', modified: '2024-01-13' },
    { name: 'app_netxduo.c.j2', type: 'NetX Duo', category: 'Source', size: '6.3 KB', modified: '2024-01-12' },
    { name: 'app_usbx_device.c.j2', type: 'USBX', category: 'Source', size: '7.1 KB', modified: '2024-01-11' },
    { name: 'ioc.j2', type: 'Configuration', category: 'IOC', size: '8.4 KB', modified: '2024-01-10' },
    { name: 'README.md.j2', type: 'Documentation', category: 'Markdown', size: '2.7 KB', modified: '2024-01-09' },
  ];

  const filteredTemplates = templates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         template.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterType === 'all' || template.type.toLowerCase() === filterType.toLowerCase();
    return matchesSearch && matchesFilter;
  });

  const handleTemplateAction = (action: string, templateName: string) => {
    (window as any).addConsoleLog?.('info', `${action} template: ${templateName}`);
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Core':
        return STM32_COLORS.primary;
      case 'ThreadX':
        return STM32_COLORS.secondary;
      case 'FileX':
        return STM32_COLORS.accent;
      case 'NetX Duo':
        return STM32_COLORS.success;
      case 'USBX':
        return STM32_COLORS.warning;
      case 'Configuration':
        return STM32_COLORS.error;
      default:
        return STM32_COLORS.gray600;
    }
  };

  const getIcon = (category: string) => {
    switch (category) {
      case 'Source':
      case 'Header':
        return File;
      case 'IOC':
        return Folder;
      default:
        return FileText;
    }
  };

  const sampleTemplate = `/* {{file_header}} */
#include "main.h"
#include "app_azure_rtos.h"
{% if middleware.threadx.enabled %}
#include "tx_api.h"
{% endif %}

/* Private variables */
{% for thread in threads %}
TX_THREAD {{thread.name}}_thread;
UCHAR {{thread.name}}_thread_stack[{{thread.stack_size}}];
{% endfor %}

/* Application initialization */
void MX_{{project_name}}_Init(void)
{
    /* Initialize Azure RTOS */
    {% if middleware.threadx.enabled %}
    tx_kernel_enter();
    {% endif %}
}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-5 h-5" style={{ color: STM32_COLORS.error }} />
          <h2 className="text-lg font-semibold">Template Manager</h2>
        </div>
        <Button className="flex items-center gap-2" style={{ backgroundColor: STM32_COLORS.primary }}>
          <Plus className="w-4 h-4" />
          New Template
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Jinja2 Template Files</CardTitle>
            <div className="flex items-center gap-4">
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="core">Core</SelectItem>
                  <SelectItem value="threadx">ThreadX</SelectItem>
                  <SelectItem value="filex">FileX</SelectItem>
                  <SelectItem value="netx duo">NetX Duo</SelectItem>
                  <SelectItem value="usbx">USBX</SelectItem>
                  <SelectItem value="configuration">Configuration</SelectItem>
                </SelectContent>
              </Select>
              
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
          </div>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <div className="space-y-2">
              {filteredTemplates.map((template, index) => {
                const Icon = getIcon(template.category);
                return (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                      selectedTemplate === template.name ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
                    }`}
                    onClick={() => setSelectedTemplate(template.name)}
                  >
                    <div className="flex items-center gap-3">
                      <Icon className="w-5 h-5 text-gray-400" />
                      <div>
                        <div className="font-medium">{template.name}</div>
                        <div className="text-sm text-gray-500">
                          {template.size} • {template.category} • Modified {template.modified}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="secondary" 
                        style={{ 
                          backgroundColor: `${getTypeColor(template.type)}15`,
                          color: getTypeColor(template.type)
                        }}
                      >
                        {template.type}
                      </Badge>
                      
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
                );
              })}
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
              className="p-4 rounded-lg font-mono text-sm overflow-x-auto"
              style={{ backgroundColor: STM32_COLORS.codeBackground, color: STM32_COLORS.codeText }}
            >
              <pre>{sampleTemplate}</pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default TemplateManagerTab;
