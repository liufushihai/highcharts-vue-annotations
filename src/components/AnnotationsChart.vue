<template>
  <div class="hello">
    <h1>{{ msg }}</h1>
    <chart :options="chartOptions" ref="chart"/>
    <ul>
      <li v-for="(item, index) in labels" :key="index">
        {{ item.text }}
      </li>
    </ul>
    <button @click="deleteEventLabel">删除事件</button>
  </div>
</template>

<script>
import axios from 'axios'
import { Chart } from 'highcharts-vue'
import Highcharts from 'highcharts'
import Annotations from 'highcharts/modules/annotations.js'

export default {
  name: 'AnnotationsChart',
  data () {
    return {
      msg: 'highcharts-vue annotations 插件使用',
      url: '/info/pv',
      chartOptions: null,
      chartData: null,
      categories: [],
      series: [],
      labels: [],
      pltBndId: 'pbid1',
      pltBnds: [],
      pltBndObjs: []
    }
  },
  components: {
    Chart
  },
  created () {
    this.init()
    this.getPVData()
  },
  methods: {
    init: function () {
      Annotations(Highcharts)

      var vueRef = this

      this.chartOptions = {
        chart: {
          zoomType: 'x'
        },
        title: {
          text: 'highcharts-vue 标注图'
        },
        credits: {
          enabled: true,
          href: '#',
          text: 'Demo By Leif'
        },
        xAxis: [{
          categories: this.categories || [],
          plotBands: this.pltBnds || []
        }],
        yAxis: [{
          labels: {
            format: null,
            style: {
              color: Highcharts.getOptions().colors[1]
            },
          },
          title: {
            text: null,
            style: {
              color: Highcharts.getOptions().colors[1]
            }
          }
        }, {
          gridLineWidth: 0,
          title: {
            text: null,
            style: {
              colors: Highcharts.getOptions().colors[1]
            }
          },
          label: {
            format: null,
            style: {
              color: Highcharts.getOptions().colors[1]
            }
          }
        }],
        tooltip: {
          shared: true,
          useHTML: true,
          formatter: function () {
            // console.log('vue 引用：', vueRef)
            var s = '<b>' + '日期：2018-' + this.x + '</b>'
            return s
          }
        },
        legend: {
          layout: 'horizontal',
          align: 'center',
          margin: 0,
          padding: 0
        },
        plotOptions: {
          series: {
            animation: false
          }
        },
        series: [{
          name: '2018',
          type: 'spline',
          data: this.series || []
        }],
        annotations: [{
          labelOptions: {
            background: 'rgba(0, 0, 0, 0.7)',
            color: '#ffffff',
            borderColor: 'sliver',
          },
          labels: this.labels || [],
          events: {
            // click: this.labelClick,
            mouseover: this.labelMouseover,
            mouseout: this.labelMouseout
          },
          draggable: '',
          animation: true
        }]
      }
    },
    getDateIndex (date) {
      return this.chartData['2018']['pv_list'].findIndex((ele, index, array) => {
        return ele['date'] === date
      })
    },
    getPVData: function () {
      let self = this
      axios.get(self.url)
        .then(rsp => {
          self.chartData = rsp.data

          // pv 数据处理
          rsp.data && rsp.data['2018']['pv_list'].forEach((ele, idx, array) => {
            ele.date && self.categories.push(ele.date)
            ele.pv && self.series.push(ele.pv)
          })

          rsp.data && rsp.data['2018']['event_list'].forEach((ele, idx, array) => {
            let sIdx = self.getDateIndex(ele['begin_date'])
            let eIdx = self.getDateIndex(ele['end_date'])

            // 事件标注生成
            self.labels.push({
              point: {
                x: sIdx,
                y: rsp.data['2018']['pv_list'][sIdx]['pv'],
                xAxis: 0,
                yAxis: 0
              },
              style: {
                cursor: 'pointer',
                fontSize: '13px',
                padding: '2px'
              },
              text: ele.detail
            })

            // 标示带对象数组
            self.pltBndObjs.push({
              from: sIdx,
              to: eIdx,
              text: ele['detail']
            })
          })
        }).catch(err => {
          console.log('Network error')
        })
    },
    labelMouseover: function (e) {
      if (e.srcElement.textContent.length <= 0) {
        return
      }

      this.pltBndObjs.forEach((ele, index, array) => {
        if (ele['text'] === e.srcElement.textContent) {
          this.$refs.chart.chart.xAxis[0].addPlotBand({
            from: ele.from,
            to: ele.to,
            id: this.pltBndId,
            color: '#FFF9C4'
          })
        }
      })
    },
    labelMouseout: function (e) {
      if (e.srcElement.textContent.length <= 0) {
        return
      }

      this.$refs.chart.chart.xAxis[0].removePlotBand(this.pltBndId)
    },
    deleteEventLabel () {
      this.labels.splice(0, 1)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
h1, h2 {
  font-weight: normal;
}
ul {
  list-style-type: none;
  padding: 0;
}
li {
  display: inline-block;
  margin: 0 10px;
  font-weight: bolder;
}
a {
  color: #42b983;
}
</style>
