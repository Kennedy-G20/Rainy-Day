import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { fetchAuthSession } from 'aws-amplify/auth';

@Injectable()
export class WebService {

    constructor(private http: HttpClient) { }
    
    currentUserAccessToken: any;
    currentUserIdToken: any;

    ngOnInit(): void {
        this.getCurrentSession();
      }

    getTransactions() {
        const headers = new HttpHeaders({ 'Authorization': 'Bearer ' + this.currentUserAccessToken });
        return this.http.get<any>('http://127.0.0.1:5000/api/transactions', { headers });
    }

    async getCurrentSession() {
        try {
          const { accessToken, idToken } = (await fetchAuthSession({ forceRefresh: true })).tokens ?? {};
          this.currentUserAccessToken = accessToken
          this.currentUserIdToken = idToken
        } catch (err) {
          console.log(err);
        }
        return this.currentUserAccessToken
      }
}