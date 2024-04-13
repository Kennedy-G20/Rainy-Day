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

    constructor(public webService: WebService) { }

    ngOnInit() {
      fetchAuthSession().then((response
        ) => this.webService.getTransactions(
        response.tokens?.accessToken.toString() as string)
        ).catch((error) => console.log(error));
    }

}