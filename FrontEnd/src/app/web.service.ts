import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable()
export class WebService {

    transactions_list: any;

    constructor(private http: HttpClient) { }

    getTransactions() {
        return this.http.get(
            'http://127.0.0.1:5000/api/transactions'
        ).subscribe((response: any) => {
            this.transactions_list = response;
            console.log(response);
        });
    }
}