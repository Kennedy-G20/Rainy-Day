import { Component } from '@angular/core';
import { WebService } from './web.service';
import { fetchAuthSession } from 'aws-amplify/auth';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css'],
  providers: [WebService]
})
export class TransactionsComponent {

    showTransactionForm: boolean = false;
    transactionForm: any;
    page: number = 1;

    constructor(public webService: WebService,
                private formBuilder: FormBuilder) { }

    ngOnInit() {
      this.transactionForm = this.formBuilder.group({
        description: ['', Validators.required],
        transaction_direction: ['', Validators.required],
        amount: ['', Validators.required],
        category: ['', Validators.required],
        date: ['', Validators.required]
      });

      if (sessionStorage['page']) {
        this.page = Number(sessionStorage['page'])
      }

      this.getTransactionsList(this.page);
    }
  
    getTransactionsList(page: number){
      fetchAuthSession().then((response
        ) => this.webService.getTransactions(
        response.tokens?.accessToken.toString() as string, page)
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

  openTransactionForm() {
      this.showTransactionForm = !this.showTransactionForm;
    }


  onSubmit() {
    const transactionData = this.transactionForm.value;

    fetchAuthSession().then((response
        ) => this.webService.postTransaction(
        response.tokens?.accessToken.toString() as string, transactionData, this.page)
        ).catch((error) => console.log(error));
    this.transactionForm.reset();
  }
}
