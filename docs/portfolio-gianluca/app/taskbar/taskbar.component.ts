import { Component, Input, Output, EventEmitter, OnInit, OnDestroy } from '@angular/core';
import { OpenWindow } from 'src/utilities/interface/open-window.interface';

@Component({
  selector: 'app-taskbar',
  templateUrl: './taskbar.component.html',
  styleUrls: ['./taskbar.component.scss']
})
export class TaskbarComponent implements OnInit, OnDestroy {
  @Input() openWindows: OpenWindow[] = [];
  @Output() startClick = new EventEmitter<void>();
  @Output() windowClick = new EventEmitter<number>();
  @Output() openWindow = new EventEmitter<number>(); // Aggiungi questa riga

  currentTime: string = '';
  private timer: any;

  ngOnInit() {
    this.updateTime();
    this.timer = setInterval(() => this.updateTime(), 1000);
  }

  ngOnDestroy() {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }

  private updateTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString('it-IT', { hour: '2-digit', minute: '2-digit' });
  }

  onStartClick() {
    this.startClick.emit();
  }

  onWindowClick(windowId: number) {
    console.log('Taskbar: Window clicked', windowId);
    const window = this.openWindows.find(w => w.id === windowId);

    if (window) {
      if (window.isMinimized) {
        // Se la finestra è minimizzata, la riapriamo
        this.windowClick.emit(windowId);
      } else {
        // Se la finestra è già aperta e non minimizzata, la portiamo in primo piano
        this.windowClick.emit(windowId);
      }
    } else {
      // Se la finestra non esiste nell'array openWindows, la apriamo
      this.openWindow.emit(windowId);
    }
  }
}
