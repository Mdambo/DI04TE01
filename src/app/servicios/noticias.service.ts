import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class NoticiasService {
  private apiDataSubject = new BehaviorSubject<{ categoria: string, totalResults: number }[]>([]);
  apiData$ = this.apiDataSubject.asObservable();

  constructor(private http: HttpClient) {}

  cogerNoticias(categorias: string[]) {
    let apiData: { categoria: string, totalResults: number }[] = [];
    let completedRequests = 0;

    categorias.forEach(categoria => {
      this.http.get<any>(`${environment.apiUrl}/top-headlines?country=us&category=${categoria}&apiKey=${environment.apiKey}`)
        .subscribe(response => {
          if (response && response.totalResults !== undefined) {
            apiData.push({ categoria, totalResults: response.totalResults });
          }

          completedRequests++;

          // Si todas las solicitudes han terminado, emitimos los datos
          if (completedRequests === categorias.length) {
            this.apiDataSubject.next(apiData);
          }
        });
    });
  }
}