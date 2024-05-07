import { Component } from '@angular/core';
import { WebService } from './web.service';
import { fetchAuthSession } from 'aws-amplify/auth';

@Component({
  selector: 'categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.css'],
  providers: [WebService]
})

export class CategoriesComponent { 

    constructor(public webService: WebService) { }

    ngOnInit() {
        this.getCategoriesList();

    }

    // Call to web service to get categories list
    getCategoriesList(){
        fetchAuthSession().then((response
        ) => this.webService.getCategories(
        response.tokens?.accessToken.toString() as string)
        ).catch((error) => console.log(error));
    }

}
