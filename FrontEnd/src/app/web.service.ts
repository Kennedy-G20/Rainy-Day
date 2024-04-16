import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class WebService {

    private transactionID: any;

    constructor(private http: HttpClient) { }
      
    transactions_list: any;
    oldTransactionForm: any;
    notes_list: any;   

    getTransactions(accessToken: string, page: number) {
      const url = 'http://127.0.0.1:5000/api/transactions?pn=' + page;
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + accessToken });
      return this.http.get<any>(url, { headers }
      ).subscribe((response: any) => {
        this.transactions_list = response
      });
  }


    getTransaction(accessToken: string, id: any) {
      this.transactionID = id;

      const url = 'http://127.0.0.1:5000/api/transactions/' + id;
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + accessToken });
      return this.http.get<any>(url, { headers }
      ).subscribe((response: any) => {
          this.transactions_list = response
      });
  }


    postTransaction(accessToken: string, transactionData: any, page: number) {
      const url = 'http://127.0.0.1:5000/api/transactions';
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + accessToken });
      let postData = new FormData();
      Object.keys(transactionData).forEach(key => {
        postData.append(key, transactionData[key]);
      });
      return this.http.post<any>(url, postData, { headers }
      ).subscribe((response: any) => {
        this.getTransactions(accessToken, page)
      });
  }


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
    const url = 'http://127.0.0.1:5000/api/transactions/' + id;
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


    getNotes(accessToken: string, id: any) {
      const url = 'http://127.0.0.1:5000/api/transactions/' + id + '/notes';
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + accessToken });
      return this.http.get<any>(url, { headers }
      ).subscribe((response: any) => {
          this.notes_list = response
      });
  }

  
    postNote(accessToken: string, note: string) {
      let postData = new FormData();
      postData.append("note", note);

      const url = 'http://127.0.0.1:5000/api/transactions/' + this.transactionID + '/notes';
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + accessToken });
      return this.http.post<any>(url, postData, { headers }
      ).subscribe((response: any) => {
        this.getNotes(accessToken, this.transactionID);
      });
  }


    putNote(accessToken: string, noteId: any, note: string){
      let postData = new FormData();
      postData.append("note", note);

      const url = 'http://127.0.0.1:5000/api/transactions/' + this.transactionID + '/notes/' + noteId;
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + accessToken });
      return this.http.put<any>(url, postData, { headers }
      ).subscribe((response: any) => {
        this.getNotes(accessToken, this.transactionID);
      });
  }


    deleteTransaction(accessToken: string, id: any) {
    this.transactionID = id;

    const url = 'http://127.0.0.1:5000/api/transactions/' + id;
    const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + accessToken });
    return this.http.delete<any>(url, { headers }
    ).subscribe((response: any) => {
        this.transactions_list = response
    });
}


}