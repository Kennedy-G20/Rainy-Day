import { Component } from '@angular/core';
import { getCurrentUser } from 'aws-amplify/auth';
import { fetchAuthSession } from 'aws-amplify/auth';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})

export class AppComponent {
  title = 'FrontEnd';
  
  currentUser: any;
  currentUsername: any;
  currentUserId: any;
  currentUserAccessToken: any;
  currentUserIdToken: any;
  

  ngOnInit(): void {
    this.getCurrentUserDetails();
    this.getCurrentSession();
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
