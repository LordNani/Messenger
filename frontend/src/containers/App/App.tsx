import React from 'react';
import {Provider} from 'react-redux';
import {store} from "../../store";
import ReduxToastr, {toastr} from "react-redux-toastr";
import Routing from "../Routing/Routing";
import 'react-redux-toastr/lib/css/react-redux-toastr.min.css';
import {ConnectedRouter} from "connected-react-router";
import {history} from "../../helpers/history.helper";

class App extends React.Component {
    componentDidMount() {
        window.onunhandledrejection = this.handleError;
    }

    handleError(error: any) {
        toastr.error("Error", error.reason.message);
    }

    render() {
        return (
            <Provider store={store}>
                <ReduxToastr
                    timeOut={4000}
                    newestOnTop={false}
                    preventDuplicates
                    position="top-right"
                    transitionIn="fadeIn"
                    transitionOut="fadeOut"
                    closeOnToastrClick={true}
                />
                <ConnectedRouter history={history}>
                    <Routing />
                </ConnectedRouter>
            </Provider>
        );
    }
}

export default App;
