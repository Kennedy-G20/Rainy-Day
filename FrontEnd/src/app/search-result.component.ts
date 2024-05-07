import { Component } from '@angular/core';
import { WebService } from './web.service';
import { fetchAuthSession } from 'aws-amplify/auth';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'search-result',
  templateUrl: './search-result.component.html',
  styleUrls: ['./search-result.component.css']
})
export class SearchResultComponent {
    
    constructor(public webService: WebService,
                private route: ActivatedRoute) { }

    search_value: any;

    ngOnInit() {
        // Retrieve search value from session storage
        this.search_value = sessionStorage.getItem('search_value');
        this.getSearchResult(this.search_value);

    }

    // Call to web service to get search results
    getSearchResult(search_value: String){
        fetchAuthSession().then((response
          ) => this.webService.getSearch(
          response.tokens?.accessToken.toString() as string, search_value)
          ).catch((error) => console.log(error));
    }

}