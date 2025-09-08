import { Component } from '@angular/core';
// CommonModule ya no es necesario si solo usamos @if
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth-service/auth-service';

@Component({
  selector: 'app-login',
  // Quitamos CommonModule
  imports: [ReactiveFormsModule, RouterModule],
  templateUrl: './login.html',
  styleUrl: './login.css'
})
export class Login {
  loginForm: FormGroup;
  // 1. Añadimos la propiedad para el mensaje de error
  errorMessage: string | null = null;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]]
    });
  }

  onSubmit() {
    // 2. Reseteamos el mensaje en cada intento
    this.errorMessage = null;

    if (this.loginForm.valid) {
      this.authService.login(this.loginForm.value).subscribe({
        next: (user) => {
          if (!user) {
            // 3. Asignamos el mensaje de error si el login falla
            this.errorMessage = 'Credenciales incorrectas o usuario no encontrado.';
            console.log('Login fallido.');
          }
          // Si el login es exitoso, el servicio ya se encarga de redirigir.
        },
        error: (err) => {
          // 4. Asignamos un mensaje para errores inesperados
          this.errorMessage = 'Ocurrió un error inesperado. Por favor, intente más tarde.';
          console.error('Ocurrió un error que no fue capturado en el servicio', err);
        }
      });
    }
  }
}