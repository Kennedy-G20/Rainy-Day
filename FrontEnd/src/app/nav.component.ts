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

    onSearch(search_value: string) {;
      this.resetSearch();
      sessionStorage['search_value'] = search_value;
      this.router.navigate(['/search', search_value]);
    }

    resetSearch() {
      sessionStorage.removeItem('search_value');
      if (this.router.url.startsWith('/search')) {
        window.location.reload();
      }
    }

}
