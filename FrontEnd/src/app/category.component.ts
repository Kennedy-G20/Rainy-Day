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
                private route: ActivatedRoute,) { }

    ngOnInit() {
        const category_name = this.route.snapshot.params['category_name'];
        this.getCategoriesList(category_name);

    }

    getCategoriesList(category_name: any){
        fetchAuthSession().then((response
        ) => this.webService.getCategory(
        response.tokens?.accessToken.toString() as string, category_name)
        ).catch((error) => console.log(error));
    }

}

