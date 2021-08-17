function init() {
  const selector = d3.select('#selDataset');

  d3.json('samples.json')
    .then(({ names }) => {
      names.forEach((sample) => {
        selector.append('option').text(sample).property('value', sample);
      });

      const initialSample = names[0];
      createMetaData(initialSample);
      createCharts(initialSample);
    })
    .catch((error) => console.log(error));
}

init();

function optionChanged(id) {
  createMetaData(id);
  createCharts(id);
}

function createMetaData(sampleId) {
  d3.json('samples.json').then(({ metadata }) => {
    const demographicInfo = d3.select('#sample-metadata');
    const sampleFound = metadata.filter((data) => data.id == sampleId);

    demographicInfo.html('');

    Object.entries(sampleFound[0]).forEach(([key, value]) => {
      demographicInfo.append('h6').text(key + ': ' + value);
    });
  });
}

function createCharts(sample) {
  d3.json('samples.json').then(function ({ samples, metadata }) {
    const data = samples.filter((obj) => obj.id == sample)[0];

    const barChart = {
      otuIds: data.otu_ids.map((row) => `OTU ${row}`),
      values: data.sample_values.slice(0, 10),
      labels: data.otu_labels
        .slice(0, 10)
        .map((label) => label.replaceAll(';', ', ')),
    };

    const bubbleChart = {
      otuIds: data.otu_ids,
      values: data.sample_values,
      labels: data.otu_labels.map((label) => label.replaceAll(';', ', ')),
    };

    const gaugeData = metadata.filter((obj) => obj.id == sample)[0];
    const wfreq = (gaugeData && gaugeData.wfreq) || {};

    const data1 = [
      {
        x: barChart.values,
        y: barChart.otuIds,
        type: 'bar',
        orientation: 'h',
        text: barChart.labels,
        hoverinfo: 'text',
      },
    ];

    const data2 = [
      {
        x: bubbleChart.otuIds,
        y: bubbleChart.values,
        mode: 'markers',
        text: bubbleChart.labels,
        marker: {
          size: bubbleChart.values,
          color: bubbleChart.otuIds,
        },
      },
    ];

    const data3 = [
      {
        value: wfreq,
        title: {
          text: 'Scrubs per Week',
          font: { size: 12, color: 'grey' },
        },
        type: 'indicator',
        mode: 'gauge+number',
        gauge: {
          axis: { range: [null, 9] },
          bar: { color: 'green' },
          steps: [
            { range: [0, 1], color: '#F4F8F8' },
            { range: [1, 2], color: '#F4F8F8' },
            { range: [2, 3], color: '#D4E6E5' },
            { range: [3, 4], color: '#BED9D8' },
            { range: [4, 5], color: '#A8CCCD' },
            { range: [5, 6], color: '#92BFC0' },
            { range: [6, 7], color: '#7BB4B3' },
            { range: [7, 8], color: '#64A6A6' },
            { range: [8, 9], color: '#4B9A9A' },
          ],
        },
      },
    ];

    const layout1 = {
      margin: {
        t: 40,
        l: 150,
      },
      title: {
        text: 'Top 10 Bacterial Cultures Found',
      },
    };

    // layout for bubble chart
    const layout2 = {
      xaxis: { title: 'OTU ID' },
      title: {
        text: 'Bacteria Cultures Per Sample',
      },
    };

    // layout for gauge chart
    const layout3 = {
      width: 300,
      height: 200,
      margin: { t: 100, r: 25, l: 25, b: 25 },
      title: {
        text: 'Belly Button Washing Frequency',
      },
    };

    Plotly.newPlot('bar', data1, layout1);
    Plotly.newPlot('bubble', data2, layout2);
    Plotly.newPlot('gauge', data3, layout3);
  });
}
