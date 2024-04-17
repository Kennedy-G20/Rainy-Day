import { Component, Input } from '@angular/core';

@Component({
  selector: 'navigation',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})

export class NavComponent {
    @Input() signOut?: () => void;

    openDropdown: boolean = false;

    toggleDropdown() {
        this.openDropdown = !this.openDropdown;
    }
}
