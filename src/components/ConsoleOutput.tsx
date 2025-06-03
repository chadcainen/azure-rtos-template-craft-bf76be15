
import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Terminal, Trash2, Copy, Download } from 'lucide-react';
import { STM32_COLORS } from '@/styles/stm32-theme';

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

const ConsoleOutput: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      message: 'Welcome to STM32Cube Builder for Azure RTOS v1.0.0'
    },
    {
      id: '2',
      timestamp: new Date().toLocaleTimeString(),
      type: 'info',
      message: 'Professional tool for generating MX files, packs and applications'
    },
    {
      id: '3',
      timestamp: new Date().toLocaleTimeString(),
      type: 'success',
      message: 'System initialized successfully. Ready for development.'
    }
  ]);
  
  const [isMinimized, setIsMinimized] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const addLog = (type: LogEntry['type'], message: string) => {
    const newLog: LogEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
    };
    setLogs(prev => [...prev, newLog]);
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const copyLogs = () => {
    const logText = logs.map(log => `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`).join('\n');
    navigator.clipboard.writeText(logText);
  };

  const exportLogs = () => {
    const logText = logs.map(log => `[${log.timestamp}] ${log.type.toUpperCase()}: ${log.message}`).join('\n');
    const blob = new Blob([logText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `stm32-logs-${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [logs]);

  const getLogColor = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return STM32_COLORS.success;
      case 'warning':
        return STM32_COLORS.warning;
      case 'error':
        return STM32_COLORS.error;
      default:
        return STM32_COLORS.textSecondary;
    }
  };

  const getLogIcon = (type: LogEntry['type']) => {
    switch (type) {
      case 'success':
        return '✓';
      case 'warning':
        return '⚠';
      case 'error':
        return '✗';
      default:
        return 'ℹ';
    }
  };

  // Expose addLog function globally for other components to use
  useEffect(() => {
    (window as any).addConsoleLog = addLog;
    return () => {
      delete (window as any).addConsoleLog;
    };
  }, []);

  return (
    <Card 
      className={`border-t border-l-0 border-r-0 border-b-0 rounded-none transition-all duration-300 ${
        isMinimized ? 'h-12' : 'h-80'
      }`}
      style={{ borderColor: STM32_COLORS.gray300 }}
    >
      <CardHeader 
        className="py-3 px-4 cursor-pointer hover:bg-gray-50 transition-colors"
        onClick={() => setIsMinimized(!isMinimized)}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4" style={{ color: STM32_COLORS.primary }} />
            <CardTitle className="text-sm font-semibold">Console Output</CardTitle>
            <span 
              className="text-xs px-2 py-1 rounded-full bg-gray-100"
              style={{ color: STM32_COLORS.textSecondary }}
            >
              {logs.length} entries
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                copyLogs();
              }}
              className="h-6 w-6 p-0"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                exportLogs();
              }}
              className="h-6 w-6 p-0"
            >
              <Download className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                clearLogs();
              }}
              className="h-6 w-6 p-0"
            >
              <Trash2 className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </CardHeader>

      {!isMinimized && (
        <>
          <Separator />
          <CardContent className="p-0">
            <ScrollArea className="h-64" ref={scrollAreaRef}>
              <div className="p-4 space-y-1">
                {logs.length === 0 ? (
                  <div 
                    className="text-center py-8 text-sm"
                    style={{ color: STM32_COLORS.textLight }}
                  >
                    No console output yet...
                  </div>
                ) : (
                  logs.map((log) => (
                    <div
                      key={log.id}
                      className="flex items-start gap-3 py-1 px-2 rounded hover:bg-gray-50 transition-colors"
                    >
                      <span 
                        className="text-xs font-mono mt-0.5 flex-shrink-0"
                        style={{ color: STM32_COLORS.textLight }}
                      >
                        {log.timestamp}
                      </span>
                      <span
                        className="text-xs font-mono mt-0.5 flex-shrink-0 w-4"
                        style={{ color: getLogColor(log.type) }}
                      >
                        {getLogIcon(log.type)}
                      </span>
                      <span 
                        className="text-sm font-mono leading-relaxed"
                        style={{ color: STM32_COLORS.textPrimary }}
                      >
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </CardContent>
        </>
      )}
    </Card>
  );
};

export default ConsoleOutput;
