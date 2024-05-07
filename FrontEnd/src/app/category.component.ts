import { Component } from '@angular/core';
import { WebService } from './web.service';
import { fetchAuthSession } from 'aws-amplify/auth';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'category',
  templateUrl: './category.component.html',
  styleUrls: ['./category.component.css']
})
export class CategoryComponent {
    
    constructor(public webService: WebService,
                private route: ActivatedRoute) { }
      
    current_category: any;

    ngOnInit() {
        // Define current category by url parameter
        this.current_category= this.route.snapshot.params['category_name'];
        this.getCategoryList();

    }

    // Call to web service to get transactions in category
    getCategoryList(){
        fetchAuthSession().then((response
        ) => this.webService.getCategory(
        response.tokens?.accessToken.toString() as string, this.current_category)
        ).catch((error) => console.log(error));
    }

}

