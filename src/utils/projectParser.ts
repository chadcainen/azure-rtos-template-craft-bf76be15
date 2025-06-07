
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
  projectPath?: string;
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

  console.log('Parsing project data:', projectData);

  // Extract series from JSON files
  const series: string[] = [];
  const boards: BoardConfig[] = [];
  const middleware = new Set<string>();
  const applications = new Set<string>();

  // Parse JSON files to get series and board data
  if (projectData.apps?.json) {
    projectData.apps.json.forEach((file: any) => {
      const fileName = file.name;
      console.log('Processing JSON file:', fileName);
      
      // Series files (f4.json, h7.json, etc.)
      const seriesMatch = fileName.match(/^([a-z]+\d*)\.json$/);
      if (seriesMatch) {
        const seriesName = seriesMatch[1];
        if (!series.includes(seriesName)) {
          series.push(seriesName);
        }
        return;
      }
      
      // Board JSON files
      const boardName = fileName.replace('.json', '');
      
      try {
        // Read file content if available
        let boardData = null;
        if (file.file) {
          // For uploaded files, we need to read the content
          const reader = new FileReader();
          reader.onload = (e) => {
            try {
              boardData = JSON.parse(e.target?.result as string);
              processBoardData(boardName, boardData, boards, middleware, applications);
            } catch (error) {
              console.error(`Error parsing ${fileName}:`, error);
            }
          };
          reader.readAsText(file.file);
        } else if (file.content) {
          // If content is already available
          boardData = JSON.parse(file.content);
          processBoardData(boardName, boardData, boards, middleware, applications);
        }
      } catch (error) {
        console.error(`Error processing board file ${fileName}:`, error);
      }
    });
  }

  // Extract middleware from actual directories
  if (projectData.apps) {
    Object.keys(projectData.apps).forEach(key => {
      if (key !== 'json' && key !== 'templates' && projectData.apps[key].length > 0) {
        middleware.add(key);
      }
    });
  }

  return {
    series: series.sort(),
    boards,
    middleware: Array.from(middleware).sort(),
    applications: Array.from(applications).sort(),
    projectPath: projectData.projectPath
  };
};

function processBoardData(
  boardName: string, 
  boardData: any, 
  boards: BoardConfig[], 
  middleware: Set<string>, 
  applications: Set<string>
) {
  if (!boardData?.board?.[0]) return;

  const board = boardData.board[0];
  const boardApps = board.apps || [];
  const boardAppsDetails = board.apps_details || [];

  // Add middleware based on app prefixes
  boardApps.forEach((app: string) => {
    if (app.startsWith('Tx_')) middleware.add('ThreadX');
    else if (app.startsWith('Fx_')) middleware.add('FileX');
    else if (app.startsWith('Nx_')) middleware.add('NetXDuo');
    else if (app.startsWith('Ux_')) middleware.add('USBX');
    
    applications.add(app);
  });

  boards.push({
    name: boardName,
    apps: boardApps,
    apps_details: boardAppsDetails
  });
}

export const getBoardsForSeries = (series: string, projectData: any): string[] => {
  if (!projectData?.apps?.json) return [];
  
  const boards: string[] = [];
  
  // Read the series JSON file to get boards
  const seriesFile = projectData.apps.json.find((file: any) => 
    file.name === `${series}.json`
  );
  
  if (seriesFile) {
    try {
      let seriesData = null;
      if (seriesFile.content) {
        seriesData = JSON.parse(seriesFile.content);
      } else if (seriesFile.file) {
        // For real uploaded files, we need to read asynchronously
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            seriesData = JSON.parse(e.target?.result as string);
            // This would need to be handled asynchronously in the component
          } catch (error) {
            console.error(`Error parsing series file ${series}.json:`, error);
          }
        };
        reader.readAsText(seriesFile.file);
        return [];
      }
      
      if (seriesData?.serie?.[0]?.boards) {
        return seriesData.serie[0].boards;
      }
    } catch (error) {
      console.error(`Error reading series file ${series}.json:`, error);
    }
  }
  
  // Fallback: extract boards from individual board JSON files
  projectData.apps.json.forEach((file: any) => {
    const fileName = file.name;
    if (!fileName.match(/^[a-z]+\d*\.json$/) && fileName.endsWith('.json')) {
      const boardName = fileName.replace('.json', '');
      boards.push(boardName);
    }
  });
  
  return boards.sort();
};

export const getMiddlewareForBoard = (board: string, projectData: any): string[] => {
  if (!projectData?.apps?.json) return [];
  
  const boardFile = projectData.apps.json.find((file: any) => 
    file.name === `${board}.json`
  );
  
  if (!boardFile) return [];
  
  try {
    let boardData = null;
    if (boardFile.content) {
      boardData = JSON.parse(boardFile.content);
    } else if (boardFile.file) {
      // For uploaded files, this needs to be handled asynchronously
      return [];
    }
    
    if (boardData?.board?.[0]?.apps) {
      const apps = boardData.board[0].apps;
      const middleware = new Set<string>();
      
      apps.forEach((app: string) => {
        if (app.startsWith('Tx_')) middleware.add('ThreadX');
        else if (app.startsWith('Fx_')) middleware.add('FileX');
        else if (app.startsWith('Nx_')) middleware.add('NetXDuo');
        else if (app.startsWith('Ux_')) middleware.add('USBX');
      });
      
      return Array.from(middleware).sort();
    }
  } catch (error) {
    console.error(`Error parsing board file ${board}.json:`, error);
  }
  
  return [];
};

export const getApplicationsForMiddleware = (board: string, middleware: string, projectData: any): string[] => {
  if (!projectData?.apps?.json) return [];
  
  const boardFile = projectData.apps.json.find((file: any) => 
    file.name === `${board}.json`
  );
  
  if (!boardFile) return [];
  
  try {
    let boardData = null;
    if (boardFile.content) {
      boardData = JSON.parse(boardFile.content);
    } else if (boardFile.file) {
      // For uploaded files, this needs to be handled asynchronously
      return [];
    }
    
    if (boardData?.board?.[0]?.apps) {
      const apps = boardData.board[0].apps;
      
      // Filter applications based on the selected middleware
      const middlewareToPrefix: Record<string, string> = {
        "ThreadX": "Tx_",
        "NetXDuo": "Nx_",
        "USBX": "Ux_",
        "FileX": "Fx_"
      };
      
      const prefix = middlewareToPrefix[middleware];
      if (prefix) {
        return apps.filter((app: string) => app.startsWith(prefix)).sort();
      }
    }
  } catch (error) {
    console.error(`Error parsing board file ${board}.json:`, error);
  }
  
  return [];
};

export const getApplicationDetails = (board: string, application: string, projectData: any) => {
  if (!projectData?.apps?.json) {
    return {
      name: application,
      description: `No project data available for ${application}`,
      features: [],
      requirements: []
    };
  }
  
  const boardFile = projectData.apps.json.find((file: any) => 
    file.name === `${board}.json`
  );
  
  if (boardFile) {
    try {
      let boardData = null;
      if (boardFile.content) {
        boardData = JSON.parse(boardFile.content);
      } else if (boardFile.file) {
        // For uploaded files, this needs to be handled asynchronously
        return {
          name: application,
          description: `Loading details for ${application}...`,
          features: [],
          requirements: []
        };
      }
      
      if (boardData?.board?.[0]?.apps_details) {
        const appsDetails = boardData.board[0].apps_details;
        const appDetail = appsDetails.find((app: any) => app.name === application);
        
        if (appDetail) {
          return {
            name: appDetail.name,
            description: appDetail.description || `${application} application for ${board}`,
            features: appDetail.features || [],
            requirements: appDetail.requirements || []
          };
        }
      }
    } catch (error) {
      console.error(`Error parsing board file ${board}.json:`, error);
    }
  }
  
  return {
    name: application,
    description: `${application} application for ${board}`,
    features: [],
    requirements: [board]
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
  if (!projectData?.apps?.[middleware]) return [];
  
  const files: string[] = [];
  
  // Look for actual template files in the project structure
  const middlewareApps = projectData.apps[middleware];
  
  if (Array.isArray(middlewareApps)) {
    middlewareApps.forEach((file: any) => {
      if (file.path && file.path.includes(application) && file.name.endsWith('.j2')) {
        files.push(file.path);
      }
    });
  }
  
  return files.sort();
};

export const getFileContent = async (filePath: string, projectData: any): Promise<string> => {
  if (!projectData) return '';
  
  // Find the file in the project structure
  const allFiles = [
    ...(projectData.apps?.FileX || []),
    ...(projectData.apps?.NetXDuo || []),
    ...(projectData.apps?.ThreadX || []),
    ...(projectData.apps?.USBX || []),
    ...(projectData.apps?.templates || []),
    ...(projectData.apps?.json || []),
    ...(projectData.pack || [])
  ];
  
  const file = allFiles.find((f: any) => f.path === filePath || f.name === filePath);
  
  if (file?.file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        resolve(e.target?.result as string || '');
      };
      reader.readAsText(file.file);
    });
  } else if (file?.content) {
    return file.content;
  }
  
  return '';
};

// Helper function to read file content asynchronously
export const readFileContent = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target?.result as string || '');
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};
