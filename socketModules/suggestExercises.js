const stringSimilarity = require('string-similarity');
var natural = require('natural');
var classifier = new natural.BayesClassifier();
const stemmer = natural.PorterStemmer;
const tf = require('@tensorflow/tfjs');
var sw = require('stopword');
const unidecode = require('unidecode');
const { forEach } = require('lodash');

const data = require('../data/data.json');
let listCategory = [];
data.forEach(item => {
  listCategory.push(item.category);
});
// loai bỏ trùng lặp
listCategory = [...new Set(listCategory)];

// data.forEach(item=>{
//   item.text = item.text.toLowerCase();
//   item.text = unidecode(item.text);
//   item.text = sw.removeStopwords(item.text.split(' ')).join(' ');
//   item.text = stemmer.stem(item.text);
//   classifier.addDocument(item.text,item.category);
// })
// classifier.train();

// setTimeout(() => {
//   classifier.save('nvclassifier.json',function(err,classifier){});
// }, 1000);

const datatest = [
  'Hôm nay trời nắng đẹp',
  'Tôi đang học lập trình Node.js',
  'Chào buổi sáng!',
  'Thời tiết hôm nay rất lạnh',
  'Tôi yêu công nghệ'
];
//   const matches = stringSimilarity.findBestMatch(text, datatest);
// console.log(matches.bestMatch.target);

// văn bản cần so sánh
const text = 'Tôi đang học lập trình';

let dataAnalysis = [];

const suggestExercises = (socket, io) => {
  socket.on('suggest_exercises', async (data) => {
    let textAnalysis = '';
    await forEach(data, async (item) => {
      textAnalysis += item + ' ';
    });
    await forEach(data, async (item) => {
      item = item.toLowerCase();
      item = unidecode(item);
      item = sw.removeStopwords(item.split(' ')).join(' ');
      item = stemmer.stem(item);
      natural.BayesClassifier.load('nvclassifier.json', null, async function (err, classifier) {
        var probabilities = await classifier.getClassifications(item).sort((a, b) => b.value - a.value);
        var n = 3;
        var topNProbabilities = probabilities.slice(0, n).map(p => ({
          label: p.label,
          value: p.value
        }));
        dataAnalysis.push(topNProbabilities);
      })
    });
    setTimeout(() => {
      const result = dataAnalysis.reduce((acc, e) => {
        e.forEach(({ label, value }) => {
          if (acc[label]) {
            acc[label] += value;
          } else {
            acc[label] = value;
          }
        });
        return acc;
      }, {});
      const sorted = Object.entries(result).sort(([, a], [, b]) => b - a);
      const top2 = sorted.slice(0, 2).map(([label]) => label);
      const matches = stringSimilarity.findBestMatch(textAnalysis, top2);
      // send data to client have token
      io.to(socket.handshake.address).emit('suggest_exercises', {
        lable: matches.bestMatch.target,
        listCategory: listCategory
      });
      dataAnalysis = [];
    }, 1000);

    

  });
}
module.exports = suggestExercises;