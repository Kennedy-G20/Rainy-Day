import { Component } from '@angular/core';
import { WebService } from './web.service';

@Component({
  selector: 'transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent {

    transactions_list: any;

    constructor(public webService: WebService) { }

    ngOnInit() {
        this.webService.getTransactions();
    }

}
