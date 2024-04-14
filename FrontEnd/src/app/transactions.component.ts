import { Component } from '@angular/core';
import { WebService } from './web.service';
import { fetchAuthSession } from 'aws-amplify/auth';

@Component({
  selector: 'transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
  providers: [WebService]
})
export class TransactionsComponent {

    page: number = 1;

    constructor(public webService: WebService) { }

    ngOnInit() {
      if (sessionStorage['page']) {
        this.page = Number(sessionStorage['page'])
      }
      fetchAuthSession().then((response
        ) => this.webService.getTransactions(
        response.tokens?.accessToken.toString() as string, this.page)
        ).catch((error) => console.log(error));
    }

    previousPage() {
      if (this.page > 1) {
          this.page = this.page - 1;
          sessionStorage['page'] = this.page

          fetchAuthSession().then((response
            ) => this.webService.getTransactions(
            response.tokens?.accessToken.toString() as string, this.page)
            ).catch((error) => console.log(error));
      }
   }

    nextPage() { 
      this.page = this.page + 1;
      sessionStorage['page'] = this.page

      fetchAuthSession().then((response
        ) => this.webService.getTransactions(
        response.tokens?.accessToken.toString() as string, this.page)
        ).catch((error) => console.log(error));
  }

}
