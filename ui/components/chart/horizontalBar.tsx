import { Component } from 'react';

import styled from 'styled-components';

import Chart from 'chart.js';
import { cssColors, typeface } from 'feather';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';

const StyledHorizontalBar = styled.div`
  display: block;
  width: 100%;
  position: relative;
`;

interface HorizontalBarOptionalProps {
  valueFormat?: string;
  showLegend?: boolean;
  labels?: string[];
  datasets: Chart.ChartDataSets[];
  areaBackground?: string;
}

interface HorizontalBarProps extends HorizontalBarOptionalProps {}

interface HorizontalBarState {
  chart: Chart;
  resized: boolean;
}

export class HorizontalBar extends Component<HorizontalBarProps, HorizontalBarState> {
  public static defaultProps = {
    areaBackground: 'white',
  };

  private canvas;
  public state = {
    chart: {} as Chart,
    resized: false,
  };
  componentDidMount() {
    this.drawChart(this.props);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (!isEqual(this.props, nextProps) && !isEmpty(this.state.chart)) {
      this.state.chart.destroy();
      this.drawChart(nextProps);
    }
  }

  private drawChart = (props) => {
    const context = this.canvas.getContext('2d');

    const showBarValueLabel = () => {
      const chartInstance = this.state.chart;
      const { ctx } = chartInstance;

      props.datasets.forEach((dataset, i) => {
        const meta = chartInstance['getDatasetMeta'] && chartInstance['getDatasetMeta'](i);
        const maxValue = props.datasets[0].data[0];
        meta &&
          meta.data.forEach((bar, index) => {
            const data = dataset.data[index];
            const percent = Math.floor((data / maxValue) * 100) || 0;
            if (ctx) {
              ctx.fillStyle = String(cssColors('purple-7'));
              ctx.textAlign = 'center';
              ctx.textBaseline = 'bottom';
              ctx.fillText(`${percent}%`, bar._model.x + 20, bar._model.y + 8);

              if (data > 0) {
                ctx.fillStyle = 'white';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'bottom';
                ctx.fillText(data, bar._model.x - 12, bar._model.y + 8);
              }
            }
          });
      });
    };

    const options = {
      hover: {},
      tooltips: {
        enabled: false,
      },
      maintainAspectRatio: false,
      onResize: () => {
        this.setState({ resized: true });
      },
      legend: {
        display: props.showLegend,
      },
      scales: {
        xAxes: [
          {
            gridLines: {
              drawBorder: false,
            },
            ticks: {
              beginAtZero: true,
              callback: () => {
                return '';
              },
            },
          },
        ],
        yAxes: [
          {
            gridLines: {
              display: false,
              drawBorder: false,
            },
            ticks: {
              fontColor: cssColors('neutral-7'),
              fontFamily: typeface.system,
              fontSize: 12,
            },
            barThickness: 24,
          },
        ],
      },
      layout: {
        padding: {
          top: 4,
          right: 50,
        },
      },
      animation: {
        duration: 1,
        onProgress: () => {
          showBarValueLabel();
        },
        onComplete: () => {
          if (this.state.resized) {
            this.setState({ resized: false }, () => {
              showBarValueLabel();
            });
          }
        },
      },
    };

    Chart.defaults.global.defaultFontFamily = typeface.system;
    Chart.defaults.global.defaultFontSize = 12;
    const chart = new Chart(context, {
      type: 'horizontalBar',
      data: {
        labels: props.labels,
        datasets: props.datasets,
      },
      options,
      plugins: [
        {
          beforeDraw: (chartInstance) => {
            const { ctx, chartArea } = chartInstance;
            if (ctx) {
              ctx.fillStyle = props.areaBackground!;
              ctx.fillRect(
                chartArea.left,
                chartArea.top,
                chartArea.right - chartArea.left,
                chartArea.bottom - chartArea.top,
              );
            }
          },
        },
      ],
    });
    this.setState({ chart });
  };

  public render() {
    return (
      <StyledHorizontalBar>
        <canvas
          ref={(component) => {
            this.canvas = component;
          }}
          height={212}
        />
      </StyledHorizontalBar>
    );
  }
}
