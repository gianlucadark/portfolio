import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-icon',
  template: `
    <img [src]="icon.imgSrc" [alt]="icon.name">
  `,
  styleUrls: ['./icon.component.scss']
})
export class IconComponent {
  @Input() icon!: { name: string, imgSrc: string };
}
