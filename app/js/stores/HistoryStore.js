import Reflux from 'reflux';
import HistoryActions from '../actions/HistoryActions';
import I18n from '../util/i18n';

export default Reflux.createStore({
  listenables: HistoryActions,

  init() {
    window.addEventListener('hashchange', this.registerUrlChange.bind(this));
  },

  navigateToRoot() {
    history.pushState({}, 'Our Politics', this.rootUrl);
  },

  currentLocale() {
    return window.location.hash.slice(1,3);
  },

  onNavigateToModal(data) {
    history.pushState({
      party: Symbol.keyFor(data.party),
      topic: data.topic,
      policy: data.policy
    }, data.topic, `${this.rootUrl}/${Symbol.keyFor(data.party)}/${data.topic}/${data.policy.details.slice(0,-3)}`.toLowerCase());

    this.trigger(data);
  },

  registerUrlChange() {
    const pageLocaleFromUrl = this.currentLocale();
    if (pageLocaleFromUrl && pageLocaleFromUrl !== I18n.locale) {
      I18n.locale = pageLocaleFromUrl;
      delete this._rootUrl;
      HistoryActions.localeChanged(I18n.locale);
    } else if (['', '#en', '#fr'].indexOf(window.location.hash) !== -1) {
      HistoryActions.closeModal();
      return this.navigateToRoot();
    }
  },

  get rootUrl() {
    if (this._rootUrl) { return this._rootUrl; }
    const hostname = document.location.hostname || document.location.host;
    let rootUrl = `${document.location.protocol}//${hostname}`;
    if (document.location.port) {
      rootUrl = `${rootUrl}:${document.location.port}`;
    }

    this._rootUrl = `${rootUrl}/#${I18n.locale}`;
    return this._rootUrl;
  }
});