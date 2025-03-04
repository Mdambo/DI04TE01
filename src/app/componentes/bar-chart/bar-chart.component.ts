import { Component, OnInit, Input } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { NoticiasService } from 'src/app/servicios/noticias.service';

@Component({
  selector: 'app-bar-chart',
  templateUrl: './bar-chart.component.html',
  styleUrls: ['./bar-chart.component.scss'],
  standalone: false
})
export class BarChartComponent implements OnInit {
  @Input() backgroundColorCat: string[] = [];
  @Input() borderColorCat: string[] = [];

  public chart: Chart | undefined;
  public apiData: { categoria: string, totalResults: number }[] = [];
  public isDataLoaded: boolean = false;  // Bandera para controlar si los datos están cargados

  constructor(private noticiasService: NoticiasService) {}

  ngOnInit() {
    // Realizamos la consulta API cuando la página se carga
    this.fetchDataAndInitializeChart();

    // Nos suscribimos a los datos del servicio
    this.noticiasService.apiData$.subscribe(data => {
      if (data.length > 0) {
        this.apiData = data;
        this.isDataLoaded = true;  // Cambiamos la bandera a 'true' cuando los datos están disponibles
        this.actualizarChart();  // Actualizamos el gráfico con los nuevos datos
      }
    });
  }

  // Método para obtener los datos de la API y actualizar el gráfico
  fetchDataAndInitializeChart() {
    const categorias = ['business', 'entertainment', 'general', 'technology', 'health', 'science', 'sports'];
    this.noticiasService.cogerNoticias(categorias); // Llamada al servicio para obtener los datos
    this.iniciarGrafico(); // Inicializamos el gráfico con datos vacíos al principio
  }

  // Método para iniciar la gráfica cuando no hay datos
  iniciarGrafico() {
    this.chart = new Chart('barCanvas', {
      type: 'bar',
      data: {
        labels: [],  // Inicialmente vacío
        datasets: []  // Inicialmente vacío
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }

  // Método para actualizar la gráfica con los datos recibidos de la API
  actualizarChart() {
    const datasetsByCompany: { [key: string]: any } = {};

    this.apiData.forEach((row, index) => {
      const categoria = row.categoria;
      const totalResults = row.totalResults;

      // Si no existe el dataset para esa categoría, lo creamos
      if (!datasetsByCompany[categoria]) {
        datasetsByCompany[categoria] = {
          label: 'Valores de ' + categoria,
          data: [],
          backgroundColor: [this.backgroundColorCat[index]],
          borderColor: [this.borderColorCat[index]],
          borderWidth: 1
        };
      }

      datasetsByCompany[categoria].data.push(totalResults);
    });

    // Si ya existe un gráfico, lo destruimos para evitar que se dibuje otro
    if (this.chart) {
      this.chart.destroy();
    }

    // Creamos un nuevo gráfico con los datos actualizados
    this.chart = new Chart('barCanvas', {
      type: 'bar',
      data: {
        labels: this.apiData.map(row => row.categoria),  // Labels de las categorías
        datasets: Object.values(datasetsByCompany)  // Los datasets con los resultados
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true
          }
        }
      }
    });
  }
}