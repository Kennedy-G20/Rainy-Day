import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class WebService {
  
    transactions_list: any;
    notes_list: any;

    constructor(private http: HttpClient) { }
        
    getTransactions(accessToken: string, page: number) {
      const url = 'http://127.0.0.1:5000/api/transactions?pn=' + page;
      const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + accessToken });
      return this.http.get<any>(url, { headers }
      ).subscribe((response: any) => {
        this.transactions_list = response
      });
  }

    getTransaction(accessToken: string, id: any) {
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
  
}