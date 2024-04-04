import { Component } from '@angular/core';

@Component({
  selector: 'transactions',
  templateUrl: './transactions.component.html',
  styleUrls: ['./transactions.component.css']
})
export class TransactionsComponent {

    transactions_list = [
        {
            "id": 1,
            "description": "Tesco shop",
            "transaction_direction": "outcome",
            "amount": 35.60,
            "category": "groceries",
            "date": "2023-12-30",
            "notes": []
        },
        {
            "id": 2,
            "description": "Asda shop",
            "transaction_direction": "outcome",
            "amount": 49.95,
            "category": "groceries",
            "date": "2024-03-15",
            "notes": []
        },
        {
            "id": 2,
            "description": "Amazon",
            "transaction_direction": "outcome",
            "amount": 7.99,
            "category": "subscriptions",
            "date": "2024-02-30",
            "notes": []
        },
        {
            "id": 2,
            "description": "student loan",
            "transaction_direction": "income",
            "amount": 950,
            "category": "loans",
            "date": "2024-01-10",
            "notes": []
        }
    ]

}
