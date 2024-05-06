import { Component } from '@angular/core';
import { WebService } from './web.service';
import { fetchAuthSession } from 'aws-amplify/auth';
import { getCurrentUser } from 'aws-amplify/auth';

@Component({
  selector: 'home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  providers: [WebService]
})
export class HomeComponent { 

  page: number = 1;
  transaction_direction: string = "all";

  currentUser: any;
  currentUsername: any;
  currentUserId: any;
  currentUserAccessToken: any;
  currentUserIdToken: any;

  constructor(public webService: WebService) { }

  ngOnInit() {

    this.getCurrentUserDetails();
    this.getCurrentSession();

    if (sessionStorage['page']) {
      this.page = Number(sessionStorage['page'])
    }

    if (sessionStorage['transaction_direction']) {
      this.transaction_direction = String(sessionStorage['transaction_direction'])
    }

    fetchAuthSession().then((response
      ) => this.webService.getTransactions(
      response.tokens?.accessToken.toString() as string, this.transaction_direction, this.page)
      ).catch((error) => console.log(error));


    fetchAuthSession().then((response
      ) => this.webService.getCategories(
      response.tokens?.accessToken.toString() as string)
      ).catch((error) => console.log(error));

  }

  async getCurrentUserDetails() {
    try {
      const { username, userId, signInDetails } = await getCurrentUser();
      this.currentUsername = username
      this.currentUserId = userId
    } catch (err) {
      console.log('Error retrieving user', err);
    }
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

