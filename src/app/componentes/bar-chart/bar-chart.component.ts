import { Component, OnInit, Renderer2, ElementRef, Input } from '@angular/core';
import { Chart, ChartType } from 'chart.js/auto';
import { GestionApiService } from 'src/app/servicios/gestion-api.service';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
  standalone: false,
})
export class BarChartComponent implements OnInit {
  @Input() datosCategorias: number[] = [];
  @Input() nombresCategorias: string[] = [];
  @Input() backgroundColorCategorias: string[] = [];
  @Input() borderColorCategorias: string[] = [];
  @Input() tipoChartSelected: string = "";

  // Atributo que almacena los datos del chart
  public chart!: Chart;

  // Este es el objeto donde se almacenan los datos de la API
  public apiData: { categoria: string; totalResults: number }[] = [];

  constructor(private el: ElementRef, private renderer: Renderer2, private gestionServiceApi: GestionApiService) {}

  ngOnInit(): void {
    console.log("Ejecuta bar-chart");
    this.inicializarChart();

    // Nos suscribimos al BehaviorSubject para recibir los datos de la API
    this.gestionServiceApi.datos$.subscribe((datos) => {
      if (datos != undefined) {
        // Cuando recibimos un valor, actualizamos apiData
        this.apiData.push({ categoria: datos.categoria, totalResults: datos.totalResults });
        // Actualizamos el gráfico con los nuevos valores
        this.actualizarChart();
      }
    });
  }

  // Método para inicializar el gráfico
  private inicializarChart() {
    const data = {
      labels: this.nombresCategorias,
      datasets: [{
        label: 'Gráfico de barras',
        data: this.datosCategorias,
        fill: false,
        backgroundColor: this.backgroundColorCategorias,
        borderColor: this.borderColorCategorias,
        borderWidth: 1
      }]
    };

    const canvas = this.renderer.createElement('canvas');
    this.renderer.setAttribute(canvas, 'id', 'barChart');
    const container = this.el.nativeElement.querySelector('#contenedor-barchart');
    this.renderer.appendChild(container, canvas);

    this.chart = new Chart(canvas, {
      type: 'bar' as ChartType,
      data: data,
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: true
          },
          x: {
            // Aseguramos que las categorías se distribuyan correctamente en el eje X
            ticks: {
              autoSkip: false
            }
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
            }
          }
        }
      }
    });

    this.chart.canvas.width = 100;
    this.chart.canvas.height = 100;
  }

  // Método para actualizar el gráfico con los datos recibidos de la API
  private actualizarChart() {
    const datasetsByCompany: { [key: string]: { label: string; data: number[]; backgroundColor: string[]; borderColor: string[]; borderWidth: number } } = {};

    // Inicializamos las etiquetas para las categorías
    const categorias = this.apiData.map(row => row.categoria);

    // Recorremos apiData para actualizar los datos del gráfico
    this.apiData.forEach((row, index) => {
      const categoria = row.categoria;
      const totalResults = row.totalResults;

      // Si no hemos pintado aún los datos de esta categoría, inicializamos su objeto en datasetsByCompany
      if (!datasetsByCompany[categoria]) {
        datasetsByCompany[categoria] = {
          label: 'Valores de ' + categoria,
          data: new Array(this.apiData.length).fill(0), // Inicializamos los valores de data con 0
          backgroundColor: [this.backgroundColorCategorias[index]],
          borderColor: [this.borderColorCategorias[index]],
          borderWidth: 1
        };
      }

      // Actualizamos los valores de la categoría
      const categoryIndex = categorias.indexOf(categoria); // Encontramos el índice de la categoría
      datasetsByCompany[categoria].data[categoryIndex] = totalResults; // Asignamos el valor a la categoría correspondiente
    });

    // Actualizamos las labels con las categorías
    this.chart.data.labels = categorias;

    // Modificamos los datasets para reflejar correctamente los valores de las categorías
    this.chart.data.datasets = Object.values(datasetsByCompany);

    // Actualizamos el gráfico con los nuevos datos
    this.chart.update();
  }
}