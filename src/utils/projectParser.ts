
// Utility functions for parsing PACK_AZRTOS_AutoGen project data
export interface BoardConfig {
  name: string;
  apps: string[];
  apps_details?: Array<{
    name: string;
    description?: string;
    features?: string[];
    requirements?: string[];
  }>;
}

export interface ProjectStructure {
  series: string[];
  boards: BoardConfig[];
  middleware: string[];
  applications: string[];
}

export const parseProjectData = (projectData: any): ProjectStructure => {
  if (!projectData) {
    return {
      series: [],
      boards: [],
      middleware: [],
      applications: []
    };
  }

  // Extract available series from project structure
  const series = ['f4', 'f7', 'g4', 'h7', 'h7rs', 'l4', 'l5', 'wb', 'wl'];
  
  // Parse board configurations from project files
  const boards: BoardConfig[] = [];
  const middleware = new Set<string>();
  const applications = new Set<string>();

  // Mock parsing logic - in real implementation this would parse actual project files
  // This would read from the apps/json/*.json files in the uploaded project
  const mockBoards = [
    {
      name: 'NUCLEO-H723ZG',
      apps: ['Tx_Thread_Creation', 'Nx_TCP_Echo_Client', 'Ux_Host_MSC'],
      apps_details: [
        {
          name: 'Tx_Thread_Creation',
          description: 'This application demonstrates basic ThreadX thread creation and management.',
          features: ['Thread creation', 'Thread scheduling', 'Basic synchronization'],
          requirements: ['STM32H723ZG', 'ThreadX middleware']
        }
      ]
    },
    {
      name: 'STM32F767ZI-Nucleo',
      apps: ['Fx_File_Edit_Standalone', 'Nx_UDP_Echo_Server', 'Ux_Device_CDC_ACM'],
      apps_details: []
    }
  ];

  mockBoards.forEach(board => {
    boards.push(board);
    board.apps.forEach(app => {
      applications.add(app);
      // Extract middleware from app prefix
      if (app.startsWith('Tx_')) middleware.add('ThreadX');
      if (app.startsWith('Fx_')) middleware.add('FileX');
      if (app.startsWith('Nx_')) middleware.add('NetXDuo');
      if (app.startsWith('Ux_')) middleware.add('USBX');
    });
  });

  return {
    series,
    boards,
    middleware: Array.from(middleware),
    applications: Array.from(applications)
  };
};

export const getBoardsForSeries = (series: string, projectData: any): string[] => {
  const seriesBoards: Record<string, string[]> = {
    'f4': ['STM32469I-Discovery', 'STM32F429ZI-Nucleo'],
    'f7': ['STM32F767ZI-Nucleo', 'STM32F769I-Discovery'],
    'g4': ['NUCLEO-G474RE', 'STM32G474E-EVAL'],
    'h7': ['NUCLEO-H723ZG', 'STM32H735G-DK', 'STM32H743I-EVAL', 'STM32H747I-DISCO'],
    'h7rs': ['NUCLEO-H7S3L8', 'STM32H7S78-DK'],
    'l4': ['NUCLEO-L4R5ZI', 'STM32L4R9I-Discovery'],
    'l5': ['NUCLEO-L552ZE-Q', 'STM32L562E-DK'],
    'wb': ['P-NUCLEO-WB55.Nucleo', 'STM32WB5MM-DK'],
    'wl': ['NUCLEO-WL55JC']
  };

  return seriesBoards[series] || [];
};

export const getMiddlewareForBoard = (board: string, projectData: any): string[] => {
  const boardMiddleware: Record<string, string[]> = {
    'NUCLEO-H723ZG': ['ThreadX', 'NetXDuo', 'USBX'],
    'STM32F767ZI-Nucleo': ['ThreadX', 'NetXDuo', 'USBX'],
    'NUCLEO-G474RE': ['ThreadX', 'FileX'],
    'STM32H735G-DK': ['ThreadX', 'NetXDuo', 'USBX', 'FileX']
  };

  return boardMiddleware[board] || [];
};

export const getApplicationsForMiddleware = (board: string, middleware: string, projectData: any): string[] => {
  const mockApplications: Record<string, Record<string, string[]>> = {
    'NUCLEO-H723ZG': {
      'ThreadX': ['Tx_Thread_Creation', 'Tx_Thread_Sync', 'Tx_Semaphore'],
      'NetXDuo': ['Nx_TCP_Echo_Client', 'Nx_UDP_Echo_Server'],
      'USBX': ['Ux_Host_MSC', 'Ux_Device_CDC_ACM']
    },
    'STM32F767ZI-Nucleo': {
      'ThreadX': ['Tx_Thread_Creation', 'Tx_LowPower'],
      'NetXDuo': ['Nx_TCP_Echo_Server', 'Nx_WebHTTP_Server'],
      'USBX': ['Ux_Host_HID', 'Ux_Device_MSC']
    }
  };

  return mockApplications[board]?.[middleware] || [];
};
