import { Component } from '@angular/core';
import { WebService } from './web.service';
import { fetchAuthSession } from 'aws-amplify/auth';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css'],
  providers: [WebService]
})
export class TransactionComponent {

    constructor(public webService: WebService,
        private route: ActivatedRoute) { }

    ngOnInit(): void {
    const transaction_id = this.route.snapshot.params['transaction_id'];
    console.log(transaction_id)
      fetchAuthSession().then((response
        ) => this.webService.getTransaction(
        response.tokens?.accessToken.toString() as string, transaction_id)
        ).catch((error) => console.log(error));
    }

}
