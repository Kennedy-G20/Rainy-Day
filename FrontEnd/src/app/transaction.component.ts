import { Component } from '@angular/core';
import { WebService } from './web.service';
import { fetchAuthSession } from 'aws-amplify/auth';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css'],
  providers: [WebService]
})
export class TransactionComponent {

    showTransaction: boolean = true;
    showTransactionForm: boolean = false;
    editDiscardText: String = "Edit";
    transactionForm: any;
    noteForm: any;
    noteEditForm: any;
    showNoteEdit: boolean = false;

    page: number = 1;

    constructor(public webService: WebService,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder,
        private router: Router) { }

    ngOnInit(): void {
        // Form Validation
        this.transactionForm = this.formBuilder.group({
            description: ['', Validators.required],
            transaction_direction: ['', Validators.required],
            amount: ['', Validators.required],
            category: ['', Validators.required],
            date: ['', Validators.required]
          });

        this.noteForm = this.formBuilder.group( {
        note: ['', Validators.required]
        });


        this.noteEditForm = this.formBuilder.group( {
            note: ['', Validators.required]
            });

        const transaction_id = this.route.snapshot.params['transaction_id'];

        // Call to web service to get current transaction
        fetchAuthSession().then((response
            ) => this.webService.getTransaction(
            response.tokens?.accessToken.toString() as string, transaction_id)
            ).catch((error) => console.log(error));

        // Call to web service to display notes for current transaction 
        fetchAuthSession().then((response
            ) => this.webService.getNotes(
            response.tokens?.accessToken.toString() as string, transaction_id)
            ).catch((error) => console.log(error));
    }


    //  Submit new note & call to web service to add new note
    onNoteSubmit() {
        const noteValue = this.noteForm.value.note.toString();

        fetchAuthSession().then((response
            ) => this.webService.postNote(
            response.tokens?.accessToken.toString() as string, noteValue)
            ).catch((error) => console.log(error));
        this.noteForm.reset();
    }

    //  Call to web web service to edit transaction
    onEditTransactionSubmit() {
        const transaction_id = this.route.snapshot.params['transaction_id'];
        const editedTransaction = this.transactionForm.value;

        fetchAuthSession().then((response
            ) => this.webService.putTransaction(
            response.tokens?.accessToken.toString() as string,transaction_id, editedTransaction)
            ).catch((error) => console.log(error));

        this.transactionForm.reset();
        this.toggleTransactionEditForm();
    }

    // Allows user to confirm deletion of transaction with pop up window
    onDeleteButton() {
        const confirmDelete = window.confirm("Are you sure you want to delete this transaction?");
        if (confirmDelete) {
            this.onDeleteTransaction();
        }
    }

    // Call to web service to delete transaction
    onDeleteTransaction() {
        const transaction_id = this.route.snapshot.params['transaction_id'];

        fetchAuthSession().then((response
            ) => this.webService.deleteTransaction(
            response.tokens?.accessToken.toString() as string, transaction_id)
            ).catch((error) => console.log(error));
        this.router.navigate(['/transactions']);

        if (sessionStorage['page']) {
            this.page = Number(sessionStorage['page'])
          }

        fetchAuthSession().then((response
          ) => this.webService.getTransactions(
          response.tokens?.accessToken.toString() as string, "all", this.page)
          ).catch((error) => console.log(error));
    }

    // Call to webservice to edit note
    onEditNoteSubmit(note: any) {
        const noteValue = this.noteEditForm.value.note.toString();
        const noteId = note._id;

        fetchAuthSession().then((response
            ) => this.webService.putNote(
            response.tokens?.accessToken.toString() as string, noteId, noteValue)
            ).catch((error) => console.log(error));
        this.noteForm.reset();
        this.toggleEditNote(note);
    }


    // Call to web service to delete note
    onDeleteNote(note: any) {
        const noteId = note._id;
        console.log(noteId)

        fetchAuthSession().then((response
            ) => this.webService.deleteNote(
            response.tokens?.accessToken.toString() as string, noteId)
            ).catch((error) => console.log(error));
    }


    isInvalid(control: any) {
        return this.noteForm.controls[control].invalid &&
                this.noteForm.controls[control].touched;
    }

    isUnTouched() {
        return this.noteForm.controls.note.pristine;
    }

    // Form validatiom
    isIncomplete() {
        return this.isInvalid('note') ||
        this.isUnTouched();
    }

    // Toggles appearance to display edit form for transaction
    toggleTransactionEditForm() {

        this.showTransactionForm = !this.showTransactionForm;
        this.showTransaction = !this.showTransaction;

        if (!this.showTransaction) {
            this.editDiscardText = "Discard";
        } else {
            this.editDiscardText = "Edit";
        }
    }

    // Toggles appearance to display edit form for note
    toggleEditNote(note: any) {
        note.showNoteEdit = !note.showNoteEdit;
    }

}
