import { OnInit, AfterContentChecked, Injector } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';

import { BaseResourceModel } from '../../models/base-resource.model';
import { BaseResourceService } from '../../services/base-resource.service';

import { switchMap } from 'rxjs/operators';

import * as toastr from 'toastr';

export abstract class BaseResourceFormComponent<T extends BaseResourceModel> implements OnInit, AfterContentChecked {

    currentAction: string;
    resourceForm: FormGroup;
    pageTitle: string;
    serverErrorMessages: string[] = null;
    submitingForm = false;

    protected route: ActivatedRoute;
    protected router: Router;
    protected formBuilder: FormBuilder;

    constructor(
        protected injector: Injector,
        public resource: T,
        protected resourceService: BaseResourceService<T>,
        protected jsonDataToResourceFn: (jsonData) => T
    ) {
        this.route = this.injector.get(ActivatedRoute);
        this.router = this.injector.get(Router);
        this.formBuilder = this.injector.get(FormBuilder);
    }

    ngOnInit() {
        this.setcurrentAction();
        this.buildResourceForm();
        this.loadResource();
    }

    ngAfterContentChecked() {
        this.setPageTitle();
    }

    submitForm() {
        this.submitingForm = true;
        if (this.currentAction === 'new') {
            this.createResource();
        } else {
            this.updateResource();
        }
    }


    // Private Methods
    protected setcurrentAction() {
        if (this.route.snapshot.url[0].path === 'new') {
            this.currentAction = 'new';
        } else {
            this.currentAction = 'edit';
        }

    }

    protected loadResource() {
        if (this.currentAction === 'edit') {
            this.route.paramMap.pipe(
                switchMap(params => this.resourceService.getById(+params.get('id')))
            )
                .subscribe(
                    (resource) => {
                        this.resource = resource;
                        this.resourceForm.patchValue(this.resource);
                    },
                    (error) => alert('Ocorreu um erro no servidor, tente mais tarde')
                );
        }
    }
    protected setPageTitle() {
        if (this.currentAction === 'new') {
            this.pageTitle = this.creationPageTitle();
        } else {
            this.pageTitle = this.editionPageTitle();
        }
    }

    protected creationPageTitle(): string {
        return 'Novo';
    }

    protected editionPageTitle(): string {
        return 'Edição';
    }

    protected createResource() {
        const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
        this.resourceService.create(resource)
            .subscribe(
                (resourceNew) => this.actionsForSucess(resourceNew),
                error => this.actionsForError(error)
            );
    }
    protected updateResource() {
        const resource: T = this.jsonDataToResourceFn(this.resourceForm.value);
        this.resourceService.update(resource)
            .subscribe(
                (resourceEdit) => this.actionsForSucess(resourceEdit),
                error => this.actionsForError(error)
            );
    }

    protected actionsForSucess(resource: T) {
        toastr.success('Solicitação processada com sucesso!');
        const baseComponentPath: string = this.route.snapshot.parent.url[0].path;
        this.router.navigateByUrl(baseComponentPath, { skipLocationChange: true })
            .then(() => this.router.navigate([baseComponentPath, resource.id, 'edit']));
    }

    protected actionsForError(error: any) {
        toastr.error('Ocorreu um erro ao processar a sua solicitação');
        this.submitingForm = false;
        if (error.status === 422 || error.status === 400 || error.status === 404) {
            this.serverErrorMessages = JSON.parse(error._body).errors;
        } else {
            this.serverErrorMessages = ['Falha na Comunicação com o Servidor. Por favor, teste mais tarde.'];
        }
    }

    protected abstract buildResourceForm(): void;
}
