import { Component, Input, Output, EventEmitter, HostListener, ElementRef, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { DesktopComponent } from '../desktop/desktop.component';

@Component({
  selector: 'app-window',
  templateUrl: './window.component.html',
  styleUrls: ['./window.component.scss']
})
export class WindowComponent implements OnInit, OnChanges {
  @Input() title: string = '';
  @Input() icon: string = '';
  @Input() initialPosition: { x: number, y: number } | null = null;
  @Input() zIndex: number = 0;
  @Output() windowClosed = new EventEmitter<void>();
  @Output() closeWindow = new EventEmitter<void>();
  @Output() closed = new EventEmitter<void>();
  @Output() focusWindow = new EventEmitter<void>();
  @Input() windowType: string = 'default';
  @Input() pdfSrc: SafeResourceUrl | undefined;
  @Input() id!: number; // o il tipo appropriato
  @Input() isMinimized: boolean = false;

  @Output() minimizeWindow = new EventEmitter<void>();
  @Output() restoreWindow = new EventEmitter<void>();

  isDragging = false;
  isResizing = false;
  position: { x: number, y: number };
  size = { width: 600, height: 700 };
  dragStart = { x: 0, y: 0 };
  resizeStart = { x: 0, y: 0 };
  resizeEdge = { top: false, right: false, bottom: false, left: false };
  isFullscreen = false;
  folderPath: string[] = [];

  isVisible: boolean = true;

  // Aggiungi queste proprietà per il prompt
  promptLines: string[] = [];
  currentInput: string = '';
  helpCommands: string[] = ['- aboutme', '- whyxp', '- whyprompt', '- clear']; // Aggiungi i tuoi comandi qui
  output: string[] = [];
  showHelp: boolean = false;
  notepadText: string = ''; // Aggiungi questa proprietà

  constructor(private el: ElementRef, private sanitizer: DomSanitizer, private desktopComponent: DesktopComponent) {
    this.pdfSrc = this.sanitizer.bypassSecurityTrustResourceUrl('assets/file/cv-gianluca.pdf');
    this.position = this.calcolaPosizioneIniziale();
  }

  private calcolaPosizioneIniziale(): { x: number, y: number } {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;
    return {
      x: (screenWidth - this.size.width) / 2,
      y: (screenHeight - this.size.height) / 2
    };
  }

  ngOnInit() {
    console.log('WindowComponent initialized');
    this.logWindowProperties();
    this.updateFolderPath();
    this.adattaDimensioniPerMobile();
    if (this.windowType === 'cv') {
      this.toggleFullscreen(); // Aggiungi questa linea per aprire la finestra CV a tutto schermo
    }
  }

  private adattaDimensioniPerMobile() {
    if (window.innerWidth < 768) { // Soglia per dispositivi mobili
      this.size = {
        width: window.innerWidth * 0.9,
        height: window.innerHeight * 0.8
      };
      this.position = this.calcolaPosizioneIniziale();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    console.log('WindowComponent changes:', changes);
    if (changes['pdfSrc']) {
      console.log('PDF source changed:', this.pdfSrc);
    }
    this.logWindowProperties();
  }

  private logWindowProperties() {
    console.log('Window properties:');
    console.log('- Type:', this.windowType);
    console.log('- PDF source:', this.pdfSrc);
  }

  updateFolderPath() {
    this.folderPath = ['Desktop', this.title];
  }

  private centerWindow() {
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    this.position = {
      x: (screenWidth - this.size.width) / 2,
      y: (screenHeight - this.size.height) / 2
    };
  }

  @HostListener('document:mousemove', ['$event'])
  onMouseMove(event: MouseEvent) {
    if (this.isDragging) {
      let newX = event.clientX - this.dragStart.x;
      let newY = event.clientY - this.dragStart.y;

      // Limita la posizione della finestra all'interno dello schermo
      newX = Math.max(0, Math.min(newX, window.innerWidth - this.size.width));
      newY = Math.max(0, Math.min(newY, window.innerHeight - this.size.height - 30)); // 40 è l'altezza della taskbar

      this.position = { x: newX, y: newY };
    } else if (this.isResizing) {
      const dx = event.clientX - this.resizeStart.x;
      const dy = event.clientY - this.resizeStart.y;

      if (this.resizeEdge.right) this.size.width += dx;
      if (this.resizeEdge.bottom) this.size.height += dy;
      if (this.resizeEdge.left) {
        this.size.width -= dx;
        this.position.x += dx;
      }
      if (this.resizeEdge.top) {
        this.size.height -= dy;
        this.position.y += dy;
      }

      // Limita la dimensione della finestra in modo che non vada sopra la taskbar
      this.size.height = Math.min(this.size.height, window.innerHeight - this.position.y - 40); // 40 è l'altezza della taskbar

      this.resizeStart = { x: event.clientX, y: event.clientY };
    }
  }

  @HostListener('document:mouseup')
  onMouseUp() {
    this.isDragging = false;
    this.isResizing = false;
  }

  onDragStart(event: MouseEvent) {
    this.isDragging = true;
    this.dragStart = {
      x: event.clientX - this.position.x,
      y: event.clientY - this.position.y
    };
  }

  onResizeStart(event: MouseEvent, edge: string) {
    event.preventDefault();
    this.isResizing = true;
    this.resizeStart = { x: event.clientX, y: event.clientY };
    this.resizeEdge = {
      top: edge.includes('top'),
      right: edge.includes('right'),
      bottom: edge.includes('bottom'),
      left: edge.includes('left')
    };
  }

  onClose() {
    this.closeWindow.emit();
  }

  close() {
    this.closed.emit();
  }

  toggleFullscreen() {
    this.isFullscreen = !this.isFullscreen;
    if (this.isFullscreen) {
      this.position = { x: 0, y: 0 };
      this.size = { width: window.innerWidth, height: window.innerHeight };
    } else {
      // Ripristina le dimensioni e la posizione precedenti
      this.position = { x: 100, y: 100 };
      this.size = { width: 400, height: 300 };
    }
  }

  onWindowClick() {
    this.focusWindow.emit();
  }

  isPromptWindow(): boolean {
    return this.windowType === 'prompt';
  }

  isCvWindow(): boolean {
    return this.windowType === 'cv';
  }

  openFolder(folderName: string) {
    this.folderPath.push(folderName);
  }

  onFolderPathClick(index: number) {
    if (index < this.folderPath.length - 1) {
      this.folderPath = this.folderPath.slice(0, index + 1);
    }
    // Qui puoi aggiungere la logica per caricare il contenuto della cartella selezionata
    console.log(`Navigazione a: ${this.folderPath.join(' > ')}`);
  }

  // Esempio di utilizzo in un metodo che gestisce l'apertura di una cartella
  onFolderOpen(folderName: string) {
    this.openFolder(folderName);
    // Altre operazioni necessarie per aprire la cartella
  }

  // Metodo per navigare a una nuova cartella
  navigateToFolder(newPath: string[]) {
    this.folderPath = ['Desktop', ...newPath];
  }

  onMinimize() {
    this.isMinimized = true;
    this.minimizeWindow.emit();
  }

  onRestore() {
    this.isMinimized = false;
    this.restoreWindow.emit();
  }

  maximize() {
    this.isMinimized = false;
  }

  private impostaDimensioniMinime() {
    const minWidth = 200;
    const minHeight = 150;
    this.size.width = Math.max(this.size.width, minWidth);
    this.size.height = Math.max(this.size.height, minHeight);
  }

  toggleVisibility() {
    this.isVisible = !this.isVisible;
  }

  // Aggiungi questo metodo per gestire l'input dell'utente nel prompt
  onEnter() {
    const command = this.currentInput.trim().toLowerCase();
    this.output.push(`C:\\> ${this.currentInput}`); // Aggiungi l'input corrente all'output

    if (command === 'help') {
      this.output.push(...this.helpCommands);
    } else if (command === 'aboutme') {
      this.output.push(
        'Ciao! Sono Gianluca, sono nato a Terracina (LT) il 25 Settembre 1997. ' +
        'Sono un full stack developer con una forte passione per il frontend e il design UI/UX. ' +
        'Amo creare interfacce utente intuitive e migliorare l\'esperienza utente attraverso il design.'
      );
    } else if (command === 'whyxp') {
      this.output.push(
        'Ho scelto di ispirare il design del mio portfolio a Windows XP perché rappresenta il punto di partenza del mio viaggio digitale. È un omaggio nostalgico ai primi esperimenti su Paint e alle lunghe sessioni di Minesweeper. Nonostante oggi lavori con tecnologie avanzate, XP resta un simbolo delle mie radici. Il design fonde passato e futuro, con un\'estetica vintage che accompagna competenze moderne e progetti innovativi. Ogni elemento richiama quel periodo, ricordando che il mio percorso è iniziato lì, ma guarda avanti.'
      );
    } else if (command === 'whyprompt') {
      this.output.push(
        'Ho scelto di implementare questo mini prompt perché rappresenta il mio primo vero approccio al mondo della programmazione. Da piccolo, il prompt di Windows era per me una porta verso un universo sconosciuto, e mi divertivo a esplorare i vari comandi, quasi sentendomi un hacker. Passavo ore cercando di capire come funzionassero le istruzioni e cosa potessi fare con quel semplice schermo nero e bianco. Quell\'esperienza ha alimentato la mia curiosità verso il mondo digitale, ponendo le basi per il percorso che ho intrapreso oggi.'
      );
    } else if (command === 'clear') {
      this.output = []; // Pulisce l'output
    } else {
      // Gestisci altri comandi qui
      this.output.push(`Comando non riconosciuto: ${this.currentInput}`);
    }

    this.currentInput = '';
  }

  openCvWindow(event: Event) {
    event.preventDefault();
    this.desktopComponent.openWindow(3, 'CV Gianluca', 'assets/icons/cv.png');
  }

  selectIcon(event: MouseEvent) {
    event.stopPropagation();
    console.log('Icona cliccata');
  }


}
