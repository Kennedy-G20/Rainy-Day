import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { Amplify } from 'aws-amplify';
import { AmplifyAuthenticatorModule } from '@aws-amplify/ui-angular';

import { AppComponent } from './app.component';
import awsconfig from '../aws-exports'
import { TransactionsComponent } from './transactions.component';
import { TransactionComponent } from './transaction.component';
import { WebService } from './web.service';
import { HttpClientModule } from '@angular/common/http';
import { RouterModule } from '@angular/router';
import { HomeComponent } from './home.component';

Amplify.configure(awsconfig);

var routes: any = [
  {
    path: '',
    component: HomeComponent
  },
  {
    path: 'transactions',
    component: TransactionsComponent
  },
  {
    path: 'transactions/:transaction_id',
    component: TransactionComponent
  }
];

@NgModule({
  declarations: [
    AppComponent, TransactionsComponent, TransactionComponent, HomeComponent
  ],
  imports: [
    BrowserModule, HttpClientModule,
    RouterModule.forRoot(routes), AmplifyAuthenticatorModule
  ],
  providers: [WebService],
  bootstrap: [AppComponent]
})
export class AppModule { }