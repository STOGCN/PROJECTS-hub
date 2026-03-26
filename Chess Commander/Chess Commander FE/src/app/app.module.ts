import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { HttpClientModule } from "@angular/common/http";
import { AppComponent } from './app.component';
import { ChessBoardComponent } from './modules/chess-board/chess-board.component';
import { ComputerModeComponent } from './modules/computer-mode/computer-mode.component';
import { NavMenuComponent } from './modules/nav-menu/nav-menu.component';
import { AppRoutingModule } from './routes/app-routing.module';
import { PlayAgainstComputerDialogComponent } from './modules/play-against-computer-dialog/play-against-computer-dialog.component';
import { MoveListComponent } from './modules/move-list/move-list.component';
import { RegisterComponent } from './modules/register/register.component';
import { RegisterPasswordComponent } from './modules/register-password/register-password.component';
import { HeaderComponent } from './modules/dashboard/header/header.component';
import { LifeTimerComponent } from './modules/dashboard/life-timer/life-timer.component';
import { FooterComponent } from './modules/dashboard/footer/footer.component';
import { GameCarouselComponent } from './modules/dashboard/game-carousel/game-carousel.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { NewGameComponent } from './modules/dashboard/header/new_game/new-game.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    AppComponent,
    ChessBoardComponent,
    ComputerModeComponent,
    HeaderComponent,
    LifeTimerComponent,
    FooterComponent,
    GameCarouselComponent,
    DashboardComponent,
    NewGameComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    AppRoutingModule,
    NavMenuComponent,
    PlayAgainstComputerDialogComponent,
    MoveListComponent,
    RegisterComponent,
    RegisterPasswordComponent,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
