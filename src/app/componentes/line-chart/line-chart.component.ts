import { Component, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { NoticiasService } from 'src/app/servicios/noticias.service';

@Component({
  selector: 'app-line-chart',
  templateUrl: './line-chart.component.html',
  styleUrls: ['./line-chart.component.scss'],
  standalone: false
})
export class LineChartComponent  implements OnInit {
  private chart!: Chart;
  public apiData: { categoria: string; totalResults: number }[] = [];

  constructor(private noticiasService: NoticiasService) {}

  ngOnInit() {
    this.noticiasService.apiData$.subscribe(data => {
      this.apiData = data;
      this.actualizarChart();
    });
  }

  actualizarChart() {
    const datasetsByCompany: { [key: string]: any } = {};

    this.apiData.forEach((row, index) => {
      const categoria = row.categoria;
      const totalResults = row.totalResults;

      if (!datasetsByCompany[categoria]) {
        datasetsByCompany[categoria] = {
          label: 'Valores de ' + categoria,
          data: [],
          backgroundColor: ['rgba(255, 99, 132, 0.2)'],
          borderColor: ['rgb(255, 99, 132)'],
          borderWidth: 1
        };
      }

      datasetsByCompany[categoria].data[index] = totalResults;
    });

    if (this.chart) {
      this.chart.destroy();
    }

    this.chart = new Chart('lineCanvas', {
      type: 'line',
      data: {
        labels: this.apiData.map(row => row.categoria),
        datasets: Object.values(datasetsByCompany)
      },
      options: { responsive: true }
    });
  }
}
