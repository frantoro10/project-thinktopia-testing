import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, of } from 'rxjs';
import { switchMap, tap, catchError, map } from 'rxjs/operators';
import { ReqresLoginResponse, ReqresRegisterResponse, User } from '../../models/auth.models';

@Injectable({
  providedIn: 'root'
})


export class AuthService {

  //Como es proyecto de prueba, y estos datos son el local y la API key es gratuita, creo que no hace falta llevarlo a un .env 
  private reqresApiUrl: string = 'https://reqres.in/api';
  private jsonServerUrl: string = 'http://localhost:3000';
  private apiKey: string = 'reqres-free-v1' //Reqres free API. 


  constructor(private http: HttpClient, private router: Router) {

  }

  /* El objetivo del metodo Login es realizar un login en reqres.in y si es exitoso, buscar el rol del usuario en JSON Server. Lo que nos permite lograr con condicionales que si tiene como role docente o alumno, redireccionarlo a su dashboard usando el modulo Router de Angular, que toma la url del enrutado y usa navigate para navegar hacia allí. */

  login(credentials: { email: string, password: string }): Observable<User | null> {

    //Objeto de opciones para el encabezado de la request http (Header), usando HttpHeaders
    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      })
    };

    //  Pasa httpOptions como tercer argumento al POST. (url, body, options-headers)
    return this.http.post<ReqresLoginResponse>(`${this.reqresApiUrl}/login`, credentials, httpOptions).pipe(

      tap(loginResponse =>
        console.log('Repuesta de Reqres.in:', loginResponse) // Se usa el operador tap para poder ver respuesta y depurar.
      ),

      //1. Si el login en reqres.in exitoso, usamos en pipe switchMap para cambiar a un nuevo observable, en este caso para un get.
      switchMap(_loginResponse => {
        //2. Usamos el email para buscar el usuario en nuestro JSON server y asi poder obtener su rol
        return this.http.get<User[]>(`${this.jsonServerUrl}/users?email=${credentials.email}`);
      }),
      // 3. El GET devuelve un array, usamos map para tomar el primer elemento, el id. Por eso la condicional, si encontro usuario me da el id o devuelve null
      map(users => users.length > 0 ? users[0] : null),
      // 4. Usamos tap para realizar una "acción secundaria" sin modificar el flujo de datos
      tap(user => {
        if (user) {
          if (user.role === 'docente') {
            this.router.navigate(['/docente/dashboard']);
          } else {
            //Si el usuario existe y no es docente entonces es un alumno, ya que solo hay dos roles, por ende quiero que me lleve al dashboard del alumno.
            this.router.navigate(['/alumno/dashboard']) ;
          }
        } else {
          // Si el usuario existe en reqres.in pero no en nuestro db.json
          console.error('Usuario autenticado pero no encontrado en la base de datos local.');
        }
      }),
      // 5. catchError para manejar errores en cualquiera de los pasos anteriores.
      catchError(error => {
        console.error('Error en el proceso de login:', error);
        return of(null); // Devolvemos un Observable nulo para que el componente pueda manejar el error.
      })
    );
  }


  register(credentials: { email: string, password: string }): Observable<User | null> {

    const httpOptions = {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'X-API-Key': this.apiKey
      })
    };

    return this.http.post<ReqresRegisterResponse>(`${this.reqresApiUrl}/register`, credentials, httpOptions).pipe(

      tap(registerResponse => console.log('Respuesta de Register:', registerResponse)),

      switchMap(_registerResponse => {
        // Creamos el objeto para el nuevo usuario
        const newUser: Omit<User, 'id'> = {
          email: credentials.email,
          role: 'alumno' // Se mantiene el rol por defecto 'alumno'.
        };
        //  Hacemos el POST a nuestro JSON Server.
        return this.http.post<User>(`${this.jsonServerUrl}/users`, newUser);
      }),
      tap(createdUser => {
        console.log('Usuario registrado exitosamente en db.json:', createdUser);
        this.router.navigate(['/auth/login']);
      }),
      catchError(error => {
        console.error('Error en el proceso de registro:', error);
        return of(null);
      })
    );
  }

}


