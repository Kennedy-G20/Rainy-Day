import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class WebService {

    private transactionID: any;

    constructor(private http: HttpClient) { }

      
    transactions_list: any;
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
  
}