# BrainBrowser

This is an experiment in using redux, angular 2, threejs, and d3 to explore large time-varrying neuroimaging data. The 2d heat maps show the brain activity of all brain verticies and times. Click on those plots to change the time point shown by the brain plots. Each brain hemisphere shows one column (time point) in the matrix above it. Click on a blue bar to see the timing of stimuli presentation. Update color min/max with the inputs under the color bar. Use the slider or time input to change the time. All components show the same time to facilitate comparisons across different conditions. 

There is a live demo available here: https://brainbrowser-ab65c.firebaseapp.com/

The demo sends a lot of data and takes a while to load. Currently experimenting with TDD in react. 

![ScreenShot](https://raw.github.com/matt-erhart/BrainBrowser/master/src/prototype2d3d_redux.jpg)
