import { Component, OnInit, Input, Output, SimpleChanges, EventEmitter } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

interface TemplateTabFormObject {
    name: string,
    description: string,
    sortKey: number,
    filterString: string
}

@Component({
    selector: 'qhana-template-tab-form',
    templateUrl: './template-tab-form.component.html',
    styleUrls: ['./template-tab-form.component.sass']
})
export class TemplateTabFormComponent implements OnInit {
    @Input() formValues: TemplateTabFormObject = { name: '', description: '', sortKey: 0, filterString: '{}' };
    @Output() formSubmit = new EventEmitter<TemplateTabFormObject>();

    // TODO: add validators
    templateForm: FormGroup = this.fb.group({
        name: [this.formValues.name, Validators.required],
        description: this.formValues.description,
        sortKey: this.formValues.sortKey,
        filterString: this.formValues.filterString
    });

    constructor(private fb: FormBuilder) { }

    ngOnInit() { }

    onSubmit() {
        this.formSubmit.emit(this.templateForm.value);
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes.formValues && !changes.formValues.firstChange) {
            this.templateForm.patchValue(changes.formValues.currentValue);
        }
    }
}
