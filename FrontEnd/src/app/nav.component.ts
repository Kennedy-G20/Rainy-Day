import { Component, Input } from '@angular/core';
import { WebService } from './web.service';
import { Router } from '@angular/router'; 

@Component({
  selector: 'navigation',
  templateUrl: './nav.component.html',
  styleUrls: ['./nav.component.css']
})

export class NavComponent {

  constructor(public webService: WebService,
              private router: Router) { }

    @Input() signOut?: () => void;

    openDropdown: boolean = false;

    toggleDropdown() {
        this.openDropdown = !this.openDropdown;
    }

    // Navigates user to search result page & stores search value in session storage
    onSearch(search_value: string) {;
      this.resetSearch();
      sessionStorage['search_value'] = search_value;
      this.router.navigate(['/search', search_value]);
    }

    // If user makes a search request from the result page this ensures the page and search value are reset
    resetSearch() {
      sessionStorage.removeItem('search_value');
      if (this.router.url.startsWith('/search')) {
        window.location.reload();
      }
    }

}
