export class FileDownloader {
  static download(content: string, fileName: string, contentType: string): void {
    if (typeof window === 'undefined') return;
    
    const blob = new Blob([content], { type: contentType });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    
    try {
      document.body.appendChild(a);
      a.click();
    } finally {
      a.remove();
      setTimeout(() => URL.revokeObjectURL(url), 100);
    }
  }
}