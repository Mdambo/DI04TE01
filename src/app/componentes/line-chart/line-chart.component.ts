import { Component, OnInit, Renderer2, ElementRef, Input } from '@angular/core';
import { Chart, ChartType } from 'chart.js/auto';
import { GestionApiService } from 'src/app/servicios/gestion-api.service';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  standalone: false
})
export class LineChartComponent  implements OnInit {
   @Input() datosCategorias: number[] = [];
   @Input() nombresCategorias: string[] = [];

   @Input() backgroundColorCategorias: string[] = [];
   @Input() borderColorCategorias: string[] = [];
   @Input() tipoChartSelected: string = "";

   // Atributo que almacena los datos del chart
   public chart!: Chart;

   constructor(private el: ElementRef, private renderer: Renderer2, private gestionServiceApi: GestionApiService) {}

   ngOnInit(): void {
     console.log("Ejecuta line-chart");
     this.inicializarChart();

     //Nos suscribimos al observable de tipo BehaviorSubject y cuando este emita un valor, recibiremos una notificación con el nuevo valor.
     this.gestionServiceApi.datos$.subscribe((datos) => {
       if (datos != undefined) {
         //Cuando recibimos un valor actualizamos los arrays de nombre y valor de categorias, para guardar el nombre y su valor en las mismas posiciones del array.
         this.nombresCategorias.push(datos.categoria);
         this.datosCategorias.push(datos.totalResults);
         //Actualizamos el chart con los nuevos valores cada vez que recibimos un valor.
         this.chart.update();
       }
     });
   }

   private inicializarChart() {

     let data = null;

     if (this.tipoChartSelected === "line-chart"){
       // datos
       data = {
         labels: this.nombresCategorias,
         datasets: [{
           label: 'Gráfico de lineas',
           data: this.datosCategorias,
           fill: false,
           backgroundColor: this.backgroundColorCategorias,
           borderColor: this.borderColorCategorias,
           tension: 0.1
         }]
       };
     } else {
       // datos
       data = {
         labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July'],
         datasets: [{
           label: 'Gráfico de lineas',
           data: [65, 59, 80, 81, 56, 55, 40],
           fill: false,
           backgroundColor: [
             'rgba(255, 99, 132, 0.2)',
             'rgba(255, 159, 64, 0.2)',
             'rgba(255, 205, 86, 0.2)',
             'rgba(75, 192, 192, 0.2)',
             'rgba(54, 162, 235, 0.2)',
             'rgba(153, 102, 255, 0.2)',
             'rgba(201, 203, 207, 0.2)'
           ],
           borderColor: [
             'rgb(255, 99, 132)',
             'rgb(255, 159, 64)',
             'rgb(255, 205, 86)',
             'rgb(75, 192, 192)',
             'rgb(54, 162, 235)',
             'rgb(153, 102, 255)',
             'rgb(201, 203, 207)'
           ],
           tension: 0.1
         }]
       };
     }


     // Creamos la gráfica
     const canvas = this.renderer.createElement('canvas');
     this.renderer.setAttribute(canvas, 'id', 'lineChart');

     // Añadimos el canvas al div con id "chartContainer"
     const container = this.el.nativeElement.querySelector('#contenedor-linechart');
     this.renderer.appendChild(container, canvas);

     this.chart = new Chart(canvas, {
       type: 'line' as ChartType, // tipo de la gráfica
       data: data, // datos
       options: { // opciones de la gráfica
         responsive: true,
         maintainAspectRatio: false,
         scales: {
           y: {
             beginAtZero: true
           }
         },
         plugins: {
           legend: {
             labels: {
               boxWidth: 0,
               font: {
                 size: 16,
                 weight: 'bold'
               }
             },
           }
         },
       }
     });

     this.chart.canvas.width = 100;
     this.chart.canvas.height = 100;
   }
}
