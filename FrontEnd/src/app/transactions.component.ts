import { Component } from '@angular/core';
import { WebService } from './web.service';
import { AppComponent } from './app.component';

@Component({
  selector: 'transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
  providers: [WebService]
})
export class TransactionsComponent {

    transactions_list: any = [];

    constructor(public webService: WebService) { }

    ngOnInit() {
      this.transactions_list = this.webService.getTransactions();
    }

}
