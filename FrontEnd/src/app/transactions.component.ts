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
    transaction_direction: string = "all";

    constructor(public webService: WebService,
                private formBuilder: FormBuilder) { }

    ngOnInit() {
      // Form Validation
      this.transactionForm = this.formBuilder.group({
        description: ['', Validators.required],
        transaction_direction: ['', Validators.required],
        amount: ['', Validators.required],
        category: ['', Validators.required],
        date: ['', Validators.required]
      });

      // Get page number from session storage for pagination
      if (sessionStorage['page']) {
        this.page = Number(sessionStorage['page'])
      }

      if (sessionStorage['transaction_direction']) {
        this.transaction_direction = String(sessionStorage['transaction_direction'])
      }

      this.getTransactionsList(this.transaction_direction, this.page);
    }
  
    // Call to web service to get transactions
    getTransactionsList(transaction_direction: string, page: number){
      fetchAuthSession().then((response
        ) => this.webService.getTransactions(
        response.tokens?.accessToken.toString() as string, transaction_direction, page)
        ).catch((error) => console.log(error));
  }

  // For previous page button
    previousPage() {
      if (this.page > 1) {
          this.page = this.page - 1;
          sessionStorage['page'] = this.page

          fetchAuthSession().then((response
            ) => this.webService.getTransactions(
            response.tokens?.accessToken.toString() as string, this.transaction_direction, this.page)
            ).catch((error) => console.log(error));
      }
   }

  //  For next page button
    nextPage() { 
      this.page = this.page + 1;
      sessionStorage['page'] = this.page

      fetchAuthSession().then((response
        ) => this.webService.getTransactions(
        response.tokens?.accessToken.toString() as string, this.transaction_direction, this.page)
        ).catch((error) => console.log(error));
  }

  // Toggles form for adding transaction
  openTransactionForm() {
      this.showTransactionForm = !this.showTransactionForm;
    }

  // Submits form data makes call to web service to add transaction
  onSubmit() {
    const transactionData = this.transactionForm.value;

    fetchAuthSession().then((response
        ) => this.webService.postTransaction(
        response.tokens?.accessToken.toString() as string, transactionData, this.page)
        ).catch((error) => console.log(error));
    this.transactionForm.reset();
  }

  isInvalid(control: any) {
    return this.transactionForm.controls[control].invalid &&
      this.transactionForm.controls[control].touched;
  }
  
  isUnTouched() {
    return this.transactionForm.controls.description.pristine ||
            this.transactionForm.controls.transaction_direction.pristine ||
            this.transactionForm.controls.amount.pristine ||
            this.transactionForm.controls.category.pristine ||
            this.transactionForm.controls.date.pristine;
  }
  
  // Form validation
  isIncomplete() {
    return this.isInvalid('description') ||
          this.isInvalid('transaction_direction') ||
          this.isInvalid('amount') ||
          this.isInvalid('category') ||
          this.isInvalid('date') ||
          this.isUnTouched();
  }

  // For handling the filtering of the transactions (all/in/out)
  onTransactionDirectionSelect(event: Event) {
    const direction = (event.target as HTMLSelectElement).value;
    this.transaction_direction = direction.toLowerCase();

    this.getTransactionsList(this.transaction_direction, this.page);
  }

}
