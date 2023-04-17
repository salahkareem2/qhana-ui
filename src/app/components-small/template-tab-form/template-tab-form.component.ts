import { Component, OnInit, Input, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
    selector: 'qhana-template-tab-form',
    templateUrl: './template-tab-form.component.html',
    styleUrls: ['./template-tab-form.component.sass']
})
export class TemplateTabFormComponent implements OnInit {
    @Input() formValues: {
        name: string | null,
        description: string | null,
        sortKey: number | null,
        filterString: string | null
    } = {
        name: '',
        description: '',
        sortKey: 0,
        filterString: '{}'
    };

    @Output() formSubmit = new EventEmitter<{
        name: string,
        description: string,
        sortKey: number,
        filterString: string
      }>();

    templateForm!: FormGroup;

    constructor(private fb: FormBuilder) { }

    ngOnInit() {
        // TODO: add validators
        this.templateForm = this.fb.group({
            name: [this.formValues.name, Validators.required],
            description: this.formValues.description,
            sortKey: this.formValues.sortKey,
            filterString: this.formValues.filterString
        });
    }

    onSubmit() {
        this.formSubmit.emit(this.templateForm.value);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.formValues && !changes.formValues.firstChange) {
            console.log(changes)
            this.templateForm.patchValue(changes.formValues.currentValue);
        }
    }
}
