import { Component, ViewChild, ElementRef, AfterViewInit } from '@angular/core';

@Component({
    selector: 'app-paint',
    templateUrl: './paint.component.html',
    styleUrls: ['./paint.component.scss']
})
export class PaintComponent implements AfterViewInit {
    @ViewChild('canvas', { static: false }) canvasRef!: ElementRef<HTMLCanvasElement>;
    private ctx!: CanvasRenderingContext2D;
    private isDrawing = false;
    private color = 'black';
    public isErasing = false; // Cambiato a public per il binding
    public lineWidth = 5; // Aggiunto per la dimensione del pennarello
    public eraserSize = 5; // Aggiunto per la dimensione della gomma
    public isPencilSizeActive = false; // Aggiunto per gestire la visibilità dello slider

    ngAfterViewInit() {
        const canvasEl = this.canvasRef.nativeElement;

        if (canvasEl) {
            this.ctx = canvasEl.getContext('2d') as CanvasRenderingContext2D;
            this.setupCanvas(canvasEl);
        }
    }

    setupCanvas(canvasEl: HTMLCanvasElement) {
        canvasEl.addEventListener('mousedown', this.startDrawing.bind(this));
        canvasEl.addEventListener('mouseup', this.stopDrawing.bind(this));
        canvasEl.addEventListener('mousemove', this.draw.bind(this));
    }

    startDrawing(event: MouseEvent) {
        this.isDrawing = true;
        this.ctx.beginPath();
        this.ctx.moveTo(event.offsetX, event.offsetY);
    }

    stopDrawing() {
        this.isDrawing = false;
        this.ctx.closePath();
    }

    draw(event: MouseEvent) {
        if (!this.isDrawing) return;

        this.ctx.lineTo(event.offsetX, event.offsetY);
        this.ctx.lineWidth = this.isErasing ? this.eraserSize : this.lineWidth; // Usa la dimensione della gomma o della matita
        this.ctx.strokeStyle = this.isErasing ? 'white' : this.color;
        this.ctx.stroke();
    }

    selectColor(event: Event) {
        const input = event.target as HTMLInputElement | null;  // Assicuriamo che event.target sia un HTMLInputElement o null
        if (input !== null) {  // Controlliamo che input non sia null
            this.isErasing = false;  // Disattiva la gomma quando si seleziona un colore
            this.isPencilSizeActive = false; // Disattiva la selezione della matita
            this.color = input.value; // Imposta il colore selezionato
        }
    }

    selectEraser() {
        this.isErasing = true; // Attiva la gomma
        this.isPencilSizeActive = false; // Disattiva la selezione della matita
    }

    togglePencilSize() {
        this.isPencilSizeActive = !this.isPencilSizeActive; // Mostra/nasconde lo slider
        this.isErasing = false; // Disattiva la gomma
    }

    clearCanvas() {
        const canvasEl = this.canvasRef.nativeElement;
        if (canvasEl) {
            this.ctx.clearRect(0, 0, canvasEl.width, canvasEl.height);
        }
    }
}
