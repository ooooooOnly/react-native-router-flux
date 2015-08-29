var alt = require('./alt');
var Actions = require('./FetchActions');
var Qs = require('qs');

var FetchSource = {
    process(state) {
        return {
            remote() {
                var {route, data} = state.data;
                var r = state.routes[route];
                var url = r.url + (r.url.indexOf("?")==-1 ? '?' : '&') + Qs.stringify(data);

                //var url = 'http://www.masonsoft.com/rest/login?username='+username+'&password='+password;
                console.log("DO FETCH:"+url);
                return fetch(url).then((response) => response.text())
                    .then((responseText) => {
                        return {route, data: JSON.parse(responseText)};
                    })
            },

            local() {
                // Never check locally, always fetch remotely.
                return null;
            },

            success: Actions.success,
            error: Actions.error,
            loading: Actions.loading
        }
    }
};

// async handling like shown http://alt.js.org/docs/async/
class FetchStore {
    constructor() {
        this.data = {};
        this.routes = {};
        this.errorMessage = null;

        this.bindListeners({
            onLoad: Actions.load,
            onSuccess: Actions.success,
            onFetch: Actions.fetch,
            onError: Actions.error,
            onLoading: Actions.loading
        });

        this.registerAsync(FetchSource);
    }

    onLoad(routes){
        this.routes = routes;
        this.loading = false;
        return false;
    }

    onLoading(){
        this.loading = true;
    }

    onSuccess({route, data}) {
        this.loading = false;
        this.data = data;
        this.route = route;
        this.errorMessage = null;
    }

    onFetch({route, data}) {
        this.data = {route, data};
        console.log("onFetch: "+route+", "+JSON.stringify(data));

        if (!this.getInstance().isLoading()) {
            setTimeout(()=>this.getInstance().process());
        }
        return false;
    }

    onError(errorMessage) {
        this.loading = false;
        console.log("onError:"+JSON.stringify(data));
        this.errorMessage = errorMessage;
    }
}

module.exports = alt.createStore(FetchStore, 'FetchStore');