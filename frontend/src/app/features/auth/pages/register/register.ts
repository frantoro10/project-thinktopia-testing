import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../../../../services/auth-service/auth-service';


@Component({
  selector: 'app-register',
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './register.html',
  styleUrl: './register.css'
})
export class Register {
  registerForm: FormGroup;
  errorMessage: string | null = null;
  successMessage: string | null = null;

  constructor(private fb: FormBuilder, private authService: AuthService) {
    this.registerForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: FormGroup) {
    return form.get('password')?.value === form.get('confirmPassword')?.value
      ? null : { mismatch: true };
  }

  onSubmit(): void {
    // Reseteamos los mensajes cada vez que se envía el formulario
    this.errorMessage = null;
    this.successMessage = null;

    if (this.registerForm.valid) {
      // Extraemos solo email y password, que es lo que el servicio espera
      const { email, password } = this.registerForm.value;

      // Llamamos al metodo register del servicio y nos suscribimos al observable
      this.authService.register({ email, password }).subscribe({
        next: (user) => {
          if (user) {
            this.successMessage = '¡Registro exitoso! Serás redirigido a la página de login.';
          } else {
            // Si devuelve null, haay error.
            this.errorMessage = 'El registro falló. Es posible que el email ya esté en uso.';
          }
        },
        error: (err) => {
          // Este bloque se ejecuta si hay un error en la petición HTTP que no fue manejado por catchError en el servicio
          this.errorMessage = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo más tarde.';
          console.error('Ocurrió un error inesperado durante el registro:', err);
        }
      })
    }
  }

}
