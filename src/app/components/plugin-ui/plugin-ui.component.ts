import { Component, Input, OnChanges, OnInit, SimpleChanges } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { map } from 'rxjs/operators';
import { PluginsService, QhanaPlugin } from 'src/app/services/plugins.service';

@Component({
    selector: 'qhana-plugin-ui',
    templateUrl: './plugin-ui.component.html',
    styleUrls: ['./plugin-ui.component.sass']
})
export class PluginUiComponent implements OnInit, OnChanges {

    @Input() plugin: QhanaPlugin | null = null;

    microFrontend: SafeHtml | null = null;

    constructor(private plugins: PluginsService, private sanitizer: DomSanitizer) { }

    ngOnInit(): void {
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (this.plugin != null) {
            this.plugins.getPluginUi(this.plugin).pipe(
                map(frontend => {
                    //return this.sanitizer.sanitize(SecurityContext.HTML, frontend);
                    return this.sanitizer.bypassSecurityTrustHtml(frontend);
                }),
            ).subscribe(frontend => this.microFrontend = frontend);
        }
    }

}
