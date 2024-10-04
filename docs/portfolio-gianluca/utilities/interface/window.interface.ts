export interface Window {
  id: number;
  title: string;
  icon: string;
  isOpen: boolean;
  zIndex: number;
  windowType?: string;
  pdfSrc?: string;
  isMinimized: boolean;
}
