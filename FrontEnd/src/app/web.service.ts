import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class WebService {

    private transactionID: any;

    constructor(private http: HttpClient) { }
      
    transactions_list: any;
    oldTransactionForm: any;
    notes_list: any;   
    categories_list: any;
    category_transactions_list: any;
    balance_list: any;
    search_transactions_list: any;


    // GET transactions
    getTransactions(accessToken: string, transaction_direction: string, page: number) {
      const url = 'https://fgadyhtyd3.us-east-1.awsapprunner.com/api/transactions?td=' + transaction_direction + '&pn=' + page;
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + accessToken });
      return this.http.get<any>(url, { headers }
      ).subscribe((response: any) => {
        this.transactions_list = response
      });
  }


    // GET single transaction
    getTransaction(accessToken: string, id: any) {
      this.transactionID = id;

      const url = 'https://fgadyhtyd3.us-east-1.awsapprunner.com/api/transactions/' + id;
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + accessToken });
      return this.http.get<any>(url, { headers }
      ).subscribe((response: any) => {
          this.transactions_list = response
      });
  }


    // ADD transaction
    postTransaction(accessToken: string, transactionData: any, page: number) {
      const url = 'https://fgadyhtyd3.us-east-1.awsapprunner.com/api/transactions';
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + accessToken });
      let postData = new FormData();
      Object.keys(transactionData).forEach(key => {
        postData.append(key, transactionData[key]);
      });
      return this.http.post<any>(url, postData, { headers }
      ).subscribe((response: any) => {
        this.getTransactions(accessToken, "all", page)
      });
  }


    // EDIT Transaction
    putTransaction(accessToken: string, id: any, editedTransaction: any){
    const updatedTransaction: any = {}
    this.oldTransactionForm = this.transactions_list.find((transaction: { id: any; }) => transaction.id === id);
    for (const key in editedTransaction) {
        const editedValue = editedTransaction[key];
        const oldValue = this.oldTransactionForm[key];
        if (editedValue === '' || editedValue === undefined) {
          updatedTransaction[key] = oldValue;
      } else if (editedValue !== oldValue) {
          updatedTransaction[key] = editedValue;
      } else {
          updatedTransaction[key] = oldValue;
      }
    }
    const url = 'https://fgadyhtyd3.us-east-1.awsapprunner.com/api/transactions/' + id;
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + accessToken });
    let postData = new FormData();
    Object.keys(updatedTransaction).forEach(key => {
      postData.append(key, updatedTransaction[key]);
    });
    return this.http.put<any>(url, postData, { headers }
    ).subscribe((response: any) => {
      this.getTransaction(accessToken, id)
    });
  }


    // DELETE Transaction
    deleteTransaction(accessToken: string, id: any) {
      this.transactionID = id;

      const url = 'https://fgadyhtyd3.us-east-1.awsapprunner.com/api/transactions/' + id;
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + accessToken });
      return this.http.delete<any>(url, { headers }
      ).subscribe((response: any) => {
          this.transactions_list = response
      });
  }


    // GET Notes
    getNotes(accessToken: string, id: any) {
      const url = 'https://fgadyhtyd3.us-east-1.awsapprunner.com/api/transactions/' + id + '/notes';
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + accessToken });
      return this.http.get<any>(url, { headers }
      ).subscribe((response: any) => {
          this.notes_list = response
      });
  }


    // ADD Note
    postNote(accessToken: string, note: string) {
      let postData = new FormData();
      postData.append("note", note);

      const url = 'https://fgadyhtyd3.us-east-1.awsapprunner.com/api/transactions/' + this.transactionID + '/notes';
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + accessToken });
      return this.http.post<any>(url, postData, { headers }
      ).subscribe((response: any) => {
        this.getNotes(accessToken, this.transactionID);
      });
  }


    // EDIT Note
    putNote(accessToken: string, noteId: any, note: string){
      let postData = new FormData();
      postData.append("note", note);

      const url = 'https://fgadyhtyd3.us-east-1.awsapprunner.com/api/transactions/' + this.transactionID + '/notes/' + noteId;
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + accessToken });
      return this.http.put<any>(url, postData, { headers }
      ).subscribe((response: any) => {
        this.getNotes(accessToken, this.transactionID);
      });
  }


    // DELETE Note
    deleteNote(accessToken: string, noteId: any) {
      const updated_notes: any = [];
      for (let i = 0; i < this.notes_list.length; i++) {
          if (this.notes_list[i]._id !== noteId) {
              updated_notes.push(this.notes_list[i]);
          }
      }

      const url = 'https://fgadyhtyd3.us-east-1.awsapprunner.com/api/transactions/' + this.transactionID + '/notes/' + noteId;
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + accessToken });
      return this.http.delete<any>(url, { headers }
      ).subscribe((response: any) => {
          this.notes_list = updated_notes;
      });
}


    // GET list of categories 
    getCategories(accessToken: string) {
      const url = 'https://fgadyhtyd3.us-east-1.awsapprunner.com/api/categories';
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + accessToken });
      return this.http.get<any>(url, { headers }
      ).subscribe((response: any) => {
        this.categories_list = response
      });
    }


    // GET transactions in given category
    getCategory(accessToken: string, category_name: String) {
      const url = 'https://fgadyhtyd3.us-east-1.awsapprunner.com/api/categories/' + category_name;
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + accessToken });
      return this.http.get<any>(url, { headers }
      ).subscribe((response: any) => {
          this.category_transactions_list = response
          this.balance_list = this.calculateCategoryBalance();
      });
    }

    // Summary calculations for category stored as key value pairs
    calculateCategoryBalance(): any {
      let totalIncome = 0;
      let totalOutcome = 0;

      for (const transaction of this.category_transactions_list) {
        if (transaction.transaction_direction === 'income') {
          totalIncome += parseFloat(transaction.amount);
        } else if (transaction.transaction_direction === 'outcome') {
          totalOutcome += parseFloat(transaction.amount);
        }
      }

      const balance = totalIncome - totalOutcome;
    
      const spendings_list = {
        'total_income': parseFloat(totalIncome.toFixed(2)),
        'total_outcome': parseFloat(totalOutcome.toFixed(2)),
        'balance': parseFloat(balance.toFixed(2))
      };  
      return spendings_list;
    }


    // GET search results
    getSearch(accessToken: string, search_value: any) {
      const url = 'https://fgadyhtyd3.us-east-1.awsapprunner.com/api/search?q=' + search_value;
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + accessToken });
      return this.http.get<any>(url, { headers }
      ).subscribe((response: any) => {
        this.search_transactions_list = response
      });
    }
  

}
