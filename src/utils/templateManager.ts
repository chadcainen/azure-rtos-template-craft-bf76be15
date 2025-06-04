
export interface UserCodeSection {
  sectionId: string;
  content: string;
  lineStart: number;
  lineEnd: number;
  readOnly: boolean;
  modified: boolean;
  originalContent: string;
}

export class STM32TemplateParser {
  private static readonly USER_CODE_BEGIN_PATTERN = /\/\*\s*USER CODE BEGIN\s+([^*]+)\*\//g;
  private static readonly USER_CODE_END_PATTERN = /\/\*\s*USER CODE END\s+([^*]+)\*\//g;
  
  private sections: Map<string, UserCodeSection> = new Map();
  private nonUserSections: UserCodeSection[] = [];
  private templateLines: string[] = [];

  parseTemplate(templateContent: string): Map<string, UserCodeSection> {
    this.templateLines = templateContent.split('\n');
    this.sections.clear();
    this.nonUserSections = [];
    
    let i = 0;
    let lastEnd = 0;
    let nonUserCount = 1;
    
    while (i < this.templateLines.length) {
      const line = this.templateLines[i];
      const beginMatch = line.match(/\/\*\s*USER CODE BEGIN\s+([^*]+)\*\//);
      
      if (beginMatch) {
        const sectionId = beginMatch[1].trim();
        
        // Add non-user code section before this user code section
        if (i > lastEnd) {
          const nonUserContent = this.templateLines.slice(lastEnd, i).join('\n');
          if (nonUserContent.trim()) {
            const nonUserSection: UserCodeSection = {
              sectionId: `NonUserCode_${nonUserCount}`,
              content: nonUserContent,
              lineStart: lastEnd,
              lineEnd: i,
              readOnly: true,
              modified: false,
              originalContent: nonUserContent
            };
            this.nonUserSections.push(nonUserSection);
            nonUserCount++;
          }
        }
        
        // Find the content between BEGIN and END
        const contentLines: string[] = [];
        const startLine = i + 1;
        i++;
        
        while (i < this.templateLines.length) {
          const endLine = this.templateLines[i];
          const endMatch = endLine.match(/\/\*\s*USER CODE END\s+([^*]+)\*\//);
          
          if (endMatch && endMatch[1].trim() === sectionId) {
            const content = contentLines.join('\n');
            const section: UserCodeSection = {
              sectionId,
              content,
              lineStart: startLine,
              lineEnd: i,
              readOnly: false,
              modified: false,
              originalContent: content
            };
            this.sections.set(sectionId, section);
            lastEnd = i + 1;
            break;
          } else {
            contentLines.push(endLine);
          }
          i++;
        }
      }
      i++;
    }
    
    // Add remaining non-user code
    if (lastEnd < this.templateLines.length) {
      const nonUserContent = this.templateLines.slice(lastEnd).join('\n');
      if (nonUserContent.trim()) {
        const nonUserSection: UserCodeSection = {
          sectionId: `NonUserCode_${nonUserCount}`,
          content: nonUserContent,
          lineStart: lastEnd,
          lineEnd: this.templateLines.length,
          readOnly: true,
          modified: false,
          originalContent: nonUserContent
        };
        this.nonUserSections.push(nonUserSection);
      }
    }
    
    return this.sections;
  }

  generateCode(): string {
    const resultLines = [...this.templateLines];
    const sectionsArray = Array.from(this.sections.entries());
    
    // Sort by line start in reverse order to maintain indices
    sectionsArray.sort((a, b) => b[1].lineStart - a[1].lineStart);
    
    for (const [sectionId, section] of sectionsArray) {
      if (this.isModified(section)) {
        const newContentLines = section.content.split('\n');
        resultLines.splice(section.lineStart, section.lineEnd - section.lineStart, ...newContentLines);
      }
    }
    
    return resultLines.join('\n');
  }

  private isModified(section: UserCodeSection): boolean {
    return section.content !== section.originalContent && !section.readOnly;
  }

  getSections(): Map<string, UserCodeSection> {
    return this.sections;
  }

  getNonUserSections(): UserCodeSection[] {
    return this.nonUserSections;
  }

  resetSection(sectionId: string): void {
    const section = this.sections.get(sectionId);
    if (section && !section.readOnly) {
      section.content = section.originalContent;
      section.modified = false;
    }
  }

  updateSection(sectionId: string, content: string): void {
    const section = this.sections.get(sectionId);
    if (section && !section.readOnly) {
      section.content = content;
      section.modified = section.content !== section.originalContent;
    }
  }
}
