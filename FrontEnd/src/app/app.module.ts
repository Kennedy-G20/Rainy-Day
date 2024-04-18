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
import { CategoriesComponent } from './categories.component';
import { CategoryComponent } from './category.component';
import { SearchResultComponent } from './search-result.component';
import { ReactiveFormsModule } from '@angular/forms';
import { NavComponent } from './nav.component';

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
  },
  {
    path: 'categories',
    component: CategoriesComponent
  },
  {
    path: 'categories/:category_name',
    component: CategoryComponent
  },
  {
    path: 'search/:search_value',
    component: SearchResultComponent
  }
];

@NgModule({
  declarations: [
    AppComponent, TransactionsComponent, TransactionComponent, HomeComponent,
    NavComponent, CategoriesComponent, CategoryComponent, SearchResultComponent
  ],
  imports: [
    BrowserModule, HttpClientModule,
    RouterModule.forRoot(routes), AmplifyAuthenticatorModule, ReactiveFormsModule
  ],
  providers: [WebService],
  bootstrap: [AppComponent]
})
export class AppModule { }