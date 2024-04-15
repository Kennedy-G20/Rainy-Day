import { Component } from '@angular/core';
import { WebService } from './web.service';
import { fetchAuthSession } from 'aws-amplify/auth';
import { ActivatedRoute } from '@angular/router';
import { FormBuilder, Validators } from '@angular/forms';

@Component({
  selector: 'transaction',
  templateUrl: './transaction.component.html',
  styleUrls: ['./transaction.component.css'],
  providers: [WebService]
})
export class TransactionComponent {

    noteForm: any;

    constructor(public webService: WebService,
        private route: ActivatedRoute,
        private formBuilder: FormBuilder) { }

    ngOnInit(): void {
        this.noteForm = this.formBuilder.group( {
        note: ['', Validators.required]
        });

        const transaction_id = this.route.snapshot.params['transaction_id'];

        fetchAuthSession().then((response
            ) => this.webService.getTransaction(
            response.tokens?.accessToken.toString() as string, transaction_id)
            ).catch((error) => console.log(error));

        fetchAuthSession().then((response
            ) => this.webService.getNotes(
            response.tokens?.accessToken.toString() as string, transaction_id)
            ).catch((error) => console.log(error));
        }

    onSubmit() {
        const noteValue = this.noteForm.value.note.toString();

        fetchAuthSession().then((response
            ) => this.webService.postNote(
            response.tokens?.accessToken.toString() as string, noteValue)
            ).catch((error) => console.log(error));
        this.noteForm.reset();
    }

    isInvalid(control: any) {
        return this.noteForm.controls[control].invalid &&
                this.noteForm.controls[control].touched;
    }

    isUnTouched() {
        return this.noteForm.controls.note.pristine;
    }

    isIncomplete() {
        return this.isInvalid('note') ||
        this.isUnTouched();
    }


}
