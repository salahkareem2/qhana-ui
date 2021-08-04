/*
 * Copyright 2021 University of Stuttgart
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatCommonModule } from '@angular/material/core';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatToolbarModule } from '@angular/material/toolbar';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { ExperimentsPageComponent } from './components/experiments-page/experiments-page.component';
import { NavbarComponent } from './components/navbar/navbar.component';
import { ExperimentComponent } from './components/experiment/experiment.component';
import { MatTabsModule } from '@angular/material/tabs';
import { ExperimentNavComponent } from './components/experiment-nav/experiment-nav.component';
import { ExperimentWorkspaceComponent } from './components/experiment-workspace/experiment-workspace.component';
import { ExperimentDataComponent } from './components/experiment-data/experiment-data.component';
import { ExperimentTimelineComponent } from './components/experiment-timeline/experiment-timeline.component';



@NgModule({
    declarations: [
        AppComponent,
        NavbarComponent,
        ExperimentsPageComponent,
        ExperimentComponent,
        ExperimentNavComponent,
        ExperimentWorkspaceComponent,
        ExperimentDataComponent,
        ExperimentTimelineComponent,
    ],
    imports: [
        BrowserModule,
        AppRoutingModule,
        BrowserAnimationsModule,
        HttpClientModule,
        MatToolbarModule,
        MatPaginatorModule,
        MatCardModule,
        MatButtonModule,
        MatCommonModule,
        MatTabsModule,
    ],
    providers: [],
    bootstrap: [AppComponent]
})
export class AppModule { }
