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

// Static mappings based on the project structure - updated to match Python code exactly
export const SERIES_TO_BOARDS: Record<string, string[]> = {
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

export const BOARD_TO_MIDDLEWARE: Record<string, string[]> = {
  "NUCLEO-G0B1RE": ["ThreadX", "FileX"],
  "NUCLEO-G474RE": ["ThreadX", "FileX"],
  "NUCLEO-H723ZG": ["ThreadX", "NetXDuo", "USBX"],
  "NUCLEO-H7S3L8": ["ThreadX", "NetXDuo", "USBX"],
  "NUCLEO-L4R5ZI": ["ThreadX", "USBX"],
  "NUCLEO-L552ZE-Q": ["ThreadX", "USBX"],
  "NUCLEO-WL55JC": ["ThreadX", "FileX"],
  "P-NUCLEO-WB55.Nucleo": ["ThreadX", "FileX", "USBX"],
  "STM32469I-Discovery": ["ThreadX", "NetXDuo", "USBX"],
  "STM32F429ZI-Nucleo": ["FileX", "NetXDuo", "USBX"],
  "STM32F767ZI-Nucleo": ["FileX", "NetXDuo", "USBX"],
  "STM32F769I-Discovery": ["ThreadX", "USBX"],
  "STM32G0C1E-EV": ["FileX", "USBX"],
  "STM32G474E-EVAL": ["ThreadX", "NetXDuo", "USBX", "FileX"],
  "STM32H735G-DK": ["ThreadX", "NetXDuo", "USBX", "FileX"],
  "STM32H743I-EVAL": ["USBX"],
  "STM32H747I-DISCO": ["NetXDuo", "USBX"],
  "STM32H7S78-DK": ["ThreadX", "FileX", "USBX"],
  "STM32L4R9I-Discovery": ["FileX"],
  "STM32L562E-DK": ["FileX", "USBX"],
  "STM32WB5MM-DK": ["ThreadX", "FileX", "USBX"]
};

export const parseProjectData = (projectData: any): ProjectStructure => {
  if (!projectData) {
    return {
      series: [],
      boards: [],
      middleware: [],
      applications: []
    };
  }

  const series = ['f4', 'f7', 'g4', 'h7', 'h7rs', 'l4', 'l5', 'wb', 'wl'];
  
  // Parse board configurations from uploaded project files
  const boards: BoardConfig[] = [];
  const middleware = new Set<string>(['ThreadX', 'FileX', 'NetXDuo', 'USBX']);
  const applications = new Set<string>();

  // Parse JSON files to get actual board configurations
  if (projectData.apps?.json) {
    projectData.apps.json.forEach((file: any) => {
      const fileName = file.name;
      
      // Skip series files (f4.json, h7.json, etc.)
      if (/^[a-z]+\d*\.json$/.test(fileName)) {
        return;
      }
      
      // Board JSON files
      const boardName = fileName.replace('.json', '');
      
      try {
        // In a real implementation, we would read the file content
        // For now, we'll use the middleware mapping
        const boardMiddleware = BOARD_TO_MIDDLEWARE[boardName] || [];
        const boardApps: string[] = [];
        
        // Add mock applications based on middleware
        boardMiddleware.forEach(mw => {
          if (mw === 'ThreadX') {
            boardApps.push('Tx_Thread_Creation', 'Tx_Thread_Sync', 'Tx_LowPower', 'Tx_Thread_MsgQueue');
          } else if (mw === 'FileX') {
            boardApps.push('Fx_File_Edit_Standalone', 'Fx_Dual_Instance', 'Fx_MultiAccess', 'Fx_NoR_Write_Read_File', 'Fx_uSD_File_Edit');
          } else if (mw === 'NetXDuo') {
            boardApps.push('Nx_TCP_Echo_Client', 'Nx_TCP_Echo_Server', 'Nx_UDP_Echo_Client', 'Nx_UDP_Echo_Server', 'Nx_WebServer', 'Nx_MQTT_Client', 'Nx_SNTP_Client', 'Nx_Iperf');
          } else if (mw === 'USBX') {
            boardApps.push('Ux_Device_CDC_ACM', 'Ux_Device_HID', 'Ux_Device_MSC', 'Ux_Host_HID', 'Ux_Host_MSC', 'Ux_Device_CustomHID', 'Ux_Device_DFU', 'Ux_Host_CDC_ACM');
          }
        });
        
        boards.push({
          name: boardName,
          apps: boardApps,
          apps_details: boardApps.map(app => ({
            name: app,
            description: `${app} application for ${boardName}`,
            features: [`${app.split('_')[0]} middleware`, 'Real-time processing', 'Azure RTOS integration'],
            requirements: [boardName, `${app.split('_')[0]} middleware`]
          }))
        });
        
        boardApps.forEach(app => applications.add(app));
        
      } catch (error) {
        console.error(`Error parsing board file ${fileName}:`, error);
      }
    });
  }

  return {
    series,
    boards,
    middleware: Array.from(middleware),
    applications: Array.from(applications)
  };
};

export const getBoardsForSeries = (series: string, projectData: any): string[] => {
  return SERIES_TO_BOARDS[series] || [];
};

export const getMiddlewareForBoard = (board: string, projectData: any): string[] => {
  return BOARD_TO_MIDDLEWARE[board] || [];
};

export const getApplicationsForMiddleware = (board: string, middleware: string, projectData: any): string[] => {
  // Try to get from actual JSON file if available
  if (projectData?.apps?.json) {
    const boardFile = projectData.apps.json.find((file: any) => 
      file.name === `${board}.json`
    );
    
    if (boardFile && boardFile.content) {
      try {
        const boardData = JSON.parse(boardFile.content);
        const boardApps = boardData.board?.[0]?.apps || [];
        
        // Filter applications based on the selected middleware
        const middlewareToPrefix: Record<string, string> = {
          "ThreadX": "Tx_",
          "NetXDuo": "Nx_",
          "USBX": "Ux_",
          "FileX": "Fx_"
        };
        
        const prefix = middlewareToPrefix[middleware];
        if (prefix) {
          return boardApps.filter((app: string) => app.startsWith(prefix));
        }
      } catch (error) {
        console.error(`Error parsing board file ${board}.json:`, error);
      }
    }
  }
  
  // Fallback to static data based on middleware
  const allApps = {
    "ThreadX": ['Tx_Thread_Creation', 'Tx_Thread_Sync', 'Tx_LowPower', 'Tx_Thread_MsgQueue'],
    "FileX": ['Fx_File_Edit_Standalone', 'Fx_Dual_Instance', 'Fx_MultiAccess', 'Fx_NoR_Write_Read_File', 'Fx_uSD_File_Edit'],
    "NetXDuo": ['Nx_TCP_Echo_Client', 'Nx_TCP_Echo_Server', 'Nx_UDP_Echo_Client', 'Nx_UDP_Echo_Server', 'Nx_WebServer', 'Nx_MQTT_Client', 'Nx_SNTP_Client', 'Nx_Iperf'],
    "USBX": ['Ux_Device_CDC_ACM', 'Ux_Device_HID', 'Ux_Device_MSC', 'Ux_Host_HID', 'Ux_Host_MSC', 'Ux_Device_CustomHID', 'Ux_Device_DFU', 'Ux_Host_CDC_ACM']
  };
  
  return allApps[middleware as keyof typeof allApps] || [];
};

export const getApplicationDetails = (board: string, application: string, projectData: any) => {
  if (projectData?.apps?.json) {
    const boardFile = projectData.apps.json.find((file: any) => 
      file.name === `${board}.json`
    );
    
    if (boardFile && boardFile.content) {
      try {
        const boardData = JSON.parse(boardFile.content);
        const appsDetails = boardData.board?.[0]?.apps_details || [];
        
        return appsDetails.find((app: any) => app.name === application) || {
          name: application,
          description: `${application} application for ${board}`,
          features: [`${application.split('_')[0]} middleware`, 'Real-time processing', 'Azure RTOS integration'],
          requirements: [board, `${application.split('_')[0]} middleware`]
        };
      } catch (error) {
        console.error(`Error parsing board file ${board}.json:`, error);
      }
    }
  }
  
  // Fallback default details
  return {
    name: application,
    description: `${application} application for ${board}`,
    features: [`${application.split('_')[0]} middleware`, 'Real-time processing', 'Azure RTOS integration'],
    requirements: [board, `${application.split('_')[0]} middleware`]
  };
};

export const getProjectFiles = (projectData: any) => {
  if (!projectData) return null;
  
  return {
    apps: projectData.apps || {},
    templates: projectData.apps?.templates || [],
    json: projectData.apps?.json || [],
    pack: projectData.pack || []
  };
};

export const getTemplateFiles = (middleware: string, application: string, projectData: any): string[] => {
  const files: string[] = [];
  
  // Mock template files based on project structure
  if (projectData?.apps?.[middleware]?.[application]) {
    // Return template files that would exist for this application
    files.push(
      `${application}/.extSettings.j2`,
      `${application}/README.md.j2`,
      `${application}/Core/Src/main.c.j2`,
      `${application}/Core/Inc/main.h.j2`,
      `${application}/AZURE_RTOS/app_azure_rtos.c.j2`
    );
    
    if (middleware === 'ThreadX') {
      files.push(
        `${application}/Inc/app_threadx.h.j2`,
        `${application}/Src/app_threadx.c.j2`
      );
    } else if (middleware === 'FileX') {
      files.push(
        `${application}/FileX/App/app_filex.c.j2`,
        `${application}/FileX/App/app_filex.h.j2`
      );
    } else if (middleware === 'NetXDuo') {
      files.push(
        `${application}/NetXDuo/App/app_netxduo.c.j2`,
        `${application}/NetXDuo/App/app_netxduo.h.j2`
      );
    } else if (middleware === 'USBX') {
      files.push(
        `${application}/USBX/App/app_usbx_device.c.j2`,
        `${application}/USBX/App/app_usbx_device.h.j2`
      );
    }
  }
  
  return files;
};

export const getFileContent = async (filePath: string, projectData: any): Promise<string> => {
  // In a real implementation, this would read the actual file content
  // For now, return mock content based on file type
  
  if (filePath.endsWith('.j2')) {
    if (filePath.includes('main.c')) {
      return `/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file    main.c
  * @author  MCD Application Team
  * @brief   Main program body for {{ app_name }}
  ******************************************************************************
  */
/* USER CODE END Header */

/* Includes ------------------------------------------------------------------*/
#include "main.h"
#include "app_azure_rtos.h"

/* USER CODE BEGIN Includes */

/* USER CODE END Includes */

/* USER CODE BEGIN PTD */

/* USER CODE END PTD */

/* USER CODE BEGIN PD */

/* USER CODE END PD */

/* USER CODE BEGIN PV */

/* USER CODE END PV */

/* USER CODE BEGIN PFP */

/* USER CODE END PFP */

/* USER CODE BEGIN 0 */

/* USER CODE END 0 */

/**
  * @brief  The application entry point.
  * @retval int
  */
int main(void)
{
  /* USER CODE BEGIN 1 */

  /* USER CODE END 1 */

  /* MCU Configuration--------------------------------------------------------*/

  /* Reset of all peripherals, Initializes the Flash interface and the Systick. */
  HAL_Init();

  /* USER CODE BEGIN Init */

  /* USER CODE END Init */

  /* Configure the system clock */
  SystemClock_Config();

  /* USER CODE BEGIN SysInit */

  /* USER CODE END SysInit */

  /* Initialize all configured peripherals */
  MX_GPIO_Init();

  /* USER CODE BEGIN 2 */

  /* USER CODE END 2 */

  /* Init Azure RTOS */
  MX_AURE_RTOS_Init();

  /* Start scheduler */
  tx_kernel_enter();

  /* We should never get here as control is now taken by the scheduler */
  /* Infinite loop */
  /* USER CODE BEGIN WHILE */
  while (1)
  {
    /* USER CODE END WHILE */

    /* USER CODE BEGIN 3 */
  }
  /* USER CODE END 3 */
}

/* USER CODE BEGIN 4 */

/* USER CODE END 4 */`;
    } else if (filePath.includes('app_azure_rtos.c')) {
      return `/* USER CODE BEGIN Header */
/**
  ******************************************************************************
  * @file    app_azure_rtos.c
  * @author  MCD Application Team
  * @brief   Azure RTOS application
  ******************************************************************************
  */
/* USER CODE END Header */

/* Includes ------------------------------------------------------------------*/
#include "app_azure_rtos.h"

/* USER CODE BEGIN Includes */

/* USER CODE END Includes */

/* USER CODE BEGIN PTD */

/* USER CODE END PTD */

/* USER CODE BEGIN PD */

/* USER CODE END PD */

/* USER CODE BEGIN PV */

/* USER CODE END PV */

/* USER CODE BEGIN PFP */

/* USER CODE END PFP */

/**
  * @brief  Initialize Azure RTOS.
  * @param  None
  * @retval None
  */
void MX_AURE_RTOS_Init(void)
{
  /* USER CODE BEGIN AURE_RTOS_Init */

  /* USER CODE END AURE_RTOS_Init */
}

/* USER CODE BEGIN 1 */

/* USER CODE END 1 */`;
    }
  }
  
  // Default template content
  return `/* USER CODE BEGIN Header */
/**
  * @file    ${filePath.split('/').pop()?.replace('.j2', '')}
  * @brief   Generated from template for {{ app_name }} on {{ board }}
  */
/* USER CODE END Header */

/* USER CODE BEGIN Content */

/* USER CODE END Content */`;
};
