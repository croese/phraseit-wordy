var articles = require('articles/lib/Articles.js');
var randy = require('randy');

// ---------------------------------------------
//                  DEFAULTS
// ---------------------------------------------

function Phraseit() {
  var self = this;

  self._nouns = require('./words/nouns.js');
  self._adjectives = require('./words/adjectives.js');
  self._adverbs = require('./words/adverbs.js');
  self._verbs = require('./words/verbs.js');

  self.actions = {
    noun: function () {
      return randy.choice(self._nouns);
    },
    a_noun: function () {
      return articles.articlize(self.actions.noun());
    },
    adjective: function () {
      return randy.choice(self._adjectives);
    },
    an_adjective: function () {
      return articles.articlize(self.actions.adjective());
    },
    adverb: function () {
      return randy.choice(self._adverbs);
    },
    verb: function () {
      return randy.choice(self._verbs);
    },
  };

  self.configure = function (options) {
    // merge actions
    Object.assign(self.actions, options.actions || {});

    self._nouns = (options.nounList || self._nouns).concat(options.addNouns || []);
    self._adjectives = (options.adjectiveList || self._adjectives).concat(options.addAdjectives || []);
    self._adverbs = (options.adverbList || self._adverbs).concat(options.addAdverbs || []);
    self._verbs = (options.verbList || self._verbs).concat(options.addVerbs || []);
  };

  self.use = function (options) {
    var newInstance = new Phraseit();
    newInstance.configure(options);
    return newInstance;
  };
}

// ---------------------------------------------
//                  THE GOODS
// ---------------------------------------------

Phraseit.prototype.make = function (template) {
  var self = this;

  var sentence = template;
  var occurrences = template.match(/\{\{(.+?)\}\}/g);

  if (occurrences && occurrences.length) {
    for (var i = 0; i < occurrences.length; i++) {
      var action = occurrences[i].replace('{{', '').replace('}}', '').trim();
      var result = '';
      if (action.match(/\((.+?)\)/)) {
        try {
          result = eval('self.actions.' + action);
        }
        catch (e) { }
      } else {
        if (self.actions[action]) {
          result = self.actions[action]();
        } else {
          result = '{{ ' + action + ' }}';
        }
      }
      sentence = sentence.replace(occurrences[i], result);
    }
  }
  return sentence;
};

// ---------------------------------------------
//                    DONE
// ---------------------------------------------

var instance = new Phraseit();
module.exports = instance;
