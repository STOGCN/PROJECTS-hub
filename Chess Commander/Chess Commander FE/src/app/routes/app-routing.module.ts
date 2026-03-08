import { NgModule } from "@angular/core";
import { ChessBoardComponent } from "../modules/chess-board/chess-board.component";
import { ComputerModeComponent } from "../modules/computer-mode/computer-mode.component";
import { RouterModule, Routes } from "@angular/router";
import { LoginComponent } from "../modules/login/login.component";
import { RegisterComponent } from "../modules/register/register.component";
import { RegisterPasswordComponent } from "../modules/register-password/register-password.component";

const routes: Routes = [
    { path: "", component: LoginComponent, title: "Login - Chess Commander" },
    { path: "register", component: RegisterComponent, title: "Register - Chess Commander" },
    { path: "register-password", component: RegisterPasswordComponent, title: "Set Password - Chess Commander" },
    { path: "against-friend", component: ChessBoardComponent, title: "Play against friend" },
    { path: "against-computer", component: ComputerModeComponent, title: "Play against computer" }

]

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule { }