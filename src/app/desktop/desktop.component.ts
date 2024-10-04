import { Component, HostListener, OnInit } from '@angular/core';
import { CdkDragEnd } from '@angular/cdk/drag-drop';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Icon } from 'src/utilities/interface/icon.interface';
import { Window } from 'src/utilities/interface/window.interface';



@Component({
  selector: 'app-desktop',
  templateUrl: './desktop.component.html',
  styleUrls: ['./desktop.component.scss']
})
export class DesktopComponent implements OnInit {
  private nextWindowId = 0;

  isStartMenuOpen = false;
  selectedIconId: number | null = null;
  openWindows: Window[] = []; // Cambia ExtendedWindow in Window
  private highestZIndex: number = 0;
  isDocumentsWindowOpen: boolean = false;
  isComputerWindowOpen: boolean = false;
  private lastTouchTime: number = 0;

  icons: Icon[] = [
    { id: 1, name: 'Computer', image: 'assets/icons/computer.png', position: { x: 20, y: 20 } },
    //{ id: 2, name: 'Documenti', image: 'assets/icons/folder.png', position: { x: 20, y: 120 } },
    { id: 3, name: 'CV Gianluca', image: 'assets/icons/cv.png', position: { x: 20, y: 120 } },
    { id: 4, name: 'Prompt', image: 'assets/icons/prompt.png', position: { x: 20, y: 220 } },
    { id: 5, name: 'README', image: 'assets/icons/readme.png', position: { x: 20, y: 320 } },
    { id: 6, name: 'Paint', image: 'assets/icons/paint.png', position: { x: 20, y: 420 } },
    { id: 7, name: 'Cestino', image: 'assets/icons/cestino.png', position: { x: window.innerWidth - 100, y: window.innerHeight - 124 } }, // Posiziona l'icona del cestino in basso a destra
    { id: 8, name: 'Blocco Note', image: 'assets/icons/paper.png', position: { x: 20, y: 520 } }, // Nuova icona
  ];

  constructor(private sanitizer: DomSanitizer) {}

  ngOnInit() {
    this.openWindow(5, 'README', 'assets/icons/readme.png');
  }

  toggleStartMenu() {
    this.isStartMenuOpen = !this.isStartMenuOpen;
  }

  onDragEnded(event: CdkDragEnd, icon: Icon) {
    icon.position = {
      x: icon.position.x + event.distance.x,
      y: icon.position.y + event.distance.y
    };
  }

  selectIcon(event: MouseEvent, id: number) {
    event.stopPropagation();
    this.selectedIconId = this.selectedIconId === id ? null : id;
  }

  openIcon(event: MouseEvent | TouchEvent, id: number) {
    event.stopPropagation();
    const icon = this.icons.find(i => i.id === id);
    if (icon) {
      this.openWindow(id, icon.name, icon.image);
    }
  }

  openWindow(id: number, title: string, icon: string) {
    console.log('DesktopComponent: openWindow called', id, title, icon);
    const existingWindow = this.openWindows.find(w => w.id === id);
    if (existingWindow) {
      console.log('DesktopComponent: Existing window found, bringing to front');
      existingWindow.isOpen = true;
      existingWindow.isMinimized = false;
      this.bringToFront(existingWindow);
    } else {
      console.log('DesktopComponent: Creating new window');
      this.highestZIndex++;
      const windowType = id === 3 ? 'cv' : id === 4 ? 'prompt' : id === 5 ? 'readme' : id === 6 ? 'paint' : id === 1 ? 'computer' : id === 7 ? 'recycle-bin' : id === 8 ? 'notepad' : 'default';
      let pdfSrc: SafeResourceUrl | undefined;
      if (id === 3) {
        pdfSrc = this.getSafeCvPdfUrl();
        console.log('Opening CV window with PDF source:', pdfSrc);
      }
      const newWindow = {
        id,
        title: title,
        icon: icon,
        isOpen: true,
        zIndex: this.highestZIndex,
        windowType,
        pdfSrc: pdfSrc as string,
        isMinimized: false,
        size: id === 3 ? { width: window.innerWidth, height: window.innerHeight } : { width: 800, height: 600 } // Aggiungi dimensioni predefinite
      };
      this.openWindows.push(newWindow);
      this.bringToFront(newWindow);
    }
  }

  bringToFront(window: Window) {
    this.highestZIndex++;
    window.zIndex = this.highestZIndex;
  }

  onWindowFocus(windowId: number) {
    const window = this.openWindows.find(w => w.id === windowId);
    if (window) {
      this.bringToFront(window);
    }
  }

  closeWindow(id: number | string) {
    if (typeof id === 'number') {
      const index = this.openWindows.findIndex(w => w.id === id);
      if (index !== -1) {
        this.openWindows.splice(index, 1);
      }
      this.removeFromOpenWindows(id);
    } else {
      const window = this.windows.find(w => w.id === id);
      if (window) {
        window.isOpen = false;
      }
    }
  }

  addToOpenWindows(id: number, title: string, icon: string) {
    const existingWindow = this.openWindows.find(w => w.id === id);
    if (!existingWindow) {
      this.openWindows.push({ id, title, icon, isOpen: true, zIndex: this.highestZIndex, isMinimized: false });
    }
  }

  removeFromOpenWindows(id: number) {
    const index = this.openWindows.findIndex(w => w.id === id);
    if (index !== -1) {
      this.openWindows.splice(index, 1);
    }
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    if ((event.target as HTMLElement).classList.contains('desktop')) {
      this.selectedIconId = null;
    }
    if (!((event.target as HTMLElement).closest('.start-menu') ||
          (event.target as HTMLElement).closest('.start-button'))) {
      this.isStartMenuOpen = false;
    }
  }

  @HostListener('touchend', ['$event'])
  onTouchEnd(event: TouchEvent) {
    const currentTime = new Date().getTime();
    const timeDifference = currentTime - this.lastTouchTime;

    if (timeDifference < 300 && timeDifference > 0) { // Intervallo di tempo per considerare un doppio tocco
      const target = event.target as HTMLElement;
      const iconElement = target.closest('.icon');
      if (iconElement) {
        const iconId = Number(iconElement.getAttribute('data-id'));
        this.openIcon(event, iconId);
      }
    }

    this.lastTouchTime = currentTime;
  }

  onWindowClick(windowId: number) {
    const window = this.openWindows.find(w => w.id === windowId);
    if (window) {
      if (window.isMinimized) {
        this.restoreWindow(windowId);
      } else {
        this.bringToFront(window);
      }
    }
  }

  onOpenWindow(windowId: number) {
    console.log('DesktopComponent: onOpenWindow called with id', windowId);
    const icon = this.icons.find(i => i.id === windowId);
    if (icon) {
      console.log('DesktopComponent: Icon found', icon);
      this.openWindow(windowId, icon.name, icon.image);
    } else {
      console.log('DesktopComponent: Icon not found for id', windowId);
    }
  }

  restoreWindow(windowId: number) {
    const window = this.openWindows.find(w => w.id === windowId);
    if (window) {
      window.isMinimized = false;
      this.bringToFront(window);
    }
  }

  focusWindow(windowId: number) {
    const window = this.openWindows.find(w => w.id === windowId);
    if (window) {
      this.bringToFront(window);
    }
  }

  closeDocumentsWindow() {
    this.isDocumentsWindowOpen = false;
  }

  closeComputerWindow() {
    this.isComputerWindowOpen = false;
  }

  windows = [
    { id: 'computer', title: 'Computer', icon: 'assets/icons/computer.png', isOpen: false },
    //{ id: 'documents', title: 'Documenti', icon: 'assets/icons/folder.png', isOpen: false },
    { id: 'prompt', title: 'Prompt', icon: 'assets/icons/prompt.png', isOpen: false },
    { id: 'cv', title: 'CV Gianluca', icon: 'assets/icons/cv.png', isOpen: false },
    { id: 'readme', title: 'README', icon: 'assets/icons/readme.png', isOpen: true },
    { id: 'paint', title: 'Paint', icon: 'assets/icons/paint.png', isOpen: false },
    { id: 'cestino', title: 'Cestino', icon: 'assets/icons/cestino.png', isOpen: false }, // Aggiungi la finestra del cestino
    { id: 'paper', title: 'Paper', icon: 'assets/icons/paper.png', isOpen: false },

    // Aggiungi qui altre finestre secondo necessità
  ];

  openCVWindow() {
    this.windows.push({
      id: 'cv-window',
      title: 'CV Gianluca',
      icon: 'cv-icon',
      isOpen: true,
    });
  }

  getCvPdfUrl(): string {
    const pdfUrl = 'assets/file/cv-gianluca.pdf';
    console.log('PDF URL:', pdfUrl);
    return pdfUrl;
  }

  getSafeCvPdfUrl(): SafeResourceUrl {
    const url = this.getCvPdfUrl();
    return this.sanitizer.bypassSecurityTrustResourceUrl(url);
  }

  minimizeWindow(windowId: number) {
    const window = this.openWindows.find(w => w.id === windowId);
    if (window) {
      window.isMinimized = true;
    }
  }

  toggleWindow(windowId: number) {
    const window = this.openWindows.find(w => w.id === windowId);
    if (window) {
      if (window.isMinimized) {
        window.isMinimized = false;
        this.bringToFront(window);
      } else {
        this.bringToFront(window);
      }
    }
  }
}
